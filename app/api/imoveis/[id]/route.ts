import { NextRequest, NextResponse } from 'next/server'
import { getImovelById, updateImovel, deleteImovel } from '@/lib/supabase'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const imovel = await getImovelById(params.id)
    return NextResponse.json({ imovel })
  } catch {
    return NextResponse.json({ error: 'Imóvel não encontrado' }, { status: 404 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const unauthorized = requireAdmin(req)
  if (unauthorized) return unauthorized

  try {
    const body = await req.json()
    const imovel = await updateImovel(params.id, body)
    return NextResponse.json({ imovel })
  } catch (err) {
    return NextResponse.json({ error: 'Erro ao atualizar', detail: String(err) }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const unauthorized = requireAdmin(_)
  if (unauthorized) return unauthorized

  try {
    await deleteImovel(params.id)
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: 'Erro ao deletar', detail: String(err) }, { status: 500 })
  }
}
