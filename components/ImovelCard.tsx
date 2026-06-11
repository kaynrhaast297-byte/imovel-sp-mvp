import Link from 'next/link'
import { Bath, BedDouble, CarFront, Expand, Heart, MapPin } from 'lucide-react'
import { Imovel } from '@/lib/types'
import { propertyPhoto } from '@/lib/property-visual'
import { calcularPrecoM2, formatarArea, formatarPreco, labelNegocio, labelTipo } from '@/lib/utils'

interface Props {
  imovel: Imovel
}

export default function ImovelCard({ imovel }: Props) {
  const precoM2 = calcularPrecoM2(imovel.preco, imovel.area_m2)

  return (
    <Link className="property-card-link" href={`/imovel/${imovel.id}`} aria-label={`Ver ${imovel.titulo}`}>
      <article className="property-card">
        <div
          className="property-card-media"
          role="img"
          aria-label={`Foto de ${imovel.titulo}`}
          style={{ backgroundImage: `url(${propertyPhoto(imovel)})` }}
        >
          <div className="property-card-badges">
            <span>{labelNegocio(imovel.negocio)}</span>
            {imovel.portal_origem && <span>{imovel.portal_origem}</span>}
          </div>
          <span className="property-card-favorite" aria-hidden="true"><Heart size={17} /></span>
        </div>

        <div className="property-card-body">
          <p className="property-card-kicker">{labelTipo(imovel.tipo)}</p>
          <h3>{imovel.titulo}</h3>
          <p className="property-card-location"><MapPin size={14} />{imovel.bairro}, {imovel.cidade}</p>

          <div className="property-card-attributes">
            <span><Expand size={15} />{formatarArea(imovel.area_m2)}</span>
            {imovel.quartos != null && <span><BedDouble size={15} />{imovel.quartos} qts</span>}
            {imovel.banheiros != null && <span><Bath size={15} />{imovel.banheiros} ban</span>}
            {imovel.vagas != null && <span><CarFront size={15} />{imovel.vagas} vaga{imovel.vagas !== 1 ? 's' : ''}</span>}
          </div>

          <div className="property-card-footer">
            <div>
              <strong>{formatarPreco(imovel.preco)}</strong>
              {imovel.negocio === 'aluguel' && <small>/mes</small>}
            </div>
            {precoM2 > 0 && (
              <div className="property-card-m2">
                <small>por m2</small>
                <strong>{formatarPreco(precoM2)}</strong>
              </div>
            )}
          </div>
        </div>
      </article>
    </Link>
  )
}
