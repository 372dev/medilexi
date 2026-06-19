'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Fuse from 'fuse.js'
import vocabData from '@/data/medical_vocab.json'
import partsData from '@/data/medical_wordparts_simple.json'

interface VocabEntry {
  en_h: string; en_l?: string; abbr?: string
  f: string[]; d: string; lvl: string
  parts?: { p?: string[]; r?: string[]; s?: string[] }
}
interface WordPart { wp: string; t: 'p'|'r'|'s'; d: string }

const vocab = vocabData as VocabEntry[]
const partsMap = Object.fromEntries((partsData as WordPart[]).map(p => [p.wp, p]))

const FIELD_PRIORITY: Record<string, number> = { en_h: 0, abbr: 1, en_l: 2, d: 3 }

const fuse = new Fuse(vocab, {
  keys: [
    { name: 'en_h', weight: 2   },
    { name: 'abbr', weight: 1.5 },
    { name: 'en_l', weight: 1   },
    { name: 'd',    weight: 0.5 },
  ],
  threshold: 0.4,
  minMatchCharLength: 2,
  ignoreLocation: true,
  includeScore: true,
  includeMatches: true,
})

function toLiteral(wp: string) {
  return wp.replace(/^-|-$/g,'').replace(/\/[oiea]$/,'').replace(/\//g,'').toLowerCase()
}
interface Segment { text: string; wp?: string; type?: 'p'|'r'|'s'; meaning?: string }
function getSegments(en_h: string, parts?: VocabEntry['parts']): Segment[] {
  if (!parts) return [{ text: en_h }]
  const typeMap: Record<string,'p'|'r'|'s'> = { p:'p', r:'r', s:'s' }
  const allParts = Object.entries(parts).flatMap(([ptype, wpList]) =>
    (wpList as string[]).map(wp => ({ literal: toLiteral(wp), wp, type: typeMap[ptype], meaning: partsMap[wp]?.d||'' }))
  ).filter(p => p.literal.length >= 2)
  if (!allParts.length) return [{ text: en_h }]
  const lower = en_h.toLowerCase()
  const matches: { start:number; end:number; wp:string; type:'p'|'r'|'s'; meaning:string }[] = []
  for (const part of allParts) {
    let idx = lower.indexOf(part.literal)
    while (idx !== -1) {
      if (!matches.some(m => idx < m.end && idx + part.literal.length > m.start))
        matches.push({ start:idx, end:idx+part.literal.length, wp:part.wp, type:part.type, meaning:part.meaning })
      idx = lower.indexOf(part.literal, idx+1)
    }
  }
  if (!matches.length) return [{ text: en_h }]
  matches.sort((a,b) => a.start-b.start)
  const segs: Segment[] = []; let cursor = 0
  for (const m of matches) {
    if (m.start > cursor) segs.push({ text: en_h.slice(cursor, m.start) })
    segs.push({ text: en_h.slice(m.start, m.end), wp:m.wp, type:m.type, meaning:m.meaning })
    cursor = m.end
  }
  if (cursor < en_h.length) segs.push({ text: en_h.slice(cursor) })
  return segs
}

const STARS: Record<string,string> = { '⭐⭐⭐ Essential':'⭐⭐⭐', '⭐⭐ Important':'⭐⭐', '⭐ Good to know':'⭐' }
const STAR_CLASS: Record<string,string> = { '⭐⭐⭐ Essential':'c-stars--3', '⭐⭐ Important':'c-stars--2', '⭐ Good to know':'c-stars--1' }
const LVL_CARD_CLASS: Record<string,string> = { '⭐⭐⭐ Essential':'c-card--lvl3', '⭐⭐ Important':'c-card--lvl2', '⭐ Good to know':'c-card--lvl1' }
const ALL_FIELDS = Array.from(new Set(vocab.flatMap(v => v.f))).sort()
const ALL_LEVELS = ['⭐⭐⭐ Essential','⭐⭐ Important','⭐ Good to know']

function Card({ v, onFieldClick }: { v: VocabEntry; onFieldClick: (f: string) => void }) {
  const [hovered, setHovered] = useState(false)
  const segs = useMemo(() => getSegments(v.en_h, v.parts), [v])
  return (
    <div className={`c-card ${LVL_CARD_CLASS[v.lvl]||''}`} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.5rem' }}>
        <span className={`c-stars ${STAR_CLASS[v.lvl]||''}`}>{STARS[v.lvl]}</span>
        {v.abbr && <span className="c-abbr">{v.abbr}</span>}
      </div>
      <div style={{ fontSize:'1.15rem', fontWeight:700, color:'var(--color-text)', marginBottom:'0.15rem', lineHeight:1.3 }}>
        {hovered && v.parts ? segs.map((s,i) => s.wp
          ? <span key={i} className={`c-part-highlight c-part-${s.type}`} data-tooltip={`${s.wp} · ${s.meaning}`}>{s.text}</span>
          : <span key={i}>{s.text}</span>) : v.en_h}
      </div>
      {v.en_l && <div style={{ fontSize:'1rem', color:'var(--color-text-dim)', marginBottom:'0.4rem' }}>{v.en_l}</div>}
      <p style={{ fontSize:'0.88rem', color:'var(--color-text-dim)', lineHeight:1.6, marginBottom:'0.65rem' }}>{v.d}</p>
      <div style={{ display:'flex', flexWrap:'wrap', gap:'0.3rem' }}>
        {v.f.map(f => (
          <button key={f} className="c-field-badge" onClick={() => onFieldClick(f)}>{f}</button>
        ))}
      </div>
    </div>
  )
}

export default function GlossaryPage() {
  const [search, setSearch]     = useState('')
  const [fieldFilter, setField] = useState<string|null>(null)
  const [levelFilter, setLevel] = useState<string|null>(null)

  const filtered = useMemo(() => {
    const q = search.trim()

    if (!q) {
      return vocab.filter(v => {
        if (fieldFilter && !v.f.includes(fieldFilter)) return false
        if (levelFilter && v.lvl !== levelFilter) return false
        return true
      })
    }

    return fuse.search(q)
      .sort((a, b) => {
        const pa = Math.min(...(a.matches?.map(m => FIELD_PRIORITY[m.key ?? ''] ?? 99) ?? [99]))
        const pb = Math.min(...(b.matches?.map(m => FIELD_PRIORITY[m.key ?? ''] ?? 99) ?? [99]))
        if (pa !== pb) return pa - pb
        return (a.score ?? 1) - (b.score ?? 1)
      })
      .map(r => r.item)
      .filter(v => {
        if (fieldFilter && !v.f.includes(fieldFilter)) return false
        if (levelFilter && v.lvl !== levelFilter) return false
        return true
      })
  }, [search, fieldFilter, levelFilter])

  return (
    <>
      {/* ── Sticky filter bar ── */}
      <div className="c-filter-bar">
        <div className="c-search-row">
          <input className="c-search" type="text" placeholder="Search terms, abbreviations, definitions..." value={search} onChange={e => setSearch(e.target.value)} />
          <select className="c-field-drop" value={fieldFilter||''} onChange={e => setField(e.target.value||null)}>
            <option value="">All Fields</option>
            {ALL_FIELDS.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
          <Link href="/flashcards" className="c-btn-pixel" style={{ fontSize:'0.5rem', whiteSpace:'nowrap', padding:'0 1rem', display:'flex', alignItems:'center' }}>
            Flashcard →
          </Link>
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:'0.75rem', flexWrap:'wrap' }}>
          <div className="c-filter-row" style={{ marginBottom:0 }}>
            <button className={`c-pill ${!levelFilter?'c-pill--active':''}`} onClick={() => setLevel(null)}>All</button>
            {ALL_LEVELS.map(lvl => (
              <button key={lvl} className={`c-pill c-pill--star ${levelFilter===lvl?'c-pill--active':''}`} onClick={() => setLevel(levelFilter===lvl?null:lvl)}>
                {STARS[lvl]}
              </button>
            ))}
          </div>
          <span className="c-count" style={{ marginBottom:0 }}>{filtered.length} terms</span>
        </div>
      </div>

      {/* ── Cards ── */}
      <div className="c-grid">
        {filtered.map((v,i) => <Card key={i} v={v} onFieldClick={f => setField(f === fieldFilter ? null : f)} />)}
      </div>
      {filtered.length === 0 && <div className="c-empty">No terms found.</div>}
    </>
  )
}
