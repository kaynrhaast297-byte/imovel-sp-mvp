import { expect, test } from '@playwright/test'
import { mockImoveisResponse } from './fixtures'
import { expectNoBrowserErrors, gotoHydrated, mockExternalAssets, watchBrowserErrors } from './helpers'

const expectedApiError = 'console.error: Failed to load resource: the server responded with a status of 500'

test.describe('Busca avancada', () => {
  let browserErrors: string[]
  let apiShouldFail = false
  let apiFailureExpected = false

  test.beforeEach(async ({ page }) => {
    browserErrors = watchBrowserErrors(page)
    apiShouldFail = false
    apiFailureExpected = false
    await mockExternalAssets(page)
    await page.route('**/api/imoveis**', route =>
      route.fulfill(
        apiShouldFail
          ? {
              status: 500,
              json: { error: 'Falha controlada na busca.' },
            }
          : {
              status: 200,
              json: mockImoveisResponse,
            },
      ),
    )
  })

  test.afterEach(async () => {
    const unexpectedErrors = browserErrors.filter(
      error => !(apiFailureExpected && error.startsWith(expectedApiError)),
    )
    expectNoBrowserErrors(unexpectedErrors)
  })

  test('exibe skeletons de cards enquanto a busca esta carregando', async ({ page }) => {
    await page.unroute('**/api/imoveis**')
    let releaseResponse = () => {}
    const responseGate = new Promise<void>((resolve) => {
      releaseResponse = resolve
    })

    await page.route('**/api/imoveis**', async route => {
      await responseGate
      await route.fulfill({ status: 200, json: mockImoveisResponse })
    })

    await page.goto('/busca')

    await expect(page.locator('.property-card-skeleton')).toHaveCount(6)
    releaseResponse()
    await expect(page.getByText('Apto Pinheiros', { exact: true })).toBeVisible()
  })

  test('aplica filtros combinados e atualiza todos os query params', async ({ page }) => {
    await gotoHydrated(page, '/busca')

    await page.getByPlaceholder('Ex: Moema').fill('Pinheiros')
    await page.getByLabel('Tipo').selectOption('apartamento')
    await page.getByLabel('Negocio').selectOption('aluguel')
    await page.getByLabel('Quartos minimos').selectOption('2')
    await page.getByPlaceholder('R$ 0').fill('6500')
    await page.getByRole('button', { name: 'Aplicar filtros' }).click()

    await expect(page).toHaveURL(/bairro=Pinheiros/)
    await expect(page).toHaveURL(/tipo=apartamento/)
    await expect(page).toHaveURL(/negocio=aluguel/)
    await expect(page).toHaveURL(/quartos=2/)
    await expect(page).toHaveURL(/preco_max=6500/)
    await expect(page).toHaveURL(/page=1/)
    await expect(page).toHaveURL(/per_page=12/)
  })

  test('ordenacao preserva filtros e volta para pagina 1', async ({ page }) => {
    await gotoHydrated(page, '/busca?bairro=Pinheiros&negocio=venda&page=2&per_page=12')

    await page.getByLabel('Ordenacao').selectOption('preco_asc')

    await expect(page).toHaveURL(/bairro=Pinheiros/)
    await expect(page).toHaveURL(/negocio=venda/)
    await expect(page).toHaveURL(/ordenacao=preco_asc/)
    await expect(page).toHaveURL(/page=1/)
    await expect(page).toHaveURL(/per_page=12/)
  })

  test('hidrata os filtros a partir da URL', async ({ page }) => {
    await gotoHydrated(page, '/busca?bairro=Moema&tipo=casa&negocio=aluguel&quartos=3&preco_max=9000')

    await expect(page.getByPlaceholder('Ex: Moema')).toHaveValue('Moema')
    await expect(page.getByLabel('Tipo')).toHaveValue('casa')
    await expect(page.getByLabel('Negocio')).toHaveValue('aluguel')
    await expect(page.getByLabel('Quartos minimos')).toHaveValue('3')
    await expect(page.getByPlaceholder('R$ 0')).toHaveValue('9000')
  })

  test('exibe estado vazio quando nenhum imovel e encontrado', async ({ page }) => {
    await page.unroute('**/api/imoveis**')
    await page.route('**/api/imoveis**', route =>
      route.fulfill({
        status: 200,
        json: {
          imoveis: [],
          pagination: {
            page: 1,
            per_page: 12,
            total: 0,
            total_pages: 1,
            has_next: false,
            has_prev: false,
          },
        },
      }),
    )

    await gotoHydrated(page, '/busca?bairro=Inexistente')

    await expect(page.getByRole('heading', { name: '0 imoveis encontrados' })).toBeVisible()
    await expect(page.getByText('Nenhum imovel encontrado', { exact: true })).toBeVisible()
    await page.getByRole('button', { name: 'Limpar filtros' }).click()
    await expect(page).toHaveURL(/\/busca\?page=1&per_page=12$/)
    await expect(page.getByRole('heading', { name: '0 imoveis encontrados' })).toBeVisible()
  })

  test('exibe mensagem da API e permite tentar novamente', async ({ page }) => {
    apiShouldFail = true
    apiFailureExpected = true

    await gotoHydrated(page, '/busca?bairro=Pinheiros')

    await expect(page.getByRole('heading', { name: 'Nao foi possivel carregar os imoveis' })).toBeVisible()
    await expect(page.getByText('Falha controlada na busca.', { exact: true })).toBeVisible()
    await expect(page.getByText('Tente novamente em alguns instantes.', { exact: true })).toBeVisible()

    apiShouldFail = false
    await page.getByRole('button', { name: 'Tentar novamente' }).click()
    await expect(page.getByText('Apto Pinheiros', { exact: true })).toBeVisible()
  })
})
