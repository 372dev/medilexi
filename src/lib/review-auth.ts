import { createHash, timingSafeEqual } from 'node:crypto'

/**
 * Shared secrets gating the internal per-language review tool. Server-only.
 *
 * Each language has its own key so a reviewer only ever sees their own layer:
 *   REVIEW_KEY_FR, REVIEW_KEY_KO, REVIEW_KEY_ES, REVIEW_KEY_JA
 * For back-compat, `fr` also accepts the original single `REVIEW_KEY`, so the
 * live French reviewer's existing link keeps working the day this ships.
 *
 * Both the page (which reads ?k=) and the submissions API (x-review-key header)
 * check through here, so the two can never drift. Read env dynamically at
 * request time: these are server vars, never NEXT_PUBLIC_, so they are never
 * inlined into a client bundle.
 *
 * Both sides are hashed before comparing so timingSafeEqual always gets
 * equal-length buffers - it throws on a length mismatch, and that throw would
 * itself leak the expected key's length.
 */

/** The env var holding a given language's reviewer key, plus the fr fallback. */
function expectedKeyFor(lang: string): string | undefined {
  const perLang = process.env[`REVIEW_KEY_${lang.toUpperCase()}`]
  if (perLang) return perLang
  if (lang === 'fr') return process.env.REVIEW_KEY // legacy single-key fallback
  return undefined
}

export function reviewKeyMatches(lang: string, supplied: string | null | undefined): boolean {
  const expected = expectedKeyFor(lang)
  if (!supplied || !expected) return false
  const a = createHash('sha256').update(supplied).digest()
  const b = createHash('sha256').update(expected).digest()
  return timingSafeEqual(a, b)
}
