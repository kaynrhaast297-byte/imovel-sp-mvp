import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'

const mocks = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  resolveAddressByCep: vi.fn(),
}))

vi.mock('@/lib/admin-auth', () => ({ requireAdmin: mocks.requireAdmin }))
vi.mock('@/lib/geocoding', () => ({ resolveAddressByCep: mocks.resolveAddressByCep }))

const { POST } = await import('@/app/api/admin/geocode/route')

function request(body: unknown) {
  return new NextRequest('http://localhost/api/admin/geocode', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/admin/geocode', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.requireAdmin.mockReturnValue(null)
  })

  it('exige admin e valida CEP', async () => {
    mocks.requireAdmin.mockReturnValueOnce(NextResponse.json({ error: 'Admin nao autorizado.' }, { status: 401 }))
    expect((await POST(request({ cep: '01001000' }))).status).toBe(401)
    expect((await POST(request({ cep: '123' }))).status).toBe(400)
    const malformed = new NextRequest('http://localhost/api/admin/geocode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{',
    })
    expect((await POST(malformed)).status).toBe(400)
  })

  it('retorna endereco resolvido e trata falha externa com erro seguro', async () => {
    mocks.resolveAddressByCep.mockResolvedValueOnce({ cep: '01001-000', endereco: 'Praca da Se' })
    const success = await POST(request({ cep: '01001000', numero: '10' }))
    expect(success.status).toBe(200)
    expect(mocks.resolveAddressByCep).toHaveBeenCalledWith('01001-000', '10')

    mocks.resolveAddressByCep.mockRejectedValueOnce(new Error('CEP nao encontrado.'))
    const failure = await POST(request({ cep: '01001000' }))
    expect(failure.status).toBe(502)
    expect(await failure.json()).toEqual({ error: 'CEP nao encontrado.' })

    mocks.resolveAddressByCep.mockRejectedValueOnce('falha desconhecida')
    const unknownFailure = await POST(request({ cep: '01001000' }))
    expect(await unknownFailure.json()).toEqual({ error: 'Nao foi possivel consultar o endereco.' })
  })
})
