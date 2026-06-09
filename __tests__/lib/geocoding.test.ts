import { beforeEach, describe, expect, it, vi } from 'vitest'

const fetchMock = vi.fn()
vi.stubGlobal('fetch', fetchMock)

describe('geocoding', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    vi.resetModules()
    const { resetGeocodingCache } = await import('@/lib/geocoding')
    resetGeocodingCache()
  })

  it('combina ViaCEP e Nominatim e reutiliza o cache', async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          cep: '01001-000',
          logradouro: 'Praca da Se',
          bairro: 'Se',
          localidade: 'Sao Paulo',
          uf: 'SP',
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ lat: '-23.5503', lon: '-46.6342' }],
      })

    const { resolveAddressByCep } = await import('@/lib/geocoding')
    const first = await resolveAddressByCep('01001000', '10')
    const cached = await resolveAddressByCep('01001-000', '10')

    expect(first).toMatchObject({
      cep: '01001-000',
      endereco: 'Praca da Se',
      numero: '10',
      bairro: 'Se',
      cidade: 'Sao Paulo',
      estado: 'SP',
      latitude: -23.5503,
      longitude: -46.6342,
      localizacao_aproximada: true,
    })
    expect(cached).toEqual(first)
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('mantem endereco quando o Nominatim falha e rejeita CEP inexistente', async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          cep: '01001-000',
          logradouro: 'Praca da Se',
          bairro: 'Se',
          localidade: 'Sao Paulo',
          uf: 'SP',
        }),
      })
      .mockRejectedValueOnce(new Error('offline'))

    const { resolveAddressByCep } = await import('@/lib/geocoding')
    await expect(resolveAddressByCep('01001000')).resolves.toMatchObject({
      endereco: 'Praca da Se',
      latitude: undefined,
      longitude: undefined,
    })

    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ erro: true }) })
    await expect(resolveAddressByCep('99999999')).rejects.toThrow(/nao encontrado/i)
    await expect(resolveAddressByCep('123')).rejects.toThrow(/invalido/i)
  })

  it('serializa chamadas diferentes ao Nominatim', async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ cep: '01001-000', logradouro: 'Rua A', bairro: 'Centro', localidade: 'Sao Paulo', uf: 'SP' }),
      })
      .mockResolvedValueOnce({ ok: true, json: async () => [{ lat: '-23', lon: '-46' }] })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ cep: '20040-000', logradouro: 'Rua B', bairro: 'Centro', localidade: 'Rio de Janeiro', uf: 'RJ' }),
      })
      .mockResolvedValueOnce({ ok: true, json: async () => [{ lat: '-22', lon: '-43' }] })

    const { resolveAddressByCep } = await import('@/lib/geocoding')
    await resolveAddressByCep('01001000')
    await resolveAddressByCep('20040000')

    expect(fetchMock).toHaveBeenCalledTimes(4)
  })
})
