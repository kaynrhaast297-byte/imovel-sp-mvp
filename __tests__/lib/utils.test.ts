import { describe, expect, it } from 'vitest'
import type { Imovel, ImovelSimilar } from '@/lib/types'
import {
  analisarPreco,
  calcularAnalise,
  calcularPrecoM2,
  calcularPrecoM2Medio,
  formatarArea,
  formatarMoeda,
  formatarNumero,
  formatarPreco,
  labelNegocio,
  labelTipo,
  removerMascaraCep,
  slugify,
  validarCep,
} from '@/lib/utils'

const imovelBase: Imovel = {
  id: 'imovel-1',
  titulo: 'Apartamento em Pinheiros',
  tipo: 'apartamento',
  negocio: 'venda',
  status: 'ativo',
  preco: 850000,
  area_m2: 100,
  quartos: 2,
  bairro: 'Pinheiros',
  cidade: 'Sao Paulo',
  estado: 'SP',
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
}

const similares: ImovelSimilar[] = [
  {
    id: 'similar-1',
    titulo: 'Similar 1',
    preco: 1000000,
    area_m2: 100,
    bairro: 'Pinheiros',
    cidade: 'Sao Paulo',
  },
  {
    id: 'similar-2',
    titulo: 'Similar 2',
    preco: 990000,
    area_m2: 99,
    bairro: 'Pinheiros',
    cidade: 'Sao Paulo',
  },
  {
    id: 'similar-3',
    titulo: 'Similar 3',
    preco: 1050000,
    area_m2: 105,
    bairro: 'Pinheiros',
    cidade: 'Sao Paulo',
  },
]

describe('utils', () => {
  it('calcula preco por m2 e evita divisao por zero', () => {
    expect(calcularPrecoM2(900000, 90)).toBe(10000)
    expect(calcularPrecoM2(900000, 0)).toBe(0)
  })

  it('classifica oportunidade abaixo da referencia de similares', () => {
    const analise = calcularAnalise(imovelBase, similares)

    expect(analise.classificacao).toBe('abaixo')
    expect(analise.preco_m2_imovel).toBe(8500)
    expect(analise.preco_estimado_justo).toBe(1000000)
    expect(analise.economia_estimativa).toBe(150000)
    expect(analise.confianca).toBe('baixa')
  })

  it('classifica preco acima e na media com diferentes niveis de confianca', () => {
    const similaresBaratos = Array.from({ length: 4 }, (_, index) => ({
      ...similares[0],
      id: `barato-${index}`,
      preco: 600000 + index * 10000,
      area_m2: 100,
    }))
    const acima = calcularAnalise(imovelBase, similaresBaratos)

    expect(acima.classificacao).toBe('acima')
    expect(acima.confianca).toBe('media')
    expect(acima.recomendacao).toMatch(/negocie com cuidado/i)
    expect(acima.economia_estimativa).toBe(0)

    const similaresProximos = Array.from({ length: 8 }, (_, index) => ({
      ...similares[0],
      id: `proximo-${index}`,
      preco: 840000 + index * 2000,
      area_m2: 100,
    }))
    const naMedia = calcularAnalise(imovelBase, similaresProximos)

    expect(naMedia.classificacao).toBe('na_media')
    expect(naMedia.confianca).toBe('alta')
    expect(naMedia.recomendacao).toMatch(/preco justo/i)
  })

  it('ignora similares invalidos e usa o proprio imovel como referencia', () => {
    const analise = calcularAnalise(
      { ...imovelBase, preco: 0, area_m2: 0 },
      [
        { ...similares[0], preco: 0 },
        { ...similares[1], area_m2: 0 },
      ],
    )

    expect(analise.imoveis_comparados).toBe(0)
    expect(analise.preco_medio_bairro).toBe(0)
    expect(analise.preco_estimado_justo).toBe(0)
    expect(analise.percentual_diferenca).toBe(0)
    expect(analise.economia_percentual).toBe(0)
    expect(analise.menor_preco_comparavel).toBe(0)
    expect(analise.maior_preco_comparavel).toBe(0)
  })

  it('calcula mediana par e ordena similares por preco por m2', () => {
    const analise = calcularAnalise(imovelBase, [
      { ...similares[0], id: 'mais-caro', preco: 1200000, area_m2: 100 },
      { ...similares[1], id: 'mais-barato', preco: 800000, area_m2: 100 },
    ])

    expect(analise.preco_m2_mediano_bairro).toBe(10000)
    expect(analise.imoveis_similares.map(item => item.id)).toEqual(['mais-barato', 'mais-caro'])
  })

  it('formata valores, areas e labels para exibicao', () => {
    expect(formatarPreco(1234)).toMatch(/1\.234/)
    expect(formatarMoeda(1234.5)).toMatch(/1\.234,50/)
    expect(formatarNumero(1234)).toBe('1.234')
    expect(formatarArea(90)).toBe('90 m2')
    expect(labelTipo('apartamento')).toBe('Apartamento')
    expect(labelTipo('fazenda')).toBe('fazenda')
    expect(labelNegocio('aluguel')).toBe('Aluguel')
    expect(labelNegocio('permuta')).toBe('permuta')
  })

  it('calcula media de preco por m2 e classifica diferenca de preco', () => {
    expect(calcularPrecoM2Medio([])).toBe(0)
    expect(calcularPrecoM2Medio([
      imovelBase,
      { ...imovelBase, id: 'imovel-2', preco: 1000000, area_m2: 100 },
    ])).toBe(9250)

    expect(analisarPreco(imovelBase, 700000)).toMatchObject({ status: 'caro', percentual: 21 })
    expect(analisarPreco(imovelBase, 1000000)).toMatchObject({ status: 'barato', percentual: -15 })
    expect(analisarPreco(imovelBase, 850000)).toMatchObject({ status: 'justo', percentual: 0 })
    expect(analisarPreco(imovelBase, 0)).toMatchObject({ status: 'justo', percentual: 0 })
  })

  it('normaliza textos e valida CEP', () => {
    expect(slugify('Apto Jardim Sao Paulo, 2 quartos!')).toBe('apto-jardim-sao-paulo-2-quartos')
    expect(validarCep('05422-000')).toBe(true)
    expect(validarCep('05422000')).toBe(true)
    expect(validarCep('abc')).toBe(false)
    expect(removerMascaraCep('05422-000')).toBe('05422000')
  })
})
