/**
 * Best-effort rate limiting for the open write endpoint.
 *
 * WHY: `POST /api/submissions` with `kind: "feedback"` is deliberately keyless
 * (it backs a public form), so anyone can write rows. Unbounded, a trivial loop
 * could fill the `submissions` table and burn the Supabase free tier.
 *
 * HONEST LIMITATION: this is in-memory, and Vercel runs many short-lived
 * instances, so counters are per-instance and vanish on cold start. It reliably
 * stops the realistic threat (a naive loop from one source, which mostly lands
 * on warm instances) and does NOT stop a determined distributed attacker. The
 * durable fix is a shared store (Vercel KV / Upstash); this buys protection with
 * zero new dependencies, which matters because there is no local Node here to
 * validate one against.
 *
 * The GLOBAL cap is the part that actually protects the database: per-IP limits
 * fail against rotating IPs, but the global counter still holds the line.
 */

export type RateDecision = {
  allowed: boolean
  /** Seconds until the caller may retry. 0 when allowed. */
  retryAfter: number
  reason?: 'ip' | 'global'
}

export type LimiterOptions = {
  /** Requests allowed per IP within `ipWindowMs`. */
  ipLimit: number
  ipWindowMs: number
  /** Requests allowed across ALL callers within `globalWindowMs`. */
  globalLimit: number
  globalWindowMs: number
  /**
   * Cap on tracked IPs. Without this, IP rotation is itself an attack: the map
   * grows until the instance runs out of memory.
   */
  maxTrackedIps: number
}

export const DEFAULT_OPTIONS: LimiterOptions = {
  ipLimit: 5,
  ipWindowMs: 10 * 60 * 1000, // 5 per 10 minutes per IP
  globalLimit: 60,
  globalWindowMs: 60 * 60 * 1000, // 60 per hour overall
  maxTrackedIps: 5000,
}

export type Limiter = {
  check(ip: string, now?: number): RateDecision
  /** Tracked-IP count. Exposed for tests and diagnostics only. */
  size(): number
  reset(): void
}

export function createLimiter(opts: LimiterOptions = DEFAULT_OPTIONS): Limiter {
  // ip -> hit timestamps within the window
  const hits = new Map<string, number[]>()
  let globalHits: number[] = []

  function prune(list: number[], now: number, windowMs: number): number[] {
    const cutoff = now - windowMs
    // Timestamps are appended in order, so the first index inside the window
    // makes everything after it valid too.
    let i = 0
    while (i < list.length && list[i] <= cutoff) i++
    return i === 0 ? list : list.slice(i)
  }

  function sweep(now: number): void {
    // `Map.forEach`, not `for...of`: this project's tsconfig sets no `target`,
    // so TypeScript defaults to ES5, where iterating a Map needs
    // `downlevelIteration`. Arrays are exempt, hence the two array loops below.
    // (This broke the v1.315 Vercel build; keep it this way.)
    const drop: string[] = []
    const update: Array<[string, number[]]> = []

    hits.forEach((list, ip) => {
      const kept = prune(list, now, opts.ipWindowMs)
      if (kept.length === 0) drop.push(ip)
      else if (kept !== list) update.push([ip, kept])
    })

    for (const ip of drop) hits.delete(ip)
    for (const [ip, kept] of update) hits.set(ip, kept)
  }

  return {
    check(ip: string, now: number = Date.now()): RateDecision {
      globalHits = prune(globalHits, now, opts.globalWindowMs)
      if (globalHits.length >= opts.globalLimit) {
        const oldest = globalHits[0]
        return {
          allowed: false,
          retryAfter: Math.max(1, Math.ceil((oldest + opts.globalWindowMs - now) / 1000)),
          reason: 'global',
        }
      }

      const key = ip || 'unknown'
      const existing = prune(hits.get(key) ?? [], now, opts.ipWindowMs)

      if (existing.length >= opts.ipLimit) {
        hits.set(key, existing)
        const oldest = existing[0]
        return {
          allowed: false,
          retryAfter: Math.max(1, Math.ceil((oldest + opts.ipWindowMs - now) / 1000)),
          reason: 'ip',
        }
      }

      // Only sweep when the map is growing; on a quiet endpoint this never runs.
      if (!hits.has(key) && hits.size >= opts.maxTrackedIps) {
        sweep(now)
        // Still full after sweeping: everything tracked is live traffic, which
        // is itself abnormal. Refuse rather than grow without bound.
        if (hits.size >= opts.maxTrackedIps) {
          return { allowed: false, retryAfter: 60, reason: 'global' }
        }
      }

      existing.push(now)
      hits.set(key, existing)
      globalHits.push(now)
      return { allowed: true, retryAfter: 0 }
    },

    size() {
      return hits.size
    },

    reset() {
      hits.clear()
      globalHits = []
    },
  }
}

/**
 * Client IP, as seen through Vercel's proxy. `x-forwarded-for` is a comma
 * separated chain; the first entry is the original client.
 *
 * A client can forge this header, but Vercel overwrites it at the edge, so the
 * leftmost value is trustworthy on this deployment. Falls back to a constant,
 * which means unidentifiable callers share one bucket -- deliberately strict.
 */
export function clientIp(headers: Headers): string {
  const fwd = headers.get('x-forwarded-for')
  if (fwd) {
    const first = fwd.split(',')[0]?.trim()
    if (first) return first
  }
  return headers.get('x-real-ip')?.trim() || 'unknown'
}

/** Process-wide limiter for the route. Per-instance, by nature. */
export const submissionLimiter = createLimiter()
