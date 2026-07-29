import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'

const mocks = vi.hoisted(() => ({
  getAdminImoveis: vi.fn(),
  requireAdmin: vi.fn(),
}))

vi.mock('@/lib/admin-auth', () => ({
  requireAdmin: mocks.requireAdmin,
}))

vi.mock('@/lib/supabase', () => ({
  getAdminImoveis: mocks.getAdminImoveis,
}))

const { GET } = await import('@/app/api/admin/imoveis/route')

function request(query = '') {
  return new NextRequest(`http://localhost/api/admin/imoveis${query}`)
}

describe('GET /api/admin/imoveis', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.requireAdmin.mockReturnValue(null)
  })

  it('bloqueia visitante antes de consultar o banco', async () => {
    mocks.requireAdmin.mockReturnValueOnce(
      NextResponse.json({ error: 'Admin nao autorizado.' }, { status: 401 }),
    )

    const response = await GET(request('?q=Pinheiros'))

    expect(response.status).toBe(401)
    expect(mocks.getAdminImoveis).not.toHaveBeenCalled()
  })

  it('valida, normaliza e encaminha filtros para a consulta administrativa', async () => {
    const result = {
      imoveis: [{ id: 'imovel-1', titulo: 'Apartamento Pinheiros' }],
      pagination: {
        page: 2,
        per_page: 25,
        total: 40,
        total_pages: 2,
        has_next: false,
        has_prev: true,
      },
    }
    mocks.getAdminImoveis.mockResolvedValueOnce(result)

    const response = await GET(request('?page=2&per_page=25&status=inativo&q=%20Pinheiros%20'))

    expect(response.status).toBe(200)
    expect(response.headers.get('Cache-Control')).toBe('no-store')
    expect(await response.json()).toEqual(result)
    expect(mocks.getAdminImoveis).toHaveBeenCalledWith({
      page: 2,
      per_page: 25,
      status: 'inativo',
      q: 'Pinheiros',
    })
  })

  it('aplica defaults seguros quando os filtros nao sao informados', async () => {
    mocks.getAdminImoveis.mockResolvedValueOnce({ imoveis: [], pagination: {} })

    const response = await GET(request())

    expect(response.status).toBe(200)
    expect(mocks.getAdminImoveis).toHaveBeenCalledWith({
      page: 1,
      per_page: 20,
      status: 'todos',
      q: '',
    })
  })

  it.each([
    '?page=0',
    '?page=abc',
    '?per_page=51',
    '?status=vendido',
    `?q=${'a'.repeat(121)}`,
    '?campo_desconhecido=1',
  ])('rejeita parametros invalidos: %s', async (query) => {
    const response = await GET(request(query))

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ error: 'Parametros de busca invalidos.' })
    expect(mocks.getAdminImoveis).not.toHaveBeenCalled()
  })

  it('retorna erro generico sem vazar detalhes internos', async () => {
    mocks.getAdminImoveis.mockRejectedValueOnce(new Error('password=segredo-do-banco'))

    const response = await GET(request())
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body).toEqual({ error: 'Erro ao buscar imoveis.' })
    expect(JSON.stringify(body)).not.toContain('segredo-do-banco')
  })
})
