'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Fuse from 'fuse.js'
import baseData from '@/data/medical_vocab.json'
import frData from '@/data/medical_vocab_fr.json'
import partsData from '@/data/medical_wordparts_simple.json'
import { ALL_LEVELS, STARS, STAR_CLASS } from '@/lib/vocab-constants'

interface BaseEntry { en_h: string; en_l?: string; abbr?: string; f: string[]; d: string; lvl: string; parts?: { p?: string[]; r?: string[]; s?: string[] } }
interface FrEntry  { en_h: string; fr_h: string; fr_l?: string; d_fr?: string }
interface WordPart { wp: string; t: 'p'|'r'|'s'; d: string }
interface MergedEntry extends BaseEntry { fr_h: string; fr_l?: string; d_fr?: string }

const base     = baseData as BaseEntry[]
const partsMap = Object.fromEntries((partsData as WordPart[]).map(p => [p.wp, p]))
const frMap    = Object.fromEntries((frData as FrEntry[]).map(k => [k.en_h, k]))
const vocab: MergedEntry[] = base
  .map(v => ({ ...v, ...frMap[v.en_h] }))
  .filter((v): v is MergedEntry => !!(v as MergedEntry).fr_h)

function toLiteral(wp: string) {
  return wp.replace(/^-|-$/g,'').replace(/\/[oiea]$/,'').replace(/\//g,'').toLowerCase()
}
interface Segment { text: string; wp?: string; type?: 'p'|'r'|'s'; meaning?: string }
function getSegments(en_h: string, parts?: BaseEntry['parts']): Segment[] {
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

const LVL_CARD_CLASS: Record<string,string> = { '⭐⭐⭐ Essential':'c-card--lvl3', '⭐⭐ Important':'c-card--lvl2', '⭐ Good to know':'c-card--lvl1' }
const ALL_FIELDS = Array.from(new Set(vocab.flatMap(v => v.f))).sort()

const FR_FIELD_PRIORITY: Record<string, number> = {
  fr_h: 0, en_h: 0, abbr: 1, fr_l: 2, en_l: 2, d_fr: 3, d: 3,
}

const fuseFr = new Fuse(vocab, {
  keys: [
    { name: 'fr_h', weight: 2   },
    { name: 'en_h', weight: 2   },
    { name: 'abbr', weight: 1.5 },
    { name: 'fr_l', weight: 1   },
    { name: 'en_l', weight: 1   },
    { name: 'd_fr', weight: 0.5 },
    { name: 'd',    weight: 0.5 },
  ],
  threshold: 0.4,
  minMatchCharLength: 2,
  ignoreLocation: true,
  includeScore: true,
  includeMatches: true,
})

function FrCard({ v, defLang, onFieldClick }: { v: MergedEntry; defLang: 'fr' | 'en'; onFieldClick: (f: string) => void }) {
  const [hovered, setHovered] = useState(false)
  const segs = useMemo(() => getSegments(v.en_h, v.parts), [v])
  const definition = defLang === 'en' ? v.d : (v.d_fr || v.d)
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
      {v.en_l && <div style={{ fontSize:'1rem', color:'var(--color-text-dim)', marginBottom:'0.3rem' }}>{v.en_l}</div>}
      <div style={{ fontSize:'1.05rem', fontWeight:600, color:'var(--color-text)', marginBottom:'0.1rem' }}>{v.fr_h}</div>
      {v.fr_l && <div style={{ fontSize:'0.95rem', color:'var(--color-text-dim)', marginBottom:'0.1rem' }}>{v.fr_l}</div>}
      <p style={{ fontSize:'0.88rem', color:'var(--color-text-dim)', lineHeight:1.6, marginBottom:'0.65rem' }}>{definition}</p>
      <div style={{ display:'flex', flexWrap:'wrap', gap:'0.3rem' }}>
        {v.f.map(f => (
          <button key={f} className="c-field-badge" onClick={() => onFieldClick(f)}>{f}</button>
        ))}
      </div>
    </div>
  )
}

export default function FrGlossaryPage() {
  const [search, setSearch]     = useState('')
  const [fieldFilter, setField] = useState<string|null>(null)
  const [levelFilter, setLevel] = useState<string|null>(null)
  const [defLang, setDefLang]   = useState<'fr'|'en'>('fr')

  const filtered = useMemo(() => {
    const q = search.trim()

    if (!q) {
      return vocab.filter(v => {
        if (fieldFilter && !v.f.includes(fieldFilter)) return false
        if (levelFilter && v.lvl !== levelFilter) return false
        return true
      })
    }

    return fuseFr.search(q)
      .sort((a, b) => {
        const pa = Math.min(...(a.matches?.map(m => FR_FIELD_PRIORITY[m.key ?? ''] ?? 99) ?? [99]))
        const pb = Math.min(...(b.matches?.map(m => FR_FIELD_PRIORITY[m.key ?? ''] ?? 99) ?? [99]))
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
          <input
            className="c-search"
            type="text"
            placeholder="Search terms in French or English..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select className="c-field-drop" value={fieldFilter||''} onChange={e => setField(e.target.value||null)}>
            <option value="">All Fields</option>
            {ALL_FIELDS.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
          <Link href="/flashcards/fr" className="c-btn-pixel" style={{ fontSize:'0.5rem', whiteSpace:'nowrap', padding:'0 1rem', display:'flex', alignItems:'center' }}>
            Flashcard →
          </Link>
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:'0.75rem', flexWrap:'wrap' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', flexWrap:'wrap' }}>
            <div className="c-filter-row" style={{ marginBottom:0 }}>
              <button className={`c-pill ${!levelFilter?'c-pill--active':''}`} onClick={() => setLevel(null)}>All</button>
              {ALL_LEVELS.map(lvl => (
                <button key={lvl} className={`c-pill c-pill--star ${levelFilter===lvl?'c-pill--active':''}`} onClick={() => setLevel(levelFilter===lvl?null:lvl)}>
                  {STARS[lvl]}
                </button>
              ))}
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
              <span style={{ fontFamily:'var(--font-pixel)', fontSize:'0.42rem', color:'var(--color-text-dim)', whiteSpace:'nowrap', lineHeight:1.8 }}>Definition:</span>
              <div className="c-toggle">
                <button className={`c-toggle__btn ${defLang==='fr'?'c-toggle__btn--active':''}`} onClick={() => setDefLang('fr')}>French</button>
                <button className={`c-toggle__btn ${defLang==='en'?'c-toggle__btn--active':''}`} onClick={() => setDefLang('en')}>English</button>
              </div>
            </div>
          </div>
          <span className="c-count" style={{ marginBottom:0 }}>{filtered.length} terms</span>
        </div>
      </div>

      {/* ── Cards ── */}
      <div className="c-grid">
        {filtered.map((v,i) => <FrCard key={i} v={v} defLang={defLang} onFieldClick={f => setField(f === fieldFilter ? null : f)} />)}
      </div>
      {filtered.length === 0 && <div className="c-empty">No terms found.</div>}
    </>
  )
}
