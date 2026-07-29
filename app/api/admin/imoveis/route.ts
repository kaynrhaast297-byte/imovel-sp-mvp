import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { internalServerError, invalidRequest } from '@/lib/api-response'
import { getAdminImoveis } from '@/lib/supabase'
import { adminImoveisQuerySchema } from '@/lib/validation'

const noStore = { 'Cache-Control': 'no-store' }

export async function GET(req: NextRequest) {
  const unauthorized = requireAdmin(req)
  if (unauthorized) return unauthorized

  const params = Object.fromEntries(new URL(req.url).searchParams)
  const parsed = adminImoveisQuerySchema.safeParse(params)
  if (!parsed.success) return invalidRequest('Parametros de busca invalidos.')

  try {
    const result = await getAdminImoveis(parsed.data)
    return NextResponse.json(result, { headers: noStore })
  } catch (error) {
    return internalServerError('Erro ao buscar imoveis.', error)
  }
}
