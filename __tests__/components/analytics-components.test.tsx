import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('componentes de analytics', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    vi.doMock('next/navigation', () => ({
      usePathname: () => '/busca',
      useSearchParams: () => new URLSearchParams('bairro=Pinheiros'),
    }))
  })

  it('envia pageview e renderiza scripts quando GA esta configurado', async () => {
    const pageview = vi.fn()
    vi.doMock('next/script', () => ({
      default: ({ children, id, src }: { children?: string; id?: string; src?: string }) => (
        <span data-testid={id ?? 'ga-loader'} data-src={src}>{children}</span>
      ),
    }))
    vi.doMock('@/lib/analytics', () => ({
      GA_MEASUREMENT_ID: 'G-TEST123',
      pageview,
    }))

    const { default: Analytics } = await import('@/components/Analytics')

    render(<Analytics />)

    await waitFor(() => expect(pageview).toHaveBeenCalledWith('/busca?bairro=Pinheiros'))
    expect(screen.getByTestId('ga-loader')).toHaveAttribute(
      'data-src',
      'https://www.googletagmanager.com/gtag/js?id=G-TEST123',
    )
    expect(screen.getByTestId('google-analytics').textContent).toContain('G-TEST123')
  })

  it('mantem Analytics sem scripts quando GA nao esta configurado', async () => {
    const pageview = vi.fn()
    vi.doMock('@/lib/analytics', () => ({
      GA_MEASUREMENT_ID: '',
      pageview,
    }))

    const { default: Analytics } = await import('@/components/Analytics')
    const { container } = render(<Analytics />)

    await waitFor(() => expect(pageview).toHaveBeenCalledWith('/busca?bairro=Pinheiros'))
    expect(container).toBeEmptyDOMElement()
  })

  it('rastreia clique em TrackedLink e preserva onClick', async () => {
    const user = userEvent.setup()
    const trackEvent = vi.fn()
    const onClick = vi.fn()
    vi.doMock('@/lib/analytics', () => ({
      trackEvent,
    }))

    const { default: TrackedLink } = await import('@/components/TrackedLink')

    render(
      <TrackedLink
        href="/imovel/imovel-1"
        eventName="select_item"
        eventParams={{ item_id: 'imovel-1' }}
        onClick={(event) => {
          event.preventDefault()
          onClick()
        }}
      >
        Abrir imovel
      </TrackedLink>,
    )

    await user.click(screen.getByRole('link', { name: /abrir imovel/i }))

    expect(trackEvent).toHaveBeenCalledWith('select_item', { item_id: 'imovel-1' })
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('rastreia clique em TrackedAnchor e view de imovel', async () => {
    const user = userEvent.setup()
    const trackEvent = vi.fn()
    vi.doMock('@/lib/analytics', () => ({
      trackEvent,
    }))

    const { default: TrackedAnchor } = await import('@/components/TrackedAnchor')
    const { default: PropertyViewTracker } = await import('@/components/PropertyViewTracker')

    render(
      <>
        <TrackedAnchor
          href="https://example.com"
          eventName="click_outbound"
          eventParams={{ item_id: 'imovel-1' }}
          onClick={(event) => event.preventDefault()}
        >
          Anuncio original
        </TrackedAnchor>
        <PropertyViewTracker id="imovel-1" title="Apartamento teste" tipo="apartamento" preco={900000} />
      </>,
    )

    await waitFor(() => expect(trackEvent).toHaveBeenCalledWith('view_item', {
      currency: 'BRL',
      value: 900000,
      items: [{
        item_id: 'imovel-1',
        item_name: 'Apartamento teste',
        item_category: 'apartamento',
        price: 900000,
      }],
    }))

    await user.click(screen.getByRole('link', { name: /anuncio original/i }))

    expect(trackEvent).toHaveBeenCalledWith('click_outbound', { item_id: 'imovel-1' })
  })
})
