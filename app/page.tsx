'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Building,
  MapPin,
  MessageCircle,
  Search,
} from 'lucide-react'
import { heroPhoto } from '@/lib/property-visual'

const featured = [
  {
    title: 'Busca guiada em Pinheiros',
    area: '70 a 110 m2',
    rooms: '2+ quartos',
    price: 'Faixa para validacao',
    priceM2: 'R$ 12k a R$ 16k /m2',
    variation: 'dados reais pendentes',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=84',
    neighborhood: 'Pinheiros',
  },
  {
    title: 'Busca guiada na Vila Olimpia',
    area: '30 a 55 m2',
    rooms: '1+ quarto',
    price: 'Faixa para validacao',
    priceM2: 'R$ 14k a R$ 18k /m2',
    variation: 'dados reais pendentes',
    image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=84',
    neighborhood: 'Vila Olimpia',
  },
  {
    title: 'Busca guiada no Alto de Pinheiros',
    area: '180 a 260 m2',
    rooms: '4+ quartos',
    price: 'Faixa para validacao',
    priceM2: 'R$ 13k a R$ 17k /m2',
    variation: 'dados reais pendentes',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=84',
    neighborhood: 'Alto de Pinheiros',
  },
]

const neighborhoods = [
  ['Pinheiros', 'prioridade de validacao', 'busca'],
  ['Vila Madalena', 'prioridade de validacao', 'busca'],
  ['Moema', 'prioridade de validacao', 'busca'],
]

export default function Home() {
  const router = useRouter()
  const [form, setForm] = useState({
    bairro: '',
    tipo: '',
    negocio: 'venda',
    quartos: '',
    preco_max: '',
  })

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.trim()
  const whatsappMessage = process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE
    || 'Ola, quero ajuda para encontrar um imovel com preco justo.'

  const whatsappUrl = useMemo(() => {
    if (!whatsappNumber) return null
    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`
  }, [whatsappMessage, whatsappNumber])

  function handleBuscar() {
    const params = new URLSearchParams()
    if (form.bairro) params.set('bairro', form.bairro)
    if (form.tipo) params.set('tipo', form.tipo)
    if (form.negocio) params.set('negocio', form.negocio)
    if (form.quartos) params.set('quartos', form.quartos)
    if (form.preco_max) params.set('preco_max', form.preco_max)
    const query = params.toString()
    router.push(query ? `/busca?${query}` : '/busca')
  }

  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="home-hero-media" style={{ backgroundImage: `url(${heroPhoto})` }} />
        <div className="home-hero-overlay" />
        <div className="home-hero-content">
          <p className="eyebrow eyebrow-light">Sao Paulo, do seu jeito</p>
          <h1>Encontre o imovel certo pelo preco certo.</h1>
          <p className="home-hero-copy">
            Curadoria de enderecos desejados com dados que ajudam voce a comprar melhor.
          </p>

          <div className="home-search" aria-label="Busca de imoveis">
            <label className="home-search-field home-search-wide">
              <span>Bairro ou cidade</span>
              <input
                placeholder="Ex: Moema, Pinheiros, Vila Mariana"
                value={form.bairro}
                onChange={(event) => setForm({ ...form, bairro: event.target.value })}
                onKeyDown={(event) => event.key === 'Enter' && handleBuscar()}
              />
            </label>
            <label className="home-search-field">
              <span>Tipo de imovel</span>
              <select aria-label="Tipo" value={form.tipo} onChange={(event) => setForm({ ...form, tipo: event.target.value })}>
                <option value="">Todos</option>
                <option value="apartamento">Apartamento</option>
                <option value="casa">Casa</option>
                <option value="terreno">Terreno</option>
                <option value="comercial">Comercial</option>
              </select>
            </label>
            <label className="home-search-field">
              <span>Transacao</span>
              <select aria-label="Negocio" value={form.negocio} onChange={(event) => setForm({ ...form, negocio: event.target.value })}>
                <option value="venda">Comprar</option>
                <option value="aluguel">Alugar</option>
                <option value="temporada">Temporada</option>
              </select>
            </label>
            <label className="home-search-field">
              <span>Dormitorios</span>
              <select aria-label="Quartos" value={form.quartos} onChange={(event) => setForm({ ...form, quartos: event.target.value })}>
                <option value="">Qualquer</option>
                <option value="1">1 ou mais</option>
                <option value="2">2 ou mais</option>
                <option value="3">3 ou mais</option>
                <option value="4">4 ou mais</option>
              </select>
            </label>
            <label className="home-search-field">
              <span>Preco maximo</span>
              <input
                type="number"
                placeholder="R$ 900000"
                value={form.preco_max}
                onChange={(event) => setForm({ ...form, preco_max: event.target.value })}
              />
            </label>
            <button className="home-search-button" onClick={handleBuscar}>
              <Search size={17} />
              Buscar imoveis
            </button>
          </div>
        </div>
        <div className="hero-caption">
          <MapPin size={15} />
          Apartamento contemporaneo, Jardins
        </div>
      </section>

      <section className="editorial-section selected-section" id="destaques">
        <div className="section-intro">
          <p className="eyebrow">Recortes de busca</p>
          <h2>Bairros prioritarios para validar a experiencia do ImovelSP.</h2>
          <button className="text-link" onClick={() => router.push('/busca')}>
            Ver todos os imoveis <ArrowRight size={16} />
          </button>
        </div>
        <div className="featured-grid">
          {featured.map((item) => (
            <article className="featured-card" key={item.title}>
              <button
                type="button"
                className="featured-photo"
                style={{ backgroundImage: `url(${item.image})` }}
                onClick={() => router.push(`/busca?bairro=${encodeURIComponent(item.neighborhood)}`)}
                aria-label={`Explorar ${item.neighborhood}`}
              >
                <span>{item.neighborhood}</span>
                <ArrowUpRight size={19} />
              </button>
              <div className="featured-body">
                <h3>{item.title}</h3>
                <p>{item.area} · {item.rooms}</p>
                <strong>{item.price}</strong>
                <div className="featured-analysis">
                  <span>{item.priceM2}</span>
                  <span>{item.variation}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="market-section" id="inteligencia">
        <div className="market-heading">
          <p className="eyebrow">Inteligencia de precos</p>
          <h2>Informacao para decidir melhor.</h2>
          <p>As faixas atuais orientam a navegacao ate a entrada dos imoveis reais.</p>
        </div>
        <div className="market-lead">
          <span>Status dos dados</span>
          <strong>MVP <small>curado</small></strong>
          <p><BarChart3 size={15} /> validar com imoveis reais</p>
        </div>
        <div className="neighborhood-list">
          {neighborhoods.map(([name, value, trend], index) => (
            <button type="button" key={name} onClick={() => router.push(`/busca?bairro=${encodeURIComponent(name)}`)}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{name}</strong>
              <small>{value}</small>
              <em>{trend}</em>
              <ArrowUpRight size={16} />
            </button>
          ))}
        </div>
      </section>

      <section className="neighborhood-feature">
        <div className="neighborhood-photo" />
        <div className="neighborhood-copy">
          <p className="eyebrow eyebrow-light">Guia de bairro</p>
          <h2>Vila Madalena</h2>
          <p>Arte, gastronomia, arquitetura e ruas que transformam o cotidiano.</p>
          <button className="btn btn-light" onClick={() => router.push('/busca?bairro=Vila%20Madalena')}>
            Explorar o bairro <ArrowRight size={16} />
          </button>
        </div>
        <div className="neighborhood-metrics">
          <span><BarChart3 size={18} /><strong>Amostra</strong>dados a validar</span>
          <span><Building size={18} /><strong>Sem ranking</strong>ate dados reais</span>
        </div>
      </section>

      <section className="service-strip">
        <div>
          <Search size={21} />
          <h3>Curadoria autoral</h3>
          <p>Imoveis escolhidos por localizacao, arquitetura e qualidade.</p>
        </div>
        <div>
          <BarChart3 size={21} />
          <h3>Inteligencia de preco</h3>
          <p>Dados reais para comparar e negociar com seguranca.</p>
        </div>
        <div>
          <MessageCircle size={21} />
          <h3>Atendimento humano</h3>
          <p>Converse rapidamente sobre os imoveis que interessam.</p>
          {whatsappUrl ? (
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">Falar no WhatsApp <ArrowUpRight size={14} /></a>
          ) : (
            <span className="service-contact-note">Contato sera ativado com canal oficial.</span>
          )}
        </div>
      </section>

      {whatsappUrl ? (
        <a className="floating-whatsapp" href={whatsappUrl} target="_blank" rel="noopener noreferrer" aria-label="Chamar no WhatsApp">
          <MessageCircle size={22} />
        </a>
      ) : null}
    </div>
  )
}
