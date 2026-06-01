'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Imovel } from '@/lib/types'
import ImovelCard from '@/components/ImovelCard'

export default function BuscaPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [imoveis, setImoveis] = useState<Imovel[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    bairro: searchParams.get('bairro') ?? '',
    tipo: searchParams.get('tipo') ?? '',
    negocio: searchParams.get('negocio') ?? 'venda',
    quartos: searchParams.get('quartos') ?? '',
    preco_max: searchParams.get('preco_max') ?? '',
  })

  useEffect(() => {
    buscar()
  }, [searchParams])

  async function buscar() {
    setLoading(true)
    try {
      const res = await fetch(`/api/imoveis?${searchParams.toString()}`)
      const data = await res.json()
      setImoveis(data.imoveis ?? [])
    } catch {
      setImoveis([])
    } finally {
      setLoading(false)
    }
  }

  function aplicarFiltros() {
    const params = new URLSearchParams()
    if (form.bairro) params.set('bairro', form.bairro)
    if (form.tipo) params.set('tipo', form.tipo)
    if (form.negocio) params.set('negocio', form.negocio)
    if (form.quartos) params.set('quartos', form.quartos)
    if (form.preco_max) params.set('preco_max', form.preco_max)
    router.push(`/busca?${params.toString()}`)
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem', display: 'grid', gridTemplateColumns: '280px 1fr', gap: '2rem', alignItems: 'start' }}>
      {/* Sidebar de filtros */}
      <aside style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem', position: 'sticky', top: '80px' }}>
        <h2 style={{ fontWeight: 700, marginBottom: '1.25rem', fontSize: '1rem' }}>Filtros</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Bairro</label>
            <input placeholder="Ex: Moema" value={form.bairro} onChange={e => setForm({ ...form, bairro: e.target.value })} />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Tipo</label>
            <select value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })}>
              <option value="">Todos</option>
              <option value="apartamento">Apartamento</option>
              <option value="casa">Casa</option>
              <option value="terreno">Terreno</option>
              <option value="comercial">Comercial</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Negócio</label>
            <select value={form.negocio} onChange={e => setForm({ ...form, negocio: e.target.value })}>
              <option value="venda">Venda</option>
              <option value="aluguel">Aluguel</option>
              <option value="temporada">Temporada</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Quartos mínimos</label>
            <select value={form.quartos} onChange={e => setForm({ ...form, quartos: e.target.value })}>
              <option value="">Qualquer</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Preço máximo</label>
            <input type="number" placeholder="R$ 0" value={form.preco_max} onChange={e => setForm({ ...form, preco_max: e.target.value })} />
          </div>
          <button className="btn btn-primary" onClick={aplicarFiltros} style={{ width: '100%', justifyContent: 'center', marginTop: '0.25rem' }}>
            Aplicar filtros
          </button>
        </div>
      </aside>

      {/* Resultados */}
      <div>
        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.5rem' }}>
            {loading ? 'Buscando…' : `${imoveis.length} imóve${imoveis.length !== 1 ? 'is' : 'l'} encontrado${imoveis.length !== 1 ? 's' : ''}`}
          </h1>
          {form.bairro && <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>em <strong style={{ color: 'var(--text)' }}>{form.bairro}</strong></span>}
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: '320px', borderRadius: 'var(--radius)' }} />
            ))}
          </div>
        ) : imoveis.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏚️</div>
            <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Nenhum imóvel encontrado</p>
            <p style={{ fontSize: '0.875rem' }}>Tente ajustar os filtros ou buscar em outro bairro.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
            {imoveis.map(im => <ImovelCard key={im.id} imovel={im} />)}
          </div>
        )}
      </div>
    </div>
  )
}
