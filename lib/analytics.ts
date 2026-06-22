export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() ?? ''

type AnalyticsValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | AnalyticsValue[]
  | { [key: string]: AnalyticsValue }

export type AnalyticsEventParams = Record<string, AnalyticsValue>

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

function removeUndefined(value: AnalyticsValue): AnalyticsValue {
  if (Array.isArray(value)) return value.map(removeUndefined)

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, entry]) => entry !== undefined)
        .map(([key, entry]) => [key, removeUndefined(entry)]),
    )
  }

  return value
}

export function isAnalyticsEnabled() {
  return GA_MEASUREMENT_ID.length > 0
}

export function pageview(path: string) {
  if (!isAnalyticsEnabled() || typeof window === 'undefined' || !window.gtag) return

  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: path,
  })
}

export function trackEvent(name: string, params: AnalyticsEventParams = {}) {
  if (!isAnalyticsEnabled() || typeof window === 'undefined' || !window.gtag) return

  window.gtag('event', name, removeUndefined(params))
}
