'use client'

import { useEffect } from 'react'
import { trackEvent } from '@/lib/analytics'

type PropertyViewTrackerProps = {
  id: string
  title: string
  tipo: string
  preco: number
}

export default function PropertyViewTracker({
  id,
  title,
  tipo,
  preco,
}: PropertyViewTrackerProps) {
  useEffect(() => {
    trackEvent('view_item', {
      currency: 'BRL',
      value: preco,
      items: [
        {
          item_id: id,
          item_name: title,
          item_category: tipo,
          price: preco,
        },
      ],
    })
  }, [id, preco, tipo, title])

  return null
}
