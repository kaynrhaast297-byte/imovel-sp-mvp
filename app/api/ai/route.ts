import { NextRequest, NextResponse } from 'next/server'

function getOllamaConfig() {
  return {
    url: process.env.OLLAMA_URL?.trim() || 'http://localhost:11434',
    model: process.env.OLLAMA_MODEL?.trim() || 'qwen2.5-coder:7b',
  }
}

function isConnectionError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error)
  return message.includes('ECONNREFUSED') || message.includes('fetch failed') || message.includes('Ollama offline')
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : ''
    const stream = body.stream === true

    if (!prompt) {
      return NextResponse.json(
        { error: 'Campo "prompt" e obrigatorio e deve ser uma string.' },
        { status: 400 },
      )
    }

    const { url, model } = getOllamaConfig()
    const ollamaRes = await fetch(`${url}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, prompt, stream }),
    })

    if (!ollamaRes.ok) {
      const text = await ollamaRes.text()
      return NextResponse.json(
        { error: `Ollama retornou erro: ${text}` },
        { status: ollamaRes.status },
      )
    }

    const data = await ollamaRes.json()

    return NextResponse.json({
      response: data.response,
      model: data.model,
      done: data.done,
    })
  } catch (error) {
    if (isConnectionError(error)) {
      return NextResponse.json(
        { error: 'Ollama nao esta rodando. Inicie com: ollama serve' },
        { status: 503 },
      )
    }

    const message = error instanceof Error ? error.message : 'Erro desconhecido'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function GET() {
  try {
    const { url } = getOllamaConfig()
    const res = await fetch(`${url}/api/tags`)
    if (!res.ok) throw new Error('Ollama offline')

    const data = await res.json()
    return NextResponse.json({ status: 'online', models: data.models ?? [] })
  } catch {
    return NextResponse.json({ status: 'offline' }, { status: 503 })
  }
}
