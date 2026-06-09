import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { e2eImovel, e2eImoveisSimilares } from './e2e-fixtures'
import {
  createPropertyImagePath,
  PROPERTY_IMAGES_BUCKET,
  type PropertyImageFile,
} from './property-images'
import type { Imovel, ImovelSimilar } from './types'

let publicClient: SupabaseClient | null = null
let adminClient: SupabaseClient | null = null

function requireEnv(name: string) {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`Configure ${name} nas variaveis de ambiente.`)
  return value
}

function getPublicClient() {
  if (!publicClient) {
    publicClient = createClient(
      requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
      requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    )
  }
  return publicClient
}

function getAdminClient() {
  if (!adminClient) {
    const serverKey = process.env.SUPABASE_SECRET_KEY?.trim()
      || process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()

    if (!serverKey) {
      throw new Error('Configure SUPABASE_SECRET_KEY ou SUPABASE_SERVICE_ROLE_KEY para operacoes administrativas.')
    }

    adminClient = createClient(requireEnv('NEXT_PUBLIC_SUPABASE_URL'), serverKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  }
  return adminClient
}

function asText(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function asNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function asPositiveInteger(value: unknown, fallback: number, max: number) {
  const numberValue = typeof value === 'number' ? value : Number(value)
  if (!Number.isInteger(numberValue) || numberValue < 1) return fallback
  return Math.min(numberValue, max)
}

function sanitizeSearchTerm(value: unknown) {
  return asText(value).replace(/[,%]/g, ' ').replace(/\s+/g, ' ').trim()
}

function isE2EMockEnabled() {
  return process.env.E2E_MOCKS === '1'
}

// Imoveis

export async function getImoveis(filtros?: Record<string, unknown>) {
  const supabase = getPublicClient()
  const page = asPositiveInteger(filtros?.page, 1, 10000)
  const perPage = asPositiveInteger(filtros?.per_page, 12, 48)
  const from = (page - 1) * perPage
  const to = from + perPage - 1

  let query = supabase
    .from('imoveis')
    .select('*', { count: 'exact' })
    .eq('status', 'ativo')

  const tipo = asText(filtros?.tipo)
  const negocio = asText(filtros?.negocio)
  const bairro = sanitizeSearchTerm(filtros?.bairro)
  const cidade = sanitizeSearchTerm(filtros?.cidade)
  const precoMin = asNumber(filtros?.preco_min)
  const precoMax = asNumber(filtros?.preco_max)
  const quartosMin = asNumber(filtros?.quartos_min)
  const ordenacao = asText(filtros?.ordenacao)

  if (tipo) query = query.eq('tipo', tipo)
  if (negocio) query = query.eq('negocio', negocio)
  if (bairro) query = query.or(`bairro.ilike.%${bairro}%,cidade.ilike.%${bairro}%`)
  if (cidade) query = query.ilike('cidade', `%${cidade}%`)
  if (precoMin !== null) query = query.gte('preco', precoMin)
  if (precoMax !== null) query = query.lte('preco', precoMax)
  if (quartosMin !== null) query = query.gte('quartos', quartosMin)

  if (ordenacao === 'preco_m2_asc') {
    query = query.order('preco_m2', { ascending: true, nullsFirst: false })
  } else if (ordenacao === 'preco_asc') {
    query = query.order('preco', { ascending: true })
  } else if (ordenacao === 'area_desc') {
    query = query.order('area_m2', { ascending: false })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  const { data, error, count } = await query.range(from, to)
  if (error) throw error

  const total = count ?? 0
  const totalPages = Math.max(Math.ceil(total / perPage), 1)

  return {
    imoveis: data ?? [],
    pagination: {
      page,
      per_page: perPage,
      total,
      total_pages: totalPages,
      has_next: page < totalPages,
      has_prev: page > 1,
    },
  }
}

export async function getImovelById(id: string) {
  if (isE2EMockEnabled() && id === e2eImovel.id) {
    return e2eImovel
  }

  const { data, error } = await getPublicClient()
    .from('imoveis')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function createImovel(imovel: Record<string, unknown>) {
  const { data, error } = await getAdminClient()
    .from('imoveis')
    .insert(imovel)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateImovel(id: string, imovel: Record<string, unknown>) {
  const { data, error } = await getAdminClient()
    .from('imoveis')
    .update({ ...imovel, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteImovel(id: string) {
  const { error } = await getAdminClient()
    .from('imoveis')
    .update({ status: 'inativo' })
    .eq('id', id)
  if (error) throw error
}

export async function uploadPropertyImages(files: PropertyImageFile[]) {
  const storage = getAdminClient().storage.from(PROPERTY_IMAGES_BUCKET)
  const uploaded: { path: string; url: string }[] = []

  try {
    for (const file of files) {
      const path = createPropertyImagePath(file)
      const { error } = await storage.upload(path, Buffer.from(await file.arrayBuffer()), {
        cacheControl: '31536000',
        contentType: file.type,
        upsert: false,
      })
      if (error) throw error

      const { data } = storage.getPublicUrl(path)
      uploaded.push({ path, url: data.publicUrl })
    }
  } catch (error) {
    if (uploaded.length > 0) {
      await storage.remove(uploaded.map(image => image.path)).catch(() => null)
    }
    throw error
  }

  return uploaded
}

export async function removePropertyImages(paths: string[]) {
  if (paths.length === 0) return
  const { error } = await getAdminClient().storage
    .from(PROPERTY_IMAGES_BUCKET)
    .remove(paths)
  if (error) throw error
}

// Leads

export async function createLead(lead: Record<string, unknown>) {
  const { error } = await getAdminClient()
    .from('leads')
    .insert(lead)
  if (error) throw error
  return { ok: true }
}

// Analise de preco

async function consultarSimilares(
  imovel: Imovel,
  escopo: 'bairro' | 'cidade',
  quartosExatos: boolean,
) {
  let query = getPublicClient()
    .from('imoveis')
    .select('id, titulo, preco, area_m2, quartos, bairro, cidade, tipo, negocio, portal_origem, url_original')
    .eq('tipo', imovel.tipo)
    .eq('negocio', imovel.negocio)
    .eq('status', 'ativo')
    .neq('id', imovel.id)
    .gte('area_m2', imovel.area_m2 * 0.7)
    .lte('area_m2', imovel.area_m2 * 1.3)
    .order('preco', { ascending: true })

  if (escopo === 'bairro') query = query.eq('bairro', imovel.bairro)
  if (escopo === 'cidade') query = query.eq('cidade', imovel.cidade)
  if (quartosExatos && imovel.quartos != null) query = query.eq('quartos', imovel.quartos)

  const { data, error } = await query.limit(16)
  if (error) throw error
  return data ?? []
}

export async function getImovelSimilares(imovel: Imovel): Promise<ImovelSimilar[]> {
  if (isE2EMockEnabled() && imovel.id === e2eImovel.id) {
    return e2eImoveisSimilares
  }

  const grupos = await Promise.all([
    consultarSimilares(imovel, 'bairro', true),
    consultarSimilares(imovel, 'bairro', false),
    consultarSimilares(imovel, 'cidade', false),
  ])

  const unicos = new Map<string, ImovelSimilar>()
  grupos.flat().forEach((similar) => {
    if (!unicos.has(similar.id)) unicos.set(similar.id, similar)
  })

  return Array.from(unicos.values()).slice(0, 16)
}
