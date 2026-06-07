import { afterEach, describe, expect, it } from 'vitest'
import { NextRequest } from 'next/server'
import { ADMIN_SESSION_COOKIE, createAdminSessionValue } from '@/lib/admin-auth'
import { resetRateLimits } from '@/lib/rate-limit'
import { DELETE, GET, POST } from '@/app/api/admin/session/route'

function request(method = 'GET', body?: unknown, headers?: HeadersInit) {
  return new NextRequest('http://localhost/api/admin/session', {
    method,
    headers: body ? { 'Content-Type': 'application/json', ...headers } : headers,
    body: body ? JSON.stringify(body) : undefined,
  })
}

describe('/api/admin/session', () => {
  afterEach(() => {
    delete process.env.IMOVEL_ADMIN_TOKEN
    delete process.env.ADMIN_LOGIN_RATE_LIMIT_MAX
    delete process.env.ADMIN_LOGIN_RATE_LIMIT_WINDOW_MS
    resetRateLimits()
  })

  it('cria cookie HttpOnly para token valido', async () => {
    process.env.IMOVEL_ADMIN_TOKEN = 'segredo'

    const response = await POST(request('POST', { token: 'segredo' }))
    const cookie = response.headers.get('set-cookie')

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ authenticated: true })
    expect(response.headers.get('Cache-Control')).toBe('no-store')
    expect(cookie).toContain(`${ADMIN_SESSION_COOKIE}=`)
    expect(cookie).toContain('HttpOnly')
    expect(cookie).toContain('SameSite=strict')
    expect(cookie).not.toContain('segredo')
  })

  it('rejeita token invalido ou payload com campos extras', async () => {
    process.env.IMOVEL_ADMIN_TOKEN = 'segredo'

    const invalidToken = await POST(request('POST', { token: 'incorreto' }))
    const extraField = await POST(request('POST', { token: 'segredo', role: 'admin' }))

    expect(invalidToken.status).toBe(401)
    expect(extraField.status).toBe(400)
  })

  it('rejeita JSON malformado e informa sessao ausente sem erro de console no browser', async () => {
    process.env.IMOVEL_ADMIN_TOKEN = 'segredo'
    const malformed = new NextRequest('http://localhost/api/admin/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{',
    })

    expect((await POST(malformed)).status).toBe(400)
    const sessionStatus = await GET(request())
    expect(sessionStatus.status).toBe(200)
    expect(await sessionStatus.json()).toEqual({ authenticated: false })
  })

  it('valida sessao existente e limpa cookie no logout', async () => {
    process.env.IMOVEL_ADMIN_TOKEN = 'segredo'
    const session = createAdminSessionValue()

    const authenticated = await GET(request('GET', undefined, {
      cookie: `${ADMIN_SESSION_COOKIE}=${session}`,
    }))
    const logout = await DELETE()

    expect(authenticated.status).toBe(200)
    expect(await authenticated.json()).toEqual({ authenticated: true })
    expect(authenticated.headers.get('Cache-Control')).toBe('no-store')
    expect(logout.headers.get('set-cookie')).toContain(`${ADMIN_SESSION_COOKIE}=;`)
    expect(logout.headers.get('set-cookie')).toContain('Max-Age=0')
  })

  it('limita tentativas repetidas de login por IP', async () => {
    process.env.IMOVEL_ADMIN_TOKEN = 'segredo'
    process.env.ADMIN_LOGIN_RATE_LIMIT_MAX = '1'

    const first = await POST(request('POST', { token: 'incorreto' }))
    const limited = await POST(request('POST', { token: 'segredo' }))

    expect(first.status).toBe(401)
    expect(limited.status).toBe(429)
    expect(limited.headers.get('Retry-After')).toMatch(/^\d+$/)
  })
})
