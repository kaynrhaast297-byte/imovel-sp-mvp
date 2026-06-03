import { timingSafeEqual } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'

function getExpectedToken() {
  return process.env.IMOVEL_ADMIN_TOKEN?.trim() ?? ''
}

function getRequestToken(req: NextRequest) {
  const auth = req.headers.get('authorization') ?? ''
  if (auth.toLowerCase().startsWith('bearer ')) return auth.slice(7).trim()
  return req.headers.get('x-admin-token')?.trim() ?? ''
}

function safeEqual(leftValue: string, rightValue: string) {
  const left = Buffer.from(leftValue)
  const right = Buffer.from(rightValue)
  return left.length === right.length && timingSafeEqual(left, right)
}

export function requireAdmin(req: NextRequest) {
  const expected = getExpectedToken()
  if (!expected) {
    return NextResponse.json(
      { error: 'Admin nao configurado. Defina IMOVEL_ADMIN_TOKEN.' },
      { status: 503 },
    )
  }

  const received = getRequestToken(req)
  if (!received || !safeEqual(received, expected)) {
    return NextResponse.json({ error: 'Admin nao autorizado.' }, { status: 401 })
  }

  return null
}
