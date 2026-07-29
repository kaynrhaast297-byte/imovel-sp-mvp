'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ListFilter,
  LogOut,
  RefreshCw,
  Search,
} from 'lucide-react'
import { useCallback, useEffect, useState, useTransition, type FormEvent } from 'react'
import type {
  AdminImovelListItem,
  AdminImovelStatusFilter,
  Pagination,
} from '@/lib/types'
import styles from './AdminPropertiesList.module.css'

const PER_PAGE = 20

const emptyPagination: Pagination = {
  page: 1,
  per_page: PER_PAGE,
  total: 0,
  total_pages: 1,
  has_next: false,
  has_prev: false,
}

const statusLabels = {
  ativo: 'Ativo',
  vendido: 'Vendido',
  alugado: 'Alugado',
  inativo: 'Inativo',
}

const typeLabels = {
  apartamento: 'Apartamento',
  casa: 'Casa',
  terreno: 'Terreno',
  comercial: 'Comercial',
  hotel: 'Hotel',
}

const businessLabels = {
  venda: 'Venda',
  aluguel: 'Aluguel',
  temporada: 'Temporada',
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value)
}

function searchPath(q: string, status: AdminImovelStatusFilter, page: number) {
  const params = new URLSearchParams()
  if (q) params.set('q', q)
  if (status !== 'todos') params.set('status', status)
  if (page > 1) params.set('page', String(page))
  const query = params.toString()
  return query ? `/admin/imoveis?${query}` : '/admin/imoveis'
}

interface AdminPropertiesListProps {
  page: number
  q: string
  status: AdminImovelStatusFilter
}

export default function AdminPropertiesList({ page, q, status }: AdminPropertiesListProps) {
  const router = useRouter()
  const [isNavigating, startTransition] = useTransition()
  const [view, setView] = useState<'loading' | 'ready' | 'guest' | 'error'>('loading')
  const [authenticated, setAuthenticated] = useState<boolean | null>(null)
  const [imoveis, setImoveis] = useState<AdminImovelListItem[]>([])
  const [pagination, setPagination] = useState<Pagination>(emptyPagination)
  const [error, setError] = useState('')
  const [retryToken, setRetryToken] = useState(0)
  const [adminToken, setAdminToken] = useState('')
  const [loginState, setLoginState] = useState<'idle' | 'loading' | 'error'>('idle')
  const [loginError, setLoginError] = useState('')

  const requestProperties = useCallback(async (signal?: AbortSignal) => {
    const params = new URLSearchParams({
      page: String(page),
      per_page: String(PER_PAGE),
      status,
      q,
    })

    const response = await fetch(`/api/admin/imoveis?${params.toString()}`, { signal })
    const data = await response.json().catch(() => null)

    if (response.status === 401) return { kind: 'guest' as const }
    if (!response.ok) throw new Error(data?.error ?? 'Nao foi possivel buscar os imoveis.')

    return {
      kind: 'ready' as const,
      imoveis: Array.isArray(data?.imoveis) ? data.imoveis as AdminImovelListItem[] : [],
      pagination: data?.pagination as Pagination | undefined,
    }
  }, [page, q, status])

  useEffect(() => {
    const controller = new AbortController()

    async function checkSession() {
      try {
        const response = await fetch('/api/admin/session', { signal: controller.signal })
        const data = await response.json().catch(() => null)
        const isAuthenticated = response.ok && data?.authenticated === true
        setAuthenticated(isAuthenticated)
        if (!isAuthenticated) setView('guest')
      } catch (sessionError) {
        if (sessionError instanceof DOMException && sessionError.name === 'AbortError') return
        setError('Nao foi possivel verificar a sessao administrativa.')
        setView('error')
      }
    }

    void checkSession()
    return () => controller.abort()
  }, [])

  useEffect(() => {
    if (authenticated !== true) return
    const controller = new AbortController()

    async function load() {
      try {
        const result = await requestProperties(controller.signal)
        if (result.kind === 'guest') {
          setAuthenticated(false)
          setView('guest')
          return
        }

        setImoveis(result.imoveis)
        setPagination(result.pagination ?? emptyPagination)
        setError('')
        setView('ready')
      } catch (loadError) {
        if (loadError instanceof DOMException && loadError.name === 'AbortError') return
        setImoveis([])
        setPagination(emptyPagination)
        setError(loadError instanceof Error ? loadError.message : 'Nao foi possivel buscar os imoveis.')
        setView('error')
      }
    }

    void load()
    return () => controller.abort()
  }, [authenticated, requestProperties, retryToken])

  function navigate(nextPath: string) {
    startTransition(() => router.push(nextPath))
  }

  function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const nextQuery = String(form.get('q') ?? '').trim()
    const nextStatus = String(form.get('status') ?? 'todos') as AdminImovelStatusFilter
    navigate(searchPath(nextQuery, nextStatus, 1))
  }

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const token = adminToken.trim()
    if (!token) {
      setLoginState('error')
      setLoginError('Informe o token de admin.')
      return
    }

    setLoginState('loading')
    setLoginError('')
    try {
      const response = await fetch('/api/admin/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      const data = await response.json().catch(() => null)
      if (!response.ok) throw new Error(data?.error ?? 'Token de admin invalido.')

      setAdminToken('')
      setLoginState('idle')
      setView('loading')
      setAuthenticated(true)
    } catch (loginFailure) {
      setLoginState('error')
      setLoginError(loginFailure instanceof Error ? loginFailure.message : 'Nao foi possivel autenticar.')
    }
  }

  async function logout() {
    await fetch('/api/admin/session', { method: 'DELETE' }).catch(() => null)
    setAdminToken('')
    setAuthenticated(false)
    setView('guest')
  }

  if (view === 'guest') {
    return (
      <div className={styles.loginPage}>
        <Link href="/admin" className={styles.backLink}>
          <ArrowLeft size={16} aria-hidden="true" /> Painel admin
        </Link>
        <section className={styles.loginPanel} aria-labelledby="admin-properties-login">
          <p className="eyebrow">Acesso restrito</p>
          <h1 id="admin-properties-login">Imoveis</h1>
          <form onSubmit={login} className={styles.loginForm}>
            <label htmlFor="properties-admin-token">Token de admin</label>
            <input
              id="properties-admin-token"
              type="password"
              value={adminToken}
              onChange={event => setAdminToken(event.target.value)}
              autoComplete="current-password"
            />
            {loginState === 'error' ? (
              <p className={styles.errorText} role="alert">{loginError}</p>
            ) : null}
            <button className="btn btn-primary" type="submit" disabled={loginState === 'loading'}>
              {loginState === 'loading' ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </section>
      </div>
    )
  }

  const hasFilters = Boolean(q || status !== 'todos')

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <Link href="/admin" className={styles.backLink}>
            <ArrowLeft size={16} aria-hidden="true" /> Painel admin
          </Link>
          <p className="eyebrow">Inventario</p>
          <h1>Imoveis</h1>
        </div>
        <button className="btn btn-ghost" type="button" onClick={logout}>
          <LogOut size={16} aria-hidden="true" /> Sair
        </button>
      </header>

      <form
        key={`${q}-${status}`}
        className={styles.filters}
        onSubmit={applyFilters}
        aria-label="Filtros de imoveis"
      >
        <label className={styles.searchField}>
          <span>Buscar</span>
          <span className={styles.inputWithIcon}>
            <Search size={17} aria-hidden="true" />
            <input name="q" defaultValue={q} placeholder="Titulo, bairro ou cidade" maxLength={120} />
          </span>
        </label>
        <label className={styles.statusField}>
          <span>Status</span>
          <select name="status" defaultValue={status}>
            <option value="todos">Todos</option>
            <option value="ativo">Ativos</option>
            <option value="inativo">Inativos</option>
          </select>
        </label>
        <button className="btn btn-primary" type="submit" disabled={isNavigating}>
          <ListFilter size={16} aria-hidden="true" /> Aplicar
        </button>
        {hasFilters ? (
          <button className="btn btn-ghost" type="button" onClick={() => navigate('/admin/imoveis')}>
            Limpar
          </button>
        ) : null}
      </form>

      <section className={styles.results} aria-live="polite" aria-busy={view === 'loading'}>
        <div className={styles.resultsHeader}>
          <p>
            {view === 'ready'
              ? `${pagination.total} ${pagination.total === 1 ? 'imovel' : 'imoveis'}`
              : 'Consultando inventario'}
          </p>
          {view === 'ready' ? <span>Pagina {pagination.page} de {pagination.total_pages}</span> : null}
        </div>

        {view === 'loading' ? (
          <div className={styles.statePanel}>Carregando imoveis...</div>
        ) : null}

        {view === 'error' ? (
          <div className={styles.statePanel} role="alert">
            <p>{error}</p>
            <button
              className="btn btn-ghost"
              type="button"
              onClick={() => {
                setView('loading')
                setRetryToken(value => value + 1)
              }}
            >
              <RefreshCw size={16} aria-hidden="true" /> Tentar novamente
            </button>
          </div>
        ) : null}

        {view === 'ready' && imoveis.length === 0 ? (
          <div className={styles.statePanel}>
            <p>Nenhum imovel encontrado.</p>
            {hasFilters ? (
              <button className="btn btn-ghost" type="button" onClick={() => navigate('/admin/imoveis')}>
                Limpar filtros
              </button>
            ) : null}
          </div>
        ) : null}

        {view === 'ready' && imoveis.length > 0 ? (
          <div className={styles.tableScroll}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Imovel</th>
                  <th>Localizacao</th>
                  <th>Preco</th>
                  <th>Status</th>
                  <th><span className={styles.visuallyHidden}>Acoes</span></th>
                </tr>
              </thead>
              <tbody>
                {imoveis.map(imovel => (
                  <tr key={imovel.id}>
                    <td data-label="Imovel">
                      <span className={styles.cellValue}>
                        <strong>{imovel.titulo}</strong>
                        <small>{typeLabels[imovel.tipo]} - {businessLabels[imovel.negocio]}</small>
                      </span>
                    </td>
                    <td data-label="Localizacao">
                      <span className={styles.cellValue}>
                        {imovel.bairro}
                        <small>{imovel.cidade} - {imovel.estado}</small>
                      </span>
                    </td>
                    <td data-label="Preco" className={styles.price}>{formatCurrency(imovel.preco)}</td>
                    <td data-label="Status">
                      <span className={styles.status} data-status={imovel.status}>{statusLabels[imovel.status]}</span>
                    </td>
                    <td className={styles.actions}>
                      <Link
                        href={`/imovel/${imovel.id}`}
                        className={styles.iconButton}
                        aria-label={`Ver ${imovel.titulo} no site`}
                        title="Ver anuncio no site"
                      >
                        <ExternalLink size={17} aria-hidden="true" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>

      {view === 'ready' && pagination.total_pages > 1 ? (
        <nav className={styles.pagination} aria-label="Paginacao de imoveis">
          <button
            className={styles.iconButton}
            type="button"
            onClick={() => navigate(searchPath(q, status, page - 1))}
            disabled={!pagination.has_prev || isNavigating}
            aria-label="Pagina anterior"
            title="Pagina anterior"
          >
            <ChevronLeft size={18} aria-hidden="true" />
          </button>
          <span>{pagination.page} / {pagination.total_pages}</span>
          <button
            className={styles.iconButton}
            type="button"
            onClick={() => navigate(searchPath(q, status, page + 1))}
            disabled={!pagination.has_next || isNavigating}
            aria-label="Proxima pagina"
            title="Proxima pagina"
          >
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        </nav>
      ) : null}
    </div>
  )
}
