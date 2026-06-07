import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'

const mocks = vi.hoisted(() => ({
  deleteImovel: vi.fn(),
  getImovelById: vi.fn(),
  requireAdmin: vi.fn(),
  updateImovel: vi.fn(),
}))

vi.mock('@/lib/admin-auth', () => ({
  requireAdmin: mocks.requireAdmin,
}))

vi.mock('@/lib/supabase', () => ({
  deleteImovel: mocks.deleteImovel,
  getImovelById: mocks.getImovelById,
  updateImovel: mocks.updateImovel,
}))

const { DELETE, GET, PUT } = await import('@/app/api/imoveis/[id]/route')

function makeRequest(method = 'GET', body?: unknown) {
  return new NextRequest('http://localhost/api/imoveis/imovel-1', {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })
}

function params(id = 'imovel-1') {
  return { params: Promise.resolve({ id }) }
}

describe('GET /api/imoveis/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('retorna o imovel encontrado', async () => {
    const imovel = { id: 'imovel-1', titulo: 'Apartamento em Pinheiros' }
    mocks.getImovelById.mockResolvedValueOnce(imovel)

    const res = await GET(makeRequest(), params())
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.imovel).toEqual(imovel)
    expect(mocks.getImovelById).toHaveBeenCalledWith('imovel-1')
  })

  it('retorna 404 quando o imovel nao existe', async () => {
    mocks.getImovelById.mockRejectedValueOnce(new Error('not found'))

    const res = await GET(makeRequest(), params())
    const json = await res.json()

    expect(res.status).toBe(404)
    expect(json.error).toBe('Imovel nao encontrado')
  })
})

describe('PUT /api/imoveis/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.requireAdmin.mockReturnValue(null)
  })

  it('bloqueia atualizacao quando admin nao esta autorizado', async () => {
    mocks.requireAdmin.mockReturnValueOnce(
      NextResponse.json({ error: 'Admin nao autorizado.' }, { status: 401 }),
    )

    const res = await PUT(makeRequest('PUT', { preco: 950000 }), params())
    const json = await res.json()

    expect(res.status).toBe(401)
    expect(json.error).toMatch(/nao autorizado/i)
    expect(mocks.updateImovel).not.toHaveBeenCalled()
  })

  it('atualiza o imovel pelo id', async () => {
    const imovel = { id: 'imovel-1', preco: 950000 }
    mocks.updateImovel.mockResolvedValueOnce(imovel)

    const res = await PUT(makeRequest('PUT', { preco: 950000 }), params())
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.imovel).toEqual(imovel)
    expect(mocks.updateImovel).toHaveBeenCalledWith('imovel-1', { preco: 950000 })
  })

  it('rejeita update vazio ou com campos protegidos', async () => {
    const empty = await PUT(makeRequest('PUT', {}), params())
    const protectedField = await PUT(makeRequest('PUT', { id: 'outro-id' }), params())

    expect(empty.status).toBe(400)
    expect(protectedField.status).toBe(400)
    expect(await protectedField.json()).toEqual({ error: 'Dados do imovel invalidos.' })
    expect(mocks.updateImovel).not.toHaveBeenCalled()
  })

  it('rejeita JSON malformado no update', async () => {
    const req = new NextRequest('http://localhost/api/imoveis/imovel-1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: '{',
    })

    const res = await PUT(req, params())

    expect(res.status).toBe(400)
    expect(mocks.updateImovel).not.toHaveBeenCalled()
  })

  it('retorna 500 quando a atualizacao falha', async () => {
    mocks.updateImovel.mockRejectedValueOnce(new Error('update falhou'))

    const res = await PUT(makeRequest('PUT', { preco: 950000 }), params())
    const json = await res.json()

    expect(res.status).toBe(500)
    expect(json).toEqual({ error: 'Erro ao atualizar' })
  })
})

describe('DELETE /api/imoveis/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.requireAdmin.mockReturnValue(null)
  })

  it('bloqueia exclusao quando admin nao esta autorizado', async () => {
    mocks.requireAdmin.mockReturnValueOnce(
      NextResponse.json({ error: 'Admin nao autorizado.' }, { status: 401 }),
    )

    const res = await DELETE(makeRequest('DELETE'), params())
    const json = await res.json()

    expect(res.status).toBe(401)
    expect(json.error).toMatch(/nao autorizado/i)
    expect(mocks.deleteImovel).not.toHaveBeenCalled()
  })

  it('marca o imovel como deletado', async () => {
    mocks.deleteImovel.mockResolvedValueOnce(undefined)

    const res = await DELETE(makeRequest('DELETE'), params())
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.ok).toBe(true)
    expect(mocks.deleteImovel).toHaveBeenCalledWith('imovel-1')
  })

  it('retorna 500 quando a exclusao falha', async () => {
    mocks.deleteImovel.mockRejectedValueOnce(new Error('delete falhou'))

    const res = await DELETE(makeRequest('DELETE'), params())
    const json = await res.json()

    expect(res.status).toBe(500)
    expect(json).toEqual({ error: 'Erro ao deletar' })
  })
})
