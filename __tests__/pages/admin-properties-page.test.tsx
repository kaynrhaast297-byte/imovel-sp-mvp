import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AdminPropertiesList from '@/components/admin/AdminPropertiesList'

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mocks.push }),
}))

const mockFetch = vi.fn()

function response(ok: boolean, body: unknown, status = ok ? 200 : 500) {
  return Promise.resolve({
    ok,
    status,
    json: () => Promise.resolve(body),
  })
}

const imovel = {
  id: 'imovel-1',
  titulo: 'Apartamento em Pinheiros',
  tipo: 'apartamento',
  negocio: 'venda',
  status: 'ativo',
  preco: 900000,
  bairro: 'Pinheiros',
  cidade: 'Sao Paulo',
  estado: 'SP',
  created_at: '2026-07-01T12:00:00.000Z',
  updated_at: '2026-07-20T12:00:00.000Z',
}

describe('AdminPropertiesList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('fetch', mockFetch)
  })

  it('lista imoveis, filtra pela URL, pagina e encerra a sessao', async () => {
    const user = userEvent.setup()
    mockFetch.mockImplementation((url: string, options?: RequestInit) => {
      if (url === '/api/admin/session' && !options?.method) {
        return response(true, { authenticated: true })
      }
      if (url === '/api/admin/session' && options?.method === 'DELETE') {
        return response(true, { authenticated: false })
      }
      return response(true, {
        imoveis: [imovel],
        pagination: {
          page: 2,
          per_page: 20,
          total: 41,
          total_pages: 3,
          has_next: true,
          has_prev: true,
        },
      })
    })

    render(<AdminPropertiesList page={2} q="Pinheiros" status="ativo" />)

    expect(await screen.findByText('Apartamento em Pinheiros')).toBeVisible()
    expect(screen.getByText(/900\.000/)).toBeVisible()
    expect(screen.getByText('Ativo')).toBeVisible()
    expect(screen.getByRole('link', { name: 'Ver Apartamento em Pinheiros no site' }))
      .toHaveAttribute('href', '/imovel/imovel-1')
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/admin/imoveis?page=2&per_page=20&status=ativo&q=Pinheiros',
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    )

    await user.clear(screen.getByPlaceholderText('Titulo, bairro ou cidade'))
    await user.type(screen.getByPlaceholderText('Titulo, bairro ou cidade'), 'Guarulhos')
    await user.selectOptions(screen.getByLabelText('Status'), 'inativo')
    await user.click(screen.getByRole('button', { name: 'Aplicar' }))
    expect(mocks.push).toHaveBeenCalledWith('/admin/imoveis?q=Guarulhos&status=inativo')

    await user.click(screen.getByRole('button', { name: 'Pagina anterior' }))
    expect(mocks.push).toHaveBeenCalledWith('/admin/imoveis?q=Pinheiros&status=ativo')
    await user.click(screen.getByRole('button', { name: 'Proxima pagina' }))
    expect(mocks.push).toHaveBeenCalledWith('/admin/imoveis?q=Pinheiros&status=ativo&page=3')

    await user.click(screen.getByRole('button', { name: 'Limpar' }))
    expect(mocks.push).toHaveBeenCalledWith('/admin/imoveis')

    await user.click(screen.getByRole('button', { name: 'Sair' }))
    expect(mockFetch).toHaveBeenCalledWith('/api/admin/session', { method: 'DELETE' })
    expect(await screen.findByLabelText('Token de admin')).toBeVisible()
  })

  it('bloqueia visitante e carrega a lista depois do login', async () => {
    const user = userEvent.setup()
    mockFetch
      .mockImplementationOnce(() => response(false, { error: 'Admin nao autorizado.' }, 401))
      .mockImplementationOnce(() => response(true, { authenticated: true }))
      .mockImplementationOnce(() => response(true, {
        imoveis: [],
        pagination: {
          page: 1,
          per_page: 20,
          total: 0,
          total_pages: 1,
          has_next: false,
          has_prev: false,
        },
      }))

    render(<AdminPropertiesList page={1} q="" status="todos" />)

    const tokenInput = await screen.findByLabelText('Token de admin')
    fireEvent.submit(tokenInput.closest('form') as HTMLFormElement)
    expect(await screen.findByText('Informe o token de admin.')).toBeVisible()

    await user.type(tokenInput, 'token-seguro')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(mockFetch).toHaveBeenCalledWith('/api/admin/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: 'token-seguro' }),
    })
    expect(await screen.findByText('Nenhum imovel encontrado.')).toBeVisible()
    expect(screen.queryByDisplayValue('token-seguro')).not.toBeInTheDocument()
  })

  it('mostra erro generico, permite tentar novamente e limpar busca vazia', async () => {
    const user = userEvent.setup()
    mockFetch
      .mockImplementationOnce(() => response(true, { authenticated: true }))
      .mockImplementationOnce(() => response(false, { error: 'Servico temporariamente indisponivel.' }))
      .mockImplementationOnce(() => response(true, {
        imoveis: [],
        pagination: {
          page: 1,
          per_page: 20,
          total: 0,
          total_pages: 1,
          has_next: false,
          has_prev: false,
        },
      }))

    render(<AdminPropertiesList page={1} q="Centro" status="todos" />)

    expect(await screen.findByText('Servico temporariamente indisponivel.')).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }))
    expect(await screen.findByText('Nenhum imovel encontrado.')).toBeVisible()

    await user.click(screen.getByRole('button', { name: 'Limpar filtros' }))
    expect(mocks.push).toHaveBeenCalledWith('/admin/imoveis')
    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(3))
  })

  it('exibe a falha de login sem liberar o inventario', async () => {
    const user = userEvent.setup()
    mockFetch
      .mockImplementationOnce(() => response(false, { error: 'Admin nao autorizado.' }, 401))
      .mockImplementationOnce(() => Promise.resolve({
        ok: false,
        status: 401,
        json: () => Promise.reject(new Error('resposta malformada')),
      }))

    render(<AdminPropertiesList page={1} q="" status="todos" />)

    await user.type(await screen.findByLabelText('Token de admin'), 'token-incorreto')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(await screen.findByText('Token de admin invalido.')).toBeVisible()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  it('usa fallbacks para resposta incompleta e logout indisponivel', async () => {
    const user = userEvent.setup()
    mockFetch
      .mockImplementationOnce(() => response(true, { authenticated: true }))
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.reject(new Error('resposta malformada')),
      }))
      .mockRejectedValueOnce(new Error('logout offline'))

    render(<AdminPropertiesList page={1} q="" status="todos" />)

    expect(await screen.findByText('Nenhum imovel encontrado.')).toBeVisible()
    expect(screen.getByText('Pagina 1 de 1')).toBeVisible()

    await user.click(screen.getByRole('button', { name: 'Aplicar' }))
    expect(mocks.push).toHaveBeenCalledWith('/admin/imoveis')

    await user.click(screen.getByRole('button', { name: 'Sair' }))
    expect(await screen.findByLabelText('Token de admin')).toBeVisible()
  })

  it('normaliza falha sem Error para mensagem segura', async () => {
    mockFetch
      .mockImplementationOnce(() => response(true, { authenticated: true }))
      .mockRejectedValueOnce('falha desconhecida')

    render(<AdminPropertiesList page={1} q="" status="todos" />)

    expect(await screen.findByText('Nao foi possivel buscar os imoveis.')).toBeVisible()
  })

  it('bloqueia a tela quando a verificacao de sessao falha', async () => {
    mockFetch.mockRejectedValueOnce(new Error('session offline'))

    render(<AdminPropertiesList page={1} q="" status="todos" />)

    expect(await screen.findByText('Nao foi possivel verificar a sessao administrativa.')).toBeVisible()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  it('trata resposta de sessao malformada como visitante', async () => {
    mockFetch.mockImplementationOnce(() => Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.reject(new Error('resposta malformada')),
    }))

    render(<AdminPropertiesList page={1} q="" status="todos" />)

    expect(await screen.findByLabelText('Token de admin')).toBeVisible()
  })
})
