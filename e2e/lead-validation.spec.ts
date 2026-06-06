import { expect, test, type Page } from '@playwright/test'
import { expectNoBrowserErrors, gotoHydrated, mockExternalAssets, watchBrowserErrors } from './helpers'

const validationMessages = [
  'Informe seu nome.',
  'Informe um telefone valido.',
  'Escreva uma mensagem um pouco maior.',
]

async function fillValidLead(page: Page) {
  await page.getByLabel('Nome').fill('Jonathan Silva')
  await page.getByLabel('Telefone').fill('(11) 98888-7777')
  await page.getByLabel('Email').fill('jonathan@example.com')
  await page.getByLabel('Mensagem').fill('Quero visitar este imovel ainda esta semana.')
}

test.describe('Validacoes do formulario de lead', () => {
  let browserErrors: string[]

  test.beforeEach(async ({ page }) => {
    browserErrors = watchBrowserErrors(page)
    await mockExternalAssets(page)
    await page.route('**/api/leads', route =>
      route.fulfill({
        status: 201,
        json: { ok: true },
      }),
    )
    await gotoHydrated(page, '/imovel/imovel-1')
  })

  test.afterEach(async () => {
    expectNoBrowserErrors(browserErrors)
  })

  test('exibe erro quando nome esta vazio', async ({ page }) => {
    await page.getByLabel('Telefone').fill('(11) 98888-7777')
    await page.getByRole('button', { name: /enviar contato/i }).click()

    await expect(page.getByText('Informe seu nome.', { exact: true })).toBeVisible()
  })

  test('exibe erro quando telefone e invalido', async ({ page }) => {
    await page.getByLabel('Nome').fill('Jonathan Silva')
    await page.getByLabel('Telefone').fill('123')
    await page.getByRole('button', { name: /enviar contato/i }).click()

    await expect(page.getByText('Informe um telefone valido.', { exact: true })).toBeVisible()
  })

  test('exibe erro quando mensagem e muito curta', async ({ page }) => {
    await page.getByLabel('Nome').fill('Jonathan Silva')
    await page.getByLabel('Telefone').fill('(11) 98888-7777')
    await page.getByLabel('Mensagem').fill('Curta')
    await page.getByRole('button', { name: /enviar contato/i }).click()

    await expect(page.getByText('Escreva uma mensagem um pouco maior.', { exact: true })).toBeVisible()
  })

  test('nao exibe erros quando formulario e valido', async ({ page }) => {
    await fillValidLead(page)
    await page.getByRole('button', { name: /enviar contato/i }).click()

    await expect(page.getByText(/contato enviado\. em breve alguem fala com voce\./i)).toBeVisible()
    for (const message of validationMessages) {
      await expect(page.getByText(message, { exact: true })).toHaveCount(0)
    }
  })
})
