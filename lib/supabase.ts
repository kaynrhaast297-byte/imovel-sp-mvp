import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// â”€â”€ ImÃ³veis â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export async function getImoveis(filtros?: Record<string, unknown>) {
  let query = supabase
    .from('imoveis')
    .select('*')
    .eq('status', 'ativo')
    .order('created_at', { ascending: false })

  if (filtros?.tipo) query = query.eq('tipo', filtros.tipo)
  if (filtros?.negocio) query = query.eq('negocio', filtros.negocio)
  if (filtros?.bairro) query = query.ilike('bairro', `%${filtros.bairro}%`)
  if (filtros?.cidade) query = query.ilike('cidade', `%${filtros.cidade}%`)
  if (filtros?.preco_min) query = query.gte('preco', filtros.preco_min)
  if (filtros?.preco_max) query = query.lte('preco', filtros.preco_max)
  if (filtros?.quartos_min) query = query.gte('quartos', filtros.quartos_min)

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function getImovelById(id: string) {
  const { data, error } = await supabase
    .from('imoveis')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function createImovel(imovel: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('imoveis')
    .insert(imovel)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateImovel(id: string, imovel: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('imoveis')
    .update({ ...imovel, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteImovel(id: string) {
  const { error } = await supabase
    .from('imoveis')
    .update({ status: 'inativo' })
    .eq('id', id)
  if (error) throw error
}

// â”€â”€ AnÃ¡lise de preÃ§o â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export async function getImovelSimilares(
  bairro: string,
  tipo: string,
  quartos: number | null,
  area_m2: number,
  excludeId: string
) {
  let query = supabase
    .from('imoveis')
    .select('id, titulo, preco, area_m2, quartos, bairro, portal_origem, url_original')
    .eq('bairro', bairro)
    .eq('tipo', tipo)
    .eq('status', 'ativo')
    .neq('id', excludeId)
    .gte('area_m2', area_m2 * 0.7)
    .lte('area_m2', area_m2 * 1.3)

  if (quartos) query = query.eq('quartos', quartos)

  const { data, error } = await query.limit(10)
  if (error) throw error
  return data ?? []
}
