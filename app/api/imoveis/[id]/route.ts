import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { deleteImovel, getImovelById, updateImovel } from '@/lib/supabase'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const imovel = await getImovelById(id)
    return NextResponse.json({ imovel })
  } catch {
    return NextResponse.json({ error: 'Imovel nao encontrado' }, { status: 404 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = requireAdmin(req)
  if (unauthorized) return unauthorized

  try {
    const { id } = await params
    const body = await req.json()
    const imovel = await updateImovel(id, body)
    return NextResponse.json({ imovel })
  } catch (err) {
    return NextResponse.json({ error: 'Erro ao atualizar', detail: String(err) }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = requireAdmin(req)
  if (unauthorized) return unauthorized

  try {
    const { id } = await params
    await deleteImovel(id)
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: 'Erro ao deletar', detail: String(err) }, { status: 500 })
  }
}
