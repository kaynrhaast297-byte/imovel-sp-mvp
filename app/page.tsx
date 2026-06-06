'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

const featured = [
  {
    title: 'Apartamento garden em Pinheiros',
    area: '94 m2',
    rooms: '2 quartos',
    price: 'R$ 1.180.000',
    tag: 'Abaixo da media',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Studio premium na Vila Olimpia',
    area: '41 m2',
    rooms: '1 quarto',
    price: 'R$ 620.000',
    tag: 'Alta liquidez',
    image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Casa contemporanea no Alto de Pinheiros',
    area: '220 m2',
    rooms: '4 quartos',
    price: 'R$ 3.450.000',
    tag: 'Preco competitivo',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80',
  },
]

const benefits = [
  ['Preco justo', 'Compare o valor anunciado com referencias parecidas na mesma regiao.'],
  ['Busca inteligente', 'Filtre por bairro, tipo, quartos, negocio e faixa de preco.'],
  ['Atendimento rapido', 'Leve o imovel direto para o WhatsApp e continue a conversa sem friccao.'],
]

const testimonials = [
  ['Marina Alves', 'Achei apartamentos com uma leitura muito mais clara de preco por metro quadrado.'],
  ['Rafael Costa', 'O fluxo de busca parece produto grande, mas continua direto e facil de usar.'],
  ['Bianca Torres', 'O QR code ajudou a mandar o link para meu corretor na hora da visita.'],
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

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=12&data=${encodeURIComponent(whatsappUrl)}`

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
        <div className="home-hero-media" />
        <div className="home-hero-overlay" />
        <nav className="home-hero-nav" aria-label="Atalhos da pagina inicial">
          <a href="#destaques">Destaques</a>
          <a href="#mapa">Mapa</a>
          <a href="#whatsapp">WhatsApp</a>
        </nav>

        <div className="home-hero-content">
          <p className="home-eyebrow">ImovelSP - Sao Paulo</p>
          <h1>Encontre o imovel certo pelo preco certo.</h1>
          <p className="home-hero-copy">
            Busca premium, cards visuais e analise de preco para transformar uma imobiliaria comum em uma experiencia de decisao.
          </p>

          <div className="home-search" aria-label="Busca de imoveis">
            <div className="home-search-field home-search-wide">
              <span>Bairro ou cidade</span>
              <input
                placeholder="Ex: Moema, Pinheiros, Vila Mariana"
                value={form.bairro}
                onChange={(event) => setForm({ ...form, bairro: event.target.value })}
                onKeyDown={(event) => event.key === 'Enter' && handleBuscar()}
              />
            </div>
            <div className="home-search-field">
              <span>Tipo</span>
              <select aria-label="Tipo" value={form.tipo} onChange={(event) => setForm({ ...form, tipo: event.target.value })}>
                <option value="">Todos</option>
                <option value="apartamento">Apartamento</option>
                <option value="casa">Casa</option>
                <option value="terreno">Terreno</option>
                <option value="comercial">Comercial</option>
              </select>
            </div>
            <div className="home-search-field">
              <span>Negocio</span>
              <select aria-label="Negocio" value={form.negocio} onChange={(event) => setForm({ ...form, negocio: event.target.value })}>
                <option value="venda">Venda</option>
                <option value="aluguel">Aluguel</option>
                <option value="temporada">Temporada</option>
              </select>
            </div>
            <div className="home-search-field">
              <span>Quartos</span>
              <select aria-label="Quartos" value={form.quartos} onChange={(event) => setForm({ ...form, quartos: event.target.value })}>
                <option value="">Qualquer</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
              </select>
            </div>
            <div className="home-search-field">
              <span>Preco max.</span>
              <input
                type="number"
                placeholder="R$ 900000"
                value={form.preco_max}
                onChange={(event) => setForm({ ...form, preco_max: event.target.value })}
              />
            </div>
            <button className="home-search-button" onClick={handleBuscar}>Buscar imoveis</button>
          </div>
        </div>
      </section>

      <section className="home-section home-stats" aria-label="Indicadores">
        {[
          ['Preco/m2', 'Analise automatica'],
          ['24h', 'Resposta por WhatsApp'],
          ['SP', 'Foco em Sao Paulo'],
          ['MVP', 'Pronto para evoluir'],
        ].map(([value, label]) => (
          <div className="home-stat" key={label}>
            <strong>{value}</strong>
            <span>{label}</span>
          </div>
        ))}
      </section>

      <section className="home-section" id="destaques">
        <div className="home-section-head">
          <p className="home-eyebrow">Imoveis em destaque</p>
          <h2>Cards visuais para vender desejo e dados ao mesmo tempo.</h2>
        </div>
        <div className="featured-grid">
          {featured.map((item) => (
            <article className="featured-card" key={item.title}>
              <div className="featured-photo" style={{ backgroundImage: `url(${item.image})` }}>
                <span>{item.tag}</span>
              </div>
              <div className="featured-body">
                <h3>{item.title}</h3>
                <p>{item.area} - {item.rooms}</p>
                <div className="featured-price">
                  <strong>{item.price}</strong>
                  <small>Ver analise</small>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="home-section benefits-grid">
        <div className="home-section-head">
          <p className="home-eyebrow">Diferenciais</p>
          <h2>Mais que uma vitrine: uma ferramenta para decidir melhor.</h2>
        </div>
        <div className="benefit-list">
          {benefits.map(([title, text], index) => (
            <article className="benefit-card" key={title}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="home-section map-section" id="mapa">
        <div>
          <p className="home-eyebrow">Mapa interativo</p>
          <h2>Explore bairros, compare regioes e evolua para busca no mapa.</h2>
          <p>
            A versao atual ja prepara a experiencia para um mapa real. O proximo passo natural e conectar coordenadas dos imoveis e filtros por raio.
          </p>
        </div>
        <div className="map-frame">
          <iframe
            title="Mapa de Sao Paulo"
            src="https://www.openstreetmap.org/export/embed.html?bbox=-46.78%2C-23.68%2C-46.45%2C-23.43&layer=mapnik&marker=-23.56%2C-46.64"
          />
          <div className="map-pin pin-one">Pinheiros</div>
          <div className="map-pin pin-two">Moema</div>
          <div className="map-pin pin-three">Vila Mariana</div>
        </div>
      </section>

      <section className="home-section testimonials">
        <div className="home-section-head">
          <p className="home-eyebrow">Prova social</p>
          <h2>Depoimentos deixam o projeto com cara de produto pronto.</h2>
        </div>
        <div className="testimonial-grid">
          {testimonials.map(([name, text]) => (
            <article className="testimonial-card" key={name}>
              <p>&quot;{text}&quot;</p>
              <strong>{name}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="home-section whatsapp-section" id="whatsapp">
        <div className="whatsapp-copy">
          <p className="home-eyebrow">Atendimento e lead</p>
          <h2>WhatsApp integrado com QR code para capturar contato rapido.</h2>
          <p>
            O visitante pode clicar no botao ou escanear o QR code. Depois voce troca o numero placeholder pelo numero real da imobiliaria.
          </p>
          <a className="whatsapp-button" href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            Chamar no WhatsApp
          </a>
        </div>
        <div className="qr-card">
          <div
            className="qr-image"
            role="img"
            aria-label="QR code para conversa no WhatsApp"
            style={{ backgroundImage: `url(${qrUrl})` }}
          />
          <strong>Escaneie para conversar</strong>
          <span>{whatsappNumber}</span>
        </div>
      </section>

      <a className="floating-whatsapp" href={whatsappUrl} target="_blank" rel="noopener noreferrer" aria-label="Chamar no WhatsApp">
        WA
      </a>
    </div>
  )
}
