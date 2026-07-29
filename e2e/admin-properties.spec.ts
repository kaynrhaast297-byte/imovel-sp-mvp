import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page, type Route } from '@playwright/test'
import { expectNoBrowserErrors, gotoHydrated, watchBrowserErrors } from './helpers'

const properties = [
  {
    id: 'imovel-1',
    titulo: 'Apartamento em Pinheiros',
    tipo: 'apartamento',
    negocio: 'venda',
    status: 'ativo',
    preco: 900000,
    bairro: 'Pinheiros',
    cidade: 'Sao Paulo',
    estado: 'SP',
    created_at: '2026-07-01T12:00:00.000Z',
    updated_at: '2026-07-20T12:00:00.000Z',
  },
  {
    id: 'imovel-2',
    titulo: 'Casa no Centro de Guarulhos',
    tipo: 'casa',
    negocio: 'aluguel',
    status: 'inativo',
    preco: 4500,
    bairro: 'Centro',
    cidade: 'Guarulhos',
    estado: 'SP',
    created_at: '2026-07-02T12:00:00.000Z',
    updated_at: '2026-07-21T12:00:00.000Z',
  },
]

async function mockAdminProperties(route: Route) {
  const cookie = route.request().headers().cookie ?? ''
  if (!cookie.includes('imovel_admin_session=')) {
    await route.fulfill({ status: 401, json: { error: 'Admin nao autorizado.' } })
    return
  }

  const url = new URL(route.request().url())
  const status = url.searchParams.get('status') ?? 'todos'
  const query = (url.searchParams.get('q') ?? '').toLocaleLowerCase('pt-BR')
  const filtered = properties.filter(property => {
    const matchesStatus = status === 'todos' || property.status === status
    const searchable = `${property.titulo} ${property.bairro} ${property.cidade}`.toLocaleLowerCase('pt-BR')
    return matchesStatus && (!query || searchable.includes(query))
  })

  await route.fulfill({
    status: 200,
    json: {
      imoveis: filtered,
      pagination: {
        page: 1,
        per_page: 20,
        total: filtered.length,
        total_pages: 1,
        has_next: false,
        has_prev: false,
      },
    },
  })
}

async function login(page: Page) {
  await gotoHydrated(page, '/admin/imoveis')
  await page.getByLabel('Token de admin').fill(process.env.E2E_ADMIN_TOKEN ?? 'e2e-admin-token')
  await page.getByRole('button', { name: 'Entrar' }).click()
}

test.describe('Inventario administrativo de imoveis', () => {
  test('login, lista e combina busca com status na URL', async ({ page }) => {
    const browserErrors = watchBrowserErrors(page)
    await page.route('**/api/admin/imoveis?**', mockAdminProperties)
    await login(page)

    await expect(page.getByText('Apartamento em Pinheiros')).toBeVisible()
    await expect(page.getByText('Casa no Centro de Guarulhos')).toBeVisible()

    await page.getByPlaceholder('Titulo, bairro ou cidade').fill('Guarulhos')
    await page.getByLabel('Status').selectOption('inativo')
    await page.getByRole('button', { name: 'Aplicar' }).click()

    await expect(page).toHaveURL('/admin/imoveis?q=Guarulhos&status=inativo')
    await expect(page.getByText('Casa no Centro de Guarulhos')).toBeVisible()
    await expect(page.getByText('Apartamento em Pinheiros')).toBeHidden()
    await expect(page.getByRole('link', { name: 'Ver Casa no Centro de Guarulhos no site' }))
      .toHaveAttribute('href', '/imovel/imovel-2')
    expectNoBrowserErrors(browserErrors)
  })

  test('permanece utilizavel e acessivel no celular', async ({ page }) => {
    const browserErrors = watchBrowserErrors(page)
    await page.setViewportSize({ width: 390, height: 844 })
    await page.route('**/api/admin/imoveis?**', mockAdminProperties)
    await login(page)

    await expect(page.getByText('Apartamento em Pinheiros')).toBeVisible()
    const dimensions = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }))
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth)

    const results = await new AxeBuilder({ page }).include('main').analyze()
    const serious = results.violations.filter(
      violation => violation.impact === 'critical' || violation.impact === 'serious',
    )
    expect(serious).toEqual([])
    expectNoBrowserErrors(browserErrors)
  })
})
