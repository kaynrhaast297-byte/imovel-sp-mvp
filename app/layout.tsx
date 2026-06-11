import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight, AtSign, Building2, Search } from 'lucide-react'
import './globals.css'

export const metadata: Metadata = {
  title: 'ImovelSP - Comparador de Precos',
  description: 'Compare precos de imoveis em Sao Paulo e saiba se o preco esta justo.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" data-scroll-behavior="smooth">
      <body>
        <header className="site-header">
          <Link href="/" className="brand" aria-label="ImovelSP - Pagina inicial">
            Imovel<span>SP</span>
          </Link>
          <nav className="site-nav" aria-label="Navegacao principal">
            <Link href="/busca"><Search size={15} />Comprar</Link>
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
