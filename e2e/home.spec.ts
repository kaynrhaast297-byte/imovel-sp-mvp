import { expect, test } from '@playwright/test'
import { mockImoveisResponse } from './fixtures'
import { expectNoBrowserErrors, gotoHydrated, mockExternalAssets, watchBrowserErrors } from './helpers'

test.describe('Home', () => {
  let browserErrors: string[]

  test.beforeEach(async ({ page }) => {
    browserErrors = watchBrowserErrors(page)
    await mockExternalAssets(page)
    await page.route('**/api/imoveis**', route =>
      route.fulfill({ status: 200, json: mockImoveisResponse }),
    )
  })

  test.afterEach(async () => {
    expectNoBrowserErrors(browserErrors)
  })

  test('carrega conteudo principal e recortes de validacao', async ({ page }) => {
    await gotoHydrated(page, '/')

    await expect(page.getByRole('heading', { name: /encontre o imovel certo/i })).toBeVisible()
    await expect(page.getByPlaceholder(/moema, pinheiros, vila mariana/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /buscar imoveis/i })).toBeVisible()
    await expect(page.getByText('Busca guiada em Pinheiros')).toBeVisible()
    await expect(page.getByText('Busca guiada na Vila Olimpia')).toBeVisible()
    await expect(page.getByText('Busca guiada no Alto de Pinheiros')).toBeVisible()
    await expect(page.getByText('dados reais pendentes').first()).toBeVisible()
    await expect(page.getByText('Contato sera ativado com canal oficial.')).toBeVisible()
    await expect(page.getByRole('link', { name: /chamar no whatsapp/i })).toHaveCount(0)
  })

  test('navega para busca usando o formulario principal', async ({ page }) => {
    await gotoHydrated(page, '/')

    await page.getByPlaceholder(/moema, pinheiros, vila mariana/i).fill('Pinheiros')
    await expect(page.getByPlaceholder(/moema, pinheiros, vila mariana/i)).toHaveValue('Pinheiros')
    await page.getByRole('button', { name: /buscar imoveis/i }).click()

    await expect(page).toHaveURL(/\/busca\?.*bairro=Pinheiros/)
    await expect(page).toHaveURL(/\/busca\?.*negocio=venda/)
    await expect(page.getByText('Apto Pinheiros', { exact: true })).toBeVisible()
  })
})
