'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Imovel } from '@/lib/types'
import ImovelCard from '@/components/ImovelCard'
import { calcularPrecoM2 } from '@/lib/utils'

function BuscaConteudo() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [imoveis, setImoveis] = useState<Imovel[]>([])
  const [loading, setLoading] = useState(true)
  const [ordenacao, setOrdenacao] = useState('recentes')
  const [form, setForm] = useState({
    bairro: searchParams.get('bairro') ?? '',
    tipo: searchParams.get('tipo') ?? '',
    negocio: searchParams.get('negocio') ?? 'venda',
    quartos: searchParams.get('quartos') ?? '',
    preco_max: searchParams.get('preco_max') ?? '',
  })

  useEffect(() => {
    let ativo = true

    async function carregar() {
      try {
        const res = await fetch(`/api/imoveis?${searchParams.toString()}`)
        const data = await res.json()
        if (ativo) setImoveis(data.imoveis ?? [])
      } catch {
        if (ativo) setImoveis([])
      } finally {
        if (ativo) setLoading(false)
      }
    }

    void carregar()
    return () => {
      ativo = false
    }
  }, [searchParams])

  function aplicarFiltros() {
    setLoading(true)
    const params = new URLSearchParams()
    if (form.bairro) params.set('bairro', form.bairro)
    if (form.tipo) params.set('tipo', form.tipo)
    if (form.negocio) params.set('negocio', form.negocio)
    if (form.quartos) params.set('quartos', form.quartos)
    if (form.preco_max) params.set('preco_max', form.preco_max)
    router.push(`/busca?${params.toString()}`)
  }

  const imoveisOrdenados = useMemo(() => {
    return [...imoveis].sort((a, b) => {
      if (ordenacao === 'preco_m2_asc') return calcularPrecoM2(a.preco, a.area_m2) - calcularPrecoM2(b.preco, b.area_m2)
      if (ordenacao === 'preco_asc') return a.preco - b.preco
      if (ordenacao === 'area_desc') return b.area_m2 - a.area_m2
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
  }, [imoveis, ordenacao])

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem', display: 'grid', gridTemplateColumns: '280px 1fr', gap: '2rem', alignItems: 'start' }}>
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
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Negocio</label>
            <select value={form.negocio} onChange={e => setForm({ ...form, negocio: e.target.value })}>
              <option value="venda">Venda</option>
              <option value="aluguel">Aluguel</option>
              <option value="temporada">Temporada</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Quartos minimos</label>
            <select value={form.quartos} onChange={e => setForm({ ...form, quartos: e.target.value })}>
              <option value="">Qualquer</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Preco maximo</label>
            <input type="number" placeholder="R$ 0" value={form.preco_max} onChange={e => setForm({ ...form, preco_max: e.target.value })} />
          </div>
          <button onClick={aplicarFiltros} style={{ width: '100%', justifyContent: 'center', marginTop: '0.25rem', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
            Aplicar filtros
          </button>
        </div>
      </aside>

      <div>
        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <h1 style={{ fontFamily: 'var(--font-dm-serif)', fontSize: '1.5rem' }}>
            {loading ? 'Buscando...' : `${imoveis.length} imovel${imoveis.length !== 1 ? 'is' : ''} encontrado${imoveis.length !== 1 ? 's' : ''}`}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {form.bairro && <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>em <strong style={{ color: 'var(--text)' }}>{form.bairro}</strong></span>}
            <select value={ordenacao} onChange={(event) => setOrdenacao(event.target.value)} style={{ width: 'auto', minWidth: '190px' }}>
              <option value="recentes">Mais recentes</option>
              <option value="preco_m2_asc">Menor preco/m2</option>
              <option value="preco_asc">Menor preco total</option>
              <option value="area_desc">Maior area</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ height: '320px', borderRadius: 'var(--radius)', background: 'var(--bg-card)', animation: 'pulse 1.5s infinite' }} />
            ))}
          </div>
        ) : imoveis.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏠</div>
            <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Nenhum imovel encontrado</p>
            <p style={{ fontSize: '0.875rem' }}>Tente ajustar os filtros ou buscar em outro bairro.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
            {imoveisOrdenados.map(im => <ImovelCard key={im.id} imovel={im} />)}
          </div>
        )}
      </div>
    </div>
  )
}

export default function BuscaPage() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Carregando...</div>}>
      <BuscaConteudo />
    </Suspense>
  )
}
