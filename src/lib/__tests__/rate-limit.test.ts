import { describe, it, expect } from 'vitest'
import { createLimiter, clientIp, type LimiterOptions } from '@/lib/rate-limit'

const OPTS: LimiterOptions = {
  ipLimit: 3,
  ipWindowMs: 1000,
  globalLimit: 10,
  globalWindowMs: 10_000,
  maxTrackedIps: 5,
}

describe('createLimiter — per IP', () => {
  it('allows up to the limit, then refuses', () => {
    const l = createLimiter(OPTS)
    expect(l.check('1.1.1.1', 0).allowed).toBe(true)
    expect(l.check('1.1.1.1', 10).allowed).toBe(true)
    expect(l.check('1.1.1.1', 20).allowed).toBe(true)
    const denied = l.check('1.1.1.1', 30)
    expect(denied.allowed).toBe(false)
    expect(denied.reason).toBe('ip')
  })

  it('keeps IPs in separate buckets', () => {
    const l = createLimiter(OPTS)
    for (let i = 0; i < 3; i++) l.check('1.1.1.1', i)
    expect(l.check('1.1.1.1', 4).allowed).toBe(false)
    expect(l.check('2.2.2.2', 4).allowed).toBe(true)
  })

  it('lets the window slide', () => {
    const l = createLimiter(OPTS)
    for (let i = 0; i < 3; i++) l.check('1.1.1.1', i)
    expect(l.check('1.1.1.1', 500).allowed).toBe(false)
    // first three hits have aged out by now
    expect(l.check('1.1.1.1', 1001).allowed).toBe(true)
  })

  it('reports a sane retryAfter in seconds', () => {
    const l = createLimiter(OPTS)
    for (let i = 0; i < 3; i++) l.check('9.9.9.9', 0)
    const d = l.check('9.9.9.9', 100)
    expect(d.allowed).toBe(false)
    expect(d.retryAfter).toBeGreaterThan(0)
    expect(d.retryAfter).toBeLessThanOrEqual(1)
  })
})

describe('createLimiter — global cap', () => {
  it('holds the line when IPs rotate', () => {
    const l = createLimiter({ ...OPTS, maxTrackedIps: 1000 })
    // Every request from a different IP: per-IP limiting never triggers.
    let allowed = 0
    for (let i = 0; i < 20; i++) {
      if (l.check(`10.0.0.${i}`, i).allowed) allowed++
    }
    expect(allowed).toBe(OPTS.globalLimit)
  })

  it('labels the refusal as global, not ip', () => {
    const l = createLimiter({ ...OPTS, maxTrackedIps: 1000 })
    for (let i = 0; i < 10; i++) l.check(`10.0.1.${i}`, i)
    expect(l.check('10.0.9.9', 11).reason).toBe('global')
  })
})

describe('createLimiter — memory safety', () => {
  it('does not grow past maxTrackedIps', () => {
    const l = createLimiter(OPTS)
    for (let i = 0; i < 50; i++) l.check(`172.16.0.${i}`, i)
    expect(l.size()).toBeLessThanOrEqual(OPTS.maxTrackedIps)
  })

  it('drops IPs whose hits have expired', () => {
    const l = createLimiter(OPTS)
    l.check('1.1.1.1', 0)
    l.check('2.2.2.2', 0)
    expect(l.size()).toBe(2)
    // far past the ip window; a new IP triggers the sweep
    for (let i = 0; i < OPTS.maxTrackedIps; i++) l.check(`3.3.3.${i}`, 100_000 + i)
    expect(l.size()).toBeLessThanOrEqual(OPTS.maxTrackedIps)
  })

  it('reset clears everything', () => {
    const l = createLimiter(OPTS)
    for (let i = 0; i < 3; i++) l.check('1.1.1.1', i)
    l.reset()
    expect(l.size()).toBe(0)
    expect(l.check('1.1.1.1', 4).allowed).toBe(true)
  })
})

describe('clientIp', () => {
  it('takes the leftmost x-forwarded-for entry', () => {
    const h = new Headers({ 'x-forwarded-for': '203.0.113.5, 70.41.3.18, 150.172.238.178' })
    expect(clientIp(h)).toBe('203.0.113.5')
  })

  it('handles a single value', () => {
    expect(clientIp(new Headers({ 'x-forwarded-for': '203.0.113.5' }))).toBe('203.0.113.5')
  })

  it('falls back to x-real-ip', () => {
    expect(clientIp(new Headers({ 'x-real-ip': '198.51.100.7' }))).toBe('198.51.100.7')
  })

  it('returns "unknown" when no header identifies the caller', () => {
    expect(clientIp(new Headers())).toBe('unknown')
  })

  it('ignores an empty forwarded-for and falls through', () => {
    const h = new Headers({ 'x-forwarded-for': '', 'x-real-ip': '198.51.100.7' })
    expect(clientIp(h)).toBe('198.51.100.7')
  })
})
