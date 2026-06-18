'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import partsData from '@/data/medical_wordparts_v1.07.json'

interface WordPart {
  wp: string; t: 'p'|'r'|'s'; lvl: 1|2|3
  d: string; ex: [[string,string],[string,string]]
}

const parts = partsData as WordPart[]
const TYPE_LABEL: Record<string,string> = { p:'Prefix', r:'Root', s:'Suffix' }

export default function WordPartsPage() {
  const [search, setSearch]   = useState('')
  const [typeFilter, setType] = useState<'all'|'p'|'r'|'s'>('all')
  const [lvlFilter, setLvl]   = useState<number|null>(null)

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return parts.filter(p => {
      if (typeFilter !== 'all' && p.t !== typeFilter) return false
      if (lvlFilter && p.lvl !== lvlFilter) return false
      if (!q) return true
      return p.wp.toLowerCase().includes(q) || p.d.toLowerCase().includes(q)
        || p.ex[0][0].toLowerCase().includes(q) || p.ex[1][0].toLowerCase().includes(q)
    })
  }, [search, typeFilter, lvlFilter])

  const counts = useMemo(() => ({
    p: parts.filter(p => p.t==='p').length,
    r: parts.filter(p => p.t==='r').length,
    s: parts.filter(p => p.t==='s').length,
  }), [])

  return (
    <>
      {/* ── Sticky filter bar ── */}
      <div className="c-filter-bar">
        {/* Row 1: search + flashcard button */}
        <div className="c-search-row">
          <input className="c-search" type="text" placeholder="Search word parts, definitions, examples..." value={search} onChange={e => setSearch(e.target.value)} />
          <Link href="/wordparts/flashcard" className="c-btn-pixel" style={{ fontSize:'0.5rem', whiteSpace:'nowrap', padding:'0 1rem', display:'flex', alignItems:'center' }}>
            Flashcard Quiz →
          </Link>
        </div>
        {/* Row 2: type pills */}
        <div className="c-filter-row">
          {(['all','p','r','s'] as const).map(t => (
            <button key={t} className={`c-pill ${typeFilter===t?'c-pill--active':''}`} onClick={() => setType(t)}>
              {t==='all'?`All (${parts.length})`:t==='p'?`Prefixes (${counts.p})`:t==='r'?`Roots (${counts.r})`:`Suffixes (${counts.s})`}
            </button>
          ))}
        </div>
        {/* Row 3: level pills */}
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

      {/* ── Cards ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px,1fr))', gap:'1rem' }}>
        {filtered.map((p,i) => (
          <div key={i} className="c-card" style={{ borderLeft:`3px solid ${p.t==='p'?'#3B82F6':p.t==='r'?'#3BAA6A':'#C94040'}` }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.5rem' }}>
              <span className={`c-badge c-badge--${p.t}`}>{TYPE_LABEL[p.t]}</span>
              <span className={`c-stars c-stars--${p.lvl}`}>{'⭐'.repeat(p.lvl)}</span>
            </div>
            <div style={{ fontSize:'1.2rem', fontWeight:700, color:'var(--color-text)', marginBottom:'0.25rem' }}>{p.wp}</div>
            <div style={{ fontSize:'0.88rem', color:'var(--color-text-dim)', marginBottom:'0.75rem', lineHeight:1.6 }}>{p.d}</div>
            <div style={{ display:'flex', flexDirection:'column', gap:'0.35rem' }}>
              {p.ex.map(([term,def],j) => (
                <div key={j} className={`c-ex-pill c-ex-pill--${p.t}`}>
                  <strong>{term}</strong> — {def}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {filtered.length === 0 && <div className="c-empty">No word parts found.</div>}
    </>
  )
}
