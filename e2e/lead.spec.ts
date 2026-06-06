import { expect, test } from '@playwright/test'
import { expectNoBrowserErrors, gotoHydrated, mockExternalAssets, watchBrowserErrors } from './helpers'

test.describe('Lead', () => {
  let browserErrors: string[]

  test.beforeEach(async ({ page }) => {
    browserErrors = watchBrowserErrors(page)
    await mockExternalAssets(page)
  })

  test.afterEach(async () => {
    expectNoBrowserErrors(browserErrors)
  })

  test('envia contato pela pagina de detalhe do imovel', async ({ page }) => {
    let payload: Record<string, unknown> | undefined

    await page.route('**/api/leads', async route => {
      const request = route.request()
      expect(request.method()).toBe('POST')

      payload = request.postDataJSON() as Record<string, unknown>
      expect(payload).toMatchObject({
        imovel_id: 'imovel-1',
        nome: 'Jonathan Silva',
        telefone: '(11) 98888-7777',
        email: 'jonathan@example.com',
        origem: 'pagina_imovel',
      })
      expect(payload.mensagem).toContain('Quero visitar este imovel')

      await route.fulfill({
        status: 201,
        json: { ok: true },
      })
    })

    await gotoHydrated(page, '/imovel/imovel-1')

    await expect(page.getByRole('heading', { name: 'Apto Pinheiros' })).toBeVisible()
    await expect(page.getByRole('heading', { name: /quero saber mais/i })).toBeVisible()

    await page.getByLabel('Nome').fill('Jonathan Silva')
    await page.getByLabel('Telefone').fill('(11) 98888-7777')
    await page.getByLabel('Email').fill('jonathan@example.com')
    await page.getByLabel('Mensagem').fill('Quero visitar este imovel ainda esta semana.')

    await page.getByRole('button', { name: /enviar contato/i }).click()

    await expect(page.getByText(/contato enviado\. em breve alguem fala com voce\./i)).toBeVisible()
    await expect.poll(() => payload).toBeDefined()
    await expect(page.getByLabel('Nome')).toHaveValue('')
    await expect(page.getByLabel('Telefone')).toHaveValue('')
    await expect(page.getByLabel('Email')).toHaveValue('')
    await expect(page.getByLabel('Mensagem')).toHaveValue('Tenho interesse no imovel: Apto Pinheiros')
  })
})
