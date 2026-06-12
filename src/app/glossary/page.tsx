'use client'

import { useState, useMemo } from 'react'
import baseData from '@/data/medical_vocab_v1.18.json'
import partsData from '@/data/medical_wordparts_simple_v1.05.json'
import styles from './glossary.module.css'

interface BaseEntry {
  en_h: string
  en_l?: string
  abbr?: string
  f: string[]
  d: string
  lvl: string
  parts?: { p?: string[]; r?: string[]; s?: string[] }
}

interface WordPart { wp: string; t: 'p' | 'r' | 's'; d: string }

const vocab = baseData as BaseEntry[]
const partsMap = Object.fromEntries((partsData as WordPart[]).map(p => [p.wp, p]))

function toLiteral(wp: string): string {
  return wp.replace(/^-|-$/g, '').replace(/\/[oiea]$/, '').replace(/\//g, '').toLowerCase()
}

interface Segment { text: string; wp?: string; type?: 'p'|'r'|'s'; meaning?: string }

function getSegments(en_h: string, parts?: BaseEntry['parts']): Segment[] {
  if (!parts) return [{ text: en_h }]
  const allParts: { literal: string; wp: string; type: 'p'|'r'|'s'; meaning: string }[] = []
  const typeMap: Record<string,'p'|'r'|'s'> = { p:'p', r:'r', s:'s' }
  for (const [ptype, wpList] of Object.entries(parts)) {
    for (const wp of wpList as string[]) {
      const literal = toLiteral(wp)
      if (literal.length < 2) continue
      allParts.push({ literal, wp, type: typeMap[ptype], meaning: partsMap[wp]?.d || '' })
    }
  }
  if (!allParts.length) return [{ text: en_h }]
  const lower = en_h.toLowerCase()
  const matches: { start: number; end: number; wp: string; type: 'p'|'r'|'s'; meaning: string }[] = []
  for (const part of allParts) {
    let idx = lower.indexOf(part.literal)
    while (idx !== -1) {
      const overlaps = matches.some(m => idx < m.end && idx + part.literal.length > m.start)
      if (!overlaps) matches.push({ start: idx, end: idx + part.literal.length, wp: part.wp, type: part.type, meaning: part.meaning })
      idx = lower.indexOf(part.literal, idx + 1)
    }
  }
  if (!matches.length) return [{ text: en_h }]
  matches.sort((a, b) => a.start - b.start)
  const segments: Segment[] = []
  let cursor = 0
  for (const m of matches) {
    if (m.start > cursor) segments.push({ text: en_h.slice(cursor, m.start) })
    segments.push({ text: en_h.slice(m.start, m.end), wp: m.wp, type: m.type, meaning: m.meaning })
    cursor = m.end
  }
  if (cursor < en_h.length) segments.push({ text: en_h.slice(cursor) })
  return segments
}

const LEVEL_STARS: Record<string,string> = {
  '⭐⭐⭐ Essential':'⭐⭐⭐','⭐⭐ Important':'⭐⭐','⭐ Good to know':'⭐'
}
const LEVEL_CLASS: Record<string,string> = {
  '⭐⭐⭐ Essential': styles.lvlEssential,
  '⭐⭐ Important':  styles.lvlImportant,
  '⭐ Good to know': styles.lvlGood,
}
const PART_CLASS: Record<string,string> = { p: styles.partP, r: styles.partR, s: styles.partS }
const ALL_FIELDS = Array.from(new Set(vocab.flatMap(v => v.f))).sort()
const ALL_LEVELS = ['⭐⭐⭐ Essential','⭐⭐ Important','⭐ Good to know']

function GlossaryCard({ v }: { v: BaseEntry }) {
  const [hovered, setHovered] = useState(false)
  const segments = useMemo(() => getSegments(v.en_h, v.parts), [v])
  return (
    <div className={styles.card} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div className={styles.cardTop}>
        <span className={`${styles.lvl} ${LEVEL_CLASS[v.lvl]||''}`}>{LEVEL_STARS[v.lvl]}</span>
        {v.abbr && <span className={styles.abbr}>{v.abbr}</span>}
      </div>
      <div className={styles.enH}>
        {hovered && v.parts
          ? segments.map((seg,i) => seg.wp
              ? <span key={i} className={`${styles.partHighlight} ${PART_CLASS[seg.type!]}`} data-tooltip={`${seg.wp} · ${seg.meaning}`}>{seg.text}</span>
              : <span key={i}>{seg.text}</span>)
          : v.en_h}
      </div>
      {v.en_l && <div className={styles.enL}>{v.en_l}</div>}
      <p className={styles.def}>{v.d}</p>
      <div className={styles.fields}>{v.f.map(f => <span key={f} className={styles.fieldBadge}>{f}</span>)}</div>
    </div>
  )
}

export default function GlossaryPage() {
  const [search, setSearch]     = useState('')
  const [fieldFilter, setField] = useState<string|null>(null)
  const [levelFilter, setLevel] = useState<string|null>(null)
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return vocab.filter(v => {
      if (fieldFilter && !v.f.includes(fieldFilter)) return false
      if (levelFilter && v.lvl !== levelFilter) return false
      if (!q) return true
      return v.en_h.toLowerCase().includes(q) || (v.en_l||'').toLowerCase().includes(q) || (v.abbr||'').toLowerCase().includes(q)
    })
  }, [search, fieldFilter, levelFilter])

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <a href="/" className={styles.back}>← Home</a>
        <h1 className={styles.title}>English Glossary</h1>
        <span className={styles.count}>{filtered.length} terms</span>
      </header>
      <div className={styles.searchWrap}>
        <input className={styles.search} type="text" placeholder="Search terms, abbreviations..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div className={styles.filterRow}>
        <button className={`${styles.pill} ${!levelFilter?styles.pillActive:''}`} onClick={() => setLevel(null)}>All</button>
        {ALL_LEVELS.map(lvl => <button key={lvl} className={`${styles.pill} ${levelFilter===lvl?styles.pillActive:''}`} onClick={() => setLevel(levelFilter===lvl?null:lvl)}>{LEVEL_STARS[lvl]}</button>)}
      </div>
      <div className={styles.fieldDropWrap}>
        <select
          className={styles.fieldDrop}
          value={fieldFilter || ''}
          onChange={e => setField(e.target.value || null)}
        >
          <option value="">All Fields</option>
          {ALL_FIELDS.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
      </div>
      <div className={styles.grid}>
        {filtered.map((v,i) => <GlossaryCard key={i} v={v} />)}
      </div>
      {filtered.length === 0 && <div className={styles.empty}>No terms found.</div>}
    </div>
  )
}
