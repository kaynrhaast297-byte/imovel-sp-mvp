import { expect, test, type Page } from '@playwright/test'
import { mockImoveisResponse } from './fixtures'
import { expectNoBrowserErrors, gotoHydrated, mockExternalAssets, watchBrowserErrors } from './helpers'

const adminImoveisResponse = {
  imoveis: [
    {
      ...mockImoveisResponse.imoveis[0],
      updated_at: '2026-07-20T12:00:00.000Z',
    },
    {
      ...mockImoveisResponse.imoveis[0],
      id: 'imovel-2',
      titulo: 'Casa no Centro de Guarulhos',
      tipo: 'casa',
      negocio: 'aluguel',
      status: 'inativo',
      preco: 4500,
      bairro: 'Centro',
      cidade: 'Guarulhos',
      updated_at: '2026-07-21T12:00:00.000Z',
    },
  ],
  pagination: {
    page: 1,
    per_page: 20,
    total: 2,
    total_pages: 1,
    has_next: false,
    has_prev: false,
  },
}

async function mockAdminInventory(page: Page) {
  await page.route('**/api/admin/session', route =>
    route.fulfill({ status: 200, json: { authenticated: true } }),
  )
  await page.route('**/api/admin/imoveis?**', route =>
    route.fulfill({ status: 200, json: adminImoveisResponse }),
  )
}

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

  test('busca editorial permanece visualmente estavel', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1024 })
    await gotoHydrated(page, '/busca?bairro=Pinheiros&negocio=venda&page=1&per_page=12')

    await expect(page.locator('.search-page')).toHaveScreenshot('search-editorial.png', {
      animations: 'disabled',
      caret: 'hide',
      maxDiffPixelRatio: 0.03,
    })
  })

  test('inventario admin permanece visualmente estavel', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await mockAdminInventory(page)
    await gotoHydrated(page, '/admin/imoveis')
    await expect(page.getByText('Casa no Centro de Guarulhos')).toBeVisible()

    await expect(page.locator('.site-main')).toHaveScreenshot('admin-properties.png', {
      animations: 'disabled',
      caret: 'hide',
      maxDiffPixelRatio: 0.03,
    })
  })

  test('inventario admin mobile permanece visualmente estavel', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await mockAdminInventory(page)
    await gotoHydrated(page, '/admin/imoveis')
    await expect(page.getByText('Casa no Centro de Guarulhos')).toBeVisible()

    await expect(page.locator('.site-main')).toHaveScreenshot('admin-properties-mobile.png', {
      animations: 'disabled',
      caret: 'hide',
      maxDiffPixelRatio: 0.03,
    })
  })
})
