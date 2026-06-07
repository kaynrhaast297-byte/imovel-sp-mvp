import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const mocks = vi.hoisted(() => ({
  calcularAnalise: vi.fn(),
  getImovelById: vi.fn(),
  getImovelSimilares: vi.fn(),
}))

vi.mock('@/lib/supabase', () => ({
  getImovelById: mocks.getImovelById,
  getImovelSimilares: mocks.getImovelSimilares,
}))

vi.mock('@/lib/utils', () => ({
  calcularAnalise: mocks.calcularAnalise,
}))

const { GET } = await import('@/app/api/analise/route')

describe('GET /api/analise', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('retorna 400 quando id nao foi informado', async () => {
    const response = await GET(new NextRequest('http://localhost/api/analise'))

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ error: 'id obrigatorio' })
  })

  it('busca imovel e similares antes de calcular a analise', async () => {
    const imovel = { id: 'imovel-1' }
    const similares = [{ id: 'similar-1' }]
    const analise = { classificacao: 'abaixo' }
    mocks.getImovelById.mockResolvedValueOnce(imovel)
    mocks.getImovelSimilares.mockResolvedValueOnce(similares)
    mocks.calcularAnalise.mockReturnValueOnce(analise)

    const response = await GET(new NextRequest('http://localhost/api/analise?id=imovel-1'))

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ analise })
    expect(mocks.getImovelById).toHaveBeenCalledWith('imovel-1')
    expect(mocks.getImovelSimilares).toHaveBeenCalledWith(imovel)
    expect(mocks.calcularAnalise).toHaveBeenCalledWith(imovel, similares)
  })

  it('retorna 500 quando a analise falha', async () => {
    mocks.getImovelById.mockRejectedValueOnce(new Error('banco indisponivel'))

    const response = await GET(new NextRequest('http://localhost/api/analise?id=imovel-1'))
    const json = await response.json()

    expect(response.status).toBe(500)
    expect(json).toEqual({ error: 'Erro na analise' })
  })
})
