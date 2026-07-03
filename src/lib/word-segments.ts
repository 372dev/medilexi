// Word-part highlighting: split a term into segments, marking the spans that
// correspond to its tagged prefix/root/suffix parts. Shared by the English,
// Korean, and French glossary cards.

export interface WordPartRef {
  p?: string[]
  r?: string[]
  s?: string[]
}

export interface Segment {
  text: string
  wp?: string
  type?: 'p' | 'r' | 's'
  meaning?: string
}

// Reduce a word-part slug to the literal substring the frontend highlights:
// strip leading/trailing hyphens and the trailing connecting vowel (/o /i /e /a),
// drop remaining slashes, lowercase. e.g. "-ectomy" -> "ectomy", "cardi/o" -> "cardi".
export function toLiteral(wp: string): string {
  return wp.replace(/^-|-$/g, '').replace(/\/[oiea]$/, '').replace(/\//g, '').toLowerCase()
}

// Split `en_h` into text/part segments. A span is marked when a part's literal is
// an exact lowercase substring of the term (first-come, non-overlapping). `meaningOf`
// resolves a part's tooltip text; defaults to empty so the function stays pure/testable.
export function getSegments(
  en_h: string,
  parts?: WordPartRef,
  meaningOf: (wp: string) => string = () => '',
): Segment[] {
  if (!parts) return [{ text: en_h }]
  const typeMap: Record<string, 'p' | 'r' | 's'> = { p: 'p', r: 'r', s: 's' }
  const allParts = Object.entries(parts).flatMap(([ptype, wpList]) =>
    (wpList as string[]).map(wp => ({ literal: toLiteral(wp), wp, type: typeMap[ptype], meaning: meaningOf(wp) }))
  ).filter(p => p.literal.length >= 2)
  if (!allParts.length) return [{ text: en_h }]
  const lower = en_h.toLowerCase()
  const matches: { start: number; end: number; wp: string; type: 'p' | 'r' | 's'; meaning: string }[] = []
  for (const part of allParts) {
    let idx = lower.indexOf(part.literal)
    while (idx !== -1) {
      if (!matches.some(m => idx < m.end && idx + part.literal.length > m.start))
        matches.push({ start: idx, end: idx + part.literal.length, wp: part.wp, type: part.type, meaning: part.meaning })
      idx = lower.indexOf(part.literal, idx + 1)
    }
  }
  if (!matches.length) return [{ text: en_h }]
  matches.sort((a, b) => a.start - b.start)
  const segs: Segment[] = []; let cursor = 0
  for (const m of matches) {
    if (m.start > cursor) segs.push({ text: en_h.slice(cursor, m.start) })
    segs.push({ text: en_h.slice(m.start, m.end), wp: m.wp, type: m.type, meaning: m.meaning })
    cursor = m.end
  }
  if (cursor < en_h.length) segs.push({ text: en_h.slice(cursor) })
  return segs
}
