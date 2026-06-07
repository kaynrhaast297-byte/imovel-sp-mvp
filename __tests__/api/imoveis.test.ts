import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'

const mocks = vi.hoisted(() => ({
  createImovel: vi.fn(),
  getImoveis: vi.fn(),
  requireAdmin: vi.fn(),
}))

vi.mock('@/lib/admin-auth', () => ({
  requireAdmin: mocks.requireAdmin,
}))

vi.mock('@/lib/supabase', () => ({
  createImovel: mocks.createImovel,
  getImoveis: mocks.getImoveis,
}))

const { GET, POST } = await import('@/app/api/imoveis/route')

const validImovel = {
  titulo: 'Novo imovel',
  tipo: 'apartamento',
  negocio: 'venda',
  preco: 900000,
  area_m2: 90,
  bairro: 'Pinheiros',
  cidade: 'Sao Paulo',
  estado: 'sp',
}

function makeJsonRequest(body: unknown) {
  return new NextRequest('http://localhost/api/imoveis', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('GET /api/imoveis', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('monta filtros a partir dos query params e retorna a listagem', async () => {
    const result = {
      imoveis: [{ id: 'imovel-1', titulo: 'Apartamento em Pinheiros' }],
      pagination: { page: 2, per_page: 24, total: 30, total_pages: 2, has_next: false, has_prev: true },
    }
    mocks.getImoveis.mockResolvedValueOnce(result)

    const req = new NextRequest(
      'http://localhost/api/imoveis?tipo=apartamento&negocio=venda&bairro=Pinheiros&cidade=Sao%20Paulo&preco_min=500000&preco_max=1200000&quartos=2&ordenacao=preco_asc&page=2&per_page=24',
    )

    const res = await GET(req)
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json).toEqual(result)
    expect(mocks.getImoveis).toHaveBeenCalledWith({
      tipo: 'apartamento',
      negocio: 'venda',
      bairro: 'Pinheiros',
      cidade: 'Sao Paulo',
      preco_min: 500000,
      preco_max: 1200000,
      quartos_min: 2,
      ordenacao: 'preco_asc',
      page: 2,
      per_page: 24,
    })
  })

  it('retorna 500 quando a busca falha', async () => {
    mocks.getImoveis.mockRejectedValueOnce(new Error('falha no banco'))

    const res = await GET(new NextRequest('http://localhost/api/imoveis'))
    const json = await res.json()

    expect(res.status).toBe(500)
    expect(json).toEqual({ error: 'Erro ao buscar imoveis' })
  })
})

describe('POST /api/imoveis', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.requireAdmin.mockReturnValue(null)
  })

  it('bloqueia criacao quando admin nao esta autorizado', async () => {
    mocks.requireAdmin.mockReturnValueOnce(
      NextResponse.json({ error: 'Admin nao autorizado.' }, { status: 401 }),
    )

    const res = await POST(makeJsonRequest({ titulo: 'Novo imovel' }))
    const json = await res.json()

    expect(res.status).toBe(401)
    expect(json.error).toMatch(/nao autorizado/i)
    expect(mocks.createImovel).not.toHaveBeenCalled()
  })

  it('cria imovel ativo com timestamps server-side', async () => {
    const imovelCriado = { id: 'imovel-1', titulo: 'Novo imovel', status: 'ativo' }
    mocks.createImovel.mockResolvedValueOnce(imovelCriado)

    const res = await POST(makeJsonRequest(validImovel))
    const json = await res.json()

    expect(res.status).toBe(201)
    expect(json.imovel).toEqual(imovelCriado)
    expect(mocks.createImovel).toHaveBeenCalledWith({
      titulo: 'Novo imovel',
      tipo: 'apartamento',
      negocio: 'venda',
      preco: 900000,
      area_m2: 90,
      bairro: 'Pinheiros',
      cidade: 'Sao Paulo',
      estado: 'SP',
      status: 'ativo',
      created_at: expect.any(String),
      updated_at: expect.any(String),
    })
  })

  it('rejeita campos ausentes ou nao permitidos', async () => {
    const missingRequired = await POST(makeJsonRequest({ titulo: 'Incompleto' }))
    const unknownField = await POST(makeJsonRequest({ ...validImovel, admin: true }))

    expect(missingRequired.status).toBe(400)
    expect(unknownField.status).toBe(400)
    expect(await unknownField.json()).toEqual({ error: 'Dados do imovel invalidos.' })
    expect(mocks.createImovel).not.toHaveBeenCalled()
  })

  it('rejeita JSON malformado', async () => {
    const req = new NextRequest('http://localhost/api/imoveis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{',
    })

    const res = await POST(req)

    expect(res.status).toBe(400)
    expect(mocks.createImovel).not.toHaveBeenCalled()
  })

  it('retorna 500 quando a criacao falha', async () => {
    mocks.createImovel.mockRejectedValueOnce(new Error('insert falhou'))

    const res = await POST(makeJsonRequest(validImovel))
    const json = await res.json()

    expect(res.status).toBe(500)
    expect(json).toEqual({ error: 'Erro ao criar imovel' })
  })
})
