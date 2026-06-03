import { NextRequest, NextResponse } from 'next/server'
import { getImoveis, createImovel } from '@/lib/supabase'
import { requireAdmin } from '@/lib/admin-auth'

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

    const imoveis = await getImoveis(filtros)
    return NextResponse.json({ imoveis })
  } catch (err) {
    return NextResponse.json({ error: 'Erro ao buscar imóveis', detail: String(err) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const unauthorized = requireAdmin(req)
  if (unauthorized) return unauthorized

  try {
    const body = await req.json()
    const imovel = await createImovel({
      ...body,
      status: 'ativo',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    return NextResponse.json({ imovel }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: 'Erro ao criar imóvel', detail: String(err) }, { status: 500 })
  }
}
