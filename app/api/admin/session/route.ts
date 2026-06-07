import { NextRequest, NextResponse } from 'next/server'
import {
  clearAdminSessionCookie,
  isAdminTokenValid,
  requireAdmin,
  setAdminSessionCookie,
} from '@/lib/admin-auth'
import { invalidRequest } from '@/lib/api-response'
import {
  checkRateLimit,
  getAdminLoginRateLimitOptions,
  getClientIp,
} from '@/lib/rate-limit'
import { adminSessionSchema } from '@/lib/validation'

const noStore = { 'Cache-Control': 'no-store' }

export async function GET(req: NextRequest) {
  const unauthorized = requireAdmin(req)
  if (unauthorized) return NextResponse.json({ authenticated: false }, { headers: noStore })
  return NextResponse.json({ authenticated: true }, { headers: noStore })
}

export async function POST(req: NextRequest) {
  const limit = checkRateLimit(getClientIp(req), getAdminLoginRateLimitOptions())
  if (!limit.allowed) {
    const retryAfter = Math.max(Math.ceil((limit.resetAt - Date.now()) / 1000), 1)
    return NextResponse.json(
      { error: 'Muitas tentativas de acesso. Aguarde e tente novamente.' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } },
    )
  }

  const parsed = adminSessionSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return invalidRequest('Token de admin invalido.')

  if (!isAdminTokenValid(parsed.data.token)) {
    return NextResponse.json({ error: 'Admin nao autorizado.' }, { status: 401 })
  }

  const response = NextResponse.json({ authenticated: true }, { headers: noStore })
  setAdminSessionCookie(response)
  return response
}

export async function DELETE() {
  const response = NextResponse.json({ authenticated: false }, { headers: noStore })
  clearAdminSessionCookie(response)
  return response
}
