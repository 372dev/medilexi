import { NextResponse } from 'next/server'
import partsData from '@/data/medical_wordparts.json'

/* On-demand examples for the word-parts glossary. The list ships only the lean
   parts (wp, type, level, meaning); the heavy example set (the 448 KB master
   file) stays on the server and each visible chunk fetches its examples here. */

interface WP { wp: string; ex: [string, string][] }

const exByWp = new Map<string, [string, string][]>()
for (const p of partsData as unknown as WP[]) exByWp.set(p.wp, p.ex)

export function GET(req: Request) {
  // Parse ids from the RAW query and split on the delimiter commas BEFORE
  // decoding: a wp can itself contain a comma (e.g. "a-, an-"), and the client
  // percent-encodes each id, so a data comma arrives as %2C, not a delimiter.
  const raw = /[?&]ids=([^&]*)/.exec(req.url)?.[1] || ''
  const ids = raw.split(',')
    .map(s => { try { return decodeURIComponent(s).trim() } catch { return s.trim() } })
    .filter(Boolean).slice(0, 80)

  const out: Record<string, [string, string][]> = {}
  for (const wp of ids) {
    const ex = exByWp.get(wp)
    if (ex) out[wp] = ex
  }

  return NextResponse.json(out, {
    headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800' },
  })
}
