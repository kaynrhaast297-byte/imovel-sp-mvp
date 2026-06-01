'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  const [form, setForm] = useState({
    bairro: '',
    tipo: '',
    negocio: 'venda',
    quartos: '',
    preco_max: '',
  })

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
    <div>
      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, #0f1117 0%, #161b27 50%, #0f1117 100%)',
        padding: '5rem 1.5rem 4rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Glow */}
        <div style={{
          position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
          width: '600px', height: '300px',
          background: 'radial-gradient(ellipse, rgba(59,127,245,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <p className="fade-up" style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.85rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem' }}>
          Comparador de Imóveis · São Paulo
        </p>
        <h1 className="fade-up" style={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: 'clamp(2rem, 5vw, 3.5rem)',
          lineHeight: 1.15,
          marginBottom: '1rem',
          animationDelay: '0.1s',
        }}>
          Saiba se o preço<br />
          <span style={{ color: 'var(--primary)' }}>está justo</span>
        </h1>
        <p className="fade-up" style={{ color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto 2.5rem', animationDelay: '0.2s' }}>
          Compare imóveis de vários portais em um só lugar e descubra o preço médio do bairro.
        </p>

        {/* Formulário de busca */}
        <div className="fade-up" style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '1.5rem',
          maxWidth: '720px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '0.75rem',
          animationDelay: '0.3s',
        }}>
          <input
            placeholder="Bairro ou cidade"
            value={form.bairro}
            onChange={e => setForm({ ...form, bairro: e.target.value })}
            onKeyDown={e => e.key === 'Enter' && handleBuscar()}
            style={{ gridColumn: 'span 2' }}
          />
          <select value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })}>
            <option value="">Tipo de imóvel</option>
            <option value="apartamento">Apartamento</option>
            <option value="casa">Casa</option>
            <option value="terreno">Terreno</option>
            <option value="comercial">Comercial</option>
          </select>
          <select value={form.negocio} onChange={e => setForm({ ...form, negocio: e.target.value })}>
            <option value="venda">Venda</option>
            <option value="aluguel">Aluguel</option>
            <option value="temporada">Temporada</option>
          </select>
          <select value={form.quartos} onChange={e => setForm({ ...form, quartos: e.target.value })}>
            <option value="">Quartos</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
          </select>
          <input
            placeholder="Preço máximo"
            type="number"
            value={form.preco_max}
            onChange={e => setForm({ ...form, preco_max: e.target.value })}
          />
          <button
            className="btn btn-primary"
            onClick={handleBuscar}
            style={{ gridColumn: 'span 2', justifyContent: 'center', padding: '0.75rem' }}
          >
            🔍 Buscar imóveis
          </button>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: '3rem 1.5rem', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          {[
            { icon: '🏢', label: 'Imóveis cadastrados', valor: '—' },
            { icon: '📍', label: 'Bairros cobertos', valor: '—' },
            { icon: '💡', label: 'Análises de preço', valor: 'Grátis' },
            { icon: '🔗', label: 'Portais integrados', valor: 'Em breve' },
          ].map((s) => (
            <div key={s.label} className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{s.icon}</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)' }}>{s.valor}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Como funciona */}
      <section style={{ padding: '2rem 1.5rem 4rem', maxWidth: '900px', margin: '0 auto' }}>
        <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.75rem', marginBottom: '2rem', textAlign: 'center' }}>
          Como funciona
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {[
            { n: '01', titulo: 'Busque', desc: 'Digite o bairro e filtre pelo tipo de imóvel que procura.' },
            { n: '02', titulo: 'Compare', desc: 'Veja imóveis similares e o preço médio da região.' },
            { n: '03', titulo: 'Decida', desc: 'Saiba se o preço está abaixo, na média ou acima do mercado.' },
          ].map((p) => (
            <div key={p.n} className="card" style={{ padding: '1.5rem' }}>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--border)', marginBottom: '0.75rem', fontFamily: "'DM Serif Display', serif" }}>{p.n}</div>
              <div style={{ fontWeight: 600, marginBottom: '0.4rem' }}>{p.titulo}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{p.desc}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
    </div>
  )
}
