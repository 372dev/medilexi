import partsData from '@/data/medical_wordparts.json'
import WordPartsList, { type LeanPart } from './WordPartsList'

/* Server shell. Ships only the lean parts (wp, type, level, meaning); the heavy
   example set (the 448 KB master file) stays server-side and loads per visible
   chunk from /api/wpex. */

interface FullPart { wp: string; t: 'p' | 'r' | 's'; lvl: 1 | 2 | 3; d: string }

const parts: LeanPart[] = (partsData as unknown as FullPart[]).map(p => ({
  wp: p.wp, t: p.t, lvl: p.lvl, d: p.d,
}))

export default function WordPartsPage() {
  return <WordPartsList parts={parts} />
}
