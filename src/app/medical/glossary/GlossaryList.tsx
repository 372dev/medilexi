'use client'

import { useState, useMemo, useEffect, useRef, Suspense, type ReactNode } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Fuse from 'fuse.js'
import { ALL_LEVELS } from '@/lib/vocab-constants'
import { useT, useTField, type MsgKey } from '@/lib/i18n'
import { useInfiniteReveal } from '@/lib/use-infinite-reveal'
import { rankTier } from '@/lib/search-rank'
import { useIsTouch } from '@/lib/use-is-touch'
import WordPartsSheet from './WordPartsSheet'
import type { Segment } from '@/lib/word-segments'

/* Client glossary list. Receives a LEAN index (no definitions / word parts) from
   the server shell, searches it with Fuse (terms + abbr + lay only), and
   lazily fetches each visible chunk's definitions + word-part segments from
   /api/defs as the user scrolls or searches. Definitions fade in when they land. */

export interface LeanEntry {
  en_h: string; slug: string; abbr?: string; en_l?: string; f: string[]; lvl: number
}
type DefRec = { d: string; segs: Segment[] | null; d2?: string | null }
type MatchMap = Partial<Record<string, readonly [number, number][]>>
type CardEntry = LeanEntry & { _mm?: MatchMap }

function matchTier(item: LeanEntry, matches: readonly { key?: string }[] | undefined, ql: string): number {
  return rankTier(
    [item.en_h, item.abbr, item.en_l],
    (matches ?? []).map(m => m.key ?? ''),
    ['en_h', 'abbr', 'en_l'],
    ql,
  )
}

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

function Card({ v, def, onFieldClick, mm, isTouch, onOpen }: { v: CardEntry; def?: DefRec; onFieldClick: (f: string) => void; mm?: MatchMap; isTouch: boolean; onOpen: (v: LeanEntry) => void }) {
  const [hovered, setHovered] = useState(false)
  const t = useT()
  const tf = useTField()

  // Mobile: a compact, definition-free card; the whole card taps to the sheet.
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
          <span className={`b-lvl b-lvl--${v.lvl}`}>{t(`lvl.${v.lvl}` as MsgKey)}</span>
          {v.abbr && <span className="b-abbr">{hi(v.abbr, mm?.abbr)}</span>}
        </div>
        <div className="text-[1.1rem] font-semibold leading-tight tracking-[-0.005em] text-[var(--b-text)]" style={{ fontFamily: 'var(--b-display)' }}>
          {hi(v.en_h, mm?.en_h)}
        </div>
        {v.en_l && <div className="text-[0.9rem] leading-tight text-[var(--b-dim)]">{hi(v.en_l, mm?.en_l)}</div>}
        {v.f.length > 0 && (
          <div className="mt-0.5 flex flex-wrap gap-1">
            {v.f.map(f => <span key={f} className="b-chip">{tf(f)}</span>)}
          </div>
        )}
      </div>
    )
  }

  // Desktop: full card with the definition and hover word-part tooltips.
  return (
    <div
      className="b-card b-lift b-press flex flex-col gap-2 p-5"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-center justify-between gap-2">
        <span className={`b-lvl b-lvl--${v.lvl}`}>{t(`lvl.${v.lvl}` as MsgKey)}</span>
        {v.abbr && <span className="b-abbr">{hi(v.abbr, mm?.abbr)}</span>}
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

      {v.en_l && <div className="text-[0.98rem] text-[var(--b-dim)]">{hi(v.en_l, mm?.en_l)}</div>}

      {def
        ? <p className="b-fade text-[0.87rem] leading-[1.6] text-[var(--b-dim)]">{def.d}</p>
        : (
          <div className="flex animate-pulse flex-col gap-1.5 py-1" aria-hidden="true">
            <span className="h-3 w-full rounded bg-[var(--b-raised)]" />
            <span className="h-3 w-[82%] rounded bg-[var(--b-raised)]" />
          </div>
        )}

      <div className="mt-1 flex flex-wrap gap-1.5">
        {v.f.map(f => (
          <button key={f} className="b-field b-focus" onClick={() => onFieldClick(f)}>{tf(f)}</button>
        ))}
      </div>
    </div>
  )
}

function GlossaryInner({ entries, allFields }: { entries: LeanEntry[]; allFields: string[] }) {
  const t = useT()
  const tf = useTField()
  const params = useSearchParams()
  const [search, setSearch]     = useState(params.get('q') || '')
  const [query, setQuery]       = useState(search)
  const [fieldFilter, setField] = useState<string | null>(null)
  const [levelFilter, setLevel] = useState<number | null>(null)
  const isTouch = useIsTouch()
  const [sheetEntry, setSheetEntry] = useState<LeanEntry | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const fuse = useMemo(() => new Fuse(entries, {
    keys: [
      { name: 'en_h', weight: 2 },
      { name: 'abbr', weight: 1.5 },
      { name: 'en_l', weight: 1 },
    ],
    threshold: 0.3,
    minMatchCharLength: 2,
    ignoreLocation: true,
    includeScore: true,
    includeMatches: true,
  }), [entries])

  // Debounce so search + re-render don't fire on every keystroke.
  useEffect(() => {
    const t = setTimeout(() => setQuery(search), 150)
    return () => clearTimeout(t)
  }, [search])

  // A new search should surface the best matches from the top of the page.
  useEffect(() => { if (query.trim()) window.scrollTo({ top: 0 }) }, [query])

  const filtered = useMemo((): CardEntry[] => {
    const q = query.trim()
    if (!q) {
      return entries.filter(v => {
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
  }, [query, fieldFilter, levelFilter, entries, fuse])

  const noExact = useMemo(() => {
    const q = query.trim()
    if (!q || filtered.length === 0) return false
    return matchTier(filtered[0], [], q.toLowerCase()) >= 4
  }, [query, filtered])

  const { visible, sentinelRef } = useInfiniteReveal(filtered.length, filtered)

  // ── Lazy definitions: fetch each visible chunk's defs from /api/defs ──
  const [defs, setDefs] = useState<Map<string, DefRec>>(new Map())
  const requested = useRef<Set<string>>(new Set())
  useEffect(() => {
    const need = filtered.slice(0, visible).map(e => e.slug).filter(s => !requested.current.has(s))
    if (!need.length) return
    need.forEach(s => requested.current.add(s))
    for (let i = 0; i < need.length; i += 60) {
      const chunk = need.slice(i, i + 60)
      fetch(`/api/defs?lang=en&ids=${chunk.map(encodeURIComponent).join(',')}`)
        .then(r => r.ok ? r.json() : Promise.reject(new Error('defs')))
        .then((data: Record<string, DefRec>) => setDefs(prev => {
          const m = new Map(prev)
          for (const k in data) m.set(k, data[k])
          return m
        }))
        .catch(() => { chunk.forEach(s => requested.current.delete(s)) })  // allow retry on next reveal
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
            aria-label={t('gloss.searchAria')}
            placeholder={t('gloss.searchPlaceholder')}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowFilters(o => !o)}
            aria-expanded={showFilters}
            className="b-press b-focus inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl border border-[var(--b-border)] bg-[var(--b-panel)] px-3.5 py-2.5 text-[0.82rem] font-semibold sm:hidden"
          >
            {t('filter.filters')}{activeFilters ? ` · ${activeFilters}` : ''}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={`transition-transform ${showFilters ? 'rotate-180' : ''}`}>
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          <Link
            href="/medical/flashcards"
            className="b-press b-focus hidden items-center whitespace-nowrap rounded-xl border border-[var(--b-border)] bg-[var(--b-panel)] px-4 py-2.5 text-[0.82rem] font-semibold hover:border-[var(--b-primary)] hover:text-[var(--b-primary)] sm:inline-flex"
          >
            {t('gloss.flashcard')} →
          </Link>
        </div>

        {/* collapsible on mobile (always shown from sm up): specialty + levels */}
        <div className={`${showFilters ? 'flex' : 'hidden'} flex-col gap-2 sm:flex sm:flex-row sm:items-center sm:gap-3`}>
          <select
            className="b-select b-focus"
            aria-label={t('gloss.specialtyAria')}
            value={fieldFilter || ''}
            onChange={e => setField(e.target.value || null)}
          >
            <option value="">{t('filter.allFields')}</option>
            {allFields.map(f => <option key={f} value={f}>{tf(f)}</option>)}
          </select>
          <div className="flex gap-2 overflow-x-auto sm:flex-wrap sm:overflow-visible [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button className={`b-fpill b-focus shrink-0 ${!levelFilter ? 'b-fpill--active' : ''}`} onClick={() => setLevel(null)}>
              {t('lvl.all')}
            </button>
            {ALL_LEVELS.map(lvl => (
              <button
                key={lvl}
                className={`b-fpill b-focus shrink-0 ${levelFilter === lvl ? 'b-fpill--active' : ''}`}
                onClick={() => setLevel(levelFilter === lvl ? null : lvl)}
              >
                {t(`lvl.${lvl}` as MsgKey)}
              </button>
            ))}
          </div>
        </div>

        {/* meta row (always) */}
        <div className="flex items-center justify-between gap-3 text-[0.78rem] font-medium text-[var(--b-dim)] tabular-nums">
          <span className="shrink-0">{filtered.length}{t(`gloss.terms`)}</span>
          <Link href="/medical/terms" className="b-focus font-semibold text-[var(--b-primary)] no-underline hover:opacity-80">
            {t('gloss.browseAZ')} →
          </Link>
        </div>
      </div>

      {noExact && (
        <div className="rounded-xl border border-[var(--b-border)] bg-[var(--b-panel)] px-4 py-3 text-[0.84rem] text-[var(--b-dim)]">
          {t('gloss.noExactPre')}{query.trim()}{t('gloss.noExactPost')}
        </div>
      )}

      {/* ── Cards ── */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(290px,1fr))] gap-4">
        {filtered.slice(0, visible).map(v => (
          <Card key={v.en_h} v={v} def={defs.get(v.slug)} onFieldClick={f => setField(f === fieldFilter ? null : f)} mm={v._mm} isTouch={isTouch} onOpen={setSheetEntry} />
        ))}
      </div>
      <div ref={sentinelRef} aria-hidden="true" />
      {filtered.length === 0 && (
        <div className="py-16 text-center text-[0.92rem] text-[var(--b-dim)]">{t('gloss.noResults')}</div>
      )}

      <WordPartsSheet
        entry={sheetEntry ? { en_h: sheetEntry.en_h, slug: sheetEntry.slug, en_l: sheetEntry.en_l, abbr: sheetEntry.abbr, f: sheetEntry.f, lvl: sheetEntry.lvl } : null}
        def={sheetEntry ? defs.get(sheetEntry.slug) : undefined}
        onClose={() => setSheetEntry(null)}
      />
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

export default function GlossaryList({ entries, allFields }: { entries: LeanEntry[]; allFields: string[] }) {
  return (
    <Suspense fallback={<GlossarySkeleton />}>
      <GlossaryInner entries={entries} allFields={allFields} />
    </Suspense>
  )
}
