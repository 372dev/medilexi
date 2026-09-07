import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { REVIEW_BATCHES, flagsFor, type ReviewEntry } from '@/lib/review-batches'
import { reviewKeyMatches } from '@/lib/review-auth'
import { isReviewLang, type ReviewLang } from '@/lib/review-langs'
import vocabData from '@/data/medical_vocab.json'
import frData from '@/data/medical_vocab_fr.json'
import koData from '@/data/medical_vocab_ko.json'
import ReviewClient from './ReviewClient'

// The key is checked per request, so this route can never be prerendered.
export const dynamic = 'force-dynamic'

// Internal tooling on a public domain: keep it out of every index. The sitemap
// is generated from the glossary data and never includes /review.
export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
  title: 'Review · Medi Lexi',
}

type Vocab = { en_h: string; en_l?: string; f: string[]; d: string; lvl: number }
type Target = { h: string; l: string; d: string }

const VOCAB = vocabData as unknown as Vocab[]

// Target triple per live language, keyed by en_h. es/ja are not live yet
// (no _es/_ja data file) -> null until Phase 2 seeds review_items.
const TARGETS: Record<ReviewLang, Map<string, Target> | null> = {
  fr: new Map(
    (frData as unknown as { en_h: string; fr_h: string; fr_l?: string; d_fr?: string }[])
      .map((e) => [e.en_h, { h: e.fr_h, l: e.fr_l ?? '', d: e.d_fr ?? '' }]),
  ),
  ko: new Map(
    (koData as unknown as { en_h: string; ko_h: string; ko_l?: string; d_ko?: string }[])
      .map((e) => [e.en_h, { h: e.ko_h, l: e.ko_l ?? '', d: e.d_ko ?? '' }]),
  ),
  es: null,
  ja: null,
}

export default function ReviewPage({
  params,
  searchParams,
}: {
  params: { lang: string; batch: string }
  // Next validates page props against its generated PageProps, where
  // searchParams is an index signature; narrowing it fails the build, so take
  // the wide type and narrow here.
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const { lang, batch: slug } = params
  const supplied = typeof searchParams.k === 'string' ? searchParams.k : undefined

  // A wrong/missing key, an unknown language, or a not-yet-live language 404s
  // rather than 401s: an unauthorized visitor should not learn the route exists.
  if (!isReviewLang(lang) || !reviewKeyMatches(lang, supplied)) notFound()

  const batch = REVIEW_BATCHES[slug]
  const targets = TARGETS[lang]
  if (!batch || !targets) notFound() // es/ja (targets null) -> Phase 2

  const entries: ReviewEntry[] = VOCAB.filter((v) => v.f[0] === batch.field).flatMap((v) => {
    const t = targets.get(v.en_h)
    if (!t) return []
    return [
      {
        k: v.en_h,
        el: v.en_l ?? '',
        ed: v.d,
        lv: v.lvl,
        th: t.h,
        tl: t.l,
        td: t.d,
        fg: flagsFor(lang, t.h, t.d, v.en_h),
      },
    ]
  })

  const title = lang === 'fr' ? batch.fr : batch.field

  return (
    <ReviewClient
      lang={lang}
      slug={slug}
      title={title}
      entries={entries}
      reviewKey={supplied ?? ''}
    />
  )
}
