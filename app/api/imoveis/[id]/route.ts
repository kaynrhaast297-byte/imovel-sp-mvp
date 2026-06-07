import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { internalServerError, invalidRequest } from '@/lib/api-response'
import { deleteImovel, getImovelById, updateImovel } from '@/lib/supabase'
import { imovelUpdateSchema } from '@/lib/validation'

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
    const parsed = imovelUpdateSchema.safeParse(await req.json().catch(() => null))
    if (!parsed.success) return invalidRequest('Dados do imovel invalidos.')

    const imovel = await updateImovel(id, parsed.data)
    return NextResponse.json({ imovel })
  } catch (err) {
    return internalServerError('Erro ao atualizar', err)
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
    return internalServerError('Erro ao deletar', err)
  }
}
