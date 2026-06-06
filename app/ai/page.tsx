'use client'

import { useState } from 'react'

interface AIResponse {
  response?: string
  error?: string
  model?: string
}

export default function AIPage() {
  const [prompt, setPrompt] = useState('')
  const [result, setResult] = useState<AIResponse | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const cleanPrompt = prompt.trim()
    if (!cleanPrompt) return

    setLoading(true)
    setResult(null)

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: cleanPrompt }),
      })
      const data: AIResponse = await res.json()
      setResult(data)
    } catch {
      setResult({ error: 'Falha ao conectar com a API.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="ai-page">
      <section className="ai-panel">
        <div className="ai-header">
          <p className="home-eyebrow">IA local</p>
          <h1>Teste de IA Local com Ollama</h1>
          <p>
            Envie um prompt para a rota local do Next.js e receba a resposta do modelo configurado no Ollama.
          </p>
        </div>

        <form className="ai-form" onSubmit={handleSubmit}>
          <label htmlFor="ai-prompt">Prompt</label>
          <textarea
            id="ai-prompt"
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="Digite seu prompt aqui..."
            rows={5}
          />
          <button className="btn btn-primary" type="submit" disabled={loading || !prompt.trim()}>
            {loading ? 'Aguardando resposta...' : 'Enviar'}
          </button>
        </form>

        {result && (
          <section className={result.error ? 'ai-result ai-result-error' : 'ai-result'} aria-live="polite">
            {result.error ? (
              <p>{result.error}</p>
            ) : (
              <>
                {result.model && <span>Modelo: {result.model}</span>}
                <p>{result.response}</p>
              </>
            )}
          </section>
        )}
      </section>
    </div>
  )
}
