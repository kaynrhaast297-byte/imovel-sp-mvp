import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ImóvelSP – Comparador de Preços',
  description: 'Compare preços de imóveis em São Paulo e saiba se o preço está justo.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap"
          rel="stylesheet"
        />
      </head>
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
          <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.4rem' }}>🏙️</span>
            <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.25rem', color: 'var(--text)' }}>
              Imóvel<span style={{ color: 'var(--primary)' }}>SP</span>
            </span>
          </a>
          <nav style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <a href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>Buscar</a>
            <a href="/admin" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>Admin</a>
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
          © {new Date().getFullYear()} ImóvelSP · Comparador de preços de imóveis em São Paulo
        </footer>
      </body>
    </html>
  )
}
