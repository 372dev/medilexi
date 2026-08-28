import vocabData from '@/data/medical_vocab.json'
import { normalizeLvl } from '@/lib/vocab-constants'
import { slugify } from '@/lib/slug'
import GlossaryList, { type LeanEntry } from './GlossaryList'

/* Server shell. Reads the full vocab on the server and ships only a LEAN search
   index to the client (no definitions / word parts) — those are fetched per
   visible chunk from /api/defs. Keeps the client payload small and flat as the
   corpus and language layers grow. */

interface FullEntry { en_h: string; en_l?: string; abbr?: string; f: string[]; lvl: number }

const entries: LeanEntry[] = (vocabData as unknown as FullEntry[]).map(v => ({
  en_h: v.en_h,
  slug: slugify(v.en_h),
  abbr: v.abbr,
  en_l: v.en_l,
  f: v.f,
  lvl: normalizeLvl(v.lvl),
}))
const allFields = Array.from(new Set(entries.flatMap(e => e.f))).sort()

export default function GlossaryPage() {
  return <GlossaryList entries={entries} allFields={allFields} />
}
