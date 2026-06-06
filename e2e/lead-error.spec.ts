import { expect, test } from '@playwright/test'
import { expectNoBrowserErrors, gotoHydrated, mockExternalAssets, watchBrowserErrors } from './helpers'

const expectedApiError = 'console.error: Failed to load resource: the server responded with a status of 500'

test.describe('Erro no envio do lead', () => {
  let browserErrors: string[]

  test.beforeEach(async ({ page }) => {
    browserErrors = watchBrowserErrors(page)
    await mockExternalAssets(page)
    await page.route('**/api/leads', route =>
      route.fulfill({
        status: 500,
        json: { error: 'Erro ao salvar contato. Tente novamente.' },
      }),
    )
    await gotoHydrated(page, '/imovel/imovel-1')
  })

  test.afterEach(async () => {
    const unexpectedErrors = browserErrors.filter(error => !error.startsWith(expectedApiError))
    expectNoBrowserErrors(unexpectedErrors)
  })

  test('mantem campos preenchidos quando API falha', async ({ page }) => {
    const values = {
      nome: 'Jonathan Silva',
      telefone: '(11) 98888-7777',
      email: 'jonathan@example.com',
      mensagem: 'Quero visitar este imovel ainda esta semana.',
    }

    await page.getByLabel('Nome').fill(values.nome)
    await page.getByLabel('Telefone').fill(values.telefone)
    await page.getByLabel('Email').fill(values.email)
    await page.getByLabel('Mensagem').fill(values.mensagem)
    await page.getByRole('button', { name: /enviar contato/i }).click()

    await expect(page.getByText('Erro ao salvar contato. Tente novamente.', { exact: true })).toBeVisible()
    await expect(page.getByLabel('Nome')).toHaveValue(values.nome)
    await expect(page.getByLabel('Telefone')).toHaveValue(values.telefone)
    await expect(page.getByLabel('Email')).toHaveValue(values.email)
    await expect(page.getByLabel('Mensagem')).toHaveValue(values.mensagem)
    await expect(page.getByRole('button', { name: /enviar contato/i })).toBeEnabled()
  })
})
