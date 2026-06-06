import { afterEach, describe, expect, it } from 'vitest'
import { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'

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

  it('aceita bearer token e x-admin-token validos', () => {
    process.env.IMOVEL_ADMIN_TOKEN = 'segredo'

    expect(requireAdmin(request({ authorization: 'Bearer segredo' }))).toBeNull()
    expect(requireAdmin(request({ 'x-admin-token': 'segredo' }))).toBeNull()
  })

  it('retorna 401 para token ausente, diferente ou com tamanho diferente', async () => {
    process.env.IMOVEL_ADMIN_TOKEN = 'segredo'

    const invalidHeaders: Array<HeadersInit | undefined> = [
      undefined,
      { authorization: 'Bearer incorreto' },
      { 'x-admin-token': 'x' },
    ]

    for (const headers of invalidHeaders) {
      const response = requireAdmin(request(headers))
      const json = await response?.json()

      expect(response?.status).toBe(401)
      expect(json.error).toMatch(/nao autorizado/i)
    }
  })
})
