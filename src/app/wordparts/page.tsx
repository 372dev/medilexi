'use client'

import { useState, useMemo } from 'react'
import partsData from '@/data/medical_wordparts_v1.05.json'

interface WordPart {
  wp: string; t: 'p'|'r'|'s'; lvl: 1|2|3
  d: string; ex: [[string,string],[string,string]]
}

const parts = partsData as WordPart[]
const TYPE_LABEL: Record<string,string> = { p:'Prefix', r:'Root', s:'Suffix' }

export default function WordPartsPage() {
  const [tab, setTab]         = useState<'glossary'|'flashcard'>('glossary')
  const [search, setSearch]   = useState('')
  const [typeFilter, setType] = useState<'all'|'p'|'r'|'s'>('all')
  const [lvlFilter, setLvl]   = useState<number|null>(null)

  // Flashcard
  const [deck, setDeck]     = useState<WordPart[]>([])
  const [cardIdx, setCardIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [score, setScore]   = useState(0)
  const [started, setStarted] = useState(false)

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

  function startFlashcards() {
    setDeck([...filtered].sort(() => Math.random() - 0.5))
    setCardIdx(0); setFlipped(false); setScore(0); setStarted(true)
  }
  function next() { setFlipped(false); setTimeout(() => setCardIdx(i => i+1), 150) }
  function handleGotIt() { setScore(s => s+1); next() }

  const card = deck[cardIdx]
  const done = started && cardIdx >= deck.length

  return (
    <>
      <h2 style={{ fontFamily:'var(--font-pixel)', fontSize:'0.65rem', color:'var(--color-gold)', marginBottom:'1.5rem' }}>
        Prefix · Root · Suffix
      </h2>

      {/* Tabs */}
      <div className="c-tabs">
        <button className={`c-tab ${tab==='glossary'?'c-tab--active':''}`} onClick={() => setTab('glossary')}>Word Parts</button>
        <button className={`c-tab ${tab==='flashcard'?'c-tab--active':''}`} onClick={() => { setTab('flashcard'); setStarted(false) }}>Flashcard Quiz</button>
      </div>

      {/* ── GLOSSARY ── */}
      {tab === 'glossary' && (
        <>
          <input className="c-search" type="text" placeholder="Search word parts, definitions, examples..." value={search} onChange={e => setSearch(e.target.value)} />

          <div className="c-filter-row">
            {(['all','p','r','s'] as const).map(t => (
              <button key={t} className={`c-pill ${typeFilter===t?'c-pill--active':''}`} onClick={() => setType(t)}>
                {t==='all'?`All (${parts.length})`:t==='p'?`Prefixes (${counts.p})`:t==='r'?`Roots (${counts.r})`:`Suffixes (${counts.s})`}
              </button>
            ))}
          </div>

          <div className="c-filter-row">
            <button className={`c-pill ${!lvlFilter?'c-pill--active':''}`} onClick={() => setLvl(null)}>All levels</button>
            {[3,2,1].map(l => (
              <button key={l} className={`c-pill c-pill--star ${lvlFilter===l?'c-pill--active':''}`} onClick={() => setLvl(lvlFilter===l?null:l)}>
                {'★'.repeat(l)}
              </button>
            ))}
          </div>

          <div style={{ display:'flex', gap:'1.5rem', flexWrap:'wrap', fontSize:'0.72rem', color:'var(--color-text-dim)', marginBottom:'0.5rem' }}>
            <span>★★★ Essential</span><span>★★ Frequently used</span><span>★ Good to know</span>
          </div>

          <div className="c-count">{filtered.length} entries</div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px,1fr))', gap:'1rem' }}>
            {filtered.map((p,i) => (
              <div key={i} className="c-card" style={{ borderLeft:`3px solid ${p.t==='p'?'#3B82F6':p.t==='r'?'#3BAA6A':'#C94040'}` }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.5rem' }}>
                  <span className={`c-badge c-badge--${p.t}`}>{TYPE_LABEL[p.t]}</span>
                  <span style={{ fontSize:'0.75rem', color:'#EF9F27', opacity: p.lvl===3?1:p.lvl===2?0.75:0.45 }}>{'★'.repeat(p.lvl)}</span>
                </div>
                <div style={{ fontSize:'1.1rem', fontWeight:700, color:'var(--color-text)', marginBottom:'0.25rem' }}>{p.wp}</div>
                <div style={{ fontSize:'0.78rem', color:'var(--color-text-dim)', marginBottom:'0.75rem', lineHeight:1.5 }}>{p.d}</div>
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
      )}

      {/* ── FLASHCARD ── */}
      {tab === 'flashcard' && (
        <div style={{ maxWidth:'640px', margin:'0 auto', paddingTop:'1rem' }}>
          {!started ? (
            <div style={{ textAlign:'center' }}>
              <div className="c-filter-row" style={{ justifyContent:'center' }}>
                {(['all','p','r','s'] as const).map(t => (
                  <button key={t} className={`c-pill ${typeFilter===t?'c-pill--active':''}`} onClick={() => setType(t)}>
                    {t==='all'?'All':TYPE_LABEL[t]}
                  </button>
                ))}
              </div>
              <div className="c-filter-row" style={{ justifyContent:'center' }}>
                <button className={`c-pill ${!lvlFilter?'c-pill--active':''}`} onClick={() => setLvl(null)}>All levels</button>
                {[3,2,1].map(l => (
                  <button key={l} className={`c-pill c-pill--star ${lvlFilter===l?'c-pill--active':''}`} onClick={() => setLvl(lvlFilter===l?null:l)}>
                    {'★'.repeat(l)}
                  </button>
                ))}
              </div>
              <p style={{ fontSize:'0.85rem', color:'var(--color-text-dim)', margin:'1rem 0' }}>{filtered.length} cards in deck</p>
              <button className="c-btn-pixel" onClick={startFlashcards} style={{ fontSize:'0.55rem', padding:'0.7rem 2rem' }}>Start Quiz</button>
            </div>
          ) : done ? (
            <div style={{ textAlign:'center', padding:'3rem 0' }}>
              <div style={{ fontFamily:'var(--font-pixel)', fontSize:'1.2rem', color:'var(--color-gold)', marginBottom:'0.5rem' }}>✓ {score} / {deck.length}</div>
              <p style={{ color:'var(--color-text-dim)', marginBottom:'2rem' }}>{score===deck.length?'Perfect score!':score>=deck.length*0.8?'Great job!':'Keep practicing!'}</p>
              <button className="c-btn-pixel" onClick={() => setStarted(false)} style={{ fontSize:'0.55rem', padding:'0.7rem 2rem' }}>New Round</button>
            </div>
          ) : card && (
            <>
              {/* Progress */}
              <div style={{ marginBottom:'1.5rem' }}>
                <div style={{ height:'6px', background:'var(--color-border)', borderRadius:'3px', overflow:'hidden', marginBottom:'0.4rem' }}>
                  <div style={{ height:'100%', background:'var(--color-gold)', borderRadius:'3px', width:`${(cardIdx/deck.length)*100}%`, transition:'width 0.3s' }} />
                </div>
                <div style={{ fontFamily:'var(--font-pixel)', fontSize:'0.42rem', color:'var(--color-text-dim)', textAlign:'right' }}>
                  {cardIdx+1} / {deck.length} · ✓ {score}
                </div>
              </div>

              {/* Flip card */}
              <div onClick={() => setFlipped(f => !f)} style={{ perspective:'1000px', height:'320px', cursor:'pointer', marginBottom:'1rem' }}>
                <div style={{ position:'relative', width:'100%', height:'100%', transformStyle:'preserve-3d', transition:'transform 0.45s ease', transform: flipped?'rotateY(180deg)':'none' }}>
                  {/* Front */}
                  <div style={{ position:'absolute', inset:0, backfaceVisibility:'hidden', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'0.75rem', padding:'2rem', background:'var(--color-panel)', border:'1px solid var(--color-border)', boxShadow:'2px 2px 0 0 var(--color-border)' }}>
                    <span className={`c-badge c-badge--${card.t}`}>{TYPE_LABEL[card.t]}</span>
                    <div style={{ fontSize:'1.8rem', fontWeight:700, color:'var(--color-text)', textAlign:'center' }}>{card.wp}</div>
                    <span style={{ fontSize:'1rem', color:'#EF9F27' }}>{'★'.repeat(card.lvl)}</span>
                    <p style={{ fontFamily:'var(--font-pixel)', fontSize:'0.4rem', color:'var(--color-text-dim)', marginTop:'auto' }}>Tap to reveal</p>
                  </div>
                  {/* Back */}
                  <div style={{ position:'absolute', inset:0, backfaceVisibility:'hidden', transform:'rotateY(180deg)', display:'flex', flexDirection:'column', alignItems:'center', padding:'1.5rem 2rem', gap:'0.75rem', background:'var(--color-panel)', border:`1px solid var(--color-gold-dim)`, overflowY:'auto' }}>
                    <div style={{ fontSize:'1.4rem', fontWeight:700, color:'var(--color-text)', textAlign:'center' }}>{card.wp}</div>
                    <div style={{ fontSize:'0.85rem', color:'var(--color-text-dim)', textAlign:'center', lineHeight:1.5 }}>{card.d}</div>
                    <div style={{ width:'100%', display:'flex', flexDirection:'column', gap:'0.4rem' }}>
                      {card.ex.map(([term,def],j) => (
                        <div key={j} className={`c-ex-pill c-ex-pill--${card.t}`}><strong>{term}</strong> — {def}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {flipped && (
                <div style={{ display:'flex', gap:'1rem', justifyContent:'center' }}>
                  <button onClick={next} style={{ fontFamily:'var(--font-pixel)', fontSize:'0.52rem', padding:'0.6rem 1.5rem', background:'rgba(201,64,64,0.15)', color:'#FCA5A5', border:'1px solid #C94040', cursor:'pointer', lineHeight:1.8 }}>✗ Miss</button>
                  <button onClick={handleGotIt} style={{ fontFamily:'var(--font-pixel)', fontSize:'0.52rem', padding:'0.6rem 1.5rem', background:'rgba(59,170,106,0.15)', color:'#6EE7B7', border:'1px solid #3BAA6A', cursor:'pointer', lineHeight:1.8 }}>✓ Got it</button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </>
  )
}
