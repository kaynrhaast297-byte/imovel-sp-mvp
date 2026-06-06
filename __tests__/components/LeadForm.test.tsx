import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import LeadForm from '@/components/LeadForm'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

function renderLeadForm() {
  return render(<LeadForm imovelId="550e8400-e29b-41d4-a716-446655440000" imovelTitulo="Apartamento teste" />)
}

describe('LeadForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renderiza os campos e a mensagem inicial do imovel', () => {
    renderLeadForm()

    expect(screen.getByText('Quero saber mais')).toBeInTheDocument()
    expect(screen.getByText('Nome', { exact: true })).toBeVisible()
    expect(screen.getByText('Telefone', { exact: true })).toBeVisible()
    expect(screen.getByText('Email', { exact: true })).toBeVisible()
    expect(screen.getByText('Mensagem', { exact: true })).toBeVisible()
    expect(screen.getByLabelText(/nome/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/telefone/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/mensagem/i)).toHaveValue('Tenho interesse no imovel: Apartamento teste')
  })

  it('valida campos obrigatorios antes de enviar', async () => {
    const user = userEvent.setup()
    renderLeadForm()

    await user.click(screen.getByRole('button', { name: /enviar contato/i }))

    expect(await screen.findByText('Informe seu nome.')).toBeInTheDocument()
    expect(screen.getByText('Informe um telefone valido.')).toBeInTheDocument()
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('envia lead valido e mostra feedback de sucesso', async () => {
    const user = userEvent.setup()
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true }),
    })

    renderLeadForm()

    await user.type(screen.getByLabelText(/nome/i), 'Maria Silva')
    await user.type(screen.getByLabelText(/telefone/i), '11999999999')
    await user.type(screen.getByLabelText(/email/i), 'maria@example.com')
    await user.click(screen.getByRole('button', { name: /enviar contato/i }))

    await waitFor(() => {
      expect(screen.getByText(/contato enviado/i)).toBeInTheDocument()
    })

    expect(mockFetch).toHaveBeenCalledWith('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: expect.any(String),
    })

    const body = JSON.parse(mockFetch.mock.calls[0][1].body)
    expect(body).toEqual({
      nome: 'Maria Silva',
      telefone: '11999999999',
      email: 'maria@example.com',
      mensagem: 'Tenho interesse no imovel: Apartamento teste',
      imovel_id: '550e8400-e29b-41d4-a716-446655440000',
      origem: 'pagina_imovel',
    })
  })

  it('desabilita o botao e mostra Enviando durante a requisicao', async () => {
    const user = userEvent.setup()
    let resolveRequest: (value: unknown) => void = () => {}
    mockFetch.mockImplementationOnce(() => new Promise((resolve) => {
      resolveRequest = resolve
    }))

    renderLeadForm()

    await user.type(screen.getByLabelText(/nome/i), 'Maria Silva')
    await user.type(screen.getByLabelText(/telefone/i), '11999999999')
    await user.click(screen.getByRole('button', { name: /enviar contato/i }))

    expect(screen.getByRole('button', { name: /enviando/i })).toBeDisabled()
    expect(screen.getByRole('form')).toHaveAttribute('aria-busy', 'true')

    resolveRequest({
      ok: true,
      json: async () => ({ ok: true }),
    })

    expect(await screen.findByText(/contato enviado/i)).toBeInTheDocument()
  })

  it('mostra erro retornado pela API', async () => {
    const user = userEvent.setup()
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Dados de contato invalidos.' }),
    })

    renderLeadForm()

    await user.type(screen.getByLabelText(/nome/i), 'Maria Silva')
    await user.type(screen.getByLabelText(/telefone/i), '11999999999')
    await user.click(screen.getByRole('button', { name: /enviar contato/i }))

    expect(await screen.findByText('Dados de contato invalidos.')).toBeInTheDocument()
  })
})
