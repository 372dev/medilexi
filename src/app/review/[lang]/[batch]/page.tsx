import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { flagsFor, type ReviewEntry } from '@/lib/review-batches'
import { reviewKeyMatches } from '@/lib/review-auth'
import { isReviewLang, LANG_META, type ReviewLang } from '@/lib/review-langs'
import { getReviewItems, type ReviewItem } from '@/lib/server-db'
import vocabData from '@/data/medical_vocab.json'
import frData from '@/data/medical_vocab_fr.json'
import koData from '@/data/medical_vocab_ko.json'
import ReviewClient from './ReviewClient'

// The key is checked per request AND the queue is read from the DB, so this
// route can never be prerendered.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
  title: 'Review · Medi Lexi',
}

type Vocab = { en_h: string; en_l?: string; f: string[]; d: string; lvl: number }
type Target = { h: string; l: string; d: string }

const VOCAB = new Map(
  (vocabData as unknown as Vocab[]).map((v) => [v.en_h, v]),
)

// Live target triple for FR/KO, keyed by en_h. ES/JA carry their triple on the
// review_items row instead (no shipped data file).
const LIVE_TARGET: Record<ReviewLang, Map<string, Target> | null> = {
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

function targetFor(lang: ReviewLang, item: ReviewItem): Target | null {
  const live = LIVE_TARGET[lang]
  if (live) return live.get(item.en_h) ?? null
  // es/ja: the triple rides on the flagged row.
  if (item.src_h == null && item.src_l == null && item.src_d == null) return null
  return { h: item.src_h ?? '', l: item.src_l ?? '', d: item.src_d ?? '' }
}

export default async function ReviewPage({
  params,
  searchParams,
}: {
  params: { lang: string; batch: string }
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const { lang, batch: slug } = params
  const supplied = typeof searchParams.k === 'string' ? searchParams.k : undefined

  // Wrong/missing key or unknown language 404s (an unauthorized visitor learns
  // nothing about the route).
  if (!isReviewLang(lang) || !reviewKeyMatches(lang, supplied)) notFound()

  // The flagged queue for this language (optionally one batch; 'all' = everything).
  let items: ReviewItem[] = []
  try {
    items = await getReviewItems(lang, slug)
  } catch {
    // DB down/misconfigured: render an empty queue rather than a hard error.
    items = []
  }

  const entries: ReviewEntry[] = items.flatMap((item) => {
    const en = VOCAB.get(item.en_h)
    const t = targetFor(lang, item)
    if (!en || !t) return [] // flagged en_h no longer in the glossary, or missing target
    return [
      {
        k: item.en_h,
        el: en.en_l ?? '',
        ed: en.d,
        lv: en.lvl,
        th: t.h,
        tl: t.l,
        td: t.d,
        fg: flagsFor(lang, t.h, t.d, item.en_h),
        cn: item.concern ?? '',
      },
    ]
  })

  const title = slug === 'all' ? `${LANG_META[lang].label}` : slug

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
