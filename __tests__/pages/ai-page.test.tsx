import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AIPage from '@/app/ai/page'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

describe('pagina /ai', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renderiza o formulario corretamente', () => {
    render(<AIPage />)

    expect(screen.getByPlaceholderText(/prompt/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /enviar/i })).toBeInTheDocument()
  })

  it('mantem o botao desabilitado com prompt vazio', () => {
    render(<AIPage />)

    expect(screen.getByRole('button', { name: /enviar/i })).toBeDisabled()
  })

  it('habilita o botao ao digitar prompt', () => {
    render(<AIPage />)

    fireEvent.change(screen.getByPlaceholderText(/prompt/i), {
      target: { value: 'Ola IA' },
    })

    expect(screen.getByRole('button', { name: /enviar/i })).not.toBeDisabled()
  })

  it('exibe resposta da IA apos envio', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ response: 'Resposta da IA aqui', model: 'qwen2.5-coder:7b' }),
    })

    render(<AIPage />)
    fireEvent.change(screen.getByPlaceholderText(/prompt/i), {
      target: { value: 'teste' },
    })
    fireEvent.click(screen.getByRole('button', { name: /enviar/i }))

    await waitFor(() => {
      expect(screen.getByText('Resposta da IA aqui')).toBeInTheDocument()
    })
    expect(screen.getByText(/modelo: qwen2.5-coder:7b/i)).toBeInTheDocument()
  })

  it('exibe erro quando API falha', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Ollama nao esta rodando.' }),
    })

    render(<AIPage />)
    fireEvent.change(screen.getByPlaceholderText(/prompt/i), {
      target: { value: 'teste' },
    })
    fireEvent.click(screen.getByRole('button', { name: /enviar/i }))

    await waitFor(() => {
      expect(screen.getByText(/ollama nao esta rodando/i)).toBeInTheDocument()
    })
  })
})
