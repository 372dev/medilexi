import { NextResponse } from 'next/server'
import vocabData from '@/data/medical_vocab.json'
import koData from '@/data/medical_vocab_ko.json'
import frData from '@/data/medical_vocab_fr.json'
import partsData from '@/data/medical_wordparts_simple.json'
import { slugify } from '@/lib/slug'
import { getSegments, type WordPartRef, type Segment } from '@/lib/word-segments'

/* On-demand definitions + word-part segments for the glossary lists.
   The lists ship only a lean search index; each visible chunk of cards fetches
   its definitions here (GET so the CDN can cache — definitions are static
   between deploys). Word-part segments are pre-computed server-side so the
   635-entry meaning table never reaches the client. */

interface VocabEntry { en_h: string; d: string; parts?: WordPartRef }
interface LangEntry { en_h: string; d_ko?: string; d_fr?: string }
interface WP { wp: string; t: string; d: string }

// Built once per server instance.
const partsMap: Record<string, string> = {}
for (const p of partsData as WP[]) partsMap[p.wp] = p.d

const bySlug = new Map<string, VocabEntry>()
for (const v of vocabData as unknown as VocabEntry[]) bySlug.set(slugify(v.en_h), v)

const koDef = new Map<string, string>()
for (const k of koData as unknown as LangEntry[]) if (k.d_ko) koDef.set(slugify(k.en_h), k.d_ko)
const frDef = new Map<string, string>()
for (const f of frData as unknown as LangEntry[]) if (f.d_fr) frDef.set(slugify(f.en_h), f.d_fr)

type DefRec = { d: string; segs: Segment[] | null; d2?: string | null }

export function GET(req: Request) {
  const url = new URL(req.url)
  const lang = url.searchParams.get('lang') || 'en'
  const ids = (url.searchParams.get('ids') || '')
    .split(',').map(s => s.trim()).filter(Boolean).slice(0, 80)   // cap the chunk

  const out: Record<string, DefRec> = {}
  for (const slug of ids) {
    const v = bySlug.get(slug)
    if (!v) continue
    const segs = v.parts ? getSegments(v.en_h, v.parts, wp => partsMap[wp] || '') : null
    const rec: DefRec = { d: v.d, segs }
    if (lang === 'ko') rec.d2 = koDef.get(slug) ?? null
    else if (lang === 'fr') rec.d2 = frDef.get(slug) ?? null
    out[slug] = rec
  }

  return NextResponse.json(out, {
    headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800' },
  })
}
