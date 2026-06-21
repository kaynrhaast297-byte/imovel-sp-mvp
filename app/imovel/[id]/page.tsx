import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowLeft,
  ArrowUpRight,
  Bath,
  BedDouble,
  Building2,
  CarFront,
  Expand,
  Heart,
  MapPin,
  Share2,
} from 'lucide-react'
import LeadForm from '@/components/LeadForm'
import PriceAnalysis from '@/components/PriceAnalysis'
import PropertyViewTracker from '@/components/PropertyViewTracker'
import TrackedAnchor from '@/components/TrackedAnchor'
import { absoluteUrl, siteConfig } from '@/lib/site'
import { propertyPhoto } from '@/lib/property-visual'
import { getImovelById, getImovelSimilares } from '@/lib/supabase'
import { calcularAnalise, calcularPrecoM2, formatarArea, formatarPreco, labelNegocio, labelTipo } from '@/lib/utils'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params

  try {
    const imovel = await getImovelById(id)
    const title = `${imovel.titulo} em ${imovel.bairro}, ${imovel.cidade}`
    const description = `${labelTipo(imovel.tipo)} para ${labelNegocio(imovel.negocio).toLowerCase()} por ${formatarPreco(imovel.preco)}. Compare atributos e preco por metro quadrado no ImovelSP.`
    const imageUrl = propertyPhoto(imovel)

    return {
      title,
      description,
      alternates: {
        canonical: absoluteUrl(`/imovel/${imovel.id}`),
      },
      openGraph: {
        type: 'article',
        title,
        description,
        url: absoluteUrl(`/imovel/${imovel.id}`),
        siteName: siteConfig.name,
        ...(imageUrl ? {
          images: [
            {
              url: imageUrl,
              alt: `Foto de ${imovel.titulo}`,
            },
          ],
        } : {}),
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        ...(imageUrl ? { images: [imageUrl] } : {}),
      },
    }
  } catch {
    return {
      title: `Imovel indisponivel | ${siteConfig.name}`,
      robots: {
        index: false,
        follow: false,
      },
    }
  }
}

export default async function ImovelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  let imovel = null
  let analise = null

  try {
    imovel = await getImovelById(id)
    if (imovel.area_m2 && imovel.area_m2 > 0) {
      const similares = await getImovelSimilares(imovel)
      analise = calcularAnalise(imovel, similares)
    }
  } catch {
    return (
      <div className="search-state property-not-found">
        <p className="eyebrow">Imovel indisponivel</p>
        <h1>Imovel nao encontrado.</h1>
        <Link href="/" className="btn btn-ghost"><ArrowLeft size={15} /> Voltar</Link>
      </div>
    )
  }

  const precoM2 = calcularPrecoM2(imovel.preco, imovel.area_m2)
  const localizacao = imovel.localizacao_aproximada
    ? `${imovel.bairro}, ${imovel.cidade} - ${imovel.estado}`
    : `${imovel.endereco ?? imovel.bairro}${imovel.numero ? `, ${imovel.numero}` : ''}, ${imovel.cidade} - ${imovel.estado}`
  const attributes = [
    { label: 'Area', value: formatarArea(imovel.area_m2), icon: Expand },
    ...(imovel.quartos != null ? [{ label: 'Quartos', value: String(imovel.quartos), icon: BedDouble }] : []),
    ...(imovel.banheiros != null ? [{ label: 'Banheiros', value: String(imovel.banheiros), icon: Bath }] : []),
    ...(imovel.vagas != null ? [{ label: 'Vagas', value: String(imovel.vagas), icon: CarFront }] : []),
    ...(precoM2 > 0 ? [{ label: 'Preco/m2', value: formatarPreco(precoM2), icon: Building2 }] : []),
  ]

  return (
    <div className="property-page">
      <PropertyViewTracker
        id={imovel.id}
        title={imovel.titulo}
        tipo={imovel.tipo}
        preco={imovel.preco}
      />
      <div className="property-topbar">
        <Link href="/busca" className="property-back"><ArrowLeft size={15} />Voltar para busca</Link>
        <div>
          <button aria-label="Compartilhar imovel"><Share2 size={16} /> Compartilhar</button>
          <button aria-label="Salvar imovel"><Heart size={16} /> Salvar</button>
        </div>
      </div>

      <section className="property-gallery" aria-label="Galeria do imovel">
        <div
          className="property-gallery-main"
          role="img"
          aria-label={`Foto principal de ${imovel.titulo}`}
          style={{ backgroundImage: `url(${propertyPhoto(imovel)})` }}
        />
        <div
          className="property-gallery-secondary"
          role="img"
          aria-label={`Ambiente de ${imovel.titulo}`}
          style={{ backgroundImage: `url(${propertyPhoto(imovel, 1)})` }}
        />
        <div
          className="property-gallery-secondary"
          role="img"
          aria-label={`Detalhe de ${imovel.titulo}`}
          style={{ backgroundImage: `url(${propertyPhoto(imovel, 2)})` }}
        />
      </section>

      <div className="property-detail-layout">
        <div className="property-main">
          <div className="property-heading">
            <div className="property-badges">
              <span>{labelTipo(imovel.tipo)}</span>
              <span>{labelNegocio(imovel.negocio)}</span>
              {imovel.portal_origem && <span>{imovel.portal_origem}</span>}
            </div>
            <h1>{imovel.titulo}</h1>
            <p><MapPin size={15} />{localizacao}</p>
          </div>

          <div className="property-attributes">
            {attributes.map(({ label, value, icon: Icon }) => (
              <div key={label}>
                <Icon size={18} />
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>

          {imovel.descricao && (
            <section className="property-description">
              <p className="eyebrow">Sobre o imovel</p>
              <h2>Descricao</h2>
              <p>{imovel.descricao}</p>
            </section>
          )}

          {analise && (
            <section className="property-analysis">
              <div className="section-title-row">
                <div>
                  <p className="eyebrow">Inteligencia ImovelSP</p>
                  <h2>Analise de preco</h2>
                </div>
              </div>
              <PriceAnalysis analise={analise} />
            </section>
          )}
        </div>

        <aside className="property-sidebar">
          <div className="property-price-panel">
            <p>Valor do imovel</p>
            <strong>{formatarPreco(imovel.preco)}</strong>
            {imovel.negocio === 'aluguel' && <span>/mes</span>}
            <div className="property-extra-costs">
              {imovel.condominio && <span>Condominio <strong>{formatarPreco(imovel.condominio)}/mes</strong></span>}
              {imovel.iptu && <span>IPTU <strong>{formatarPreco(imovel.iptu)}/ano</strong></span>}
            </div>
            {imovel.url_original && (
              <TrackedAnchor
                href={imovel.url_original}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                eventName="click_outbound"
                eventParams={{
                  item_id: imovel.id,
                  item_name: imovel.titulo,
                  link_url: imovel.url_original,
                }}
              >
                Ver anuncio original <ArrowUpRight size={15} />
              </TrackedAnchor>
            )}
          </div>
          <LeadForm imovelId={imovel.id} imovelTitulo={imovel.titulo} />
        </aside>
      </div>
    </div>
  )
}
