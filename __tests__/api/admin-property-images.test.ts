import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'

const mocks = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  uploadPropertyImages: vi.fn(),
  removePropertyImages: vi.fn(),
}))

vi.mock('@/lib/admin-auth', () => ({ requireAdmin: mocks.requireAdmin }))
vi.mock('@/lib/supabase', () => ({
  uploadPropertyImages: mocks.uploadPropertyImages,
  removePropertyImages: mocks.removePropertyImages,
}))

const { POST, DELETE } = await import('@/app/api/admin/property-images/route')

function file(type = 'image/jpeg') {
  const bytes = type === 'image/gif' ? [0x47, 0x49, 0x46] : [0xff, 0xd8, 0xff, 0x00]
  return {
    name: type === 'image/gif' ? 'foto.gif' : 'foto.jpg',
    type,
    size: 4,
    arrayBuffer: async () => Uint8Array.from(bytes).buffer,
  }
}

function uploadRequest(uploadedFile = file()) {
  const request = new NextRequest('http://localhost/api/admin/property-images', { method: 'POST' })
  vi.spyOn(request, 'formData').mockResolvedValue({
    getAll: () => [uploadedFile],
  } as unknown as FormData)
  return request
}

function deleteRequest(body: unknown) {
  return new NextRequest('http://localhost/api/admin/property-images', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('/api/admin/property-images', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.requireAdmin.mockReturnValue(null)
  })

  it('exige admin e rejeita tipo de arquivo invalido', async () => {
    mocks.requireAdmin.mockReturnValueOnce(NextResponse.json({ error: 'Admin nao autorizado.' }, { status: 401 }))
    expect((await POST(uploadRequest())).status).toBe(401)
    expect((await POST(uploadRequest(file('image/gif')))).status).toBe(400)
    expect((await POST(uploadRequest({
      ...file(),
      arrayBuffer: async () => Uint8Array.from([0, 1, 2]).buffer,
    }))).status).toBe(400)
    const emptyRequest = new NextRequest('http://localhost/api/admin/property-images', { method: 'POST' })
    vi.spyOn(emptyRequest, 'formData').mockResolvedValue({ getAll: () => [] } as unknown as FormData)
    expect((await POST(emptyRequest)).status).toBe(400)
  })

  it('envia imagens validas e remove apenas caminhos seguros', async () => {
    const image = {
      path: 'properties/123e4567-e89b-12d3-a456-426614174000.jpg',
      url: 'https://example.com/foto.jpg',
    }
    mocks.uploadPropertyImages.mockResolvedValueOnce([image])

    const upload = await POST(uploadRequest())
    expect(upload.status).toBe(201)
    expect(await upload.json()).toEqual({ fotos: [image.url], imagens: [image] })

    const invalidDelete = await DELETE(deleteRequest({ paths: ['../segredo.jpg'] }))
    expect(invalidDelete.status).toBe(400)
    const malformedDelete = new NextRequest('http://localhost/api/admin/property-images', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: '{',
    })
    expect((await DELETE(malformedDelete)).status).toBe(400)

    mocks.removePropertyImages.mockResolvedValueOnce(undefined)
    const validDelete = await DELETE(deleteRequest({ paths: [image.path] }))
    expect(validDelete.status).toBe(200)
    expect(mocks.removePropertyImages).toHaveBeenCalledWith([image.path])
  })

  it('retorna erro seguro quando storage falha', async () => {
    mocks.uploadPropertyImages.mockRejectedValueOnce(new Error('storage offline'))
    expect((await POST(uploadRequest())).status).toBe(500)

    mocks.removePropertyImages.mockRejectedValueOnce(new Error('storage offline'))
    expect((await DELETE(deleteRequest({ paths: ['properties/123e4567-e89b-12d3-a456-426614174000.jpg'] }))).status).toBe(500)
  })
})
