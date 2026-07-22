import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { REVIEW_BATCHES, flagsFor, type ReviewEntry } from '@/lib/review-batches'
import { reviewKeyMatches } from '@/lib/review-auth'
import vocabData from '@/data/medical_vocab.json'
import frData from '@/data/medical_vocab_fr.json'
import ReviewClient from './ReviewClient'

// The key is checked per request, so this route can never be prerendered.
export const dynamic = 'force-dynamic'

// Internal tooling on a public domain: keep it out of every index. The sitemap
// is generated from the glossary data and never included /review.
export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
  title: 'Révision du français · Medi Lexi',
}

type Vocab = { en_h: string; en_l?: string; f: string[]; d: string; lvl: number }
type Fr = { en_h: string; fr_h: string; fr_l?: string; d_fr?: string }

const VOCAB = vocabData as unknown as Vocab[]
const FR = frData as unknown as Fr[]

export default function ReviewPage({
  params,
  searchParams,
}: {
  params: { batch: string }
  searchParams: { k?: string }
}) {
  const batch = REVIEW_BATCHES[params.batch]

  // A wrong or missing key 404s rather than 401s: an unauthorized visitor
  // should not learn that this route exists at all.
  if (!batch || !reviewKeyMatches(searchParams.k)) notFound()

  const frByKey = new Map(FR.map((e) => [e.en_h, e]))

  const entries: ReviewEntry[] = VOCAB.filter((v) => v.f[0] === batch.field).flatMap((v) => {
    const fr = frByKey.get(v.en_h)
    if (!fr) return []
    const d_fr = fr.d_fr ?? ''
    return [
      {
        k: v.en_h,
        el: v.en_l ?? '',
        ed: v.d,
        lv: v.lvl,
        fh: fr.fr_h,
        fl: fr.fr_l ?? '',
        fd: d_fr,
        fg: flagsFor(fr.fr_h, d_fr, v.en_h),
      },
    ]
  })

  return (
    <ReviewClient
      slug={params.batch}
      title={batch.fr}
      entries={entries}
      reviewKey={searchParams.k ?? ''}
    />
  )
}
