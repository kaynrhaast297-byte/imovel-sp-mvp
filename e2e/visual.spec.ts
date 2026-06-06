import { expect, test } from '@playwright/test'
import { mockImoveisResponse } from './fixtures'
import { expectNoBrowserErrors, gotoHydrated, mockExternalAssets, watchBrowserErrors } from './helpers'

test.describe('Regressao visual', () => {
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

  test('hero e busca da home permanecem visualmente estaveis', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await gotoHydrated(page, '/')

    await expect(page.locator('.home-hero')).toHaveScreenshot('home-hero.png', {
      animations: 'disabled',
      caret: 'hide',
      maxDiffPixelRatio: 0.03,
    })
  })

  test('detalhe mobile e formulario permanecem visualmente estaveis', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await gotoHydrated(page, '/imovel/imovel-1')

    await expect(page.locator('.property-detail-layout')).toHaveScreenshot('detail-mobile.png', {
      animations: 'disabled',
      caret: 'hide',
      maxDiffPixelRatio: 0.03,
    })
  })
})
