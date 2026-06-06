import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'
import { mockImoveisResponse } from './fixtures'
import { expectNoBrowserErrors, gotoHydrated, mockExternalAssets, watchBrowserErrors } from './helpers'

async function expectNoSeriousAccessibilityViolations(
  page: Page,
  context: string,
  selector?: string,
) {
  const builder = new AxeBuilder({ page })
  const results = await (selector ? builder.include(selector) : builder).analyze()
  const violations = results.violations.filter(
    violation => violation.impact === 'critical' || violation.impact === 'serious',
  )

  if (violations.length > 0) {
    const report = violations
      .map(violation => [
        `[${context}] ${violation.id}`,
        `impact: ${violation.impact}`,
        `description: ${violation.description}`,
        ...violation.nodes.map(node => `node: ${node.target.join(' > ')} - ${node.failureSummary ?? ''}`),
      ].join('\n'))
      .join('\n\n')

    process.stderr.write(`\n${report}\n`)
    expect(violations, report).toEqual([])
  }
}

test.describe('Acessibilidade', () => {
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

  test('home nao possui violacoes critical ou serious', async ({ page }) => {
    await gotoHydrated(page, '/')

    await expectNoSeriousAccessibilityViolations(page, 'Home')
  })

  test('busca com resultados nao possui violacoes critical ou serious', async ({ page }) => {
    await gotoHydrated(page, '/busca?bairro=Pinheiros&negocio=venda&page=1&per_page=12')
    await expect(page.getByRole('heading', { name: /1 imovel encontrado/i })).toBeVisible()

    await expectNoSeriousAccessibilityViolations(page, 'Busca')
  })

  test('detalhe do imovel nao possui violacoes critical ou serious', async ({ page }) => {
    await gotoHydrated(page, '/imovel/imovel-1')
    await expect(page.getByRole('heading', { name: 'Apto Pinheiros' })).toBeVisible()

    await expectNoSeriousAccessibilityViolations(page, 'Detalhe do imovel')
  })

  test('pagina de IA nao possui violacoes critical ou serious', async ({ page }) => {
    await gotoHydrated(page, '/ai')

    await expectNoSeriousAccessibilityViolations(page, 'Pagina /ai')
  })

  test('formulario de lead inicial nao possui violacoes critical ou serious', async ({ page }) => {
    await gotoHydrated(page, '/imovel/imovel-1')
    await expect(page.getByRole('heading', { name: /quero saber mais/i })).toBeVisible()

    await expectNoSeriousAccessibilityViolations(page, 'Formulario de lead inicial', 'form')
  })

  test('formulario de lead validado nao possui violacoes critical ou serious', async ({ page }) => {
    await gotoHydrated(page, '/imovel/imovel-1')
    await page.getByRole('button', { name: /enviar contato/i }).click()
    await expect(page.getByText('Informe seu nome.', { exact: true })).toBeVisible()
    await expect(page.getByText('Informe um telefone valido.', { exact: true })).toBeVisible()

    await expectNoSeriousAccessibilityViolations(page, 'Formulario de lead apos validacao', 'form')
  })
})
