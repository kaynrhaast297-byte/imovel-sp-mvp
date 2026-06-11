import { ArrowDownRight, ArrowUpRight, BarChart3, ShieldCheck } from 'lucide-react'
import { AnalisePreco } from '@/lib/types'
import { calcularPrecoM2, formatarPreco } from '@/lib/utils'

interface Props {
  analise: AnalisePreco
}

const labels = {
  abaixo: {
    label: 'Bom negocio',
    desc: 'Este imovel esta abaixo da referencia dos comparaveis.',
  },
  na_media: {
    label: 'Preco justo',
    desc: 'O preco esta proximo da referencia de mercado local.',
  },
  acima: {
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
  const content = labels[analise.classificacao]
  const positive = analise.percentual_diferenca > 0
  const signal = positive ? '+' : ''

  return (
    <div className="price-analysis">
      <div className={`price-analysis-summary price-analysis-${analise.classificacao}`}>
        <div>
          <div className="price-analysis-label">
            <BarChart3 size={19} />
            <strong>{content.label}</strong>
          </div>
          <p>{content.desc}</p>
        </div>
        <span className="confidence-badge"><ShieldCheck size={14} />{confiancaLabel[analise.confianca]}</span>
        <div className="price-analysis-difference">
          {signal}{analise.percentual_diferenca}%
          {positive ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
          <span>vs. preco justo estimado</span>
        </div>
        <p>{analise.recomendacao}</p>
      </div>

      <div className="analysis-metrics">
        <Metric label="Preco do imovel" value={formatarPreco(analise.preco_m2_imovel)} detail="por m2" />
        <Metric label="Mediana local" value={formatarPreco(analise.preco_m2_mediano_bairro)} detail="por m2" />
        <Metric label="Preco justo estimado" value={formatarPreco(analise.preco_estimado_justo)} />
        <Metric label="Economia possivel" value={formatarPreco(analise.economia_estimativa)} detail={`${analise.economia_percentual}%`} highlight={analise.economia_estimativa > 0} />
        <Metric label="Menor comparavel" value={formatarPreco(analise.menor_preco_comparavel)} />
        <Metric label="Comparaveis" value={String(analise.imoveis_comparados)} detail={analise.confianca} />
      </div>

      <p className="analysis-criteria">Criterio: {analise.criterio}</p>

      {analise.imoveis_similares.length > 0 && (
        <div className="comparables">
          <p className="eyebrow">Comparaveis usados</p>
          {analise.imoveis_similares.slice(0, 5).map((similar) => {
            const precoM2 = calcularPrecoM2(similar.preco, similar.area_m2)
            return (
              <div key={similar.id} className="comparable-row">
                <div>
                  <strong>{similar.titulo}</strong>
                  <span>{similar.area_m2}m2 · {similar.bairro}</span>
                </div>
                <div>
                  <strong>{formatarPreco(similar.preco)}</strong>
                  <span>{formatarPreco(precoM2)}/m2</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function Metric({
  label,
  value,
  detail,
  highlight,
}: {
  label: string
  value: string
  detail?: string
  highlight?: boolean
}) {
  return (
    <div className={highlight ? 'analysis-metric analysis-metric-highlight' : 'analysis-metric'}>
      <span>{label}</span>
      <strong>{value}</strong>
      {detail && <small>{detail}</small>}
    </div>
  )
}
