import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { ArrowUpRight, AtSign, Building2, Search } from 'lucide-react'
import Analytics from '@/components/Analytics'
import { siteConfig } from '@/lib/site'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  applicationName: siteConfig.name,
  title: {
    default: 'ImovelSP - Comparador de precos de imoveis em Sao Paulo',
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: siteConfig.name,
    title: 'ImovelSP - Comparador de precos de imoveis em Sao Paulo',
    description: siteConfig.description,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ImovelSP - Comparador de precos de imoveis em Sao Paulo',
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" data-scroll-behavior="smooth">
      <body>
        <Suspense fallback={null}>
          <Analytics />
        </Suspense>
        <header className="site-header">
          <Link href="/" className="brand" aria-label="ImovelSP - Pagina inicial">
            Imovel<span>SP</span>
          </Link>
          <nav className="site-nav" aria-label="Navegacao principal">
            <Link href="/busca?negocio=venda"><Search size={15} />Comprar</Link>
            <Link href="/busca?negocio=aluguel">Alugar</Link>
            <Link href="/#destaques">Selecionados</Link>
            <Link href="/#inteligencia">Inteligencia de preco</Link>
          </nav>
          <nav className="site-actions" aria-label="Acoes">
            <Link href="/ai">IA local</Link>
            <Link href="/admin" className="site-admin-link">
              <Building2 size={15} />
              Admin
            </Link>
          </nav>
        </header>
        <main className="site-main">{children}</main>
        <footer className="site-footer">
          <div>
            <Link href="/" className="brand brand-footer">Imovel<span>SP</span></Link>
            <p>Curadoria imobiliaria e inteligencia de preco para Sao Paulo.</p>
          </div>
          <div className="footer-links">
            <Link href="/busca">Explorar imoveis <ArrowUpRight size={14} /></Link>
            <Link href="/ai">Consultar IA local <ArrowUpRight size={14} /></Link>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              Instagram <AtSign size={14} />
            </a>
          </div>
          <small>© {new Date().getFullYear()} ImovelSP</small>
        </footer>
      </body>
    </html>
  )
}
