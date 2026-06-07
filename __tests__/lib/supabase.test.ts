import { beforeEach, describe, expect, it, vi } from 'vitest'
import { e2eImovel, e2eImoveisSimilares } from '@/lib/e2e-fixtures'
import type { Imovel } from '@/lib/types'

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
}))

vi.mock('@supabase/supabase-js', () => ({
  createClient: mocks.createClient,
}))

type QueryResult = {
  data?: unknown
  error?: unknown
  count?: number | null
}

function makeQuery(result: QueryResult = { data: [], error: null, count: 0 }) {
  const query = {
    eq: vi.fn(),
    from: vi.fn(),
    gte: vi.fn(),
    ilike: vi.fn(),
    insert: vi.fn(),
    limit: vi.fn(),
    lte: vi.fn(),
    neq: vi.fn(),
    or: vi.fn(),
    order: vi.fn(),
    range: vi.fn(),
    select: vi.fn(),
    single: vi.fn(),
    then: vi.fn(),
    update: vi.fn(),
  }

  for (const method of ['eq', 'gte', 'ilike', 'insert', 'lte', 'neq', 'or', 'order', 'select', 'update'] as const) {
    query[method].mockReturnValue(query)
  }
  query.range.mockResolvedValue(result)
  query.single.mockResolvedValue(result)
  query.limit.mockResolvedValue(result)
  query.then.mockImplementation((resolve, reject) => Promise.resolve(result).then(resolve, reject))

  return query
}

function makeClient(queries: ReturnType<typeof makeQuery>[]) {
  return {
    from: vi.fn(() => {
      const query = queries.shift()
      if (!query) throw new Error('Query mock nao configurada.')
      return query
    }),
  }
}

async function loadSupabase(
  publicQueries: ReturnType<typeof makeQuery>[] = [],
  adminQueries: ReturnType<typeof makeQuery>[] = [],
) {
  const publicClient = makeClient(publicQueries)
  const adminClient = makeClient(adminQueries)

  mocks.createClient.mockImplementation((_url: string, key: string) =>
    key === 'anon-key' ? publicClient : adminClient,
  )

  const supabaseModule = await import('@/lib/supabase')
  return { ...supabaseModule, publicClient, adminClient }
}

const imovel: Imovel = {
  id: 'imovel-1',
  titulo: 'Apto Pinheiros',
  tipo: 'apartamento',
  negocio: 'venda',
  status: 'ativo',
  preco: 900000,
  area_m2: 90,
  quartos: 2,
  bairro: 'Pinheiros',
  cidade: 'Sao Paulo',
  estado: 'SP',
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
}

describe('lib/supabase', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key'
    process.env.SUPABASE_SECRET_KEY = 'secret-key'
    delete process.env.SUPABASE_SERVICE_ROLE_KEY
    delete process.env.E2E_MOCKS
  })

  it('aplica filtros, sanitiza busca, ordena e pagina imoveis', async () => {
    const query = makeQuery({ data: [imovel], error: null, count: 50 })
    const { getImoveis, publicClient } = await loadSupabase([query])

    const result = await getImoveis({
      tipo: ' apartamento ',
      negocio: 'venda',
      bairro: 'Pinheiros, % centro',
      cidade: 'Sao Paulo',
      preco_min: 500000,
      preco_max: 1000000,
      quartos_min: 2,
      ordenacao: 'preco_m2_asc',
      page: 2,
      per_page: 20,
    })

    expect(publicClient.from).toHaveBeenCalledWith('imoveis')
    expect(query.or).toHaveBeenCalledWith('bairro.ilike.%Pinheiros centro%,cidade.ilike.%Pinheiros centro%')
    expect(query.ilike).toHaveBeenCalledWith('cidade', '%Sao Paulo%')
    expect(query.gte).toHaveBeenCalledWith('preco', 500000)
    expect(query.gte).toHaveBeenCalledWith('quartos', 2)
    expect(query.lte).toHaveBeenCalledWith('preco', 1000000)
    expect(query.order).toHaveBeenCalledWith('preco_m2', { ascending: true, nullsFirst: false })
    expect(query.range).toHaveBeenCalledWith(20, 39)
    expect(result.pagination).toEqual({
      page: 2,
      per_page: 20,
      total: 50,
      total_pages: 3,
      has_next: true,
      has_prev: true,
    })
  })

  it('usa defaults seguros, limita per_page e propaga erro de busca', async () => {
    const defaultQuery = makeQuery({ data: null, error: null, count: null })
    const error = new Error('select falhou')
    const errorQuery = makeQuery({ data: null, error, count: null })
    const { getImoveis } = await loadSupabase([defaultQuery, errorQuery])

    const result = await getImoveis({ page: 0, per_page: 999, ordenacao: 'area_desc' })

    expect(defaultQuery.order).toHaveBeenCalledWith('area_m2', { ascending: false })
    expect(defaultQuery.range).toHaveBeenCalledWith(0, 47)
    expect(result).toEqual({
      imoveis: [],
      pagination: {
        page: 1,
        per_page: 48,
        total: 0,
        total_pages: 1,
        has_next: false,
        has_prev: false,
      },
    })
    await expect(getImoveis()).rejects.toBe(error)
  })

  it('le detalhe e retorna fixtures quando E2E_MOCKS esta ativo', async () => {
    const detailQuery = makeQuery({ data: imovel, error: null })
    const { getImovelById, getImovelSimilares } = await loadSupabase([detailQuery])

    expect(await getImovelById('imovel-1')).toEqual(imovel)
    expect(detailQuery.eq).toHaveBeenCalledWith('id', 'imovel-1')

    process.env.E2E_MOCKS = '1'
    expect(await getImovelById(e2eImovel.id)).toEqual(e2eImovel)
    expect(await getImovelSimilares(e2eImovel)).toEqual(e2eImoveisSimilares)
  })

  it('cria, atualiza e inativa imovel usando o client admin', async () => {
    const createQuery = makeQuery({ data: imovel, error: null })
    const updateQuery = makeQuery({ data: { ...imovel, preco: 950000 }, error: null })
    const deleteQuery = makeQuery({ error: null })
    const { createImovel, updateImovel, deleteImovel, adminClient } = await loadSupabase(
      [],
      [createQuery, updateQuery, deleteQuery],
    )

    expect(await createImovel({ titulo: imovel.titulo })).toEqual(imovel)
    expect(createQuery.insert).toHaveBeenCalledWith({ titulo: imovel.titulo })

    expect(await updateImovel(imovel.id, { preco: 950000 })).toEqual({ ...imovel, preco: 950000 })
    expect(updateQuery.update).toHaveBeenCalledWith({
      preco: 950000,
      updated_at: expect.any(String),
    })
    expect(updateQuery.eq).toHaveBeenCalledWith('id', imovel.id)

    await expect(deleteImovel(imovel.id)).resolves.toBeUndefined()
    expect(deleteQuery.update).toHaveBeenCalledWith({ status: 'inativo' })
    expect(adminClient.from).toHaveBeenCalledTimes(3)
  })

  it('cria lead e propaga erros dos comandos de escrita', async () => {
    const leadQuery = makeQuery({ error: null })
    const createError = new Error('insert falhou')
    const updateError = new Error('update falhou')
    const deleteError = new Error('delete falhou')
    const createQuery = makeQuery({ data: null, error: createError })
    const updateQuery = makeQuery({ data: null, error: updateError })
    const deleteQuery = makeQuery({ error: deleteError })
    const { createLead, createImovel, updateImovel, deleteImovel, adminClient } = await loadSupabase(
      [],
      [leadQuery, createQuery, updateQuery, deleteQuery],
    )

    await expect(createLead({ nome: 'Maria' })).resolves.toEqual({ ok: true })
    expect(leadQuery.insert).toHaveBeenCalledWith({ nome: 'Maria' })
    expect(adminClient.from).toHaveBeenCalledWith('leads')
    await expect(createImovel({ titulo: 'Falha' })).rejects.toBe(createError)
    await expect(updateImovel('id', { preco: 1 })).rejects.toBe(updateError)
    await expect(deleteImovel('id')).rejects.toBe(deleteError)
  })

  it('combina similares reais sem duplicatas e limita o resultado', async () => {
    const similarA = { ...imovel, id: 'similar-a' }
    const similarB = { ...imovel, id: 'similar-b' }
    const bairroExato = makeQuery({ data: [similarA], error: null })
    const bairroAmplo = makeQuery({ data: [similarA, similarB], error: null })
    const cidade = makeQuery({ data: [similarB], error: null })
    const { getImovelSimilares } = await loadSupabase([bairroExato, bairroAmplo, cidade])

    const result = await getImovelSimilares(imovel)

    expect(result.map(item => item.id)).toEqual(['similar-a', 'similar-b'])
    expect(bairroExato.eq).toHaveBeenCalledWith('quartos', 2)
    expect(bairroAmplo.eq).toHaveBeenCalledWith('bairro', 'Pinheiros')
    expect(cidade.eq).toHaveBeenCalledWith('cidade', 'Sao Paulo')
  })

  it('falha cedo quando variaveis de ambiente obrigatorias nao existem', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    const { getImoveis } = await loadSupabase()

    await expect(getImoveis()).rejects.toThrow(/NEXT_PUBLIC_SUPABASE_URL/)
  })
})
