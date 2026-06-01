import { Imovel } from '@/lib/types'
import { formatarPreco, formatarArea, calcularPrecoM2, labelTipo, labelNegocio } from '@/lib/utils'
import Link from 'next/link'

interface Props {
  imovel: Imovel
}

export default function ImovelCard({ imovel }: Props) {
  const precoM2 = calcularPrecoM2(imovel.preco, imovel.area_m2)

  return (
    <Link href={`/imovel/${imovel.id}`} style={{ textDecoration: 'none' }}>
      <div className="card" style={{ padding: '1.25rem', cursor: 'pointer' }}>
        {/* Foto placeholder */}
        <div style={{
          background: 'var(--bg-elevated)',
          borderRadius: 'var(--radius-sm)',
          height: '160px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1rem',
          fontSize: '2.5rem',
          color: 'var(--border)',
        }}>
          {imovel.tipo === 'casa' ? '🏠' : imovel.tipo === 'terreno' ? '🏞️' : '🏢'}
        </div>

        {/* Badges */}
        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
          <span className="badge badge-blue">{labelTipo(imovel.tipo)}</span>
          <span className="badge badge-yellow">{labelNegocio(imovel.negocio)}</span>
          {imovel.portal_origem && (
            <span className="badge" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
              {imovel.portal_origem}
            </span>
          )}
        </div>

        {/* Título */}
        <p style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.4rem', color: 'var(--text)' }}>
          {imovel.titulo}
        </p>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          📍 {imovel.bairro}, {imovel.cidade}
        </p>

        {/* Atributos */}
        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <span>📐 {formatarArea(imovel.area_m2)}</span>
          {imovel.quartos != null && <span>🛏 {imovel.quartos} qts</span>}
          {imovel.banheiros != null && <span>🚿 {imovel.banheiros} ban</span>}
          {imovel.vagas != null && <span>🚗 {imovel.vagas} vaga{imovel.vagas !== 1 ? 's' : ''}</span>}
        </div>

        {/* Preço */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.875rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text)' }}>
              {formatarPreco(imovel.preco)}
            </div>
            {imovel.negocio === 'aluguel' && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/mês</div>}
          </div>
          {precoM2 > 0 && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>por m²</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--primary)' }}>{formatarPreco(precoM2)}</div>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
