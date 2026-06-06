import { expect, type Page } from '@playwright/test'

const transparentPng = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=',
  'base64',
)

export async function gotoHydrated(page: Page, path: string) {
  await page.goto(path)
  await page.waitForLoadState('networkidle')
}

export async function mockExternalAssets(page: Page) {
  await page.route('https://images.unsplash.com/**', route =>
    route.fulfill({
      status: 200,
      contentType: 'image/png',
      body: transparentPng,
    }),
  )

  await page.route('https://api.qrserver.com/**', route =>
    route.fulfill({
      status: 200,
      contentType: 'image/png',
      body: transparentPng,
    }),
  )

  await page.route('https://www.openstreetmap.org/export/embed.html**', route =>
    route.fulfill({
      status: 200,
      contentType: 'text/html',
      body: '<!doctype html><html><body>Mapa mockado</body></html>',
    }),
  )
}

export function watchBrowserErrors(page: Page) {
  const errors: string[] = []

  page.on('pageerror', error => {
    errors.push(`pageerror: ${error.message}`)
  })

  page.on('console', message => {
    if (message.type() === 'error') errors.push(`console.error: ${message.text()}`)
  })

  page.on('requestfailed', request => {
    const failure = request.failure()
    if (failure?.errorText === 'net::ERR_ABORTED') return
    if (failure) errors.push(`requestfailed: ${request.url()} - ${failure.errorText}`)
  })

  return errors
}

export function expectNoBrowserErrors(errors: string[]) {
  expect(errors, errors.join('\n')).toEqual([])
}
