'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft, ArrowRight, ListFilter, Map, Search, SlidersHorizontal } from 'lucide-react'
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
  const queryString = searchParams.toString()
  const [imoveis, setImoveis] = useState<Imovel[]>([])
  const [pagination, setPagination] = useState<Pagination>(emptyPagination)
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')
  const [retryToken, setRetryToken] = useState(0)
  const ordenacao = searchParams.get('ordenacao') ?? 'recentes'
  const [form, setForm] = useState({
    bairro: searchParams.get('bairro') ?? '',
    tipo: searchParams.get('tipo') ?? '',
    negocio: searchParams.get('negocio') ?? 'venda',
    quartos: searchParams.get('quartos') ?? '',
    preco_max: searchParams.get('preco_max') ?? '',
  })

  function navigateSearch(params: URLSearchParams) {
    window.history.pushState(null, '', `/busca?${params.toString()}`)
  }

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
  }, [queryString, retryToken])

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
    navigateSearch(params)
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
    navigateSearch(params)
  }

  function mudarPagina(page: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(page))
    params.set('per_page', String(PER_PAGE))
    navigateSearch(params)
  }

  function limparFiltros() {
    setForm({
      bairro: '',
      tipo: '',
      negocio: 'venda',
      quartos: '',
      preco_max: '',
    })
    const params = new URLSearchParams()
    params.set('page', '1')
    params.set('per_page', String(PER_PAGE))
    navigateSearch(params)
  }

  const totalLabel = pagination.total === 1
    ? '1 imovel encontrado'
    : `${pagination.total} imoveis encontrados`

  return (
    <div className="search-page">
      <section className="search-page-head">
        <div>
          <p className="eyebrow">Curadoria ImovelSP</p>
          <h1>{loading ? 'Buscando imoveis...' : totalLabel}</h1>
          <p>Compare enderecos, atributos e preco por metro quadrado.</p>
        </div>
        <button className="btn btn-ghost search-map-button" type="button">
          <Map size={16} /> Ver no mapa
        </button>
      </section>

      <div className="search-layout">
        <aside className="search-sidebar">
          <div className="filter-title">
            <div>
              <ListFilter size={17} />
              <h2>Filtros</h2>
            </div>
            <button type="button" onClick={limparFiltros}>Limpar</button>
          </div>
          <div className="filter-fields">
            <label className="filter-field">
              <span>Bairro</span>
            <input placeholder="Ex: Moema" value={form.bairro} onChange={(e) => setForm({ ...form, bairro: e.target.value })} />
            </label>
            <label className="filter-field">
              <span>Tipo</span>
            <select aria-label="Tipo" value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
              <option value="">Todos</option>
              <option value="apartamento">Apartamento</option>
              <option value="casa">Casa</option>
              <option value="terreno">Terreno</option>
              <option value="comercial">Comercial</option>
            </select>
            </label>
            <label className="filter-field">
              <span>Negocio</span>
            <select aria-label="Negocio" value={form.negocio} onChange={(e) => setForm({ ...form, negocio: e.target.value })}>
              <option value="venda">Venda</option>
              <option value="aluguel">Aluguel</option>
              <option value="temporada">Temporada</option>
            </select>
            </label>
            <label className="filter-field">
              <span>Quartos minimos</span>
            <select aria-label="Quartos minimos" value={form.quartos} onChange={(e) => setForm({ ...form, quartos: e.target.value })}>
              <option value="">Qualquer</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
            </select>
            </label>
            <label className="filter-field">
              <span>Preco maximo</span>
            <input type="number" placeholder="R$ 0" value={form.preco_max} onChange={(e) => setForm({ ...form, preco_max: e.target.value })} />
            </label>
            <button type="button" className="btn btn-primary filter-submit" onClick={aplicarFiltros}>
              <Search size={16} /> Aplicar filtros
            </button>
          </div>
        </aside>

        <div className="search-results">
        <div className="search-header">
          <div>
            {!loading && pagination.total > 0 && (
              <p>Pagina {pagination.page} de {pagination.total_pages}</p>
            )}
          </div>
          <div className="search-order">
            {form.bairro && <span>em <strong>{form.bairro}</strong></span>}
            <SlidersHorizontal size={15} />
            <select aria-label="Ordenacao" value={ordenacao} onChange={(event) => alterarOrdenacao(event.target.value)}>
              <option value="recentes">Mais recentes</option>
              <option value="preco_m2_asc">Menor preco/m2</option>
              <option value="preco_asc">Menor preco total</option>
              <option value="area_desc">Maior area</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="search-results-grid" aria-label="Carregando imoveis">
            {Array.from({ length: 6 }).map((_, i) => (
              <article key={i} className="property-card-skeleton" aria-hidden="true">
                <div className="skeleton skeleton-media" />
                <div className="skeleton-row">
                  <div className="skeleton skeleton-pill" />
                  <div className="skeleton skeleton-pill skeleton-pill-short" />
                </div>
                <div className="skeleton skeleton-line skeleton-line-title" />
                <div className="skeleton skeleton-line skeleton-line-short" />
                <div className="skeleton skeleton-line" />
                <div className="skeleton skeleton-line skeleton-line-price" />
              </article>
            ))}
          </div>
        ) : erro ? (
          <div className="search-state search-state-error" role="alert">
            <span className="search-state-kicker">Busca indisponivel</span>
            <h2>Nao foi possivel carregar os imoveis</h2>
            <p>{erro}</p>
            <p>Tente novamente em alguns instantes.</p>
            <div className="search-state-actions">
              <button type="button" className="btn btn-primary" onClick={() => setRetryToken((token) => token + 1)}>
                Tentar novamente
              </button>
              <button type="button" className="btn btn-ghost" onClick={limparFiltros}>
                Limpar filtros
              </button>
            </div>
          </div>
        ) : imoveis.length === 0 ? (
          <div className="search-state">
            <span className="search-state-kicker">Sem resultados</span>
            <h2>Nenhum imovel encontrado</h2>
            <p>Tente ajustar os filtros ou buscar em outro bairro.</p>
            <div className="search-state-actions">
              <button type="button" className="btn btn-primary" onClick={limparFiltros}>
                Limpar filtros
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="search-results-grid">
              {imoveis.map((imovel) => <ImovelCard key={imovel.id} imovel={imovel} />)}
            </div>

            {pagination.total_pages > 1 && (
              <nav className="pagination" aria-label="Paginacao de imoveis">
                <button
                  type="button"
                  className="btn btn-ghost"
                  disabled={!pagination.has_prev || loading}
                  onClick={() => mudarPagina(pagination.page - 1)}
                >
                  <ArrowLeft size={15} /> Anterior
                </button>
                <span>
                  Pagina {pagination.page} de {pagination.total_pages}
                </span>
                <button
                  type="button"
                  className="btn btn-ghost"
                  disabled={!pagination.has_next || loading}
                  onClick={() => mudarPagina(pagination.page + 1)}
                >
                  Proxima <ArrowRight size={15} />
                </button>
              </nav>
            )}
          </>
        )}
        </div>
      </div>
    </div>
  )
}

export default function BuscaPage() {
  return (
    <Suspense fallback={<div className="page-loading">Carregando...</div>}>
      <BuscaConteudo />
    </Suspense>
  )
}
