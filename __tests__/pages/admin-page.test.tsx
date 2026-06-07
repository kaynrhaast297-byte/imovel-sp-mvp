import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AdminPage from '@/app/admin/page'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

function response(ok: boolean, body: unknown = {}) {
  return { ok, json: async () => body }
}

describe('AdminPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('autentica por sessao HttpOnly e nao reenvia token ao criar imovel', async () => {
    const user = userEvent.setup()
    mockFetch
      .mockResolvedValueOnce(response(true, { authenticated: false }))
      .mockResolvedValueOnce(response(true, { authenticated: true }))
      .mockResolvedValueOnce(response(true, { imovel: { id: 'imovel-1' } }))

    render(<AdminPage />)

    await user.type(await screen.findByLabelText(/token de admin/i), 'segredo')
    await user.click(screen.getByRole('button', { name: /entrar/i }))

    await user.type(await screen.findByLabelText(/^titulo/i), 'Apartamento seguro')
    await user.selectOptions(screen.getByLabelText(/^tipo/i), 'apartamento')
    await user.selectOptions(screen.getByLabelText(/^negocio/i), 'venda')
    await user.type(screen.getByLabelText(/^preco/i), '900000')
    await user.type(screen.getByLabelText(/^area/i), '90')
    await user.type(screen.getByLabelText(/^bairro/i), 'Pinheiros')
    await user.click(screen.getByRole('button', { name: /salvar imovel/i }))

    await waitFor(() => expect(screen.getByText(/cadastrado com sucesso/i)).toBeVisible())

    expect(mockFetch).toHaveBeenNthCalledWith(2, '/api/admin/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: 'segredo' }),
    })
    expect(mockFetch).toHaveBeenNthCalledWith(3, '/api/imoveis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: expect.any(String),
    })
    expect(JSON.stringify(mockFetch.mock.calls[2])).not.toContain('segredo')
  })

  it('reaproveita sessao existente e permite logout', async () => {
    const user = userEvent.setup()
    mockFetch
      .mockResolvedValueOnce(response(true, { authenticated: true }))
      .mockRejectedValueOnce(new Error('logout offline'))

    render(<AdminPage />)

    await user.click(await screen.findByRole('button', { name: /sair/i }))

    expect(mockFetch).toHaveBeenNthCalledWith(2, '/api/admin/session', { method: 'DELETE' })
    expect(await screen.findByLabelText(/token de admin/i)).toBeVisible()
  })

  it('valida token vazio e informa falha de autenticacao', async () => {
    const user = userEvent.setup()
    mockFetch
      .mockResolvedValueOnce(response(true, { authenticated: false }))
      .mockResolvedValueOnce(response(false))

    render(<AdminPage />)

    await user.click(await screen.findByRole('button', { name: /entrar/i }))
    expect(screen.getByText(/informe o token de admin/i)).toBeVisible()

    await user.type(screen.getByLabelText(/token de admin/i), 'incorreto')
    await user.click(screen.getByRole('button', { name: /entrar/i }))
    expect(await screen.findByText(/token de admin invalido/i)).toBeVisible()
  })

  it('trata falha ao verificar sessao', async () => {
    mockFetch.mockRejectedValueOnce(new Error('offline'))

    render(<AdminPage />)

    expect(await screen.findByLabelText(/token de admin/i)).toBeVisible()
  })

  it('valida obrigatorios, limpa campos e mostra erro seguro da API', async () => {
    const user = userEvent.setup()
    mockFetch
      .mockResolvedValueOnce(response(true, { authenticated: true }))
      .mockResolvedValueOnce(response(false, { error: 'Dados do imovel invalidos.' }))

    render(<AdminPage />)

    await user.click(await screen.findByRole('button', { name: /salvar imovel/i }))
    expect(screen.getByText(/campo obrigatorio: titulo/i)).toBeVisible()

    await user.type(screen.getByLabelText(/^titulo/i), 'Apartamento seguro')
    await user.selectOptions(screen.getByLabelText(/^tipo/i), 'apartamento')
    await user.selectOptions(screen.getByLabelText(/^negocio/i), 'venda')
    await user.type(screen.getByLabelText(/^preco/i), '900000')
    await user.type(screen.getByLabelText(/^area/i), '90')
    await user.type(screen.getByLabelText(/^bairro/i), 'Pinheiros')
    await user.type(screen.getByLabelText(/^descricao/i), 'Descricao completa')
    await user.click(screen.getByRole('button', { name: /salvar imovel/i }))

    expect(await screen.findByText('Dados do imovel invalidos.')).toBeVisible()

    await user.click(screen.getByRole('button', { name: /limpar/i }))
    expect(screen.getByLabelText(/^titulo/i)).toHaveValue('')
    expect(screen.queryByText('Dados do imovel invalidos.')).not.toBeInTheDocument()
  })
})
