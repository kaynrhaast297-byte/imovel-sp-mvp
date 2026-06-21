import { beforeEach, describe, expect, it, vi } from 'vitest'

function setGtag(gtag?: (...args: unknown[]) => void) {
  const analyticsWindow = window as typeof window & {
    gtag?: (...args: unknown[]) => void
  }

  if (gtag) {
    analyticsWindow.gtag = gtag
  } else {
    delete analyticsWindow.gtag
  }
}

describe('lib/analytics', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    delete process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
    setGtag()
  })

  it('mantem analytics inativo quando o measurement id nao existe', async () => {
    const gtag = vi.fn()
    setGtag(gtag)

    const { isAnalyticsEnabled, pageview, trackEvent } = await import('@/lib/analytics')

    expect(isAnalyticsEnabled()).toBe(false)
    pageview('/busca')
    trackEvent('search', { search_term: 'Pinheiros' })
    expect(gtag).not.toHaveBeenCalled()
  })

  it('envia pageview e eventos quando o measurement id existe', async () => {
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = 'G-TEST123'
    const gtag = vi.fn()
    setGtag(gtag)

    const { isAnalyticsEnabled, pageview, trackEvent } = await import('@/lib/analytics')

    expect(isAnalyticsEnabled()).toBe(true)

    pageview('/busca?negocio=venda')
    expect(gtag).toHaveBeenCalledWith('config', 'G-TEST123', {
      page_path: '/busca?negocio=venda',
    })

    trackEvent('search', {
      search_term: 'Moema',
      preco_min: undefined,
      items: [
        {
          item_id: 'imovel-1',
          item_name: 'Apartamento teste',
          ignored: undefined,
        },
      ],
    })
    expect(gtag).toHaveBeenCalledWith('event', 'search', {
      search_term: 'Moema',
      items: [
        {
          item_id: 'imovel-1',
          item_name: 'Apartamento teste',
        },
      ],
    })
  })
})
