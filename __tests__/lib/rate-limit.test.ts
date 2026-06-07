import { afterEach, describe, expect, it } from 'vitest'
import { NextRequest } from 'next/server'
import {
  checkRateLimit,
  getAdminLoginRateLimitOptions,
  getClientIp,
  getLeadRateLimitOptions,
  resetRateLimits,
} from '@/lib/rate-limit'

describe('rate limit', () => {
  afterEach(() => {
    resetRateLimits()
    delete process.env.LEAD_RATE_LIMIT_MAX
    delete process.env.LEAD_RATE_LIMIT_WINDOW_MS
    delete process.env.ADMIN_LOGIN_RATE_LIMIT_MAX
    delete process.env.ADMIN_LOGIN_RATE_LIMIT_WINDOW_MS
  })

  it('bloqueia quando o limite da janela e excedido e libera apos reset', () => {
    const options = { namespace: 'test', limit: 2, windowMs: 1000 }

    expect(checkRateLimit('ip-1', options, 100).allowed).toBe(true)
    expect(checkRateLimit('ip-1', options, 200).allowed).toBe(true)
    expect(checkRateLimit('ip-1', options, 300).allowed).toBe(false)
    expect(checkRateLimit('ip-1', options, 1200).allowed).toBe(true)
  })

  it('identifica IP por headers confiaveis do proxy', () => {
    const forwarded = new NextRequest('http://localhost', {
      headers: { 'x-forwarded-for': '203.0.113.10, 10.0.0.1' },
    })
    const realIp = new NextRequest('http://localhost', {
      headers: { 'x-real-ip': '203.0.113.20' },
    })

    expect(getClientIp(forwarded)).toBe('203.0.113.10')
    expect(getClientIp(realIp)).toBe('203.0.113.20')
    expect(getClientIp(new NextRequest('http://localhost'))).toBe('unknown')
  })

  it('le configuracao valida do ambiente e usa defaults seguros', () => {
    expect(getLeadRateLimitOptions()).toMatchObject({ limit: 5, windowMs: 900000 })

    process.env.LEAD_RATE_LIMIT_MAX = '2'
    process.env.LEAD_RATE_LIMIT_WINDOW_MS = '60000'
    expect(getLeadRateLimitOptions()).toMatchObject({ limit: 2, windowMs: 60000 })

    process.env.LEAD_RATE_LIMIT_MAX = '-1'
    expect(getLeadRateLimitOptions().limit).toBe(5)

    process.env.ADMIN_LOGIN_RATE_LIMIT_MAX = '3'
    expect(getAdminLoginRateLimitOptions()).toMatchObject({ limit: 3, windowMs: 900000 })
  })

  it('limita memoria removendo entradas antigas ou expiradas', () => {
    const options = { namespace: 'memory', limit: 1, windowMs: 1000 }

    for (let index = 0; index < 10000; index += 1) {
      checkRateLimit(`active-${index}`, options, 0)
    }
    expect(checkRateLimit('new-active', options, 0).allowed).toBe(true)

    resetRateLimits()
    for (let index = 0; index < 10000; index += 1) {
      checkRateLimit(`expired-${index}`, options, 0)
    }
    expect(checkRateLimit('new-after-expiry', options, 2000).allowed).toBe(true)
  })
})
