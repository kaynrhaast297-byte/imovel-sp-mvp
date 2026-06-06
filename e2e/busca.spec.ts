import { expect, test } from '@playwright/test'
import { mockImoveisResponse } from './fixtures'
import { expectNoBrowserErrors, gotoHydrated, mockExternalAssets, watchBrowserErrors } from './helpers'

test.describe('Busca', () => {
  let browserErrors: string[]

  test.beforeEach(async ({ page }) => {
    browserErrors = watchBrowserErrors(page)
    await mockExternalAssets(page)
    await page.route('**/api/imoveis**', route =>
      route.fulfill({
        status: 200,
        json: mockImoveisResponse,
      }),
    )
  })

  test.afterEach(async () => {
    expectNoBrowserErrors(browserErrors)
  })

  test('carrega resultado mockado de imovel', async ({ page }) => {
    await gotoHydrated(page, '/busca?bairro=Pinheiros&negocio=venda&page=1&per_page=12')

    await expect(page.getByRole('heading', { name: /1 imovel encontrado/i })).toBeVisible()
    await expect(page.getByText('Apto Pinheiros')).toBeVisible()
    await expect(page.getByText('Pinheiros, Sao Paulo')).toBeVisible()
    await expect(page.getByText('Mock')).toBeVisible()
  })

  test('aplica filtro de bairro e atualiza a URL', async ({ page }) => {
    await gotoHydrated(page, '/busca')

    await page.getByPlaceholder(/ex: moema/i).fill('Moema')
    await expect(page.getByPlaceholder(/ex: moema/i)).toHaveValue('Moema')
    await page.getByRole('button', { name: /aplicar filtros/i }).click()

    await expect(page).toHaveURL(/\/busca\?.*bairro=Moema/)
    await expect(page).toHaveURL(/\/busca\?.*page=1/)
    await expect(page.getByRole('heading', { name: /1 imovel encontrado/i })).toBeVisible()
  })

  test('jornada principal: home, busca, resultado e detalhe do imovel', async ({ page }) => {
    await gotoHydrated(page, '/')

    await page.getByPlaceholder(/moema, pinheiros, vila mariana/i).fill('Pinheiros')
    await expect(page.getByPlaceholder(/moema, pinheiros, vila mariana/i)).toHaveValue('Pinheiros')
    await page.getByRole('button', { name: /buscar imoveis/i }).click()

    await expect(page).toHaveURL(/\/busca\?.*bairro=Pinheiros/)
    await expect(page).toHaveURL(/\/busca\?.*negocio=venda/)
    await expect(page.getByRole('heading', { name: /1 imovel encontrado/i })).toBeVisible()

    const card = page.getByRole('link', { name: /apto pinheiros/i })
    await expect(card).toBeVisible()
    await card.click()

    await expect(page).toHaveURL(/\/imovel\/imovel-1/)
    await expect(page.getByRole('heading', { name: 'Apto Pinheiros' })).toBeVisible()
    await expect(page.getByText('R$ 900.000').first()).toBeVisible()
    await expect(page.getByText(/Rua dos Testes, 123, Sao Paulo - SP/i)).toBeVisible()
    await expect(page.getByText('90 m2')).toBeVisible()
    await expect(page.getByText('2', { exact: true }).first()).toBeVisible()
    await expect(page.getByText(/Apartamento mockado para testes E2E/i)).toBeVisible()
  })
})
