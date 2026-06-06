import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import ImovelCard from '@/components/ImovelCard'
import type { Imovel } from '@/lib/types'

const imovel: Imovel = {
  id: 'imovel-1',
  titulo: 'Apartamento garden em Pinheiros',
  tipo: 'apartamento',
  negocio: 'venda',
  status: 'ativo',
  preco: 900000,
  area_m2: 90,
  quartos: 2,
  banheiros: 2,
  vagas: 1,
  bairro: 'Pinheiros',
  cidade: 'Sao Paulo',
  estado: 'SP',
  portal_origem: 'Zap',
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
}

describe('ImovelCard', () => {
  it('renderiza link, dados do imovel e preco por m2', () => {
    render(<ImovelCard imovel={imovel} />)

    expect(screen.getByRole('link')).toHaveAttribute('href', '/imovel/imovel-1')
    expect(screen.getByText('Apartamento garden em Pinheiros')).toBeInTheDocument()
    expect(screen.getByText('Apartamento')).toBeInTheDocument()
    expect(screen.getByText('Venda')).toBeInTheDocument()
    expect(screen.getByText('Zap')).toBeInTheDocument()
    expect(screen.getByText('Pinheiros, Sao Paulo')).toBeInTheDocument()
    expect(screen.getByText('90 m2')).toBeInTheDocument()
    expect(screen.getByText('2 qts')).toBeInTheDocument()
    expect(screen.getByText('2 ban')).toBeInTheDocument()
    expect(screen.getByText('1 vaga')).toBeInTheDocument()
    expect(screen.getByText(/R\$\s*900\.000/)).toBeInTheDocument()
    expect(screen.getByText(/R\$\s*10\.000/)).toBeInTheDocument()
  })

  it('renderiza aluguel com sufixo mensal e vagas no plural', () => {
    render(
      <ImovelCard
        imovel={{
          ...imovel,
          negocio: 'aluguel',
          preco: 4500,
          vagas: 2,
        }}
      />,
    )

    expect(screen.getByText('Aluguel')).toBeInTheDocument()
    expect(screen.getByText('/mes')).toBeInTheDocument()
    expect(screen.getByText('2 vagas')).toBeInTheDocument()
  })

  it('nao mostra preco por m2 quando area e zero', () => {
    render(<ImovelCard imovel={{ ...imovel, area_m2: 0 }} />)

    expect(screen.queryByText('por m2')).not.toBeInTheDocument()
  })
})
