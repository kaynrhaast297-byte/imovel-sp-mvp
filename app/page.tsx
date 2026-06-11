'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowDownRight,
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
    title: 'Apartamento garden em Pinheiros',
    area: '94 m2',
    rooms: '2 quartos',
    price: 'R$ 1.180.000',
    priceM2: 'R$ 12.553 /m2',
    variation: '-2,1% nos ultimos 6 meses',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=84',
    neighborhood: 'Pinheiros',
  },
  {
    title: 'Studio premium na Vila Olimpia',
    area: '41 m2',
    rooms: '1 quarto',
    price: 'R$ 620.000',
    priceM2: 'R$ 15.122 /m2',
    variation: '+4,3% nos ultimos 6 meses',
    image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=84',
    neighborhood: 'Vila Olimpia',
  },
  {
    title: 'Casa contemporanea no Alto de Pinheiros',
    area: '220 m2',
    rooms: '4 quartos',
    price: 'R$ 3.450.000',
    priceM2: 'R$ 15.682 /m2',
    variation: '+1,2% nos ultimos 6 meses',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=84',
    neighborhood: 'Alto de Pinheiros',
  },
]

const neighborhoods = [
  ['Pinheiros', 'R$ 15.392 /m2', '+3,8%'],
  ['Vila Madalena', 'R$ 19.082 /m2', '+4,3%'],
  ['Moema', 'R$ 18.847 /m2', '+2,7%'],
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

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5511999999999'
  const whatsappMessage = process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE
    || 'Ola, quero ajuda para encontrar um imovel com preco justo.'

  const whatsappUrl = useMemo(() => {
    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`
  }, [whatsappMessage, whatsappNumber])

  function handleBuscar() {
    const params = new URLSearchParams()
    if (form.bairro) params.set('bairro', form.bairro)
    if (form.tipo) params.set('tipo', form.tipo)
    if (form.negocio) params.set('negocio', form.negocio)
    if (form.quartos) params.set('quartos', form.quartos)
    if (form.preco_max) params.set('preco_max', form.preco_max)
    router.push(`/busca?${params.toString()}`)
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
          <p className="eyebrow">Destaques</p>
          <h2>Imoveis selecionados em bairros desejados de Sao Paulo.</h2>
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
                  <span className={item.variation.startsWith('-') ? 'trend-down' : 'trend-up'}>
                    {item.variation}
                    {item.variation.startsWith('-') ? <ArrowDownRight size={13} /> : <ArrowUpRight size={13} />}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="market-section" id="inteligencia">
        <div className="market-heading">
          <p className="eyebrow">Inteligencia de precos</p>
          <h2>Informacao que valoriza suas escolhas.</h2>
          <p>Compare valores anunciados, preco por metro quadrado e tendencias de cada bairro.</p>
        </div>
        <div className="market-lead">
          <span>Preco medio a venda</span>
          <strong>R$ 18.847<small>/m2</small></strong>
          <p><ArrowUpRight size={15} /> +2,7% nos ultimos 6 meses</p>
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
          <span><BarChart3 size={18} /><strong>R$ 19.082/m2</strong>preco medio</span>
          <span><Building size={18} /><strong>87%</strong>indice de liquidez</span>
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
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">Falar no WhatsApp <ArrowUpRight size={14} /></a>
        </div>
      </section>

      <a className="floating-whatsapp" href={whatsappUrl} target="_blank" rel="noopener noreferrer" aria-label="Chamar no WhatsApp">
        <MessageCircle size={22} />
      </a>
    </div>
  )
}
