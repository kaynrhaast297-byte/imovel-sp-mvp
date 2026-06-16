import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { internalServerError } from '@/lib/api-response'
import { getLeads } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const unauthorized = requireAdmin(req)
  if (unauthorized) return unauthorized

  try {
    const { searchParams } = new URL(req.url)
    const pagina = Math.max(Number(searchParams.get('pagina') ?? '1'), 1)
    const resultado = await getLeads(pagina)
    return NextResponse.json(resultado)
  } catch (err) {
    return internalServerError('Erro ao buscar leads.', err)
  }
}