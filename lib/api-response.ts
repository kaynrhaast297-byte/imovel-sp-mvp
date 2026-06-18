import { NextResponse } from 'next/server'
import { RuntimeEnvError } from './runtime-env'

export function internalServerError(message: string, error: unknown) {
  if (error instanceof RuntimeEnvError) {
    console.error(`[api] ${message}`, error.message)
    return NextResponse.json({ error: error.message }, { status: 503 })
  }

  console.error(`[api] ${message}`, error)
  return NextResponse.json({ error: message }, { status: 500 })
}

export function invalidRequest(message = 'Dados invalidos.') {
  return NextResponse.json({ error: message }, { status: 400 })
}
