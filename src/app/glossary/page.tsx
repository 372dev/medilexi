'use client'

import { useState, useMemo, useEffect, Suspense, type ReactNode } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Fuse from 'fuse.js'
import { slugify } from '@/lib/slug'
import vocabData from '@/data/medical_vocab.json'
import partsData from '@/data/medical_wordparts_simple.json'
import { ALL_LEVELS, LVL_TEXT, normalizeLvl } from '@/lib/vocab-constants'
import { useInfiniteReveal } from '@/lib/use-infinite-reveal'
import { getSegments } from '@/lib/word-segments'
import { rankTier } from '@/lib/search-rank'

/* Direction "Signal" redesign. Search / ranking / reveal logic is unchanged from
   the live page; only the presentation moved to the .b-* kit. Level reads as a
   labelled pill instead of stars. */

interface VocabEntry {
  en_h: string; en_l?: string; abbr?: string
  f: string[]; d: string; lvl: number
  parts?: { p?: string[]; r?: string[]; s?: string[] }
}
interface WordPart { wp: string; t: 'p'|'r'|'s'; d: string }

const vocab = (vocabData as unknown as VocabEntry[]).map((v): VocabEntry => ({ ...v, lvl: normalizeLvl(v.lvl) }))
const partsMap = Object.fromEntries((partsData as WordPart[]).map(p => [p.wp, p]))

// Relevance tier (lower = better) — see rankTier. Exact term/abbr beats a stray
// fuzzy hit; the Fuse score only decides within a tier.
function matchTier(item: VocabEntry, matches: readonly { key?: string }[] | undefined, ql: string): number {
  return rankTier(
    [item.en_h, item.abbr, item.en_l],
    (matches ?? []).map(m => m.key ?? ''),
    ['en_h', 'abbr', 'en_l'],
    ql,
  )
}

const fuse = new Fuse(vocab, {
  keys: [
    { name: 'en_h', weight: 2   },
    { name: 'abbr', weight: 1.5 },
    { name: 'en_l', weight: 1   },
    { name: 'd',    weight: 0.5 },
  ],
  threshold: 0.3,
  minMatchCharLength: 2,
  ignoreLocation: true,
  includeScore: true,
  includeMatches: true,
})

const ALL_FIELDS = Array.from(new Set(vocab.flatMap(v => v.f))).sort()

type MatchMap = Partial<Record<string, readonly [number,number][]>>

function hi(text: string, idx?: readonly [number,number][]): ReactNode {
  if (!idx?.length) return text
  const parts: ReactNode[] = []; let cur = 0
  for (const [s, e] of idx) {
    if (s > cur) parts.push(text.slice(cur, s))
    parts.push(<mark key={s} className="b-mark">{text.slice(s, e+1)}</mark>)
    cur = e + 1
  }
  if (cur < text.length) parts.push(text.slice(cur))
  return <>{parts}</>
}

function Card({ v, onFieldClick, mm }: { v: VocabEntry; onFieldClick: (f: string) => void; mm?: MatchMap }) {
  const [hovered, setHovered] = useState(false)
  const segs = useMemo(() => getSegments(v.en_h, v.parts, wp => partsMap[wp]?.d || ''), [v])
  return (
    <div
      className="b-card b-lift b-press flex flex-col gap-2 p-5"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-center justify-between gap-2">
        <span className={`b-lvl b-lvl--${v.lvl}`}>{LVL_TEXT[v.lvl]}</span>
        {v.abbr && <span className="b-abbr">{hi(v.abbr, mm?.abbr)}</span>}
      </div>

      <Link
        href={`/term/${slugify(v.en_h)}`}
        className="b-focus block text-[1.2rem] font-semibold leading-[1.28] tracking-[-0.005em] text-[var(--b-text)] no-underline"
        style={{ fontFamily: 'var(--b-display)' }}
      >
        {hovered && v.parts
          ? segs.map((s,i) => s.wp
            ? <span key={i} className={`c-part-highlight c-part-${s.type}`} data-tooltip={`${s.wp} · ${s.meaning}`}>{s.text}</span>
            : <span key={i}>{s.text}</span>)
          : hi(v.en_h, mm?.en_h)}
      </Link>

      {v.en_l && <div className="text-[0.98rem] text-[var(--b-dim)]">{hi(v.en_l, mm?.en_l)}</div>}

      <p className="text-[0.87rem] leading-[1.6] text-[var(--b-dim)]">{hi(v.d, mm?.d)}</p>

      <div className="mt-1 flex flex-wrap gap-1.5">
        {v.f.map(f => (
          <button key={f} className="b-field b-focus" onClick={() => onFieldClick(f)}>{f}</button>
        ))}
      </div>
    </div>
  )
}

function GlossaryContent() {
  const params = useSearchParams()
  const [search, setSearch]     = useState(params.get('q') || '')
  const [query, setQuery]       = useState(search)   // debounced value that actually drives search
  const [fieldFilter, setField] = useState<string|null>(null)
  const [levelFilter, setLevel] = useState<number|null>(null)

  // Debounce: don't re-run Fuse + re-render all cards on every keystroke.
  useEffect(() => {
    const t = setTimeout(() => setQuery(search), 150)
    return () => clearTimeout(t)
  }, [search])

  type CardEntry = VocabEntry & { _mm?: MatchMap }

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
    return fuse.search(q)
      .sort((a, b) => {
        const ta = matchTier(a.item, a.matches, ql)
        const tb = matchTier(b.item, b.matches, ql)
        if (ta !== tb) return ta - tb
        return (a.score ?? 1) - (b.score ?? 1)
      })
      .map(r => ({
        ...r.item,
        _mm: Object.fromEntries(r.matches?.map(m => [m.key!, m.indices]) ?? []) as MatchMap,
      }))
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
    return matchTier(filtered[0], [], q.toLowerCase()) >= 4
  }, [query, filtered])

  const { visible, sentinelRef } = useInfiniteReveal(filtered.length, filtered)

  return (
    <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-5">

      {/* ── Sticky filter bar ── */}
      <div className="sticky top-[57px] z-[90] -mx-1 flex flex-col gap-3 bg-[var(--b-bg)] px-1 pb-4 pt-3">
        <div className="flex flex-wrap items-center gap-2">
          <input
            className="b-search min-w-[220px] flex-1"
            type="text"
            aria-label="Search medical terms"
            placeholder="Search terms, abbreviations, definitions..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            className="b-select b-focus"
            aria-label="Filter by specialty"
            value={fieldFilter||''}
            onChange={e => setField(e.target.value||null)}
          >
            <option value="">All fields</option>
            {ALL_FIELDS.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
          <Link
            href="/flashcards"
            className="b-press b-focus whitespace-nowrap rounded-xl border border-[var(--b-border)] bg-[var(--b-panel)] px-4 py-2.5 text-[0.82rem] font-semibold hover:border-[var(--b-primary)] hover:text-[var(--b-primary)]"
          >
            Flashcard →
          </Link>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <button className={`b-fpill b-focus ${!levelFilter?'b-fpill--active':''}`} onClick={() => setLevel(null)}>
              All levels
            </button>
            {ALL_LEVELS.map(lvl => (
              <button
                key={lvl}
                className={`b-fpill b-focus ${levelFilter===lvl?'b-fpill--active':''}`}
                onClick={() => setLevel(levelFilter===lvl?null:lvl)}
              >
                {LVL_TEXT[lvl]}
              </button>
            ))}
          </div>
          <span className="flex items-center gap-3 text-[0.78rem] font-medium text-[var(--b-dim)] tabular-nums">
            {filtered.length} terms
            <Link href="/terms" className="b-focus font-semibold text-[var(--b-primary)] no-underline hover:opacity-80">
              Browse all A–Z →
            </Link>
          </span>
        </div>
      </div>

      {noExact && (
        <div className="rounded-xl border border-[var(--b-border)] bg-[var(--b-panel)] px-4 py-3 text-[0.84rem] text-[var(--b-dim)]">
          No exact match for “{query.trim()}”. Showing related terms.
        </div>
      )}

      {/* ── Cards ── */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(290px,1fr))] gap-4">
        {filtered.slice(0, visible).map(v => (
          <Card key={v.en_h} v={v} onFieldClick={f => setField(f === fieldFilter ? null : f)} mm={v._mm} />
        ))}
      </div>
      <div ref={sentinelRef} aria-hidden="true" />
      {filtered.length === 0 && (
        <div className="py-16 text-center text-[0.92rem] text-[var(--b-dim)]">No terms found.</div>
      )}
    </div>
  )
}

function GlossarySkeleton() {
  return (
    <div className="mx-auto w-full max-w-[1100px]">
      <div className="grid grid-cols-[repeat(auto-fill,minmax(290px,1fr))] gap-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="b-card flex flex-col gap-3 p-5">
            <div className="flex justify-between">
              <div className="h-4 w-20 rounded bg-[var(--b-raised)]" />
              <div className="h-4 w-10 rounded bg-[var(--b-raised)]" />
            </div>
            <div className="h-5 w-[70%] rounded bg-[var(--b-raised)]" />
            <div className="h-4 w-[45%] rounded bg-[var(--b-raised)]" />
            <div className="h-3 w-full rounded bg-[var(--b-raised)]" />
            <div className="h-3 w-[85%] rounded bg-[var(--b-raised)]" />
            <div className="mt-1 flex gap-2">
              <div className="h-4 w-16 rounded-full bg-[var(--b-raised)]" />
              <div className="h-4 w-12 rounded-full bg-[var(--b-raised)]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function GlossaryPage() {
  return <Suspense fallback={<GlossarySkeleton />}><GlossaryContent /></Suspense>
}
