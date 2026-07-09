// Minimal in-memory fixed-window rate limiter. Good enough to stop a single
// visitor from draining the public AI quota. NOTE: state is per-process — on a
// multi-instance / serverless deploy each instance keeps its own window, so for
// hard global limits move this to Redis (same interface).

interface Bucket {
  count: number
  resetAt: number
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  retryAfter: number // seconds until the window resets
}

export interface RateLimitOptions {
  windowMs: number
  max: number
}

export function createRateLimiter({ windowMs, max }: RateLimitOptions) {
  const buckets = new Map<string, Bucket>()

  // Occasional sweep so the map doesn't grow unbounded.
  let lastSweep = Date.now()
  const sweep = (now: number) => {
    if (now - lastSweep < windowMs) return
    lastSweep = now
    for (const [key, b] of buckets) if (b.resetAt <= now) buckets.delete(key)
  }

  return function hit(key: string): RateLimitResult {
    const now = Date.now()
    sweep(now)

    let b = buckets.get(key)
    if (!b || b.resetAt <= now) {
      b = { count: 0, resetAt: now + windowMs }
      buckets.set(key, b)
    }
    b.count += 1

    const retryAfter = Math.ceil((b.resetAt - now) / 1000)
    if (b.count > max) return { allowed: false, remaining: 0, retryAfter }
    return { allowed: true, remaining: max - b.count, retryAfter }
  }
}

// Best-effort client IP from common proxy headers (Vercel/CF/nginx). Falls back
// to the socket address, then a shared 'unknown' bucket for local dev.
export function getClientIp(headers: Record<string, string | undefined>, server?: { requestIP?: (req: Request) => { address: string } | null }, request?: Request): string {
  const fwd = headers['x-forwarded-for']
  if (fwd) return fwd.split(',')[0].trim()
  const real = headers['x-real-ip'] ?? headers['cf-connecting-ip']
  if (real) return real
  if (server?.requestIP && request) {
    const ip = server.requestIP(request)?.address
    if (ip) return ip
  }
  return 'unknown'
}
