'use client'

import Link, { type LinkProps } from 'next/link'
import type { AnchorHTMLAttributes, MouseEvent } from 'react'
import { trackEvent, type AnalyticsEventParams } from '@/lib/analytics'

type TrackedLinkProps = LinkProps
  & AnchorHTMLAttributes<HTMLAnchorElement>
  & {
    eventName: string
    eventParams?: AnalyticsEventParams
  }

export default function TrackedLink({
  eventName,
  eventParams,
  onClick,
  ...props
}: TrackedLinkProps) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    trackEvent(eventName, eventParams)
    onClick?.(event)
  }

  return <Link {...props} onClick={handleClick} />
}
