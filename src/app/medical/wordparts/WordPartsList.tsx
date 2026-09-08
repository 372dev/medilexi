'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useInfiniteReveal } from '@/lib/use-infinite-reveal'
import { useT, type MsgKey } from '@/lib/i18n'

/* Word-parts glossary over a LEAN index (wp, type, level, meaning). Search is
   word-part + meaning only — the heavy example set is fetched per visible chunk
   from /api/wpex and fades in. */

export interface LeanPart { wp: string; t: 'p' | 'r' | 's'; lvl: 1 | 2 | 3; d: string }
type ExPairs = [string, string][]

const TYPE_KEY: Record<string, MsgKey> = { p: 'parts.prefix', r: 'parts.root', s: 'parts.suffix' }
const EDGE: Record<string, string> = { p: '#3B82F6', r: '#3BAA6A', s: '#C94040' }

export default function WordPartsList({ parts }: { parts: LeanPart[] }) {
  const t = useT()
  const [search, setSearch]   = useState('')
  const [typeFilter, setType] = useState<'all' | 'p' | 'r' | 's'>('all')
  const [lvlFilter, setLvl]   = useState<number | null>(null)

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    const matched = parts.filter(p => {
      if (typeFilter !== 'all' && p.t !== typeFilter) return false
      if (lvlFilter && p.lvl !== lvlFilter) return false
      if (!q) return true
      return p.wp.toLowerCase().includes(q) || p.d.toLowerCase().includes(q)
    })
    if (!q) return matched
    // Relevance: exact word-part first, then wp substring, then meaning.
    const wpClean = (wp: string) => wp.replace(/^-|-$/g, '').replace(/\//g, '').toLowerCase()
    const tier = (p: LeanPart) => {
      const wp = p.wp.toLowerCase()
      if (wpClean(p.wp) === q || wp === q) return 0
      if (wp.includes(q)) return 1
      return 2
    }
    return matched
      .map((p, i) => ({ p, i, t: tier(p) }))
      .sort((a, b) => a.t - b.t || a.i - b.i)
      .map(x => x.p)
  }, [search, typeFilter, lvlFilter, parts])

  const counts = useMemo(() => ({
    p: parts.filter(p => p.t === 'p').length,
    r: parts.filter(p => p.t === 'r').length,
    s: parts.filter(p => p.t === 's').length,
  }), [parts])

  const { visible, sentinelRef } = useInfiniteReveal(filtered.length, filtered)

  // ── Lazy examples: fetch each visible chunk from /api/wpex ──
  const [exMap, setExMap] = useState<Map<string, ExPairs>>(new Map())
  const requested = useRef<Set<string>>(new Set())
  useEffect(() => {
    const need = filtered.slice(0, visible).map(p => p.wp).filter(w => !requested.current.has(w))
    if (!need.length) return
    need.forEach(w => requested.current.add(w))
    for (let i = 0; i < need.length; i += 60) {
      const chunk = need.slice(i, i + 60)
      fetch(`/api/wpex?ids=${chunk.map(encodeURIComponent).join('~')}`)
        .then(r => r.ok ? r.json() : Promise.reject(new Error('wpex')))
        .then((data: Record<string, ExPairs>) => setExMap(prev => {
          const m = new Map(prev)
          for (const k in data) m.set(k, data[k])
          return m
        }))
        .catch(() => { chunk.forEach(w => requested.current.delete(w)) })
    }
  }, [filtered, visible])

  return (
    <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-5">

      {/* ── Sticky filter bar ── */}
      <div className="sticky top-[57px] z-[90] -mx-1 flex flex-col gap-3 bg-[var(--b-bg)] px-1 pb-4 pt-3">
        <div className="flex flex-wrap items-center gap-2">
          <input
            className="b-search min-w-[220px] flex-1"
            type="text"
            aria-label={t('wp.searchAria')}
            placeholder={t('wp.searchPlaceholder')}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <Link
            href="/medical/wordparts/flashcard"
            className="b-press b-focus whitespace-nowrap rounded-xl border border-[var(--b-border)] bg-[var(--b-panel)] px-4 py-2.5 text-[0.82rem] font-semibold hover:border-[var(--b-primary)] hover:text-[var(--b-primary)]"
          >
            {t('gloss.flashcard')} →
          </Link>
          <Link
            href="/medical/wordparts/quiz"
            className="b-press b-focus whitespace-nowrap rounded-xl border border-[var(--b-border)] bg-[var(--b-panel)] px-4 py-2.5 text-[0.82rem] font-semibold hover:border-[var(--b-primary)] hover:text-[var(--b-primary)]"
          >
            {t('home.wpPractice')} →
          </Link>
          <Link
            href="/medical/wordparts/exam"
            className="b-press b-glow b-focus whitespace-nowrap rounded-xl bg-[var(--b-primary)] px-4 py-2.5 text-[0.82rem] font-bold text-[var(--b-on-prim)]"
          >
            {t('home.wpExam')}
          </Link>
        </div>

        <div className="flex flex-wrap gap-2">
          {(['all', 'p', 'r', 's'] as const).map(typ => (
            <button
              key={typ}
              className={`b-fpill b-focus ${typeFilter === typ ? 'b-fpill--active' : ''}`}
              onClick={() => setType(typ)}
            >
              {typ === 'all'
                ? `${t('fc.all')} (${parts.length})`
                : `${t(TYPE_KEY[typ])} (${typ === 'p' ? counts.p : typ === 'r' ? counts.r : counts.s})`}
            </button>
          ))}

          <span className="mx-1 w-px self-stretch bg-[var(--b-border)]" aria-hidden="true" />

          <button
            className={`b-fpill b-focus ${!lvlFilter ? 'b-fpill--active' : ''}`}
            onClick={() => setLvl(null)}
          >
            {t('lvl.all')}
          </button>
          {([3, 2, 1] as const).map(l => (
            <button
              key={l}
              className={`b-fpill b-focus ${lvlFilter === l ? 'b-fpill--active' : ''}`}
              onClick={() => setLvl(lvlFilter === l ? null : l)}
            >
              {t(`lvl.${l}` as MsgKey)}
            </button>
          ))}
        </div>

        <div className="text-[0.78rem] font-medium text-[var(--b-dim)] tabular-nums">
          {filtered.length}{filtered.length === 1 ? t('wp.entry') : t('wp.entries')}
        </div>
      </div>

      {/* ── Cards ── */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(290px,1fr))] gap-4">
        {filtered.slice(0, visible).map(p => {
          const ex = exMap.get(p.wp)
          return (
            <div
              key={p.wp}
              className="b-card b-lift b-press group flex flex-col gap-2.5 p-5"
              style={{ borderTop: `3px solid ${EDGE[p.t]}` }}
              tabIndex={0}
            >
              <div className="flex items-center justify-between gap-2">
                <span className={`b-badge b-badge--${p.t}`}>{t(TYPE_KEY[p.t])}</span>
                <span className={`b-lvl b-lvl--${p.lvl}`}>{t(`lvl.${p.lvl}` as MsgKey)}</span>
              </div>

              <div
                className="text-[1.34rem] font-semibold leading-tight tracking-[-0.005em] text-[var(--b-text)]"
                style={{ fontFamily: 'var(--b-display)' }}
              >
                {p.wp}
              </div>

              <div className="text-[0.86rem] leading-[1.6] text-[var(--b-dim)]">{p.d}</div>

              {ex ? (
                <div className="b-fade mt-1 flex flex-col gap-1.5">
                  {ex.slice(0, 2).map(([term, def], j) => (
                    <div key={j} className="b-ex"><strong>{term}</strong> · {def}</div>
                  ))}
                  {ex.length > 2 && (
                    <>
                      <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-200 group-hover:grid-rows-[1fr] group-focus-within:grid-rows-[1fr]">
                        <div className="overflow-hidden">
                          <div className="flex flex-col gap-1.5 pt-1.5">
                            {ex.slice(2).map(([term, def], j) => (
                              <div key={j} className="b-ex"><strong>{term}</strong> · {def}</div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-center text-[0.72rem] font-medium text-[var(--b-dim)] opacity-60 group-hover:opacity-0 group-focus-within:opacity-0">
                        +{ex.length - 2}{t('wp.more')}
                      </span>
                    </>
                  )}
                </div>
              ) : (
                <div className="mt-1 flex animate-pulse flex-col gap-1.5" aria-hidden="true">
                  <span className="h-8 rounded-[9px] bg-[var(--b-raised)]" />
                  <span className="h-8 rounded-[9px] bg-[var(--b-raised)]" />
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div ref={sentinelRef} aria-hidden="true" />

      {filtered.length === 0 && (
        <div className="py-16 text-center text-[0.92rem] text-[var(--b-dim)]">{t('gloss.noResults')}</div>
      )}
    </div>
  )
}
