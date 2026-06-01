import { getImovelById, getImovelSimilares } from '@/lib/supabase'
import { calcularAnalise, formatarPreco, formatarArea, labelTipo, labelNegocio, calcularPrecoM2 } from '@/lib/utils'
import PriceAnalysis from '@/components/PriceAnalysis'
import Link from 'next/link'

export default async function ImovelPage({ params }: { params: { id: string } }) {
  let imovel = null
  let analise = null

  try {
    imovel = await getImovelById(params.id)
    const similares = await getImovelSimilares(
      imovel.bairro, imovel.tipo, imovel.quartos ?? null, imovel.area_m2, imovel.id
    )
    analise = calcularAnalise(imovel, similares)
  } catch {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
        <p>Imóvel não encontrado.</p>
        <Link href="/" className="btn btn-ghost" style={{ marginTop: '1rem', display: 'inline-flex' }}>← Voltar</Link>
      </div>
    )
  }

  const precoM2 = calcularPrecoM2(imovel.preco, imovel.area_m2)

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <Link href="/busca" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', marginBottom: '1.5rem' }}>
        ← Voltar para busca
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem', alignItems: 'start' }}>
        {/* Coluna principal */}
        <div>
          {/* Foto */}
          <div style={{
            background: 'var(--bg-elevated)',
            borderRadius: 'var(--radius)',
            height: '320px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '4rem',
            marginBottom: '1.5rem',
            border: '1px solid var(--border)',
          }}>
            {imovel.tipo === 'casa' ? '🏠' : imovel.tipo === 'terreno' ? '🏞️' : '🏢'}
          </div>

          {/* Badges */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <span className="badge badge-blue">{labelTipo(imovel.tipo)}</span>
            <span className="badge badge-yellow">{labelNegocio(imovel.negocio)}</span>
            {imovel.portal_origem && <span className="badge" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>{imovel.portal_origem}</span>}
          </div>

          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.75rem', marginBottom: '0.5rem' }}>{imovel.titulo}</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>📍 {imovel.endereco ?? imovel.bairro}, {imovel.cidade} – {imovel.estado}</p>

          {/* Atributos */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {[
              { icon: '📐', label: 'Área', valor: formatarArea(imovel.area_m2) },
              ...(imovel.quartos != null ? [{ icon: '🛏', label: 'Quartos', valor: String(imovel.quartos) }] : []),
              ...(imovel.banheiros != null ? [{ icon: '🚿', label: 'Banheiros', valor: String(imovel.banheiros) }] : []),
              ...(imovel.vagas != null ? [{ icon: '🚗', label: 'Vagas', valor: String(imovel.vagas) }] : []),
              ...(precoM2 > 0 ? [{ icon: '💰', label: 'Preço/m²', valor: formatarPreco(precoM2) }] : []),
            ].map(a => (
              <div key={a.label} style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', padding: '0.875rem', textAlign: 'center' }}>
                <div style={{ fontSize: '1.25rem' }}>{a.icon}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{a.label}</div>
                <div style={{ fontWeight: 700, marginTop: '0.1rem' }}>{a.valor}</div>
              </div>
            ))}
          </div>

          {imovel.descricao && (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem' }}>
              <h3 style={{ fontWeight: 600, marginBottom: '0.75rem' }}>Descrição</h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: '0.9rem' }}>{imovel.descricao}</p>
            </div>
          )}
        </div>

        {/* Sidebar direita */}
        <div style={{ position: 'sticky', top: '80px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Preço */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.25rem' }}>{formatarPreco(imovel.preco)}</div>
            {imovel.negocio === 'aluguel' && <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>/mês</div>}
            {imovel.condominio && <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Condomínio: {formatarPreco(imovel.condominio)}/mês</div>}
            {imovel.iptu && <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>IPTU: {formatarPreco(imovel.iptu)}/ano</div>}
            {imovel.url_original && (
              <a href={imovel.url_original} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem', display: 'flex' }}>
                Ver anúncio original ↗
              </a>
            )}
          </div>

          {/* Análise */}
          {analise && (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem' }}>
              <h3 style={{ fontWeight: 600, marginBottom: '1rem', fontSize: '0.95rem' }}>📊 Análise de preço</h3>
              <PriceAnalysis analise={analise} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
