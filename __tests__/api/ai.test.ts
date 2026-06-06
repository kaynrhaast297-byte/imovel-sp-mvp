import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

const { GET, POST } = await import('@/app/api/ai/route')

function makeRequest(body: unknown) {
  return new NextRequest('http://localhost/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/ai', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('retorna 400 se prompt estiver ausente', async () => {
    const res = await POST(makeRequest({}))
    const json = await res.json()

    expect(res.status).toBe(400)
    expect(json.error).toMatch(/prompt/i)
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('retorna 400 se prompt nao for string', async () => {
    const res = await POST(makeRequest({ prompt: 123 }))

    expect(res.status).toBe(400)
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('retorna resposta do Ollama com sucesso', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        response: 'Ola! Sou uma IA.',
        model: 'qwen2.5-coder:7b',
        done: true,
      }),
    })

    const res = await POST(makeRequest({ prompt: 'Ola' }))
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.response).toBe('Ola! Sou uma IA.')
    expect(json.model).toBe('qwen2.5-coder:7b')
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:11434/api/generate',
      expect.objectContaining({ method: 'POST' }),
    )
  })

  it('retorna erro do Ollama preservando status', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      text: async () => 'modelo nao encontrado',
    })

    const res = await POST(makeRequest({ prompt: 'teste' }))
    const json = await res.json()

    expect(res.status).toBe(404)
    expect(json.error).toMatch(/modelo nao encontrado/i)
  })

  it('retorna 503 quando Ollama esta offline', async () => {
    mockFetch.mockRejectedValueOnce(new Error('fetch failed: ECONNREFUSED'))

    const res = await POST(makeRequest({ prompt: 'teste' }))
    const json = await res.json()

    expect(res.status).toBe(503)
    expect(json.error).toMatch(/ollama/i)
  })
})

describe('GET /api/ai', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('retorna status online com lista de modelos', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ models: [{ name: 'qwen2.5-coder:7b' }] }),
    })

    const res = await GET()
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.status).toBe('online')
    expect(json.models).toHaveLength(1)
  })

  it('retorna 503 quando Ollama esta offline', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Ollama offline'))

    const res = await GET()
    const json = await res.json()

    expect(res.status).toBe(503)
    expect(json.status).toBe('offline')
  })
})
