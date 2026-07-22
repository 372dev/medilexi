import { createHash, timingSafeEqual } from 'node:crypto'

/**
 * Shared secret gating the internal French-review tool. Server-only.
 *
 * Both the page (which reads ?k=) and the submissions API (which reads the
 * x-review-key header) check against the same env var through here, so the two
 * can never drift apart.
 *
 * Both sides are hashed before comparing so timingSafeEqual always gets
 * equal-length buffers - it throws on a length mismatch, and that throw would
 * itself leak the expected key's length.
 */
export function reviewKeyMatches(supplied: string | null | undefined): boolean {
  const expected = process.env.REVIEW_KEY
  if (!supplied || !expected) return false
  const a = createHash('sha256').update(supplied).digest()
  const b = createHash('sha256').update(expected).digest()
  return timingSafeEqual(a, b)
}
