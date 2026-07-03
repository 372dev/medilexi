'use client'

import { useState, useMemo, useEffect, type ReactNode } from 'react'
import Link from 'next/link'
import Fuse from 'fuse.js'
import baseData from '@/data/medical_vocab.json'
import frData from '@/data/medical_vocab_fr.json'
import partsData from '@/data/medical_wordparts_simple.json'
import { ALL_LEVELS, STARS, STAR_CLASS, LVL_CARD_CLASS, LVL_TEXT, normalizeLvl } from '@/lib/vocab-constants'
import { useInfiniteReveal } from '@/lib/use-infinite-reveal'
import { getSegments } from '@/lib/word-segments'
import { rankTier } from '@/lib/search-rank'

interface BaseEntry { en_h: string; en_l?: string; abbr?: string; f: string[]; d: string; lvl: number; parts?: { p?: string[]; r?: string[]; s?: string[] } }
interface FrEntry  { en_h: string; fr_h: string; fr_l?: string; d_fr?: string }
interface WordPart { wp: string; t: 'p'|'r'|'s'; d: string }
interface MergedEntry extends BaseEntry { fr_h: string; fr_l?: string; d_fr?: string }

const base     = (baseData as any[]).map(v => ({ ...v, lvl: normalizeLvl(v.lvl) })) as BaseEntry[]
const partsMap = Object.fromEntries((partsData as WordPart[]).map(p => [p.wp, p]))
const frMap    = Object.fromEntries((frData as FrEntry[]).map(k => [k.en_h, k]))
const vocab: MergedEntry[] = base
  .map(v => ({ ...v, ...frMap[v.en_h] }))
  .filter((v): v is MergedEntry => !!(v as MergedEntry).fr_h)


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

// Relevance tier (lower = better) — see rankTier. Exact term/abbr beats a stray
// fuzzy hit; the Fuse score only decides within a tier.
function matchTierFr(item: MergedEntry, matches: readonly { key?: string }[] | undefined, ql: string): number {
  return rankTier(
    [item.fr_h, item.en_h, item.abbr, item.fr_l, item.en_l],
    (matches ?? []).map(m => m.key ?? ''),
    ['fr_h', 'en_h', 'abbr', 'fr_l', 'en_l'],
    ql,
  )
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
  threshold: 0.3,
  minMatchCharLength: 2,
  ignoreLocation: true,
  includeScore: true,
  includeMatches: true,
})

function FrCard({ v, defLang, onFieldClick, mm }: { v: MergedEntry; defLang: 'fr' | 'en'; onFieldClick: (f: string) => void; mm?: MatchMap }) {
  const [hovered, setHovered] = useState(false)
  const segs = useMemo(() => getSegments(v.en_h, v.parts, wp => partsMap[wp]?.d || ''), [v])
  const definition = defLang === 'en' ? v.d : (v.d_fr || v.d)
  const defKey = defLang === 'en' ? 'd' : 'd_fr'
  return (
    <div className={`c-card ${LVL_CARD_CLASS[v.lvl]||''}`} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.5rem' }}>
        <span className={`c-stars ${STAR_CLASS[v.lvl]||''}`} role="img" aria-label={`Importance: ${LVL_TEXT[v.lvl]}`}>{STARS[v.lvl]}</span>
        {v.abbr && <span className="c-abbr">{hi(v.abbr, mm?.abbr)}</span>}
      </div>
      <div style={{ fontSize:'1.15rem', fontWeight:700, color:'var(--color-text)', marginBottom:'0.15rem', lineHeight:1.3 }}>
        {hovered && v.parts ? segs.map((s,i) => s.wp
          ? <span key={i} className={`c-part-highlight c-part-${s.type}`} data-tooltip={`${s.wp} · ${s.meaning}`}>{s.text}</span>
          : <span key={i}>{s.text}</span>) : hi(v.en_h, mm?.en_h)}
      </div>
      {v.en_l && <div style={{ fontSize:'1rem', color:'var(--color-text-dim)', marginBottom:'0.3rem' }}>{hi(v.en_l, mm?.en_l)}</div>}
      <div style={{ fontSize:'1.05rem', fontWeight:600, color:'var(--color-text)', marginBottom:'0.1rem' }}>{hi(v.fr_h, mm?.fr_h)}</div>
      {v.fr_l && <div style={{ fontSize:'0.95rem', color:'var(--color-text-dim)', marginBottom:'0.1rem' }}>{hi(v.fr_l, mm?.fr_l)}</div>}
      <p style={{ fontSize:'0.88rem', color:'var(--color-text-dim)', lineHeight:1.6, marginBottom:'0.65rem' }}>{hi(definition, mm?.[defKey])}</p>
      <div style={{ display:'flex', flexWrap:'wrap', gap:'0.3rem' }}>
        {v.f.map(f => (
          <button key={f} className="c-field-badge" onClick={() => onFieldClick(f)}>{f}</button>
        ))}
      </div>
    </div>
  )
}

function FrGlossarySkeleton() {
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

export default function FrGlossaryPage() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const [search, setSearch]     = useState('')
  const [query, setQuery]       = useState('')   // debounced value that actually drives search
  const [fieldFilter, setField] = useState<string|null>(null)
  const [levelFilter, setLevel] = useState<number|null>(null)
  const [defLang, setDefLang]   = useState<'fr'|'en'>('fr')

  // Debounce: don't re-run Fuse + re-render all cards on every keystroke.
  useEffect(() => {
    const t = setTimeout(() => setQuery(search), 150)
    return () => clearTimeout(t)
  }, [search])

  type CardEntry = MergedEntry & { _mm?: MatchMap }

  const filtered = useMemo((): CardEntry[] => {
    const q = query.trim()

    if (!q) {
      return vocab.filter(v => {
        if (fieldFilter && !v.f.includes(fieldFilter)) return false
        if (levelFilter && v.lvl !== levelFilter) return false
        return true
      })
    }

    const ql = q.toLowerCase()
    return fuseFr.search(q)
      .sort((a, b) => {
        const ta = matchTierFr(a.item, a.matches, ql)
        const tb = matchTierFr(b.item, b.matches, ql)
        if (ta !== tb) return ta - tb
        return (a.score ?? 1) - (b.score ?? 1)
      })
      .map(r => ({ ...r.item, _mm: Object.fromEntries(r.matches?.map(m => [m.key!, m.indices]) ?? []) as MatchMap }))
      .filter(v => {
        if (fieldFilter && !v.f.includes(fieldFilter)) return false
        if (levelFilter && v.lvl !== levelFilter) return false
        return true
      })
  }, [query, fieldFilter, levelFilter])

  // True when the query has no exact/prefix/substring hit — only fuzzy "related" results.
  const noExact = useMemo(() => {
    const q = query.trim()
    if (!q || filtered.length === 0) return false
    return matchTierFr(filtered[0], [], q.toLowerCase()) >= 4
  }, [query, filtered])

  const { visible, sentinelRef } = useInfiniteReveal(filtered.length, filtered)

  return (
    <>
      {/* ── Sticky filter bar ── */}
      <div className="c-filter-bar">
        <div className="c-search-row">
          <input
            className="c-search"
            type="text"
            aria-label="Search medical terms in French or English"
            placeholder="Search terms in French or English..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select className="c-field-drop" aria-label="Filter by specialty" value={fieldFilter||''} onChange={e => setField(e.target.value||null)}>
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
                <button key={lvl} className={`c-pill c-pill--star ${levelFilter===lvl?'c-pill--active':''}`} aria-label={LVL_TEXT[lvl]} onClick={() => setLevel(levelFilter===lvl?null:lvl)}>
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
      {!mounted ? <FrGlossarySkeleton /> : (
        <>
          {noExact && <div className="c-search-note">No exact match for “{query.trim()}” — showing related terms.</div>}
          <div className="c-grid">
            {filtered.slice(0, visible).map(v => <FrCard key={v.en_h} v={v} defLang={defLang} onFieldClick={f => setField(f === fieldFilter ? null : f)} mm={v._mm} />)}
          </div>
          <div ref={sentinelRef} aria-hidden="true" />
          {filtered.length === 0 && <div className="c-empty">No terms found.</div>}
        </>
      )}
    </>
  )
}
