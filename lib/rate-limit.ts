import type { NextRequest } from 'next/server'

type RateLimitEntry = {
  count: number
  resetAt: number
}

type RateLimitOptions = {
  limit: number
  windowMs: number
  namespace: string
}

const entries = new Map<string, RateLimitEntry>()
const MAX_ENTRIES = 10000

function positiveInteger(value: string | undefined, fallback: number) {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}

export function getClientIp(req: NextRequest) {
  const forwarded = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  return forwarded || req.headers.get('x-real-ip')?.trim() || 'unknown'
}

export function checkRateLimit(
  key: string,
  options: RateLimitOptions,
  now = Date.now(),
) {
  const namespacedKey = `${options.namespace}:${key}`
  const current = entries.get(namespacedKey)

  if (!current || current.resetAt <= now) {
    if (entries.size >= MAX_ENTRIES) {
      for (const [entryKey, entry] of entries) {
        if (entry.resetAt <= now) entries.delete(entryKey)
      }
      while (entries.size >= MAX_ENTRIES) {
        const oldestKey = entries.keys().next().value
        if (!oldestKey) break
        entries.delete(oldestKey)
      }
    }

    const resetAt = now + options.windowMs
    entries.set(namespacedKey, { count: 1, resetAt })
    return { allowed: true, limit: options.limit, remaining: options.limit - 1, resetAt }
  }

  current.count += 1
  const remaining = Math.max(options.limit - current.count, 0)
  return {
    allowed: current.count <= options.limit,
    limit: options.limit,
    remaining,
    resetAt: current.resetAt,
  }
}

export function getLeadRateLimitOptions(): RateLimitOptions {
  return {
    namespace: 'lead',
    limit: positiveInteger(process.env.LEAD_RATE_LIMIT_MAX, 5),
    windowMs: positiveInteger(process.env.LEAD_RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
  }
}

export function getAdminLoginRateLimitOptions(): RateLimitOptions {
  return {
    namespace: 'admin-login',
    limit: positiveInteger(process.env.ADMIN_LOGIN_RATE_LIMIT_MAX, 5),
    windowMs: positiveInteger(process.env.ADMIN_LOGIN_RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
  }
}

export function resetRateLimits() {
  entries.clear()
}
