import { expect, test, type Page } from '@playwright/test'
import { mockImoveisResponse } from './fixtures'
import { expectNoBrowserErrors, gotoHydrated, mockExternalAssets, watchBrowserErrors } from './helpers'

async function expectNoHorizontalOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }))

  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth)
}

test.describe('Responsividade mobile', () => {
  test.use({ viewport: { width: 390, height: 844 } })

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

  test('home mantem busca utilizavel sem overflow horizontal', async ({ page }) => {
    await gotoHydrated(page, '/')

    await expect(page.getByRole('heading', { name: /encontre o imovel certo/i })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Buscar imoveis' })).toBeVisible()
    await expectNoHorizontalOverflow(page)
  })

  test('busca empilha filtros e resultado sem overflow horizontal', async ({ page }) => {
    await gotoHydrated(page, '/busca?bairro=Pinheiros')

    await expect(page.getByRole('heading', { name: 'Filtros' })).toBeVisible()
    await expect(page.getByText('Apto Pinheiros', { exact: true })).toBeVisible()
    await expectNoHorizontalOverflow(page)
  })

  test('detalhe mantem formulario de lead utilizavel sem overflow horizontal', async ({ page }) => {
    await gotoHydrated(page, '/imovel/imovel-1')

    await expect(page.getByRole('heading', { name: 'Apto Pinheiros' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Quero saber mais' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Enviar contato' })).toBeVisible()
    await expectNoHorizontalOverflow(page)
  })
})
