'use client'

import { Suspense, useEffect, useState, type FormEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, ArrowRight, ListFilter, Search, SlidersHorizontal } from 'lucide-react'
import ImovelCard from '@/components/ImovelCard'
import { trackEvent } from '@/lib/analytics'
import type { Imovel, Pagination } from '@/lib/types'

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
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryString = searchParams.toString()
  const [imoveis, setImoveis] = useState<Imovel[]>([])
  const [pagination, setPagination] = useState<Pagination>(emptyPagination)
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')
  const [retryToken, setRetryToken] = useState(0)
  const ordenacao = searchParams.get('ordenacao') ?? 'recentes'
  const bairroSelecionado = searchParams.get('bairro')?.trim() ?? ''
  const negocioSelecionado = searchParams.get('negocio') ?? 'venda'

  function navigateSearch(params: URLSearchParams) {
    const search = params.toString()
    router.push(search ? `/busca?${search}` : '/busca')
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
        if (!params.get('negocio')) params.set('negocio', 'venda')

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

  useEffect(() => {
    if (loading || erro || imoveis.length === 0) return

    trackEvent('view_item_list', {
      item_list_name: 'search_results',
      search_term: bairroSelecionado || undefined,
      items: imoveis.map((imovel) => ({
        item_id: imovel.id,
        item_name: imovel.titulo,
        item_category: imovel.tipo,
        price: imovel.preco,
      })),
    })
  }, [bairroSelecionado, erro, imoveis, loading])

  function aplicarFiltros(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const params = new URLSearchParams()
    const bairro = String(formData.get('bairro') ?? '').trim()
    const tipo = String(formData.get('tipo') ?? '')
    const negocio = String(formData.get('negocio') ?? 'venda')
    const quartos = String(formData.get('quartos') ?? '')
    const precoMin = String(formData.get('preco_min') ?? '')
    const precoMax = String(formData.get('preco_max') ?? '')

    if (bairro) params.set('bairro', bairro)
    if (tipo) params.set('tipo', tipo)
    if (negocio) params.set('negocio', negocio)
    if (quartos) params.set('quartos', quartos)
    if (precoMin) params.set('preco_min', precoMin)
    if (precoMax) params.set('preco_max', precoMax)
    if (ordenacao !== 'recentes') params.set('ordenacao', ordenacao)
    params.set('page', '1')
    params.set('per_page', String(PER_PAGE))

    trackEvent('search', {
      search_term: bairro || 'sem termo',
      item_category: tipo || undefined,
      negocio,
      quartos_minimos: quartos || undefined,
      preco_min: precoMin || undefined,
      preco_max: precoMax || undefined,
    })

    navigateSearch(params)
  }

  function alterarOrdenacao(valor: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (valor === 'recentes') {
      params.delete('ordenacao')
    } else {
      params.set('ordenacao', valor)
    }
    if (!params.get('negocio')) params.set('negocio', 'venda')
    params.set('page', '1')
    params.set('per_page', String(PER_PAGE))
    navigateSearch(params)
  }

  function mudarPagina(page: number) {
    const params = new URLSearchParams(searchParams.toString())
    if (!params.get('negocio')) params.set('negocio', 'venda')
    params.set('page', String(page))
    params.set('per_page', String(PER_PAGE))
    navigateSearch(params)
  }

  function limparFiltros() {
    const params = new URLSearchParams()
    params.set('negocio', 'venda')
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
        <div role="status" aria-live="polite" aria-atomic="true">
          <p className="eyebrow">Curadoria ImovelSP</p>
          <h1>{loading ? 'Buscando imoveis...' : totalLabel}</h1>
          <p>Compare enderecos, atributos e preco por metro quadrado.</p>
        </div>
      </section>

      <div className="search-layout">
        <aside className="search-sidebar" aria-label="Filtros de busca">
          <div className="filter-title">
            <div>
              <ListFilter size={17} />
              <h2>Filtros</h2>
            </div>
            <button type="button" onClick={limparFiltros}>Limpar</button>
          </div>
          <form
            key={queryString || 'default-search'}
            className="filter-fields"
            role="search"
            aria-label="Buscar imoveis"
            onSubmit={aplicarFiltros}
          >
            <label className="filter-field">
              <span>Bairro ou cidade</span>
              <input
                name="bairro"
                type="search"
                placeholder="Ex: Moema ou Sao Paulo"
                defaultValue={bairroSelecionado}
              />
            </label>
            <label className="filter-field">
              <span>Tipo</span>
              <select name="tipo" defaultValue={searchParams.get('tipo') ?? ''}>
                <option value="">Todos</option>
                <option value="apartamento">Apartamento</option>
                <option value="casa">Casa</option>
                <option value="terreno">Terreno</option>
                <option value="comercial">Comercial</option>
              </select>
            </label>
            <label className="filter-field">
              <span>Negocio</span>
              <select name="negocio" defaultValue={negocioSelecionado}>
                <option value="venda">Venda</option>
                <option value="aluguel">Aluguel</option>
                <option value="temporada">Temporada</option>
              </select>
            </label>
            <label className="filter-field">
              <span>Quartos minimos</span>
              <select name="quartos" defaultValue={searchParams.get('quartos') ?? ''}>
                <option value="">Qualquer</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
              </select>
            </label>
            <label className="filter-field">
              <span>Preco minimo</span>
              <input
                name="preco_min"
                type="number"
                min="0"
                inputMode="numeric"
                placeholder="R$ 0"
                defaultValue={searchParams.get('preco_min') ?? ''}
              />
            </label>
            <label className="filter-field">
              <span>Preco maximo</span>
              <input
                name="preco_max"
                type="number"
                min="0"
                inputMode="numeric"
                placeholder="R$ 0"
                defaultValue={searchParams.get('preco_max') ?? ''}
              />
            </label>
            <button type="submit" className="btn btn-primary filter-submit">
              <Search size={16} /> Aplicar filtros
            </button>
          </form>
        </aside>

        <div className="search-results" aria-busy={loading}>
          <div className="search-header">
            <div>
              {!loading && pagination.total > 0 && (
                <p>Pagina {pagination.page} de {pagination.total_pages}</p>
              )}
            </div>
            <div className="search-order">
              {bairroSelecionado && <span>em <strong>{bairroSelecionado}</strong></span>}
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
              <p>Tente ajustar bairro, cidade ou faixa de preco.</p>
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
