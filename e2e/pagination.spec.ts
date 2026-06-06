import { expect, test, type Page } from '@playwright/test'
import { mockImovel } from './fixtures'
import { expectNoBrowserErrors, gotoHydrated, mockExternalAssets, watchBrowserErrors } from './helpers'

const PER_PAGE = 12
const TOTAL_PAGES = 3

function paginationStatus(page: Page, text: string) {
  return page
    .getByRole('navigation', { name: 'Paginacao de imoveis' })
    .getByText(text, { exact: true })
}

function createPaginationResponse(page: number) {
  return {
    imoveis: Array.from({ length: PER_PAGE }, (_, index) => {
      const number = (page - 1) * PER_PAGE + index + 1

      return {
        ...mockImovel,
        id: `imovel-${number}`,
        titulo: `Imovel mockado ${number}`,
      }
    }),
    pagination: {
      page,
      per_page: PER_PAGE,
      total: PER_PAGE * TOTAL_PAGES,
      total_pages: TOTAL_PAGES,
      has_prev: page > 1,
      has_next: page < TOTAL_PAGES,
    },
  }
}

async function mockPaginatedImoveis(page: Page) {
  await page.route('**/api/imoveis**', route => {
    const requestedPage = Number(new URL(route.request().url()).searchParams.get('page') ?? '1')

    return route.fulfill({
      status: 200,
      json: createPaginationResponse(requestedPage),
    })
  })
}

test.describe('Paginacao da busca', () => {
  let browserErrors: string[]

  test.beforeEach(async ({ page }) => {
    browserErrors = watchBrowserErrors(page)
    await mockExternalAssets(page)
    await mockPaginatedImoveis(page)
  })

  test.afterEach(async () => {
    expectNoBrowserErrors(browserErrors)
  })

  test('pagina 1 carrega 12 imoveis e desabilita Anterior', async ({ page }) => {
    await gotoHydrated(page, '/busca?page=1')

    await expect(page.locator('.search-results-grid').getByRole('link')).toHaveCount(PER_PAGE)
    await expect(page.getByRole('button', { name: 'Anterior' })).toBeDisabled()
    await expect(paginationStatus(page, 'Pagina 1 de 3')).toBeVisible()
  })

  test('clicar em Proxima atualiza URL para pagina 2', async ({ page }) => {
    await gotoHydrated(page, '/busca?page=1')

    await page.getByRole('button', { name: 'Proxima' }).click()

    await expect(page).toHaveURL(/\/busca\?.*page=2/)
    await expect(paginationStatus(page, 'Pagina 2 de 3')).toBeVisible()
  })

  test('pagina 2 habilita Anterior', async ({ page }) => {
    await gotoHydrated(page, '/busca?page=2')

    await expect(page.getByRole('button', { name: 'Anterior' })).toBeEnabled()
    await expect(paginationStatus(page, 'Pagina 2 de 3')).toBeVisible()
  })

  test('ultima pagina desabilita Proxima', async ({ page }) => {
    await gotoHydrated(page, '/busca?page=3')

    await expect(page.getByRole('button', { name: 'Proxima' })).toBeDisabled()
    await expect(paginationStatus(page, 'Pagina 3 de 3')).toBeVisible()
  })

  test('preserva query params existentes ao paginar', async ({ page }) => {
    await gotoHydrated(page, '/busca?bairro=Pinheiros&negocio=venda')

    await page.getByRole('button', { name: 'Proxima' }).click()

    await expect(page).toHaveURL(/\/busca\?.*bairro=Pinheiros/)
    await expect(page).toHaveURL(/\/busca\?.*negocio=venda/)
    await expect(page).toHaveURL(/\/busca\?.*page=2/)
  })
})
