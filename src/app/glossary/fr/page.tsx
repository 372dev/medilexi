import baseData from '@/data/medical_vocab.json'
import frData from '@/data/medical_vocab_fr.json'
import { normalizeLvl } from '@/lib/vocab-constants'
import { slugify } from '@/lib/slug'
import FrGlossaryList, { type FrLeanEntry } from './FrGlossaryList'

/* Server shell for the French glossary. Only entries with a French translation
   are shown (filtered on fr_h). Ships a lean index (adds fr_h / fr_l);
   definitions (d_fr / d) + word-part segments load per chunk from
   /api/defs?lang=fr. */

interface BaseEntry { en_h: string; en_l?: string; abbr?: string; f: string[]; lvl: number }
interface FrEntry { en_h: string; fr_h: string; fr_l?: string }

const frMap = new Map<string, FrEntry>()
for (const k of frData as unknown as FrEntry[]) frMap.set(k.en_h, k)

const entries: FrLeanEntry[] = (baseData as unknown as BaseEntry[])
  .filter(v => !!frMap.get(v.en_h)?.fr_h)
  .map(v => {
    const k = frMap.get(v.en_h)!
    return {
      en_h: v.en_h,
      slug: slugify(v.en_h),
      abbr: v.abbr,
      en_l: v.en_l,
      fr_h: k.fr_h,
      fr_l: k.fr_l,
      f: v.f,
      lvl: normalizeLvl(v.lvl),
    }
  })

const allFields = Array.from(new Set(entries.flatMap(e => e.f))).sort()

export default function FrGlossaryPage() {
  return <FrGlossaryList entries={entries} allFields={allFields} />
}
