import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { invalidRequest, internalServerError } from '@/lib/api-response'
import {
  isPropertyImageFile,
  isSafePropertyImagePath,
  MAX_PROPERTY_IMAGES,
  validatePropertyImage,
  validatePropertyImageContent,
} from '@/lib/property-images'
import { removePropertyImages, uploadPropertyImages } from '@/lib/supabase'
import { propertyImageDeleteSchema } from '@/lib/validation'

export async function POST(req: NextRequest) {
  const unauthorized = requireAdmin(req)
  if (unauthorized) return unauthorized

  try {
    const formData = await req.formData()
    const files = formData.getAll('files').filter((entry) => isPropertyImageFile(entry))

    if (files.length < 1 || files.length > MAX_PROPERTY_IMAGES) {
      return invalidRequest(`Envie entre 1 e ${MAX_PROPERTY_IMAGES} imagens.`)
    }

    const invalid = files.map(validatePropertyImage).find(result => !result.valid)
    if (invalid) return invalidRequest(invalid.error || 'Imagem invalida.')

    for (const file of files) {
      const content = await validatePropertyImageContent(file)
      if (!content.valid) return invalidRequest(content.error || 'Conteudo de imagem invalido.')
    }

    const imagens = await uploadPropertyImages(files)
    return NextResponse.json({
      fotos: imagens.map(imagem => imagem.url),
      imagens,
    }, { status: 201 })
  } catch (error) {
    return internalServerError('Erro ao enviar imagens do imovel', error)
  }
}

export async function DELETE(req: NextRequest) {
  const unauthorized = requireAdmin(req)
  if (unauthorized) return unauthorized

  const parsed = propertyImageDeleteSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success || parsed.data.paths.some(path => !isSafePropertyImagePath(path))) {
    return invalidRequest('Caminhos de imagem invalidos.')
  }

  try {
    await removePropertyImages(parsed.data.paths)
    return NextResponse.json({ ok: true })
  } catch (error) {
    return internalServerError('Erro ao remover imagens do imovel', error)
  }
}
