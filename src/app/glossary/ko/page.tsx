'use client'

import { useState, useMemo, useRef, useEffect, type ReactNode } from 'react'
import Link from 'next/link'
import Fuse from 'fuse.js'
import baseData from '@/data/medical_vocab.json'
import koData from '@/data/medical_vocab_ko.json'
import partsData from '@/data/medical_wordparts_simple.json'
import { ALL_LEVELS, STARS, STAR_CLASS, LVL_CARD_CLASS, normalizeLvl } from '@/lib/vocab-constants'

interface BaseEntry { en_h: string; en_l?: string; abbr?: string; f: string[]; d: string; lvl: number; parts?: { p?: string[]; r?: string[]; s?: string[] } }
interface KoEntry { en_h: string; ko_h: string; ko_l?: string; d_ko?: string }
interface WordPart { wp: string; t: 'p'|'r'|'s'; d: string }
interface MergedEntry extends BaseEntry { ko_h: string; ko_l?: string; d_ko?: string }

const base = (baseData as any[]).map(v => ({ ...v, lvl: normalizeLvl(v.lvl) })) as BaseEntry[]
const ko = koData as KoEntry[]
const partsMap = Object.fromEntries((partsData as WordPart[]).map(p => [p.wp, p]))
const koMap = Object.fromEntries(ko.map(k => [k.en_h, k]))
const vocab: MergedEntry[] = base.map(v => ({ ...v, ko_h: koMap[v.en_h]?.ko_h||'', ko_l: koMap[v.en_h]?.ko_l, d_ko: koMap[v.en_h]?.d_ko }))

// ── Hangul jamo search ─────────────────────────────────────────────────────
const CHO  = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ']
const JUNG = ['ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ']
const JONG = ['','ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ']
const JONG_SPLIT: Record<string,string[]> = {
  ㄳ:['ㄱ','ㅅ'], ㄵ:['ㄴ','ㅈ'], ㄶ:['ㄴ','ㅎ'],
  ㄺ:['ㄹ','ㄱ'], ㄻ:['ㄹ','ㅁ'], ㄼ:['ㄹ','ㅂ'],
  ㄽ:['ㄹ','ㅅ'], ㄾ:['ㄹ','ㅌ'], ㄿ:['ㄹ','ㅍ'],
  ㅀ:['ㄹ','ㅎ'], ㅄ:['ㅂ','ㅅ'],
}

// Returns each character as an array of its component jamo.
// Syllable blocks are decomposed; lone jamo and ASCII pass through unchanged.
function syllableGroups(str: string): string[][] {
  const groups: string[][] = []
  for (const ch of str) {
    const cp = ch.charCodeAt(0)
    if (cp >= 0xAC00 && cp <= 0xD7A3) {
      const off = cp - 0xAC00
      const ci  = Math.floor(off / 28 / 21)
      const vi  = Math.floor(off / 28) % 21
      const fi  = off % 28
      const g   = [CHO[ci], JUNG[vi]]
      if (fi > 0) { const j = JONG[fi]; (JONG_SPLIT[j] ?? [j]).forEach(c => g.push(c)) }
      groups.push(g)
    } else {
      groups.push([ch])
    }
  }
  return groups
}

// Syllable-by-syllable match. The last query group uses prefix matching so
// partial syllables (e.g. mid-composition) and initial-consonant shortcuts
// (ㅎㄱㄷ matching 홍길동) both work naturally.
function hangulSearch(target: string, query: string): number {
  if (!query) return 0
  const t = syllableGroups(target)
  const q = syllableGroups(query)
  for (let i = 0; i <= t.length - q.length; i++) {
    let ok = true
    for (let j = 0; j < q.length; j++) {
      const qg = q[j].join(''), tg = t[i + j].join('')
      if (j === q.length - 1 ? !tg.startsWith(qg) : tg !== qg) { ok = false; break }
    }
    if (ok) return i
  }
  return -1
}

function isKorean(str: string) {
  return /[가-힣ᄀ-ᇿ㄰-㆏]/.test(str)
}
// ──────────────────────────────────────────────────────────────────────────

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

const ALL_FIELDS = Array.from(new Set(vocab.flatMap(v => v.f))).sort()

type MatchMap = Partial<Record<string, readonly [number,number][]>>

function hi(text: string, idx?: readonly [number,number][]): ReactNode {
  if (!idx?.length) return text
  const parts: ReactNode[] = []; let cur = 0
  for (const [s, e] of idx) {
    if (s > cur) parts.push(text.slice(cur, s))
    parts.push(<mark key={s} className="c-search-match">{text.slice(s, e+1)}</mark>)
    cur = e + 1
  }
  if (cur < text.length) parts.push(text.slice(cur))
  return <>{parts}</>
}

// Relevance tier (lower = better) for the Fuse (English / romaji) path: exact term/abbr
// → field prefix → word-start → substring → fuzzy term match → definition-only (last).
// The Korean (jamo) path keeps its own position-based scoring below.
function matchTierKo(item: MergedEntry, matches: readonly { key?: string }[] | undefined, ql: string): number {
  const terms = [item.ko_h, item.en_h, item.abbr ?? '', item.ko_l ?? '', item.en_l ?? ''].map(s => (s ?? '').toLowerCase())
  const nonEmpty = terms.filter(t => t !== '')
  if (nonEmpty.some(t => t === ql)) return 0
  if (nonEmpty.some(t => t.startsWith(ql))) return 1
  const wordStart = (s: string) => s.split(/[^\p{L}\p{N}]+/u).some(w => w.startsWith(ql))
  if (nonEmpty.some(t => wordStart(t))) return 2
  if (nonEmpty.some(t => t.includes(ql))) return 3
  const keys = new Set((matches ?? []).map(m => m.key))
  if (['ko_h', 'en_h', 'abbr', 'ko_l', 'en_l'].some(k => keys.has(k))) return 4
  return 5
}

const fuseKo = new Fuse(vocab, {
  keys: [
    { name: 'ko_h', weight: 2   },
    { name: 'en_h', weight: 2   },
    { name: 'abbr', weight: 1.5 },
    { name: 'ko_l', weight: 1   },
    { name: 'en_l', weight: 1   },
    { name: 'd_ko', weight: 0.5 },
    { name: 'd',    weight: 0.5 },
  ],
  threshold: 0.3,
  minMatchCharLength: 2,
  ignoreLocation: true,
  includeScore: true,
  includeMatches: true,
})

function KoCard({ v, defLang, onFieldClick, mm }: { v: MergedEntry; defLang: 'ko' | 'en'; onFieldClick: (f: string) => void; mm?: MatchMap }) {
  const [hovered, setHovered] = useState(false)
  const segs = useMemo(() => getSegments(v.en_h, v.parts), [v])
  const definition = defLang === 'en' ? v.d : (v.d_ko || v.d)
  const defKey = defLang === 'en' ? 'd' : 'd_ko'
  return (
    <div className={`c-card ${LVL_CARD_CLASS[v.lvl]||''}`} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.5rem' }}>
        <span className={`c-stars ${STAR_CLASS[v.lvl]||''}`}>{STARS[v.lvl]}</span>
        {v.abbr && <span className="c-abbr">{hi(v.abbr, mm?.abbr)}</span>}
      </div>
      <div style={{ fontSize:'1.15rem', fontWeight:700, color:'var(--color-text)', marginBottom:'0.15rem', lineHeight:1.3 }}>
        {hovered && v.parts ? segs.map((s,i) => s.wp
          ? <span key={i} className={`c-part-highlight c-part-${s.type}`} data-tooltip={`${s.wp} · ${s.meaning}`}>{s.text}</span>
          : <span key={i}>{s.text}</span>) : hi(v.en_h, mm?.en_h)}
      </div>
      {v.en_l && <div style={{ fontSize:'1rem', color:'var(--color-text-dim)', marginBottom:'0.3rem' }}>{hi(v.en_l, mm?.en_l)}</div>}
      {v.ko_h && <div className="ko-h">{hi(v.ko_h, mm?.ko_h)}</div>}
      {v.ko_l && <div className="ko-l">{hi(v.ko_l, mm?.ko_l)}</div>}
      <p style={{ fontSize:'0.88rem', color:'var(--color-text-dim)', lineHeight:1.6, marginBottom:'0.65rem' }}>{hi(definition, mm?.[defKey])}</p>
      <div style={{ display:'flex', flexWrap:'wrap', gap:'0.3rem' }}>
        {v.f.map(f => (
          <button key={f} className="c-field-badge" onClick={() => onFieldClick(f)}>{f}</button>
        ))}
      </div>
    </div>
  )
}

function KoGlossarySkeleton() {
  return (
    <div className="c-grid">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="c-skeleton-card">
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.75rem' }}>
            <div className="c-skeleton-line" style={{ width:'4rem', height:'0.85rem' }} />
          </div>
          <div className="c-skeleton-line" style={{ width:'70%', height:'1.1rem', marginBottom:'0.35rem' }} />
          <div className="c-skeleton-line" style={{ width:'50%', height:'0.95rem', marginBottom:'0.35rem' }} />
          <div className="c-skeleton-line" style={{ width:'40%', height:'0.9rem', marginBottom:'0.75rem' }} />
          <div className="c-skeleton-line" style={{ width:'100%', height:'0.75rem', marginBottom:'0.3rem' }} />
          <div className="c-skeleton-line" style={{ width:'80%', height:'0.75rem' }} />
        </div>
      ))}
    </div>
  )
}

export default function KoGlossaryPage() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const [inputValue, setInputValue]   = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const composingRef = useRef(false)
  const [fieldFilter, setField] = useState<string|null>(null)
  const [levelFilter, setLevel] = useState<number|null>(null)
  const [defLang, setDefLang]   = useState<'ko'|'en'>('ko')

  type CardEntry = MergedEntry & { _mm?: MatchMap }

  const filtered = useMemo((): CardEntry[] => {
    const q = searchQuery.trim()

    if (!q) {
      return vocab.filter(v => {
        if (fieldFilter && !v.f.includes(fieldFilter)) return false
        if (levelFilter && v.lvl !== levelFilter) return false
        return true
      })
    }

    const ql = q.toLowerCase()
    let results: CardEntry[]

    if (isKorean(q)) {
      // Score each entry by best Korean field match position
      type Scored = { entry: MergedEntry; pri: number; pos: number }
      const scored: Scored[] = []
      const seen = new Set<string>()

      for (const v of vocab) {
        let bestPri = Infinity, bestPos = Infinity

        const h = hangulSearch(v.ko_h, q)
        if (h !== -1) { bestPri = 0; bestPos = h }

        if (bestPri > 2 && v.ko_l) {
          const l = hangulSearch(v.ko_l, q)
          if (l !== -1) { bestPri = 2; bestPos = l }
        }

        if (bestPri > 3 && v.d_ko) {
          const d = hangulSearch(v.d_ko, q)
          if (d !== -1) { bestPri = 3; bestPos = d }
        }

        if (bestPri < Infinity) {
          scored.push({ entry: v, pri: bestPri, pos: bestPos })
          seen.add(v.en_h)
        }
      }

      scored.sort((a, b) => a.pri !== b.pri ? a.pri - b.pri : a.pos - b.pos)

      // Append Fuse results for English-field matches not already found
      const fuseRest = fuseKo.search(q)
        .sort((a, b) => {
          const ta = matchTierKo(a.item, a.matches, ql)
          const tb = matchTierKo(b.item, b.matches, ql)
          if (ta !== tb) return ta - tb
          return (a.score ?? 1) - (b.score ?? 1)
        })
        .map(r => ({ ...r.item, _mm: Object.fromEntries(r.matches?.map(m => [m.key!, m.indices]) ?? []) as MatchMap }))
        .filter(v => !seen.has(v.en_h))

      results = [...scored.map(s => s.entry), ...fuseRest]
    } else {
      results = fuseKo.search(q)
        .sort((a, b) => {
          const ta = matchTierKo(a.item, a.matches, ql)
          const tb = matchTierKo(b.item, b.matches, ql)
          if (ta !== tb) return ta - tb
          return (a.score ?? 1) - (b.score ?? 1)
        })
        .map(r => ({ ...r.item, _mm: Object.fromEntries(r.matches?.map(m => [m.key!, m.indices]) ?? []) as MatchMap }))
    }

    return results.filter(v => {
      if (fieldFilter && !v.f.includes(fieldFilter)) return false
      if (levelFilter && v.lvl !== levelFilter) return false
      return true
    })
  }, [searchQuery, fieldFilter, levelFilter])

  // True when the query has no exact/prefix/substring hit — only fuzzy "related" results.
  // Skipped for Korean (jamo) queries, whose partial/초성 matches are intentional.
  const noExact = useMemo(() => {
    const q = searchQuery.trim()
    if (!q || isKorean(q) || filtered.length === 0) return false
    return matchTierKo(filtered[0], [], q.toLowerCase()) >= 4
  }, [searchQuery, filtered])

  return (
    <>
      {/* ── Sticky filter bar ── */}
      <div className="c-filter-bar">
        <div className="c-search-row">
          <input
            className="c-search"
            type="text"
            placeholder="Search terms in English or Korean..."
            value={inputValue}
            onChange={e => {
              setInputValue(e.target.value)
              if (!composingRef.current) setSearchQuery(e.target.value)
            }}
            onCompositionStart={() => { composingRef.current = true }}
            onCompositionEnd={e => {
              composingRef.current = false
              const v = (e.target as HTMLInputElement).value
              setInputValue(v)
              setSearchQuery(v)
            }}
          />
          <select className="c-field-drop" value={fieldFilter||''} onChange={e => setField(e.target.value||null)}>
            <option value="">All Fields</option>
            {ALL_FIELDS.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
          <Link href="/flashcards/ko" className="c-btn-pixel" style={{ fontSize:'0.5rem', whiteSpace:'nowrap', padding:'0 1rem', display:'flex', alignItems:'center' }}>
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
                <button className={`c-toggle__btn ${defLang==='ko'?'c-toggle__btn--active':''}`} onClick={() => setDefLang('ko')}>Korean</button>
                <button className={`c-toggle__btn ${defLang==='en'?'c-toggle__btn--active':''}`} onClick={() => setDefLang('en')}>English</button>
              </div>
            </div>
          </div>
          <span className="c-count" style={{ marginBottom:0 }}>{filtered.length} terms</span>
        </div>
      </div>

      {/* ── Cards ── */}
      {!mounted ? <KoGlossarySkeleton /> : (
        <>
          {noExact && <div className="c-search-note">No exact match for “{searchQuery.trim()}” — showing related terms.</div>}
          <div className="c-grid">
            {filtered.map(v => <KoCard key={v.en_h} v={v} defLang={defLang} onFieldClick={f => setField(f === fieldFilter ? null : f)} mm={v._mm} />)}
          </div>
          {filtered.length === 0 && <div className="c-empty">No terms found.</div>}
        </>
      )}
    </>
  )
}
