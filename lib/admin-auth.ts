import { createHmac, timingSafeEqual } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'

export const ADMIN_SESSION_COOKIE = 'imovel_admin_session'
export const ADMIN_SESSION_MAX_AGE = 8 * 60 * 60
const ADMIN_SESSION_PAYLOAD = 'imovel-admin-session-v1'

function getExpectedToken() {
  return process.env.IMOVEL_ADMIN_TOKEN?.trim() ?? ''
}

function safeEqual(leftValue: string, rightValue: string) {
  const left = Buffer.from(leftValue)
  const right = Buffer.from(rightValue)
  return left.length === right.length && timingSafeEqual(left, right)
}

export function isAdminTokenValid(token: string) {
  const expected = getExpectedToken()
  return Boolean(expected && token && safeEqual(token.trim(), expected))
}

function signAdminSession(expiresAt: number) {
  const expected = getExpectedToken()
  if (!expected) return ''
  return createHmac('sha256', expected)
    .update(`${ADMIN_SESSION_PAYLOAD}.${expiresAt}`)
    .digest('hex')
}

export function createAdminSessionValue(now = Date.now()) {
  const expiresAt = now + ADMIN_SESSION_MAX_AGE * 1000
  const signature = signAdminSession(expiresAt)
  return signature ? `${expiresAt}.${signature}` : ''
}

function hasValidSession(req: NextRequest) {
  const received = req.cookies.get(ADMIN_SESSION_COOKIE)?.value ?? ''
  const [rawExpiresAt, signature] = received.split('.', 2)
  const expiresAt = Number(rawExpiresAt)
  const expected = signAdminSession(expiresAt)
  return Boolean(
    signature
    && Number.isFinite(expiresAt)
    && expiresAt > Date.now()
    && expected
    && safeEqual(signature, expected),
  )
}

export function setAdminSessionCookie(response: NextResponse) {
  response.cookies.set(ADMIN_SESSION_COOKIE, createAdminSessionValue(), {
    httpOnly: true,
    maxAge: ADMIN_SESSION_MAX_AGE,
    path: '/',
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  })
}

export function clearAdminSessionCookie(response: NextResponse) {
  response.cookies.set(ADMIN_SESSION_COOKIE, '', {
    httpOnly: true,
    maxAge: 0,
    path: '/',
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  })
}

export function requireAdmin(req: NextRequest) {
  const expected = getExpectedToken()
  if (!expected) {
    return NextResponse.json(
      { error: 'Admin nao configurado. Defina IMOVEL_ADMIN_TOKEN.' },
      { status: 503 },
    )
  }

  if (!hasValidSession(req)) {
    return NextResponse.json({ error: 'Admin nao autorizado.' }, { status: 401 })
  }

  return null
}
