import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import PriceAnalysis from '@/components/PriceAnalysis'
import type { AnalisePreco } from '@/lib/types'

const baseAnalise: AnalisePreco = {
  imovel_id: 'imovel-1',
  preco_medio_bairro: 1000000,
  preco_m2_imovel: 8500,
  preco_m2_medio_bairro: 10000,
  preco_m2_mediano_bairro: 10000,
  preco_estimado_justo: 1000000,
  menor_preco_comparavel: 900000,
  maior_preco_comparavel: 1200000,
  economia_estimativa: 150000,
  economia_percentual: 15,
  percentual_diferenca: -15,
  classificacao: 'abaixo',
  confianca: 'baixa',
  criterio: 'Mesmo tipo e negocio.',
  recomendacao: 'Bom negocio: o preco por m2 esta abaixo de imoveis similares.',
  imoveis_comparados: 6,
  imoveis_similares: Array.from({ length: 6 }, (_, index) => ({
    id: `similar-${index + 1}`,
    titulo: `Similar ${index + 1}`,
    preco: 900000 + index * 10000,
    area_m2: 90 + index,
    bairro: 'Pinheiros',
  })),
}

describe('PriceAnalysis', () => {
  it('renderiza classificacao, confianca, recomendacao e metricas principais', () => {
    render(<PriceAnalysis analise={baseAnalise} />)

    expect(screen.getByText('Bom negocio')).toBeInTheDocument()
    expect(screen.getByText('Confianca baixa')).toBeInTheDocument()
    expect(screen.getByText('-15%')).toBeInTheDocument()
    expect(screen.getByText(baseAnalise.recomendacao)).toBeInTheDocument()
    expect(screen.getByText('Preco justo estimado')).toBeInTheDocument()
    expect(screen.getByText('Economia possivel')).toBeInTheDocument()
    expect(screen.getByText(/criterio: mesmo tipo e negocio/i)).toBeInTheDocument()
  })

  it('mostra apenas os cinco primeiros comparaveis', () => {
    render(<PriceAnalysis analise={baseAnalise} />)

    const comparaveis = screen.getByText('Comparaveis usados').parentElement
    expect(comparaveis).not.toBeNull()

    const scope = within(comparaveis as HTMLElement)
    expect(scope.getByText('Similar 1')).toBeInTheDocument()
    expect(scope.getByText('Similar 5')).toBeInTheDocument()
    expect(scope.queryByText('Similar 6')).not.toBeInTheDocument()
  })

  it('mostra sinal positivo quando preco esta acima do mercado', () => {
    render(
      <PriceAnalysis
        analise={{
          ...baseAnalise,
          percentual_diferenca: 12,
          classificacao: 'acima',
          confianca: 'alta',
          economia_estimativa: 0,
          economia_percentual: 0,
        }}
      />,
    )

    expect(screen.getByText('Acima do mercado')).toBeInTheDocument()
    expect(screen.getByText('Confianca alta')).toBeInTheDocument()
    expect(screen.getByText('+12%')).toBeInTheDocument()
  })
})
