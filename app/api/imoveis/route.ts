import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { internalServerError, invalidRequest } from '@/lib/api-response'
import { createImovel, getImoveis } from '@/lib/supabase'
import { imovelCreateSchema } from '@/lib/validation'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const filtros: Record<string, unknown> = {}

    if (searchParams.get('tipo')) filtros.tipo = searchParams.get('tipo')
    if (searchParams.get('negocio')) filtros.negocio = searchParams.get('negocio')
    if (searchParams.get('bairro')) filtros.bairro = searchParams.get('bairro')
    if (searchParams.get('cidade')) filtros.cidade = searchParams.get('cidade')
    if (searchParams.get('preco_min')) filtros.preco_min = Number(searchParams.get('preco_min'))
    if (searchParams.get('preco_max')) filtros.preco_max = Number(searchParams.get('preco_max'))
    if (searchParams.get('quartos')) filtros.quartos_min = Number(searchParams.get('quartos'))
    if (searchParams.get('ordenacao')) filtros.ordenacao = searchParams.get('ordenacao')
    if (searchParams.get('page')) filtros.page = Number(searchParams.get('page'))
    if (searchParams.get('per_page')) filtros.per_page = Number(searchParams.get('per_page'))

    const result = await getImoveis(filtros)
    return NextResponse.json(result)
  } catch (err) {
    return internalServerError('Erro ao buscar imoveis', err)
  }
}

export async function POST(req: NextRequest) {
  const unauthorized = requireAdmin(req)
  if (unauthorized) return unauthorized

  try {
    const parsed = imovelCreateSchema.safeParse(await req.json().catch(() => null))
    if (!parsed.success) return invalidRequest('Dados do imovel invalidos.')

    const imovel = await createImovel({
      ...parsed.data,
      status: 'ativo',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    return NextResponse.json({ imovel }, { status: 201 })
  } catch (err) {
    return internalServerError('Erro ao criar imovel', err)
  }
}
