'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import partsData from '@/data/medical_wordparts.json'
import { useInfiniteReveal } from '@/lib/use-infinite-reveal'
import { LVL_TEXT } from '@/lib/vocab-constants'

/* Direction B sample. Search/filter/ranking logic is unchanged from the live
   page; only the presentation moved. Level is a labelled pill instead of stars. */

interface WordPart {
  wp: string; t: 'p'|'r'|'s'; lvl: 1|2|3
  d: string; ex: [string,string][]
}

const parts = partsData as WordPart[]
const TYPE_LABEL: Record<string,string> = { p:'Prefix', r:'Root', s:'Suffix' }
const EDGE: Record<string,string> = { p:'#3B82F6', r:'#3BAA6A', s:'#C94040' }

export default function WordPartsPage() {
  const [search, setSearch]     = useState('')
  const [typeFilter, setType]   = useState<'all'|'p'|'r'|'s'>('all')
  const [lvlFilter, setLvl]     = useState<number|null>(null)

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    const matched = parts.filter(p => {
      if (typeFilter !== 'all' && p.t !== typeFilter) return false
      if (lvlFilter && p.lvl !== lvlFilter) return false
      if (!q) return true
      return p.wp.toLowerCase().includes(q) || p.d.toLowerCase().includes(q)
        || p.ex.some(([term]) => term.toLowerCase().includes(q))
    })
    if (!q) return matched
    // Relevance: exact word-part (hyphens/slashes stripped) first, then wp substring,
    // then definition, then example-word-only matches last — so searching "trophy"
    // surfaces the "-trophy" card above prefix/root cards that merely cite it as an example.
    const wpClean = (wp: string) => wp.replace(/^-|-$/g, '').replace(/\//g, '').toLowerCase()
    const tier = (p: WordPart) => {
      const wp = p.wp.toLowerCase()
      if (wpClean(p.wp) === q || wp === q) return 0
      if (wp.includes(q)) return 1
      if (p.d.toLowerCase().includes(q)) return 2
      return 3
    }
    return matched
      .map((p, i) => ({ p, i, t: tier(p) }))
      .sort((a, b) => a.t - b.t || a.i - b.i)
      .map(x => x.p)
  }, [search, typeFilter, lvlFilter])

  // True when the top hit matched neither the word part nor its definition — i.e. only an
  // example word matched, so there's no real word-part match for the query.
  const noExact = useMemo(() => {
    const q = search.toLowerCase().trim()
    if (!q || filtered.length === 0) return false
    const top = filtered[0]
    return !top.wp.toLowerCase().includes(q) && !top.d.toLowerCase().includes(q)
  }, [search, filtered])

  const counts = useMemo(() => ({
    p: parts.filter(p => p.t==='p').length,
    r: parts.filter(p => p.t==='r').length,
    s: parts.filter(p => p.t==='s').length,
  }), [])

  const { visible, sentinelRef } = useInfiniteReveal(filtered.length, filtered)

  return (
    <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-5">

      {/* ── Sticky filter bar ── */}
      <div className="sticky top-[57px] z-[90] -mx-1 flex flex-col gap-3 bg-[var(--b-bg)] px-1 pb-4 pt-3">
        <div className="flex flex-wrap items-center gap-2">
          <input
            className="b-search min-w-[220px] flex-1"
            type="text"
            aria-label="Search word parts"
            placeholder="Search word parts, definitions, examples..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <Link
            href="/wordparts/flashcard"
            className="b-press b-focus whitespace-nowrap rounded-xl border border-[var(--b-border)] bg-[var(--b-panel)] px-4 py-2.5 text-[0.82rem] font-semibold hover:border-[var(--b-primary)] hover:text-[var(--b-primary)]"
          >
            Flashcard →
          </Link>
          <Link
            href="/wordparts/exam"
            className="b-press b-glow b-focus whitespace-nowrap rounded-xl bg-[var(--b-primary)] px-4 py-2.5 text-[0.82rem] font-bold text-[var(--b-on-prim)]"
          >
            Exam ✦
          </Link>
        </div>

        <div className="flex flex-wrap gap-2">
          {(['all','p','r','s'] as const).map(t => (
            <button
              key={t}
              className={`b-fpill b-focus ${typeFilter===t?'b-fpill--active':''}`}
              onClick={() => setType(t)}
            >
              {t==='all'?`All (${parts.length})`:t==='p'?`Prefixes (${counts.p})`:t==='r'?`Roots (${counts.r})`:`Suffixes (${counts.s})`}
            </button>
          ))}

          <span className="mx-1 w-px self-stretch bg-[var(--b-border)]" aria-hidden="true" />

          <button
            className={`b-fpill b-focus ${!lvlFilter?'b-fpill--active':''}`}
            onClick={() => setLvl(null)}
          >
            All levels
          </button>
          {([3,2,1] as const).map(l => (
            <button
              key={l}
              className={`b-fpill b-focus ${lvlFilter===l?'b-fpill--active':''}`}
              onClick={() => setLvl(lvlFilter===l?null:l)}
            >
              {LVL_TEXT[l]}
            </button>
          ))}
        </div>

        <div className="text-[0.78rem] font-medium text-[var(--b-dim)] tabular-nums">
          {filtered.length} {filtered.length === 1 ? 'entry' : 'entries'}
        </div>
      </div>

      {noExact && (
        <div className="rounded-xl border border-[var(--b-border)] bg-[var(--b-panel)] px-4 py-3 text-[0.84rem] text-[var(--b-dim)]">
          No matching word part. Showing parts that use “{search.trim()}” as an example.
        </div>
      )}

      {/* ── Cards ── */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(290px,1fr))] gap-4">
        {filtered.slice(0, visible).map(p => (
          <div
            key={p.wp}
            className="b-card b-lift b-press group flex flex-col gap-2.5 p-5"
            style={{ borderTop: `3px solid ${EDGE[p.t]}` }}
            tabIndex={0}
          >
            <div className="flex items-center justify-between gap-2">
              <span className={`b-badge b-badge--${p.t}`}>{TYPE_LABEL[p.t]}</span>
              <span className={`b-lvl b-lvl--${p.lvl}`}>{LVL_TEXT[p.lvl]}</span>
            </div>

            <div
              className="text-[1.32rem] font-bold leading-tight tracking-[-0.02em] text-[var(--b-text)]"
              style={{ fontFamily: 'var(--b-display)' }}
            >
              {p.wp}
            </div>

            <div className="text-[0.86rem] leading-[1.6] text-[var(--b-dim)]">{p.d}</div>

            <div className="mt-1 flex flex-col gap-1.5">
              {p.ex.slice(0, 2).map(([term, def], j) => (
                <div key={j} className="b-ex"><strong>{term}</strong> · {def}</div>
              ))}

              {p.ex.length > 2 && (
                <>
                  {/* Same reveal-on-hover behaviour as the live page, rebuilt with
                      a 0fr/1fr grid rather than the retro .c-expand-wrap. */}
                  <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-200 group-hover:grid-rows-[1fr] group-focus-within:grid-rows-[1fr]">
                    <div className="overflow-hidden">
                      <div className="flex flex-col gap-1.5 pt-1.5">
                        {p.ex.slice(2).map(([term, def], j) => (
                          <div key={j} className="b-ex"><strong>{term}</strong> · {def}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <span className="text-center text-[0.72rem] font-medium text-[var(--b-dim)] opacity-60 group-hover:opacity-0 group-focus-within:opacity-0">
                    +{p.ex.length - 2} more
                  </span>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <div ref={sentinelRef} aria-hidden="true" />

      {filtered.length === 0 && (
        <div className="py-16 text-center text-[0.92rem] text-[var(--b-dim)]">No word parts found.</div>
      )}
    </div>
  )
}
