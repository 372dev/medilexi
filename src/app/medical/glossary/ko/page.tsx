import baseData from '@/data/medical_vocab.json'
import koData from '@/data/medical_vocab_ko.json'
import { normalizeLvl } from '@/lib/vocab-constants'
import { slugify } from '@/lib/slug'
import KoGlossaryList, { type KoLeanEntry } from './KoGlossaryList'

/* Server shell for the Korean glossary. Ships a lean index (adds ko_h / ko_l to
   the base lean fields); definitions (d_ko / d) + word-part segments are fetched
   per visible chunk from /api/defs?lang=ko. */

interface BaseEntry { en_h: string; en_l?: string; abbr?: string; f: string[]; lvl: number }
interface KoEntry { en_h: string; ko_h: string; ko_l?: string }

const koMap = new Map<string, KoEntry>()
for (const k of koData as unknown as KoEntry[]) koMap.set(k.en_h, k)

const entries: KoLeanEntry[] = (baseData as unknown as BaseEntry[]).map(v => {
  const k = koMap.get(v.en_h)
  return {
    en_h: v.en_h,
    slug: slugify(v.en_h),
    abbr: v.abbr,
    en_l: v.en_l,
    ko_h: k?.ko_h || '',
    ko_l: k?.ko_l,
    f: v.f,
    lvl: normalizeLvl(v.lvl),
  }
})
const allFields = Array.from(new Set(entries.flatMap(e => e.f))).sort()

export default function KoGlossaryPage() {
  return <KoGlossaryList entries={entries} allFields={allFields} />
}
