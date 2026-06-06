import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const mocks = vi.hoisted(() => ({
  createLead: vi.fn(),
}))

vi.mock('@/lib/supabase', () => ({
  createLead: mocks.createLead,
}))

const { POST } = await import('@/app/api/leads/route')

function makeRequest(body: unknown) {
  return new NextRequest('http://localhost/api/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

const validLead = {
  imovel_id: '550e8400-e29b-41d4-a716-446655440000',
  nome: 'Maria Silva',
  telefone: '11999999999',
  email: 'maria@example.com',
  mensagem: 'Tenho interesse neste imovel.',
  origem: 'teste_api',
}

describe('POST /api/leads', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('retorna 400 quando os dados sao invalidos', async () => {
    const res = await POST(makeRequest({ ...validLead, email: 'email-invalido' }))
    const json = await res.json()

    expect(res.status).toBe(400)
    expect(json.error).toBe('Dados de contato invalidos.')
    expect(mocks.createLead).not.toHaveBeenCalled()
  })

  it('cria lead valido preservando email e origem enviados', async () => {
    mocks.createLead.mockResolvedValueOnce({ ok: true })

    const res = await POST(makeRequest(validLead))
    const json = await res.json()

    expect(res.status).toBe(201)
    expect(json.ok).toBe(true)
    expect(mocks.createLead).toHaveBeenCalledWith({
      ...validLead,
      status: 'novo',
      created_at: expect.any(String),
    })
  })

  it('normaliza email vazio e origem ausente', async () => {
    mocks.createLead.mockResolvedValueOnce({ ok: true })

    const res = await POST(makeRequest({ ...validLead, email: '', origem: undefined }))

    expect(res.status).toBe(201)
    expect(mocks.createLead).toHaveBeenCalledWith({
      imovel_id: validLead.imovel_id,
      nome: validLead.nome,
      telefone: validLead.telefone,
      email: null,
      mensagem: validLead.mensagem,
      origem: 'pagina_imovel',
      status: 'novo',
      created_at: expect.any(String),
    })
  })

  it('retorna 500 quando salvar o lead falha', async () => {
    mocks.createLead.mockRejectedValueOnce(new Error('insert falhou'))

    const res = await POST(makeRequest(validLead))
    const json = await res.json()

    expect(res.status).toBe(500)
    expect(json.error).toBe('Erro ao salvar contato.')
    expect(json.detail).toMatch(/insert falhou/i)
  })
})
