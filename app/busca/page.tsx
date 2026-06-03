'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import ImovelCard from '@/components/ImovelCard'
import { Imovel, Pagination } from '@/lib/types'

const PER_PAGE = 12

const emptyPagination: Pagination = {
  page: 1,
  per_page: PER_PAGE,
  total: 0,
  total_pages: 1,
  has_next: false,
  has_prev: false,
}

function BuscaConteudo() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const queryString = searchParams.toString()
  const [imoveis, setImoveis] = useState<Imovel[]>([])
  const [pagination, setPagination] = useState<Pagination>(emptyPagination)
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')
  const ordenacao = searchParams.get('ordenacao') ?? 'recentes'
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
      setLoading(true)
      setErro('')

      try {
        const params = new URLSearchParams(queryString)
        if (!params.get('page')) params.set('page', '1')
        if (!params.get('per_page')) params.set('per_page', String(PER_PAGE))

        const res = await fetch(`/api/imoveis?${params.toString()}`)
        const data = await res.json()

        if (!res.ok) {
          throw new Error(data?.error ?? 'Erro ao buscar imoveis.')
        }

        if (ativo) {
          setImoveis(data.imoveis ?? [])
          setPagination(data.pagination ?? emptyPagination)
        }
      } catch (error) {
        if (ativo) {
          setImoveis([])
          setPagination(emptyPagination)
          setErro(error instanceof Error ? error.message : 'Erro ao buscar imoveis.')
        }
      } finally {
        if (ativo) setLoading(false)
      }
    }

    void carregar()
    return () => {
      ativo = false
    }
  }, [queryString])

  function aplicarFiltros() {
    const params = new URLSearchParams()
    if (form.bairro) params.set('bairro', form.bairro)
    if (form.tipo) params.set('tipo', form.tipo)
    if (form.negocio) params.set('negocio', form.negocio)
    if (form.quartos) params.set('quartos', form.quartos)
    if (form.preco_max) params.set('preco_max', form.preco_max)
    if (ordenacao !== 'recentes') params.set('ordenacao', ordenacao)
    params.set('page', '1')
    params.set('per_page', String(PER_PAGE))
    router.push(`/busca?${params.toString()}`)
  }

  function alterarOrdenacao(valor: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (valor === 'recentes') {
      params.delete('ordenacao')
    } else {
      params.set('ordenacao', valor)
    }
    params.set('page', '1')
    params.set('per_page', String(PER_PAGE))
    router.push(`/busca?${params.toString()}`)
  }

  function mudarPagina(page: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(page))
    params.set('per_page', String(PER_PAGE))
    router.push(`/busca?${params.toString()}`)
  }

  const totalLabel = `${pagination.total} imovel${pagination.total !== 1 ? 'is' : ''} encontrado${pagination.total !== 1 ? 's' : ''}`

  return (
    <div className="search-layout">
      <aside className="search-sidebar">
        <h2 style={{ fontWeight: 700, marginBottom: '1.25rem', fontSize: '1rem' }}>Filtros</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Bairro</label>
            <input placeholder="Ex: Moema" value={form.bairro} onChange={(e) => setForm({ ...form, bairro: e.target.value })} />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Tipo</label>
            <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
              <option value="">Todos</option>
              <option value="apartamento">Apartamento</option>
              <option value="casa">Casa</option>
              <option value="terreno">Terreno</option>
              <option value="comercial">Comercial</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Negocio</label>
            <select value={form.negocio} onChange={(e) => setForm({ ...form, negocio: e.target.value })}>
              <option value="venda">Venda</option>
              <option value="aluguel">Aluguel</option>
              <option value="temporada">Temporada</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Quartos minimos</label>
            <select value={form.quartos} onChange={(e) => setForm({ ...form, quartos: e.target.value })}>
              <option value="">Qualquer</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Preco maximo</label>
            <input type="number" placeholder="R$ 0" value={form.preco_max} onChange={(e) => setForm({ ...form, preco_max: e.target.value })} />
          </div>
          <button className="btn btn-primary" onClick={aplicarFiltros} style={{ width: '100%', justifyContent: 'center' }}>
            Aplicar filtros
          </button>
        </div>
      </aside>

      <div>
        <div className="search-header">
          <div>
            <h1 style={{ fontFamily: 'var(--font-dm-serif)', fontSize: '1.5rem' }}>
              {loading ? 'Buscando...' : totalLabel}
            </h1>
            {!loading && pagination.total > 0 && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                Pagina {pagination.page} de {pagination.total_pages}
              </p>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {form.bairro && <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>em <strong style={{ color: 'var(--text)' }}>{form.bairro}</strong></span>}
            <select value={ordenacao} onChange={(event) => alterarOrdenacao(event.target.value)} style={{ width: 'auto', minWidth: '190px' }}>
              <option value="recentes">Mais recentes</option>
              <option value="preco_m2_asc">Menor preco/m2</option>
              <option value="preco_asc">Menor preco total</option>
              <option value="area_desc">Maior area</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="search-results-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: '320px', borderRadius: 'var(--radius)' }} />
            ))}
          </div>
        ) : erro ? (
          <div className="search-empty">
            <p style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--danger)' }}>{erro}</p>
            <p style={{ fontSize: '0.875rem' }}>Tente novamente em alguns instantes.</p>
          </div>
        ) : imoveis.length === 0 ? (
          <div className="search-empty">
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>Casa</div>
            <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Nenhum imovel encontrado</p>
            <p style={{ fontSize: '0.875rem' }}>Tente ajustar os filtros ou buscar em outro bairro.</p>
          </div>
        ) : (
          <>
            <div className="search-results-grid">
              {imoveis.map((imovel) => <ImovelCard key={imovel.id} imovel={imovel} />)}
            </div>

            {pagination.total_pages > 1 && (
              <nav className="pagination" aria-label="Paginacao de imoveis">
                <button
                  className="btn btn-ghost"
                  disabled={!pagination.has_prev || loading}
                  onClick={() => mudarPagina(pagination.page - 1)}
                >
                  Anterior
                </button>
                <span>
                  Pagina {pagination.page} de {pagination.total_pages}
                </span>
                <button
                  className="btn btn-ghost"
                  disabled={!pagination.has_next || loading}
                  onClick={() => mudarPagina(pagination.page + 1)}
                >
                  Proxima
                </button>
              </nav>
            )}
          </>
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
