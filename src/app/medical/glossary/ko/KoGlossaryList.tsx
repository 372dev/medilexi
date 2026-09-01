'use client'

import { useState, useMemo, useRef, useEffect, type ReactNode } from 'react'
import Link from 'next/link'
import Fuse from 'fuse.js'
import { ALL_LEVELS, LVL_TEXT } from '@/lib/vocab-constants'
import { useInfiniteReveal } from '@/lib/use-infinite-reveal'
import { hangulSearch, jamoFlat, isKorean } from '@/lib/hangul'
import { rankTier } from '@/lib/search-rank'
import { useIsTouch } from '@/lib/use-is-touch'
import { useScrollRestore } from '@/lib/use-scroll-restore'
import WordPartsSheet from '../WordPartsSheet'
import SpeakButton from '../../SpeakButton'
import type { Segment } from '@/lib/word-segments'

/* Korean glossary list over a LEAN index (en_h, slug, abbr, en_l, ko_h, ko_l,
   f, lvl). Search is Korean jamo + Fuse over terms/abbr/translations only —
   definitions are no longer searched. Definitions (d_ko / d) and word-part
   segments are fetched per visible chunk from /api/defs?lang=ko and fade in. */

export interface KoLeanEntry {
  en_h: string; slug: string; abbr?: string; en_l?: string; ko_h: string; ko_l?: string; f: string[]; lvl: number
}
type DefRec = { d: string; segs: Segment[] | null; d2?: string | null }  // d2 = d_ko
type MatchMap = Partial<Record<string, readonly [number, number][]>>
type CardEntry = KoLeanEntry & { _mm?: MatchMap }

function hi(text: string, idx?: readonly [number, number][]): ReactNode {
  if (!idx?.length) return text
  const parts: ReactNode[] = []; let cur = 0
  for (const [s, e] of idx) {
    if (s > cur) parts.push(text.slice(cur, s))
    parts.push(<mark key={s} className="b-mark">{text.slice(s, e + 1)}</mark>)
    cur = e + 1
  }
  if (cur < text.length) parts.push(text.slice(cur))
  return <>{parts}</>
}

function matchTierKo(item: KoLeanEntry, matches: readonly { key?: string }[] | undefined, ql: string): number {
  return rankTier(
    [item.ko_h, item.en_h, item.abbr, item.ko_l, item.en_l],
    (matches ?? []).map(m => m.key ?? ''),
    ['ko_h', 'en_h', 'abbr', 'ko_l', 'en_l'],
    ql,
  )
}

function KoCard({ v, def, defLang, onFieldClick, mm, isTouch, onOpen }: { v: CardEntry; def?: DefRec; defLang: 'ko' | 'en'; onFieldClick: (f: string) => void; mm?: MatchMap; isTouch: boolean; onOpen: (v: CardEntry) => void }) {
  const [hovered, setHovered] = useState(false)
  const definition = def ? (defLang === 'en' ? def.d : (def.d2 || def.d)) : null

  // Mobile: compact, definition-free card; the whole card taps to the sheet.
  if (isTouch) {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={() => onOpen(v)}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(v) } }}
        className="b-card b-press b-termtap b-focus flex cursor-pointer flex-col gap-1 p-3.5"
      >
        <div className="flex items-center justify-between gap-2">
          <span className={`b-lvl b-lvl--${v.lvl}`}>{LVL_TEXT[v.lvl]}</span>
          {v.abbr && <span className="b-abbr">{hi(v.abbr, mm?.abbr)}</span>}
        </div>
        <div className="text-[1.1rem] font-semibold leading-tight tracking-[-0.005em] text-[var(--b-text)]" style={{ fontFamily: 'var(--b-display)' }}>
          {hi(v.en_h, mm?.en_h)}
        </div>
        {v.en_l && <div className="text-[0.88rem] leading-tight text-[var(--b-dim)]">{hi(v.en_l, mm?.en_l)}</div>}
        {v.ko_h && <div className="text-[0.98rem] font-semibold leading-tight text-[var(--b-primary)]">{hi(v.ko_h, mm?.ko_h)}</div>}
        {v.ko_l && <div className="text-[0.86rem] leading-tight text-[var(--b-dim)]">{hi(v.ko_l, mm?.ko_l)}</div>}
        {v.f.length > 0 && (
          <div className="mt-0.5 flex flex-wrap gap-1">
            {v.f.map(f => <span key={f} className="b-chip">{f}</span>)}
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      className="b-card b-lift b-press flex flex-col gap-2 p-5"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-center justify-between gap-2">
        <span className={`b-lvl b-lvl--${v.lvl}`}>{LVL_TEXT[v.lvl]}</span>
        <span className="flex items-center gap-2">
          {v.abbr && <span className="b-abbr">{hi(v.abbr, mm?.abbr)}</span>}
          <SpeakButton text={v.en_h} />
        </span>
      </div>

      <Link
        href={`/medical/term/${v.slug}`}
        className="b-focus block text-[1.2rem] font-semibold leading-[1.28] tracking-[-0.005em] text-[var(--b-text)] no-underline"
        style={{ fontFamily: 'var(--b-display)' }}
      >
        {hovered && def?.segs
          ? def.segs.map((s, i) => s.wp
            ? <span key={i} className={`b-htip b-part--${s.type}`} data-tip={`${s.wp} · ${s.meaning}`}>{s.text}</span>
            : <span key={i}>{s.text}</span>)
          : hi(v.en_h, mm?.en_h)}
      </Link>

      {v.en_l && <div className="text-[0.96rem] text-[var(--b-dim)]">{hi(v.en_l, mm?.en_l)}</div>}
      {v.ko_h && <div className="text-[1.02rem] font-semibold text-[var(--b-primary)]">{hi(v.ko_h, mm?.ko_h)}</div>}
      {v.ko_l && <div className="text-[0.9rem] text-[var(--b-dim)]">{hi(v.ko_l, mm?.ko_l)}</div>}

      {definition
        ? <p className="b-fade text-[0.87rem] leading-[1.6] text-[var(--b-dim)]">{definition}</p>
        : (
          <div className="flex animate-pulse flex-col gap-1.5 py-1" aria-hidden="true">
            <span className="h-3 w-full rounded bg-[var(--b-raised)]" />
            <span className="h-3 w-[82%] rounded bg-[var(--b-raised)]" />
          </div>
        )}

      <div className="mt-1 flex flex-wrap gap-1.5">
        {v.f.map(f => (
          <button key={f} className="b-field b-focus" onClick={() => onFieldClick(f)}>{f}</button>
        ))}
      </div>
    </div>
  )
}

function KoGlossarySkeleton() {
  return (
    <div className="mx-auto w-full max-w-[1100px]">
      <div className="grid grid-cols-[repeat(auto-fill,minmax(290px,1fr))] gap-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="b-card flex flex-col gap-3 p-5">
            <div className="h-4 w-20 rounded bg-[var(--b-raised)]" />
            <div className="h-5 w-[70%] rounded bg-[var(--b-raised)]" />
            <div className="h-4 w-[50%] rounded bg-[var(--b-raised)]" />
            <div className="h-4 w-[40%] rounded bg-[var(--b-raised)]" />
            <div className="h-3 w-full rounded bg-[var(--b-raised)]" />
            <div className="h-3 w-[80%] rounded bg-[var(--b-raised)]" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function KoGlossaryList({ entries, allFields }: { entries: KoLeanEntry[]; allFields: string[] }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const [inputValue, setInputValue]   = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [deferredQuery, setDeferredQuery] = useState('')
  const composingRef = useRef(false)
  const [fieldFilter, setField] = useState<string | null>(null)
  const [levelFilter, setLevel] = useState<number | null>(null)
  const [defLang, setDefLang]   = useState<'ko' | 'en'>('ko')
  const isTouch = useIsTouch()
  const [sheetEntry, setSheetEntry] = useState<CardEntry | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  // Indexes over the lean data (built once).
  const vocabByEn = useMemo(() => Object.fromEntries(entries.map(v => [v.en_h, v])) as Record<string, KoLeanEntry>, [entries])
  const fuseJamo = useMemo(() => new Fuse(
    entries.map(v => ({ en_h: v.en_h, jh: jamoFlat(v.ko_h), jl: v.ko_l ? jamoFlat(v.ko_l) : '' })),
    { keys: [{ name: 'jh', weight: 2 }, { name: 'jl', weight: 1 }], threshold: 0.3, ignoreLocation: true, minMatchCharLength: 2, includeScore: true },
  ), [entries])
  const fuseKo = useMemo(() => new Fuse(entries, {
    keys: [
      { name: 'ko_h', weight: 2 },
      { name: 'en_h', weight: 2 },
      { name: 'abbr', weight: 1.5 },
      { name: 'ko_l', weight: 1 },
      { name: 'en_l', weight: 1 },
    ],
    threshold: 0.3, minMatchCharLength: 2, ignoreLocation: true, includeScore: true, includeMatches: true,
  }), [entries])

  useEffect(() => {
    const t = setTimeout(() => setDeferredQuery(searchQuery), 150)
    return () => clearTimeout(t)
  }, [searchQuery])

  // A new search should surface the best matches from the top of the page.
  useEffect(() => { if (deferredQuery.trim()) window.scrollTo({ top: 0 }) }, [deferredQuery])

  const filtered = useMemo((): CardEntry[] => {
    const q = deferredQuery.trim()
    if (!q) {
      return entries.filter(v => {
        if (fieldFilter && !v.f.includes(fieldFilter)) return false
        if (levelFilter && v.lvl !== levelFilter) return false
        return true
      })
    }
    const ql = q.toLowerCase()
    let results: CardEntry[]

    if (isKorean(q)) {
      type Scored = { entry: KoLeanEntry; pri: number; pos: number }
      const scored: Scored[] = []
      const seen = new Set<string>()
      for (const v of entries) {
        let bestPri = Infinity, bestPos = Infinity
        const h = hangulSearch(v.ko_h, q)
        if (h !== -1) { bestPri = 0; bestPos = h }
        if (bestPri > 2 && v.ko_l) {
          const l = hangulSearch(v.ko_l, q)
          if (l !== -1) { bestPri = 2; bestPos = l }
        }
        if (bestPri < Infinity) {
          scored.push({ entry: v, pri: bestPri, pos: bestPos })
          seen.add(v.en_h)
        }
      }
      scored.sort((a, b) => a.pri !== b.pri ? a.pri - b.pri : a.pos - b.pos)

      const qj = jamoFlat(q)
      const jamoHits: CardEntry[] = []
      if (qj.length >= 2) {
        for (const r of fuseJamo.search(qj)) {
          if (seen.has(r.item.en_h)) continue
          seen.add(r.item.en_h)
          jamoHits.push(vocabByEn[r.item.en_h])
        }
      }

      const fuseRest = fuseKo.search(q)
        .sort((a, b) => {
          const ta = matchTierKo(a.item, a.matches, ql)
          const tb = matchTierKo(b.item, b.matches, ql)
          if (ta !== tb) return ta - tb
          return (a.score ?? 1) - (b.score ?? 1)
        })
        .map(r => ({ ...r.item, _mm: Object.fromEntries(r.matches?.map(m => [m.key!, m.indices]) ?? []) as MatchMap }))
        .filter(v => !seen.has(v.en_h))

      results = [...scored.map(s => s.entry), ...jamoHits, ...fuseRest]
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
  }, [deferredQuery, fieldFilter, levelFilter, entries, fuseKo, fuseJamo, vocabByEn])

  const noExact = useMemo(() => {
    const q = deferredQuery.trim()
    if (!q || filtered.length === 0) return false
    if (isKorean(q)) {
      const top = filtered[0]
      return !(hangulSearch(top.ko_h, q) !== -1 || (!!top.ko_l && hangulSearch(top.ko_l, q) !== -1))
    }
    return matchTierKo(filtered[0], [], q.toLowerCase()) >= 4
  }, [deferredQuery, filtered])

  const { visible, sentinelRef, setVisible } = useInfiniteReveal(filtered.length, filtered)
  useScrollRestore('gloss:ko', visible, setVisible, mounted)

  // ── Lazy definitions (lang=ko returns d + d2=d_ko + segs) ──
  const [defs, setDefs] = useState<Map<string, DefRec>>(new Map())
  const requested = useRef<Set<string>>(new Set())
  useEffect(() => {
    const need = filtered.slice(0, visible).map(e => e.slug).filter(s => !requested.current.has(s))
    if (!need.length) return
    need.forEach(s => requested.current.add(s))
    for (let i = 0; i < need.length; i += 60) {
      const chunk = need.slice(i, i + 60)
      fetch(`/api/defs?lang=ko&ids=${chunk.map(encodeURIComponent).join(',')}`)
        .then(r => r.ok ? r.json() : Promise.reject(new Error('defs')))
        .then((data: Record<string, DefRec>) => setDefs(prev => {
          const m = new Map(prev)
          for (const k in data) m.set(k, data[k])
          return m
        }))
        .catch(() => { chunk.forEach(s => requested.current.delete(s)) })
    }
  }, [filtered, visible])

  const activeFilters = (fieldFilter ? 1 : 0) + (levelFilter ? 1 : 0)

  return (
    <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-5">

      {/* ── Sticky filter bar ── */}
      <div className="sticky top-[57px] z-[90] -mx-1 flex flex-col gap-2 bg-[var(--b-bg)] px-1 pb-3 pt-2 sm:gap-3 sm:pb-4 sm:pt-3">
        {/* search + (mobile) filters toggle + (desktop) flashcard */}
        <div className="flex items-center gap-2">
          <input
            className="b-search min-w-0 flex-1"
            type="text"
            aria-label="Search medical terms in English or Korean"
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
          <button
            type="button"
            onClick={() => setShowFilters(o => !o)}
            aria-expanded={showFilters}
            className="b-press b-focus inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl border border-[var(--b-border)] bg-[var(--b-panel)] px-3.5 py-2.5 text-[0.82rem] font-semibold sm:hidden"
          >
            Filters{activeFilters ? ` · ${activeFilters}` : ''}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={`transition-transform ${showFilters ? 'rotate-180' : ''}`}>
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          <Link
            href="/medical/flashcards/ko"
            className="b-press b-focus hidden items-center whitespace-nowrap rounded-xl border border-[var(--b-border)] bg-[var(--b-panel)] px-4 py-2.5 text-[0.82rem] font-semibold hover:border-[var(--b-primary)] hover:text-[var(--b-primary)] sm:inline-flex"
          >
            Flashcard →
          </Link>
        </div>

        {/* collapsible on mobile (always from sm up): specialty + levels (+ def toggle, desktop only) */}
        <div className={`${showFilters ? 'flex' : 'hidden'} flex-col gap-2 sm:flex sm:flex-row sm:flex-wrap sm:items-center sm:gap-3`}>
          <select
            className="b-select b-focus"
            aria-label="Filter by specialty"
            value={fieldFilter || ''}
            onChange={e => setField(e.target.value || null)}
          >
            <option value="">All fields</option>
            {allFields.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
          <div className="flex gap-2 overflow-x-auto sm:flex-wrap sm:overflow-visible [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button className={`b-fpill b-focus shrink-0 ${!levelFilter ? 'b-fpill--active' : ''}`} onClick={() => setLevel(null)}>
              All levels
            </button>
            {ALL_LEVELS.map(lvl => (
              <button
                key={lvl}
                className={`b-fpill b-focus shrink-0 ${levelFilter === lvl ? 'b-fpill--active' : ''}`}
                onClick={() => setLevel(levelFilter === lvl ? null : lvl)}
              >
                {LVL_TEXT[lvl]}
              </button>
            ))}
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <span className="text-[0.72rem] font-semibold text-[var(--b-dim)]">Definition</span>
            <div className="inline-flex overflow-hidden rounded-lg border border-[var(--b-border)]">
              {(['ko', 'en'] as const).map(l => (
                <button
                  key={l}
                  onClick={() => setDefLang(l)}
                  aria-pressed={defLang === l}
                  className={`b-focus px-3 py-1.5 text-[0.76rem] font-semibold ${defLang === l ? 'bg-[var(--b-primary)] text-[var(--b-on-prim)]' : 'text-[var(--b-dim)]'}`}
                >
                  {l === 'ko' ? 'Korean' : 'English'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* meta row (always) */}
        <div className="flex items-center justify-end text-[0.78rem] font-medium text-[var(--b-dim)] tabular-nums">
          <span className="shrink-0">{filtered.length} terms</span>
        </div>
      </div>

      {/* ── Cards ── */}
      {!mounted ? <KoGlossarySkeleton /> : (
        <>
          {noExact && (
            <div className="rounded-xl border border-[var(--b-border)] bg-[var(--b-panel)] px-4 py-3 text-[0.84rem] text-[var(--b-dim)]">
              No exact match for “{deferredQuery.trim()}”. Showing related terms.
            </div>
          )}
          <div className="grid grid-cols-[repeat(auto-fill,minmax(290px,1fr))] gap-4">
            {filtered.slice(0, visible).map(v => (
              <KoCard key={v.en_h} v={v} def={defs.get(v.slug)} defLang={defLang} onFieldClick={f => setField(f === fieldFilter ? null : f)} mm={v._mm} isTouch={isTouch} onOpen={setSheetEntry} />
            ))}
          </div>
          <div ref={sentinelRef} aria-hidden="true" />
          {filtered.length === 0 && (
            <div className="py-16 text-center text-[0.92rem] text-[var(--b-dim)]">No terms found.</div>
          )}
        </>
      )}

      <WordPartsSheet
        entry={sheetEntry ? { en_h: sheetEntry.en_h, slug: sheetEntry.slug, en_l: sheetEntry.en_l, abbr: sheetEntry.abbr, f: sheetEntry.f, lvl: sheetEntry.lvl, head2: sheetEntry.ko_h, sub2: sheetEntry.ko_l, lang2: 'ko' } : null}
        def={sheetEntry ? defs.get(sheetEntry.slug) : undefined}
        onClose={() => setSheetEntry(null)}
      />
    </div>
  )
}
