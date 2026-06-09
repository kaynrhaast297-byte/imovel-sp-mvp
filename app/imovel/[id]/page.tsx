import Link from 'next/link'
import LeadForm from '@/components/LeadForm'
import PriceAnalysis from '@/components/PriceAnalysis'
import { getImovelById, getImovelSimilares } from '@/lib/supabase'
import { calcularAnalise, calcularPrecoM2, formatarArea, formatarPreco, labelNegocio, labelTipo } from '@/lib/utils'

function mediaLabel(tipo: string) {
  if (tipo === 'casa') return 'Casa'
  if (tipo === 'terreno') return 'Terreno'
  if (tipo === 'comercial') return 'Comercial'
  return 'Apto'
}

export default async function ImovelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  let imovel = null
  let analise = null

  try {
    imovel = await getImovelById(id)
    const similares = await getImovelSimilares(imovel)
    analise = calcularAnalise(imovel, similares)
  } catch {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
        <p>Imovel nao encontrado.</p>
        <Link href="/" className="btn btn-ghost" style={{ marginTop: '1rem', display: 'inline-flex' }}>
          Voltar
        </Link>
      </div>
    )
  }

  const precoM2 = calcularPrecoM2(imovel.preco, imovel.area_m2)
  const foto = imovel.foto_principal || imovel.fotos?.[0]
  const localizacao = imovel.localizacao_aproximada
    ? `${imovel.bairro}, ${imovel.cidade} - ${imovel.estado}`
    : `${imovel.endereco ?? imovel.bairro}${imovel.numero ? `, ${imovel.numero}` : ''}, ${imovel.cidade} - ${imovel.estado}`

  return (
    <div className="property-page">
      <Link href="/busca" className="property-back">
        Voltar para busca
      </Link>

      <div className="property-detail-layout">
        <div>
          <div
            className="property-photo-placeholder"
            role={foto ? 'img' : undefined}
            aria-label={foto ? `Foto principal de ${imovel.titulo}` : undefined}
            style={foto ? { backgroundImage: `url("${foto}")`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
          >
            {!foto && mediaLabel(imovel.tipo)}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <span className="badge badge-blue">{labelTipo(imovel.tipo)}</span>
            <span className="badge badge-yellow">{labelNegocio(imovel.negocio)}</span>
            {imovel.portal_origem && (
              <span className="badge" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
                {imovel.portal_origem}
              </span>
            )}
          </div>

          <h1 style={{ fontFamily: 'var(--font-dm-serif)', fontSize: '1.75rem', marginBottom: '0.5rem' }}>
            {imovel.titulo}
          </h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            {localizacao}
          </p>

          <div className="property-attributes">
            {[
              { label: 'Area', valor: formatarArea(imovel.area_m2) },
              ...(imovel.quartos != null ? [{ label: 'Quartos', valor: String(imovel.quartos) }] : []),
              ...(imovel.banheiros != null ? [{ label: 'Banheiros', valor: String(imovel.banheiros) }] : []),
              ...(imovel.vagas != null ? [{ label: 'Vagas', valor: String(imovel.vagas) }] : []),
              ...(precoM2 > 0 ? [{ label: 'Preco/m2', valor: formatarPreco(precoM2) }] : []),
            ].map((atributo) => (
              <div key={atributo.label} style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', padding: '0.875rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{atributo.label}</div>
                <div style={{ fontWeight: 700, marginTop: '0.1rem' }}>{atributo.valor}</div>
              </div>
            ))}
          </div>

          {imovel.descricao && (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem' }}>
              <h3 style={{ fontWeight: 600, marginBottom: '0.75rem' }}>Descricao</h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: '0.9rem' }}>{imovel.descricao}</p>
            </div>
          )}
        </div>

        <div className="property-sidebar">
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.25rem' }}>{formatarPreco(imovel.preco)}</div>
            {imovel.negocio === 'aluguel' && <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>/mes</div>}
            {imovel.condominio && <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Condominio: {formatarPreco(imovel.condominio)}/mes</div>}
            {imovel.iptu && <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>IPTU: {formatarPreco(imovel.iptu)}/ano</div>}
            {imovel.url_original && (
              <a href={imovel.url_original} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem', display: 'flex' }}>
                Ver anuncio original
              </a>
            )}
          </div>

          <LeadForm imovelId={imovel.id} imovelTitulo={imovel.titulo} />

          {analise && (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem' }}>
              <h3 style={{ fontWeight: 600, marginBottom: '1rem', fontSize: '0.95rem' }}>Analise de preco</h3>
              <PriceAnalysis analise={analise} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
