import { NextRequest, NextResponse } from 'next/server'

const MAX_PROMPT_LENGTH = 8000
const DEFAULT_OLLAMA_TIMEOUT_MS = 30000

function getOllamaConfig() {
  return {
    url: process.env.OLLAMA_URL?.trim() || 'http://localhost:11434',
    model: process.env.OLLAMA_MODEL?.trim() || 'qwen2.5-coder:7b',
    timeoutMs: getTimeoutMs(),
  }
}

function isConnectionError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error)
  return message.includes('ECONNREFUSED') || message.includes('fetch failed') || message.includes('Ollama offline')
}

function isAbortError(error: unknown) {
  return error instanceof Error && error.name === 'AbortError'
}

function getTimeoutMs() {
  const rawTimeout = Number.parseInt(process.env.OLLAMA_TIMEOUT_MS ?? '', 10)
  if (!Number.isFinite(rawTimeout) || rawTimeout <= 0) return DEFAULT_OLLAMA_TIMEOUT_MS
  return Math.min(rawTimeout, 120000)
}

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    return await fetch(url, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(timeout)
  }
}

async function readJson(req: NextRequest) {
  try {
    return await req.json()
  } catch {
    return null
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await readJson(req)
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'JSON invalido.' },
        { status: 400 },
      )
    }

    const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : ''

    if (!prompt) {
      return NextResponse.json(
        { error: 'Campo "prompt" e obrigatorio e deve ser uma string.' },
        { status: 400 },
      )
    }

    if (prompt.length > MAX_PROMPT_LENGTH) {
      return NextResponse.json(
        { error: `Prompt deve ter no maximo ${MAX_PROMPT_LENGTH} caracteres.` },
        { status: 413 },
      )
    }

    if (body.stream === true) {
      return NextResponse.json(
        { error: 'Esta rota nao suporta resposta em stream.' },
        { status: 400 },
      )
    }

    const { url, model, timeoutMs } = getOllamaConfig()
    const ollamaRes = await fetchWithTimeout(`${url}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, prompt, stream: false }),
    }, timeoutMs)

    if (!ollamaRes.ok) {
      return NextResponse.json(
        { error: 'Nao foi possivel obter resposta da IA local.' },
        { status: 502 },
      )
    }

    const data = await ollamaRes.json()

    return NextResponse.json({
      response: data.response,
      model: data.model,
      done: data.done,
    })
  } catch (error) {
    if (isAbortError(error)) {
      return NextResponse.json(
        { error: 'A IA local demorou demais para responder.' },
        { status: 504 },
      )
    }

    if (isConnectionError(error)) {
      return NextResponse.json(
        { error: 'Ollama nao esta rodando. Inicie com: ollama serve' },
        { status: 503 },
      )
    }

    return NextResponse.json(
      { error: 'Erro interno ao processar a resposta da IA.' },
      { status: 500 },
    )
  }
}

export async function GET() {
  try {
    const { url, timeoutMs } = getOllamaConfig()
    const res = await fetchWithTimeout(`${url}/api/tags`, {}, timeoutMs)
    if (!res.ok) throw new Error('Ollama offline')

    const data = await res.json()
    return NextResponse.json({ status: 'online', models: data.models ?? [] })
  } catch {
    return NextResponse.json({ status: 'offline' }, { status: 503 })
  }
}
