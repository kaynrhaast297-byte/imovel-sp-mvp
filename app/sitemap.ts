import type { MetadataRoute } from 'next'
import { absoluteUrl } from '@/lib/site'

const routes = [
  { path: '/', priority: 1, changeFrequency: 'weekly' },
  { path: '/busca', priority: 0.9, changeFrequency: 'daily' },
] as const

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  return routes.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }))
}
