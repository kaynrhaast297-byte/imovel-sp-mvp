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
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: vi.fn(() => 'blob:foto') })
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: vi.fn() })
  })

  async function preencherImovel(user: ReturnType<typeof userEvent.setup>, incluirFoto = true) {
    await user.type(await screen.findByLabelText(/^titulo/i), 'Apartamento seguro')
    await user.selectOptions(screen.getByLabelText(/^tipo/i), 'apartamento')
    await user.selectOptions(screen.getByLabelText(/^negocio/i), 'venda')
    await user.type(screen.getByLabelText(/^preco/i), '900000')
    await user.type(screen.getByLabelText(/^area/i), '90')
    await user.type(screen.getByLabelText(/^cep/i), '05422000')
    await user.type(screen.getByLabelText(/^numero/i), '100')
    await user.type(screen.getByLabelText(/^endereco/i), 'Rua dos Pinheiros')
    await user.type(screen.getByLabelText(/^bairro/i), 'Pinheiros')
    if (incluirFoto) {
      await user.upload(screen.getByLabelText(/^fotos/i), new File(['foto'], 'foto.jpg', { type: 'image/jpeg' }))
    }
  }

  it('autentica por sessao HttpOnly e nao reenvia token ao criar imovel', async () => {
    const user = userEvent.setup()
    mockFetch
      .mockResolvedValueOnce(response(true, { authenticated: false }))
      .mockResolvedValueOnce(response(true, { authenticated: true }))
      .mockResolvedValueOnce(response(true, {
        fotos: ['https://example.com/foto.jpg'],
        imagens: [{ path: 'properties/123e4567-e89b-12d3-a456-426614174000.jpg', url: 'https://example.com/foto.jpg' }],
      }))
      .mockResolvedValueOnce(response(true, { imovel: { id: 'imovel-1' } }))

    render(<AdminPage />)

    await user.type(await screen.findByLabelText(/token de admin/i), 'segredo')
    await user.click(screen.getByRole('button', { name: /entrar/i }))

    await preencherImovel(user)
    await user.click(screen.getByRole('button', { name: /salvar imovel/i }))

    await waitFor(() => expect(screen.getByText(/cadastrado com fotos e localizacao/i)).toBeVisible())

    expect(mockFetch).toHaveBeenNthCalledWith(2, '/api/admin/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: 'segredo' }),
    })
    expect(mockFetch).toHaveBeenNthCalledWith(3, '/api/admin/property-images', {
      method: 'POST',
      body: expect.any(FormData),
    })
    expect(mockFetch).toHaveBeenNthCalledWith(4, '/api/imoveis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: expect.any(String),
    })
    expect(JSON.stringify(mockFetch.mock.calls[3])).not.toContain('segredo')
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
      .mockResolvedValueOnce(response(true, {
        fotos: ['https://example.com/foto.jpg'],
        imagens: [{ path: 'properties/123e4567-e89b-12d3-a456-426614174000.jpg', url: 'https://example.com/foto.jpg' }],
      }))
      .mockResolvedValueOnce(response(false, { error: 'Dados do imovel invalidos.' }))
      .mockResolvedValueOnce(response(true, { ok: true }))

    render(<AdminPage />)

    await user.click(await screen.findByRole('button', { name: /salvar imovel/i }))
    expect(screen.getByText(/campo obrigatorio: titulo/i)).toBeVisible()

    await preencherImovel(user)
    await user.type(screen.getByLabelText(/^descricao/i), 'Descricao completa')
    await user.click(screen.getByRole('button', { name: /salvar imovel/i }))

    expect(await screen.findByText('Dados do imovel invalidos.')).toBeVisible()

    await user.click(screen.getByRole('button', { name: /limpar/i }))
    expect(screen.getByLabelText(/^titulo/i)).toHaveValue('')
    expect(screen.queryByText('Dados do imovel invalidos.')).not.toBeInTheDocument()
  })

  it('consulta CEP e preenche endereco e coordenadas', async () => {
    const user = userEvent.setup()
    mockFetch
      .mockResolvedValueOnce(response(true, { authenticated: true }))
      .mockResolvedValueOnce(response(true, {
        endereco: {
          cep: '01001-000',
          endereco: 'Praca da Se',
          bairro: 'Se',
          cidade: 'Sao Paulo',
          estado: 'SP',
          latitude: -23.55,
          longitude: -46.63,
        },
      }))

    render(<AdminPage />)
    await user.type(await screen.findByLabelText(/^cep/i), '01001000')
    await user.click(screen.getByRole('button', { name: /consultar cep/i }))

    expect(await screen.findByText(/endereco e coordenadas encontrados/i)).toBeVisible()
    expect(screen.getByLabelText(/^endereco/i)).toHaveValue('Praca da Se')
    expect(screen.getByLabelText(/^latitude/i)).toHaveValue(-23.55)
  })

  it('trata consulta de CEP vazia, sem coordenadas e com falha externa', async () => {
    const user = userEvent.setup()
    mockFetch
      .mockResolvedValueOnce(response(true, { authenticated: true }))
      .mockResolvedValueOnce(response(true, {
        endereco: {
          cep: '01001-000',
          endereco: 'Praca da Se',
          bairro: 'Se',
          cidade: 'Sao Paulo',
          estado: 'SP',
        },
      }))
      .mockResolvedValueOnce(response(false, { error: 'CEP nao encontrado.' }))

    render(<AdminPage />)
    await user.click(await screen.findByRole('button', { name: /consultar cep/i }))
    expect(screen.getByText(/informe um cep valido/i)).toBeVisible()

    await user.type(screen.getByLabelText(/^cep/i), '01001000')
    await user.click(screen.getByRole('button', { name: /consultar cep/i }))
    expect(await screen.findByText(/coordenadas nao localizadas/i)).toBeVisible()

    await user.click(screen.getByRole('button', { name: /consultar cep/i }))
    expect(await screen.findByText(/cep nao encontrado/i)).toBeVisible()
  })

  it('exige foto e permite trocar principal e remover previews', async () => {
    const user = userEvent.setup()
    mockFetch.mockResolvedValueOnce(response(true, { authenticated: true }))

    render(<AdminPage />)
    await preencherImovel(user, false)
    await user.click(screen.getByRole('button', { name: /salvar imovel/i }))
    expect(screen.getByText(/adicione ao menos uma foto/i)).toBeVisible()

    await user.upload(screen.getByLabelText(/^fotos/i), [
      new File(['foto-1'], 'foto-1.jpg', { type: 'image/jpeg' }),
      new File(['foto-2'], 'foto-2.webp', { type: 'image/webp' }),
    ])
    expect(screen.getByRole('img', { name: /preview 2/i })).toBeVisible()
    await user.click(screen.getByRole('button', { name: /definir foto 2 como principal/i }))
    await user.click(screen.getByRole('button', { name: /remover foto 1/i }))
    expect(screen.queryByRole('img', { name: /foto-1/i })).not.toBeInTheDocument()
  })

  it('mostra erro quando upload falha antes de criar imovel', async () => {
    const user = userEvent.setup()
    mockFetch
      .mockResolvedValueOnce(response(true, { authenticated: true }))
      .mockResolvedValueOnce(response(false, { error: 'Imagem invalida.' }))

    render(<AdminPage />)
    await preencherImovel(user)
    await user.click(screen.getByRole('button', { name: /salvar imovel/i }))

    expect(await screen.findByText('Imagem invalida.')).toBeVisible()
    expect(mockFetch).toHaveBeenCalledTimes(2)
  })

  it('usa mensagens fallback quando respostas externas nao possuem JSON valido', async () => {
    const user = userEvent.setup()
    mockFetch
      .mockResolvedValueOnce(response(true, { authenticated: true }))
      .mockResolvedValueOnce({ ok: false, json: async () => { throw new Error('json invalido') } })

    render(<AdminPage />)
    await user.type(await screen.findByLabelText(/^cep/i), '01001000')
    await user.click(screen.getByRole('button', { name: /consultar cep/i }))
    expect(await screen.findByText(/nao foi possivel consultar o cep/i)).toBeVisible()
  })

  it('usa fallback de upload e de criacao e tolera falha na limpeza', async () => {
    const user = userEvent.setup()
    mockFetch
      .mockResolvedValueOnce(response(true, { authenticated: true }))
      .mockResolvedValueOnce({ ok: false, json: async () => { throw new Error('json invalido') } })

    render(<AdminPage />)
    await preencherImovel(user)
    await user.click(screen.getByRole('button', { name: /salvar imovel/i }))
    expect(await screen.findByText(/erro ao enviar fotos/i)).toBeVisible()

    mockFetch.mockReset()
    mockFetch
      .mockResolvedValueOnce(response(true, {
        fotos: ['https://example.com/foto.jpg'],
        imagens: [{ path: 'properties/123e4567-e89b-12d3-a456-426614174000.jpg', url: 'https://example.com/foto.jpg' }],
      }))
      .mockResolvedValueOnce({ ok: false, json: async () => { throw new Error('json invalido') } })
      .mockRejectedValueOnce(new Error('limpeza offline'))

    await user.click(screen.getByRole('button', { name: /salvar imovel/i }))
    expect(await screen.findByText('Erro na requisicao')).toBeVisible()
  })
})
