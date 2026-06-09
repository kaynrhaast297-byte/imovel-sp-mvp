import Link from 'next/link'
import { Imovel } from '@/lib/types'
import { calcularPrecoM2, formatarArea, formatarPreco, labelNegocio, labelTipo } from '@/lib/utils'

interface Props {
  imovel: Imovel
}

function mediaLabel(tipo: string) {
  if (tipo === 'casa') return 'Casa'
  if (tipo === 'terreno') return 'Terreno'
  if (tipo === 'comercial') return 'Comercial'
  return 'Apto'
}

export default function ImovelCard({ imovel }: Props) {
  const precoM2 = calcularPrecoM2(imovel.preco, imovel.area_m2)
  const foto = imovel.foto_principal || imovel.fotos?.[0]

  return (
    <Link className="property-card-link" href={`/imovel/${imovel.id}`} style={{ textDecoration: 'none' }}>
      <div className="card property-card" style={{ padding: '1.25rem', cursor: 'pointer', height: '100%' }}>
        <div
          className="property-card-media"
          role={foto ? 'img' : undefined}
          aria-label={foto ? `Foto principal de ${imovel.titulo}` : undefined}
          style={foto ? { backgroundImage: `url("${foto}")`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
        >
          {!foto && mediaLabel(imovel.tipo)}
        </div>

        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
          <span className="badge badge-blue">{labelTipo(imovel.tipo)}</span>
          <span className="badge badge-yellow">{labelNegocio(imovel.negocio)}</span>
          {imovel.portal_origem && (
            <span className="badge" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
              {imovel.portal_origem}
            </span>
          )}
        </div>

        <p style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.4rem', color: 'var(--text)' }}>
          {imovel.titulo}
        </p>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          {imovel.bairro}, {imovel.cidade}
        </p>

        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <span>{formatarArea(imovel.area_m2)}</span>
          {imovel.quartos != null && <span>{imovel.quartos} qts</span>}
          {imovel.banheiros != null && <span>{imovel.banheiros} ban</span>}
          {imovel.vagas != null && <span>{imovel.vagas} vaga{imovel.vagas !== 1 ? 's' : ''}</span>}
        </div>

        <div className="property-card-footer" style={{ borderTop: '1px solid var(--border)', paddingTop: '0.875rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text)' }}>
              {formatarPreco(imovel.preco)}
            </div>
            {imovel.negocio === 'aluguel' && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/mes</div>}
          </div>
          {precoM2 > 0 && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>por m2</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--primary)' }}>{formatarPreco(precoM2)}</div>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
