import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { siteConfig } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Buscar imoveis em Sao Paulo',
  description: 'Filtre imoveis em Sao Paulo por bairro, cidade, tipo, negocio, quartos e faixa de preco.',
  openGraph: {
    title: 'Buscar imoveis em Sao Paulo',
    description: 'Compare imoveis em Sao Paulo com filtros de preco, bairro e atributos.',
    siteName: siteConfig.name,
  },
}

export default function BuscaLayout({ children }: { children: ReactNode }) {
  return children
}
