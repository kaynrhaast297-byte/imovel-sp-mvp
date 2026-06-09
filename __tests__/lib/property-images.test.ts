import { describe, expect, it } from 'vitest'
import {
  createPropertyImagePath,
  isPropertyImageFile,
  isSafePropertyImagePath,
  MAX_PROPERTY_IMAGE_BYTES,
  validatePropertyImage,
  validatePropertyImageContent,
} from '@/lib/property-images'

function file(type = 'image/jpeg', size = 1000, bytes = [0xff, 0xd8, 0xff, 0x00]) {
  return {
    name: 'foto original.jpg',
    size,
    type,
    arrayBuffer: async () => Uint8Array.from(bytes).buffer,
  }
}

describe('property-images', () => {
  it('aceita somente arquivos de imagem permitidos e dentro do limite', () => {
    expect(isPropertyImageFile(file())).toBe(true)
    expect(isPropertyImageFile('arquivo')).toBe(false)
    expect(isPropertyImageFile({ name: 'foto.jpg', size: 1, type: 'image/jpeg' })).toBe(false)
    expect(validatePropertyImage(file())).toEqual({ valid: true, error: null })
    expect(validatePropertyImage(file('image/gif'))).toEqual({
      valid: false,
      error: 'Use apenas imagens JPG, PNG ou WebP.',
    })
    expect(validatePropertyImage(file('image/png', MAX_PROPERTY_IMAGE_BYTES + 1))).toEqual({
      valid: false,
      error: 'Cada imagem deve ter no maximo 5 MB.',
    })
    expect(validatePropertyImage(file('image/png', 0)).valid).toBe(false)
  })

  it('gera caminho seguro sem reutilizar o nome enviado', () => {
    const path = createPropertyImagePath(file('image/webp'), '123e4567-e89b-12d3-a456-426614174000')

    expect(path).toBe('properties/123e4567-e89b-12d3-a456-426614174000.webp')
    expect(path).not.toContain('foto original')
    expect(isSafePropertyImagePath(path)).toBe(true)
    expect(isSafePropertyImagePath('../segredo.webp')).toBe(false)
    expect(isSafePropertyImagePath(null)).toBe(false)
    expect(() => createPropertyImagePath(file('image/gif'))).toThrow(/nao permitido/i)
  })

  it('confere a assinatura binaria declarada pelo arquivo', async () => {
    await expect(validatePropertyImageContent(file())).resolves.toEqual({ valid: true, error: null })
    await expect(validatePropertyImageContent(file('image/png', 1000, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))).resolves.toEqual({ valid: true, error: null })
    await expect(validatePropertyImageContent(file('image/webp', 1000, [0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50]))).resolves.toEqual({ valid: true, error: null })
    await expect(validatePropertyImageContent(file('image/jpeg', 1000, [0, 1, 2]))).resolves.toEqual({
      valid: false,
      error: 'O conteudo do arquivo nao corresponde a uma imagem permitida.',
    })
  })
})
