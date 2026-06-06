import { expect, test } from '@playwright/test'
import { expectNoBrowserErrors, gotoHydrated, watchBrowserErrors } from './helpers'

test.describe('Pagina /ai', () => {
  let browserErrors: string[]

  test.beforeEach(async ({ page }) => {
    browserErrors = watchBrowserErrors(page)
    await page.route('**/api/ai**', route =>
      route.fulfill({
        status: 200,
        json: {
          response: 'Resposta mockada da IA.',
          model: 'qwen2.5-coder:7b',
          done: true,
        },
      }),
    )
  })

  test.afterEach(async () => {
    expectNoBrowserErrors(browserErrors)
  })

  test('carrega titulo, textarea e botao de envio', async ({ page }) => {
    await gotoHydrated(page, '/ai')

    await expect(page.getByRole('heading', { name: /teste de ia local/i })).toBeVisible()
    await expect(page.getByPlaceholder(/digite seu prompt/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /enviar/i })).toBeVisible()
  })

  test('envia prompt e exibe resposta mockada com modelo', async ({ page }) => {
    await gotoHydrated(page, '/ai')

    await page.getByPlaceholder(/digite seu prompt/i).fill('O que e Next.js?')
    await expect(page.getByRole('button', { name: /enviar/i })).toBeEnabled()
    await page.getByRole('button', { name: /enviar/i }).click()

    await expect(page.getByText(/resposta mockada da ia\./i)).toBeVisible()
    await expect(page.getByText(/modelo: qwen2\.5-coder:7b/i)).toBeVisible()
  })

  test('botao fica desabilitado durante carregamento', async ({ page }) => {
    await page.unroute('**/api/ai**')
    await page.route('**/api/ai**', async route => {
      await new Promise(resolve => setTimeout(resolve, 500))
      await route.fulfill({
        status: 200,
        json: {
          response: 'Ok',
          model: 'qwen2.5-coder:7b',
          done: true,
        },
      })
    })

    await gotoHydrated(page, '/ai')
    await page.getByPlaceholder(/digite seu prompt/i).fill('Teste')
    await expect(page.getByRole('button', { name: /enviar/i })).toBeEnabled()
    await page.getByRole('button', { name: /enviar/i }).click()

    await expect(page.getByRole('button', { name: /aguardando resposta/i })).toBeDisabled()
    await expect(page.getByText('Ok')).toBeVisible()
  })
})
