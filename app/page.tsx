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
      <section style={{
        background: 'linear-gradient(135deg, #0f1117 0%, #161b27 50%, #0f1117 100%)',
        padding: '5rem 1.5rem 4rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
          width: '600px', height: '300px',
          background: 'radial-gradient(ellipse, rgba(59,127,245,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <p style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.85rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem' }}>
          Comparador de Imoveis - Sao Paulo
        </p>
        <h1 style={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: 'clamp(2rem, 5vw, 3.5rem)',
          lineHeight: 1.15,
          marginBottom: '1rem',
        }}>
          Saiba se o preco<br />
          <span style={{ color: 'var(--primary)' }}>esta justo</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto 2.5rem' }}>
          Compare imoveis de varios portais em um so lugar e descubra o preco medio do bairro.
        </p>
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '1.5rem',
          maxWidth: '720px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '0.75rem',
        }}>
          <input
            placeholder="Bairro ou cidade"
            value={form.bairro}
            onChange={e => setForm({ ...form, bairro: e.target.value })}
            onKeyDown={e => e.key === 'Enter' && handleBuscar()}
            style={{ gridColumn: 'span 2' }}
          />
          <select value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })}>
            <option value="">Tipo de imovel</option>
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
            placeholder="Preco maximo"
            type="number"
            value={form.preco_max}
            onChange={e => setForm({ ...form, preco_max: e.target.value })}
          />
          <button
            onClick={handleBuscar}
            style={{
              gridColumn: 'span 2',
              justifyContent: 'center',
              padding: '0.75rem',
              background: 'var(--primary)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '1rem',
            }}
          >
            Buscar imoveis
          </button>
        </div>
      </section>

      <section style={{ padding: '3rem 1.5rem', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          {[
            { icon: '🏢', label: 'Imoveis cadastrados', valor: '-' },
            { icon: '📍', label: 'Bairros cobertos', valor: '-' },
            { icon: '💡', label: 'Analises de preco', valor: 'Gratis' },
            { icon: '🔗', label: 'Portais integrados', valor: 'Em breve' },
          ].map((s) => (
            <div key={s.label} style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '1.25rem',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{s.icon}</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)' }}>{s.valor}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: '2rem 1.5rem 4rem', maxWidth: '900px', margin: '0 auto' }}>
        <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.75rem', marginBottom: '2rem', textAlign: 'center' }}>
          Como funciona
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {[
            { n: '01', titulo: 'Busque', desc: 'Digite o bairro e filtre pelo tipo de imovel que procura.' },
            { n: '02', titulo: 'Compare', desc: 'Veja imoveis similares e o preco medio da regiao.' },
            { n: '03', titulo: 'Decida', desc: 'Saiba se o preco esta abaixo, na media ou acima do mercado.' },
          ].map((p) => (
            <div key={p.n} style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '1.5rem',
            }}>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--border)', marginBottom: '0.75rem' }}>{p.n}</div>
              <div style={{ fontWeight: 600, marginBottom: '0.4rem' }}>{p.titulo}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{p.desc}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
