/**
 * The languages the review tool covers, plus per-language display metadata.
 * Pure data (no JSON imports), so it is safe to import from server or client.
 *
 * FR and KO are `live` (their target comes from a shipped data file). ES and JA
 * are not live yet: they have no `_es`/`_ja` data file, so their content will
 * come from a seeded `review_items` table (Phase 2). Until then the page 404s
 * for them - an unauthorized visitor should never learn a route exists, and
 * there is genuinely nothing to review.
 */
export type ReviewLang = 'fr' | 'ko' | 'es' | 'ja'

export const REVIEW_LANGS: ReviewLang[] = ['fr', 'ko', 'es', 'ja']

export function isReviewLang(x: string): x is ReviewLang {
  return (REVIEW_LANGS as readonly string[]).includes(x)
}

export type LangMeta = {
  label: string   // native language name, shown in the UI heading
  dLimit: number  // definition char limit (matches the CLAUDE.md data rule)
  live: boolean   // true = target from a shipped data file (fr/ko); false = review_items (es/ja)
}

export const LANG_META: Record<ReviewLang, LangMeta> = {
  fr: { label: 'Français', dLimit: 260, live: true },
  ko: { label: '한국어',    dLimit: 160, live: true },
  es: { label: 'Español',  dLimit: 260, live: false },
  ja: { label: '日本語',    dLimit: 160, live: false },
}
