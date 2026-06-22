'use client'

import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from 'react'
import { trackEvent, type AnalyticsEventParams } from '@/lib/analytics'

type TrackedAnchorProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode
  eventName: string
  eventParams?: AnalyticsEventParams
  href: string
}

export default function TrackedAnchor({
  children,
  eventName,
  eventParams,
  onClick,
  ...props
}: TrackedAnchorProps) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    trackEvent(eventName, eventParams)
    onClick?.(event)
  }

  return (
    <a {...props} onClick={handleClick}>
      {children}
    </a>
  )
}
