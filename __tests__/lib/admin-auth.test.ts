import { afterEach, describe, expect, it } from 'vitest'
import { NextRequest } from 'next/server'
import {
  ADMIN_SESSION_COOKIE,
  createAdminSessionValue,
  requireAdmin,
} from '@/lib/admin-auth'

function request(headers?: HeadersInit) {
  return new NextRequest('http://localhost/api/admin', { headers })
}

describe('requireAdmin', () => {
  afterEach(() => {
    delete process.env.IMOVEL_ADMIN_TOKEN
  })

  it('retorna 503 quando o token admin nao esta configurado', async () => {
    const response = requireAdmin(request())
    const json = await response?.json()

    expect(response?.status).toBe(503)
    expect(json.error).toMatch(/admin nao configurado/i)
  })

  it('nao aceita token estatico diretamente nas rotas protegidas', async () => {
    process.env.IMOVEL_ADMIN_TOKEN = 'segredo'

    const bearer = requireAdmin(request({ authorization: 'Bearer segredo' }))
    const customHeader = requireAdmin(request({ 'x-admin-token': 'segredo' }))

    expect(bearer?.status).toBe(401)
    expect(customHeader?.status).toBe(401)
  })

  it('aceita sessao administrativa assinada sem expor o token', () => {
    process.env.IMOVEL_ADMIN_TOKEN = 'segredo'
    const session = createAdminSessionValue()

    expect(session).not.toContain('segredo')
    expect(requireAdmin(request({ cookie: `${ADMIN_SESSION_COOKIE}=${session}` }))).toBeNull()
  })

  it('rejeita sessao expirada mesmo quando a assinatura e valida', async () => {
    process.env.IMOVEL_ADMIN_TOKEN = 'segredo'
    const expired = createAdminSessionValue(Date.now() - (9 * 60 * 60 * 1000))

    const response = requireAdmin(request({ cookie: `${ADMIN_SESSION_COOKIE}=${expired}` }))

    expect(response?.status).toBe(401)
  })

  it('retorna 401 para sessao ausente ou invalida', async () => {
    process.env.IMOVEL_ADMIN_TOKEN = 'segredo'

    const invalidHeaders: Array<HeadersInit | undefined> = [
      undefined,
      { cookie: `${ADMIN_SESSION_COOKIE}=incorreto` },
      { cookie: `${ADMIN_SESSION_COOKIE}=x` },
    ]

    for (const headers of invalidHeaders) {
      const response = requireAdmin(request(headers))
      const json = await response?.json()

      expect(response?.status).toBe(401)
      expect(json.error).toMatch(/nao autorizado/i)
    }
  })
})
