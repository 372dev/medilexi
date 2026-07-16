'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import partsData from '@/data/medical_wordparts.json'
import { useInfiniteReveal } from '@/lib/use-infinite-reveal'
import { LVL_TEXT } from '@/lib/vocab-constants'

interface WordPart {
  wp: string; t: 'p'|'r'|'s'; lvl: 1|2|3
  d: string; ex: [string,string][]
}

const parts = partsData as WordPart[]
const TYPE_LABEL: Record<string,string> = { p:'Prefix', r:'Root', s:'Suffix' }

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
    <>
      {/* ── Sticky filter bar ── */}
      <div className="c-filter-bar">
        <div className="c-search-row">
          <input className="c-search" type="text" aria-label="Search word parts" placeholder="Search word parts, definitions, examples..." value={search} onChange={e => setSearch(e.target.value)} />
          <Link href="/wordparts/flashcard" className="c-btn-pixel" style={{ fontSize:'0.5rem', whiteSpace:'nowrap', padding:'0 1rem', display:'flex', alignItems:'center' }}>
            Flashcard →
          </Link>
          <Link href="/wordparts/exam" className="c-btn-pixel" style={{ fontSize:'0.5rem', whiteSpace:'nowrap', padding:'0 1rem', display:'flex', alignItems:'center' }}>
            Exam →
          </Link>
        </div>
        <div className="c-filter-row">
          {(['all','p','r','s'] as const).map(t => (
            <button key={t} className={`c-pill ${typeFilter===t?'c-pill--active':''}`} onClick={() => setType(t)}>
              {t==='all'?`All (${parts.length})`:t==='p'?`Prefixes (${counts.p})`:t==='r'?`Roots (${counts.r})`:`Suffixes (${counts.s})`}
            </button>
          ))}
        </div>
        <div className="c-filter-row">
          <button className={`c-pill ${!lvlFilter?'c-pill--active':''}`} onClick={() => setLvl(null)}>All levels</button>
          {([[3,'⭐⭐⭐ Essential'],[2,'⭐⭐ Important'],[1,'⭐ Good to know']] as const).map(([l, label]) => (
            <button key={l} className={`c-pill c-pill--star ${lvlFilter===l?'c-pill--active':''}`} onClick={() => setLvl(lvlFilter===l?null:l)}>
              {label}
            </button>
          ))}
        </div>
        <div className="c-count">{filtered.length} entries</div>
      </div>

      {noExact && <div className="c-search-note">No matching word part. Showing parts that use “{search.trim()}” as an example.</div>}

      {/* ── Cards ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px,1fr))', gap:'1rem' }}>
        {filtered.slice(0, visible).map((p) => {
          return (
            <div
              key={p.wp}
              className="c-card c-wp-card"
              style={{ borderLeft:`3px solid ${p.t==='p'?'#3B82F6':p.t==='r'?'#3BAA6A':'#C94040'}`, cursor:'pointer', userSelect:'none' }}
              tabIndex={0}
            >
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.5rem' }}>
                <span className={`c-badge c-badge--${p.t}`}>{TYPE_LABEL[p.t]}</span>
                <span className={`c-stars c-stars--${p.lvl}`} role="img" aria-label={`Importance: ${LVL_TEXT[p.lvl]}`}>{'⭐'.repeat(p.lvl)}</span>
              </div>
              <div style={{ fontSize:'1.2rem', fontWeight:700, color:'var(--color-text)', marginBottom:'0.25rem' }}>{p.wp}</div>
              <div style={{ fontSize:'0.88rem', color:'var(--color-text-dim)', marginBottom:'0.75rem', lineHeight:1.6 }}>{p.d}</div>
              <div style={{ display:'flex', flexDirection:'column', gap:'0.35rem' }}>
                {p.ex.slice(0, 2).map(([term, def], j) => (
                  <div key={j} className={`c-ex-pill c-ex-pill--${p.t}`}>
                    <strong>{term}</strong> · {def}
                  </div>
                ))}
                {p.ex.length > 2 && (
                  <div className="c-expand-wrap">
                    <div>
                      <div style={{ display:'flex', flexDirection:'column', gap:'0.35rem', paddingTop:'0.35rem' }}>
                        {p.ex.slice(2).map(([term, def], j) => (
                          <div key={j} className={`c-ex-pill c-ex-pill--${p.t}`}>
                            <strong>{term}</strong> · {def}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div style={{ display:'flex', justifyContent:'center', marginTop:'0.75rem' }}>
                <span className="c-wp-hint" aria-hidden="true" style={{ fontFamily:'var(--font-pixel)', fontSize:'0.5rem', color:'var(--color-text-dim)', opacity:0.55, pointerEvents:'none' }} />
              </div>
            </div>
          )
        })}
      </div>
      <div ref={sentinelRef} aria-hidden="true" />
      {filtered.length === 0 && <div className="c-empty">No word parts found.</div>}
    </>
  )
}
