import { AnalisePreco } from '@/lib/types'
import { formatarPreco } from '@/lib/utils'

interface Props {
  analise: AnalisePreco
}

const cores = {
  abaixo: { bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.3)', text: 'var(--success)', label: '✅ Abaixo da média', desc: 'Este imóvel está mais barato que imóveis similares na região.' },
  na_media: { bg: 'rgba(59,127,245,0.1)', border: 'rgba(59,127,245,0.3)', text: 'var(--primary)', label: '📊 Na média', desc: 'O preço está alinhado com o mercado local.' },
  acima: { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)', text: 'var(--danger)', label: '⚠️ Acima da média', desc: 'Este imóvel está mais caro que similares na região.' },
}

export default function PriceAnalysis({ analise }: Props) {
  const c = cores[analise.classificacao]
  const sinal = analise.percentual_diferenca > 0 ? '+' : ''

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Card de classificação */}
      <div style={{
        background: c.bg,
        border: `1px solid ${c.border}`,
        borderRadius: 'var(--radius)',
        padding: '1.25rem',
      }}>
        <div style={{ fontWeight: 700, fontSize: '1rem', color: c.text, marginBottom: '0.3rem' }}>{c.label}</div>
        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{c.desc}</div>
        <div style={{ marginTop: '0.75rem', fontSize: '1.5rem', fontWeight: 700, color: c.text }}>
          {sinal}{analise.percentual_diferenca}%
          <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--text-muted)', marginLeft: '0.5rem' }}>em relação à média</span>
        </div>
      </div>

      {/* Métricas */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <Metrica label="Preço médio do bairro" valor={formatarPreco(analise.preco_medio_bairro)} />
        <Metrica label="Preço/m² do imóvel" valor={formatarPreco(analise.preco_m2_imovel)} />
        <Metrica label="Preço/m² médio" valor={formatarPreco(analise.preco_m2_medio_bairro)} />
        <Metrica label="Imóveis comparados" valor={String(analise.imoveis_comparados)} />
      </div>

      {/* Imóveis similares */}
      {analise.imoveis_similares.length > 0 && (
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Imóveis similares na região
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {analise.imoveis_similares.slice(0, 5).map((s) => (
              <div key={s.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'var(--bg-elevated)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.625rem 0.875rem',
                fontSize: '0.875rem',
              }}>
                <div>
                  <div style={{ fontWeight: 500 }}>{s.titulo}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{s.area_m2}m² · {s.bairro}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700 }}>{formatarPreco(s.preco)}</div>
                  {s.portal_origem && <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{s.portal_origem}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function Metrica({ label, valor }: { label: string; valor: string }) {
  return (
    <div style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', padding: '0.875rem' }}>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{label}</div>
      <div style={{ fontWeight: 700, fontSize: '1rem' }}>{valor}</div>
    </div>
  )
}
