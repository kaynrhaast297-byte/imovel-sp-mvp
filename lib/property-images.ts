export const PROPERTY_IMAGES_BUCKET = 'property-images'
export const MAX_PROPERTY_IMAGES = 12
export const MAX_PROPERTY_IMAGE_BYTES = 5 * 1024 * 1024

const IMAGE_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

export type PropertyImageFile = {
  name: string
  size: number
  type: string
  arrayBuffer(): Promise<ArrayBuffer>
}

export function isPropertyImageFile(value: unknown): value is PropertyImageFile {
  if (!value || typeof value !== 'object') return false
  const file = value as Partial<PropertyImageFile>
  return typeof file.name === 'string'
    && typeof file.size === 'number'
    && typeof file.type === 'string'
    && typeof file.arrayBuffer === 'function'
}

export function validatePropertyImage(file: PropertyImageFile) {
  if (!IMAGE_EXTENSIONS[file.type]) {
    return { valid: false, error: 'Use apenas imagens JPG, PNG ou WebP.' }
  }

  if (file.size <= 0 || file.size > MAX_PROPERTY_IMAGE_BYTES) {
    return { valid: false, error: 'Cada imagem deve ter no maximo 5 MB.' }
  }

  return { valid: true, error: null }
}

export async function validatePropertyImageContent(file: PropertyImageFile) {
  const bytes = new Uint8Array(await file.arrayBuffer())
  const isJpeg = file.type === 'image/jpeg'
    && bytes[0] === 0xff
    && bytes[1] === 0xd8
    && bytes[2] === 0xff
  const isPng = file.type === 'image/png'
    && bytes[0] === 0x89
    && bytes[1] === 0x50
    && bytes[2] === 0x4e
    && bytes[3] === 0x47
    && bytes[4] === 0x0d
    && bytes[5] === 0x0a
    && bytes[6] === 0x1a
    && bytes[7] === 0x0a
  const isWebp = file.type === 'image/webp'
    && String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF'
    && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP'

  return isJpeg || isPng || isWebp
    ? { valid: true, error: null }
    : { valid: false, error: 'O conteudo do arquivo nao corresponde a uma imagem permitida.' }
}

export function createPropertyImagePath(file: PropertyImageFile, id = globalThis.crypto.randomUUID()) {
  const extension = IMAGE_EXTENSIONS[file.type]
  if (!extension) throw new Error('Tipo de imagem nao permitido.')
  return `properties/${id}.${extension}`
}

export function isSafePropertyImagePath(path: unknown): path is string {
  return typeof path === 'string'
    && /^properties\/[0-9a-f-]+\.(jpg|png|webp)$/.test(path)
}
