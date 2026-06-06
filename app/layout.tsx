import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'

export const metadata: Metadata = {
  title: 'ImovelSP - Comparador de Precos',
  description: 'Compare precos de imoveis em Sao Paulo e saiba se o preco esta justo.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" data-scroll-behavior="smooth">
      <body>
        <header style={{
          background: 'var(--bg-card)',
          borderBottom: '1px solid var(--border)',
          padding: '0 1.5rem',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{
              alignItems: 'center',
              background: 'var(--primary-action)',
              borderRadius: 'var(--radius-sm)',
              color: '#fff',
              display: 'inline-flex',
              fontSize: '0.72rem',
              fontWeight: 700,
              height: '28px',
              justifyContent: 'center',
              letterSpacing: '0.08em',
              width: '34px',
            }}>
              SP
            </span>
            <span style={{ fontFamily: 'var(--font-dm-serif)', fontSize: '1.25rem', color: 'var(--text)' }}>
              Imovel<span style={{ color: 'var(--primary)' }}>SP</span>
            </span>
          </Link>
          <nav style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>Buscar</Link>
            <Link href="/ai" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>IA Local</Link>
            <Link href="/admin" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>Admin</Link>
          </nav>
        </header>
        <main style={{ minHeight: 'calc(100vh - 64px)' }}>{children}</main>
        <footer style={{
          borderTop: '1px solid var(--border)',
          padding: '2rem 1.5rem',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.85rem',
        }}>
          (c) {new Date().getFullYear()} ImovelSP - Comparador de precos de imoveis em Sao Paulo
        </footer>
      </body>
    </html>
  )
}
