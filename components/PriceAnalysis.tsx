import { AnalisePreco } from '@/lib/types'
import { calcularPrecoM2, formatarPreco } from '@/lib/utils'

interface Props {
  analise: AnalisePreco
}

const estilos = {
  abaixo: {
    bg: 'rgba(34,197,94,0.1)',
    border: 'rgba(34,197,94,0.3)',
    text: 'var(--success)',
    label: 'Bom negocio',
    desc: 'Este imovel esta abaixo da referencia dos comparaveis.',
  },
  na_media: {
    bg: 'rgba(59,127,245,0.1)',
    border: 'rgba(59,127,245,0.3)',
    text: 'var(--primary)',
    label: 'Preco justo',
    desc: 'O preco esta proximo da referencia de mercado local.',
  },
  acima: {
    bg: 'rgba(239,68,68,0.1)',
    border: 'rgba(239,68,68,0.3)',
    text: 'var(--danger)',
    label: 'Acima do mercado',
    desc: 'O preco por m2 esta acima de imoveis similares.',
  },
}

const confiancaLabel = {
  baixa: 'Confianca baixa',
  media: 'Confianca media',
  alta: 'Confianca alta',
}

export default function PriceAnalysis({ analise }: Props) {
  const estilo = estilos[analise.classificacao]
  const sinal = analise.percentual_diferenca > 0 ? '+' : ''

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{
        background: estilo.bg,
        border: `1px solid ${estilo.border}`,
        borderRadius: 'var(--radius)',
        padding: '1.25rem',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', alignItems: 'start' }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1rem', color: estilo.text, marginBottom: '0.3rem' }}>
              {estilo.label}
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{estilo.desc}</div>
          </div>
          <span style={{
            border: `1px solid ${estilo.border}`,
            borderRadius: '999px',
            color: estilo.text,
            fontSize: '0.72rem',
            fontWeight: 800,
            padding: '0.25rem 0.5rem',
            whiteSpace: 'nowrap',
          }}>
            {confiancaLabel[analise.confianca]}
          </span>
        </div>

        <div style={{ marginTop: '0.9rem', fontSize: '1.65rem', fontWeight: 800, color: estilo.text }}>
          {sinal}{analise.percentual_diferenca}%
          <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
            vs. preco justo estimado
          </span>
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', marginTop: '0.75rem' }}>
          {analise.recomendacao}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <Metrica label="Preco do imovel" valor={formatarPreco(analise.preco_m2_imovel)} detalhe="por m2" />
        <Metrica label="Mediana local" valor={formatarPreco(analise.preco_m2_mediano_bairro)} detalhe="por m2" />
        <Metrica label="Preco justo estimado" valor={formatarPreco(analise.preco_estimado_justo)} />
        <Metrica label="Economia possivel" valor={formatarPreco(analise.economia_estimativa)} detalhe={`${analise.economia_percentual}%`} destaque={analise.economia_estimativa > 0} />
        <Metrica label="Menor comparavel" valor={formatarPreco(analise.menor_preco_comparavel)} />
        <Metrica label="Comparaveis" valor={String(analise.imoveis_comparados)} detalhe={analise.confianca} />
      </div>

      <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', lineHeight: 1.55 }}>
        Criterio: {analise.criterio}
      </div>

      {analise.imoveis_similares.length > 0 && (
        <div>
          <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Comparaveis usados
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {analise.imoveis_similares.slice(0, 5).map((similar) => {
              const precoM2 = calcularPrecoM2(similar.preco, similar.area_m2)
              return (
                <div key={similar.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                  alignItems: 'center',
                  background: 'var(--bg-elevated)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.625rem 0.875rem',
                  fontSize: '0.875rem',
                }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{similar.titulo}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      {similar.area_m2}m2 - {similar.bairro}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800 }}>{formatarPreco(similar.preco)}</div>
                    <div style={{ color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 700 }}>
                      {formatarPreco(precoM2)}/m2
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function Metrica({
  label,
  valor,
  detalhe,
  destaque,
}: {
  label: string
  valor: string
  detalhe?: string
  destaque?: boolean
}) {
  return (
    <div style={{
      background: destaque ? 'rgba(34,197,94,0.1)' : 'var(--bg-elevated)',
      border: destaque ? '1px solid rgba(34,197,94,0.22)' : '1px solid transparent',
      borderRadius: 'var(--radius-sm)',
      padding: '0.875rem',
    }}>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{label}</div>
      <div style={{ fontWeight: 800, fontSize: '1rem' }}>{valor}</div>
      {detalhe && <div style={{ color: destaque ? 'var(--success)' : 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.15rem', fontWeight: 700 }}>{detalhe}</div>}
    </div>
  )
}
