import { NextRequest, NextResponse } from 'next/server'
import { internalServerError } from '@/lib/api-response'
import { getImovelById, getImovelSimilares } from '@/lib/supabase'
import { calcularAnalise } from '@/lib/utils'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id obrigatorio' }, { status: 400 })

    const imovel = await getImovelById(id)
    const similares = await getImovelSimilares(imovel)
    const analise = calcularAnalise(imovel, similares)
    return NextResponse.json({ analise })
  } catch (err) {
    return internalServerError('Erro na analise', err)
  }
}
