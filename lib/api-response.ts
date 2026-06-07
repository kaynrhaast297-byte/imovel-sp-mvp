import { NextResponse } from 'next/server'

export function internalServerError(message: string, error: unknown) {
  console.error(`[api] ${message}`, error)
  return NextResponse.json({ error: message }, { status: 500 })
}

export function invalidRequest(message = 'Dados invalidos.') {
  return NextResponse.json({ error: message }, { status: 400 })
}
