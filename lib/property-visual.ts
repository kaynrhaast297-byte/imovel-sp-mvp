import type { Imovel, TipoImovel } from './types'

const fallbackPhotos: Record<TipoImovel, string[]> = {
  apartamento: [
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=84',
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1400&q=84',
    'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=84',
  ],
  casa: [
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=84',
    'https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1400&q=84',
    'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1400&q=84',
  ],
  comercial: [
    'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1400&q=84',
    'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1400&q=84',
  ],
  terreno: [
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1400&q=84',
  ],
  hotel: [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1400&q=84',
  ],
}

export const heroPhoto =
  'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=2400&q=88'

function hash(value: string) {
  return Array.from(value).reduce((total, char) => total + char.charCodeAt(0), 0)
}

export function propertyPhoto(imovel: Pick<Imovel, 'id' | 'tipo' | 'fotos'>, index = 0) {
  const photos = imovel.fotos?.filter(Boolean)
  if (photos?.length) return photos[index % photos.length]

  const fallback = fallbackPhotos[imovel.tipo] ?? fallbackPhotos.apartamento
  return fallback[(hash(imovel.id) + index) % fallback.length]
}
