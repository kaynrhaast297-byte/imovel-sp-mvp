import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { invalidRequest } from '@/lib/api-response'
import { resolveAddressByCep } from '@/lib/geocoding'
import { geocodeRequestSchema } from '@/lib/validation'

export async function POST(req: NextRequest) {
  const unauthorized = requireAdmin(req)
  if (unauthorized) return unauthorized

  const parsed = geocodeRequestSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return invalidRequest('Informe um CEP valido.')

  try {
    const endereco = await resolveAddressByCep(parsed.data.cep, parsed.data.numero)
    return NextResponse.json({ endereco })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Nao foi possivel consultar o endereco.' },
      { status: 502 },
    )
  }
}
