import { test, expect } from '@playwright/test'
import { expectNoBrowserErrors, gotoHydrated, watchBrowserErrors } from './helpers'

const validImovel = {
  titulo: 'Apartamento seguro',
  tipo: 'apartamento',
  negocio: 'venda',
  preco: 900000,
  area_m2: 90,
  bairro: 'Pinheiros',
  cidade: 'Sao Paulo',
  estado: 'SP',
  cep: '05422-000',
  endereco: 'Rua dos Pinheiros',
  numero: '100',
  fotos: ['https://example.com/foto.jpg'],
  foto_principal: 'https://example.com/foto.jpg',
}

test.describe('Seguranca do painel admin', () => {
  test('usa sessao HttpOnly e rejeita Bearer token nas rotas protegidas', async ({ page }) => {
    const browserErrors = watchBrowserErrors(page)
    const token = process.env.E2E_ADMIN_TOKEN ?? 'e2e-admin-token'

    const bearerAttempt = await page.request.post('/api/imoveis', {
      headers: { Authorization: `Bearer ${token}` },
      data: validImovel,
    })
    expect(bearerAttempt.status()).toBe(401)

    await page.route('**/api/imoveis', async route => {
      expect(route.request().headers().authorization).toBeUndefined()
      await route.fulfill({ status: 201, json: { imovel: { id: 'imovel-e2e', ...validImovel } } })
    })
    await page.route('**/api/admin/property-images', async route => {
      await route.fulfill({
        status: 201,
        json: {
          fotos: validImovel.fotos,
          imagens: [{ path: 'properties/123e4567-e89b-12d3-a456-426614174000.jpg', url: validImovel.fotos[0] }],
        },
      })
    })

    await gotoHydrated(page, '/admin')
    await page.getByLabel('Token de admin').fill(token)
    await page.getByRole('button', { name: 'Entrar' }).click()

    await expect(page.getByRole('button', { name: 'Salvar imovel' })).toBeVisible()
    expect(await page.evaluate(() => document.cookie)).not.toContain('imovel_admin_session')

    await page.getByLabel(/^Titulo/).fill(validImovel.titulo)
    await page.getByLabel(/^Tipo/).selectOption(validImovel.tipo)
    await page.getByLabel(/^Negocio/).selectOption(validImovel.negocio)
    await page.getByLabel(/^Preco/).fill(String(validImovel.preco))
    await page.getByLabel(/^Area/).fill(String(validImovel.area_m2))
    await page.getByLabel(/^Bairro/).fill(validImovel.bairro)
    await page.getByLabel(/^CEP/).fill(validImovel.cep)
    await page.getByLabel(/^Numero/).fill(validImovel.numero)
    await page.getByLabel(/^Endereco/).fill(validImovel.endereco)
    await page.getByLabel(/^Fotos/).setInputFiles({
      name: 'foto.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('foto'),
    })
    await page.getByRole('button', { name: 'Salvar imovel' }).click()

    await expect(page.getByText('Imovel cadastrado com fotos e localizacao.')).toBeVisible()
    expectNoBrowserErrors(browserErrors)
  })
})
