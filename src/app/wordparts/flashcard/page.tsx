'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import partsData from '@/data/medical_wordparts_v1.05.json'

interface WordPart {
  wp: string; t: 'p'|'r'|'s'; lvl: 1|2|3
  d: string; ex: [[string,string],[string,string]]
}

const parts = partsData as WordPart[]
const TYPE_LABEL: Record<string,string> = { p:'Prefix', r:'Root', s:'Suffix' }

export default function WordPartsFlashcard() {
  const [typeFilter, setType] = useState<'all'|'p'|'r'|'s'>('all')
  const [lvlFilter, setLvl]   = useState<number|null>(null)
  const [deck, setDeck]       = useState<WordPart[]>([])
  const [cardIdx, setCardIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [score, setScore]     = useState(0)
  const [started, setStarted] = useState(false)

  const filtered = useMemo(() => parts.filter(p => {
    if (typeFilter !== 'all' && p.t !== typeFilter) return false
    if (lvlFilter && p.lvl !== lvlFilter) return false
    return true
  }), [typeFilter, lvlFilter])

  function startQuiz() {
    setDeck([...filtered].sort(() => Math.random() - 0.5))
    setCardIdx(0); setFlipped(false); setScore(0); setStarted(true)
  }
  function next() { setFlipped(false); setTimeout(() => setCardIdx(i => i+1), 150) }
  function handleGotIt() { setScore(s => s+1); next() }

  const card = deck[cardIdx]
  const done = started && cardIdx >= deck.length

  return (
    <>
      {/* ── Sticky filter bar ── */}
      <div className="c-filter-bar">
        <div className="c-search-row">
          <div className="c-filter-row" style={{ flex:1, marginBottom:0 }}>
            {(['all','p','r','s'] as const).map(t => (
              <button key={t} className={`c-pill ${typeFilter===t?'c-pill--active':''}`} onClick={() => setType(t)}>
                {t==='all'?'All':TYPE_LABEL[t]+'s'}
              </button>
            ))}
          </div>
          <div className="c-filter-row" style={{ marginBottom:0 }}>
            <button className={`c-pill ${!lvlFilter?'c-pill--active':''}`} onClick={() => setLvl(null)}>All</button>
            {[3,2,1].map(l => (
              <button key={l} className={`c-pill c-pill--star ${lvlFilter===l?'c-pill--active':''}`} onClick={() => setLvl(lvlFilter===l?null:l)}>
                {'★'.repeat(l)}
              </button>
            ))}
          </div>
          <Link href="/wordparts" className="c-btn-pixel" style={{ fontSize:'0.46rem', whiteSpace:'nowrap', padding:'0 1rem', display:'flex', alignItems:'center' }}>
            ← Glossary
          </Link>
        </div>
        <div className="c-count">{filtered.length} cards in deck</div>
      </div>

      {/* ── Quiz area ── */}
      <div style={{ maxWidth:'640px', margin:'2rem auto 0' }}>
        {!started ? (
          <div style={{ textAlign:'center', paddingTop:'2rem' }}>
            <p style={{ fontSize:'1rem', color:'var(--color-text-dim)', marginBottom:'2rem' }}>
              {filtered.length} cards selected — ready to start?
            </p>
            <button className="c-btn-pixel" onClick={startQuiz} style={{ fontSize:'0.55rem', padding:'0.7rem 2.5rem' }}>
              Start Quiz
            </button>
          </div>
        ) : done ? (
          <div style={{ textAlign:'center', paddingTop:'3rem' }}>
            <div style={{ fontFamily:'var(--font-pixel)', fontSize:'1.5rem', color:'var(--color-gold)', marginBottom:'0.75rem' }}>
              ✓ {score} / {deck.length}
            </div>
            <p style={{ color:'var(--color-text-dim)', marginBottom:'2rem' }}>
              {score===deck.length?'Perfect score!':score>=deck.length*0.8?'Great job!':'Keep practicing!'}
            </p>
            <div style={{ display:'flex', gap:'1rem', justifyContent:'center' }}>
              <button className="c-btn-pixel" onClick={startQuiz} style={{ fontSize:'0.5rem', padding:'0.6rem 1.5rem' }}>
                Try Again
              </button>
              <button className="c-btn-pixel" onClick={() => setStarted(false)} style={{ fontSize:'0.5rem', padding:'0.6rem 1.5rem' }}>
                Change Filters
              </button>
            </div>
          </div>
        ) : card && (
          <>
            {/* Progress bar */}
            <div style={{ marginBottom:'1.5rem' }}>
              <div style={{ height:'6px', background:'var(--color-border)', borderRadius:'3px', overflow:'hidden', marginBottom:'0.4rem' }}>
                <div style={{ height:'100%', background:'var(--color-gold)', borderRadius:'3px', width:`${(cardIdx/deck.length)*100}%`, transition:'width 0.3s' }} />
              </div>
              <div style={{ fontFamily:'var(--font-pixel)', fontSize:'0.42rem', color:'var(--color-text-dim)', textAlign:'right' }}>
                {cardIdx+1} / {deck.length} · ✓ {score}
              </div>
            </div>

            {/* Flip card */}
            <div onClick={() => setFlipped(f => !f)} style={{ perspective:'1000px', height:'380px', cursor:'pointer', marginBottom:'1.25rem' }}>
              <div style={{ position:'relative', width:'100%', height:'100%', transformStyle:'preserve-3d', transition:'transform 0.45s ease', transform:flipped?'rotateY(180deg)':'none' }}>
                {/* Front */}
                <div style={{ position:'absolute', inset:0, backfaceVisibility:'hidden', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'0.75rem', padding:'2rem', background:'var(--color-panel)', border:'1px solid var(--color-border)', boxShadow:'2px 2px 0 0 var(--color-border)' }}>
                  <span className={`c-badge c-badge--${card.t}`}>{TYPE_LABEL[card.t]}</span>
                  <div style={{ fontSize:'2.8rem', fontWeight:700, color:'var(--color-text)', textAlign:'center' }}>{card.wp}</div>
                  <span style={{ fontSize:'1.4rem', color:'#EF9F27', opacity:card.lvl===3?1:card.lvl===2?0.75:0.45 }}>{'★'.repeat(card.lvl)}</span>
                  <p style={{ fontFamily:'var(--font-pixel)', fontSize:'0.48rem', color:'var(--color-text-dim)', marginTop:'auto' }}>Tap to reveal</p>
                </div>
                {/* Back */}
                <div style={{ position:'absolute', inset:0, backfaceVisibility:'hidden', transform:'rotateY(180deg)', display:'flex', flexDirection:'column', alignItems:'center', padding:'1.5rem 2rem', gap:'0.75rem', background:'var(--color-panel)', border:`1px solid var(--color-gold-dim)`, overflowY:'auto' }}>
                  <div style={{ fontSize:'2rem', fontWeight:700, color:'var(--color-text)', textAlign:'center' }}>{card.wp}</div>
                  <div style={{ fontSize:'1rem', color:'var(--color-text-dim)', textAlign:'center', lineHeight:1.6 }}>{card.d}</div>
                  <div style={{ width:'100%', display:'flex', flexDirection:'column', gap:'0.4rem', marginTop:'0.5rem' }}>
                    {card.ex.map(([term,def],j) => (
                      <div key={j} className={`c-ex-pill c-ex-pill--${card.t}`}><strong>{term}</strong> — {def}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Got it / Miss */}
            {flipped && (
              <div style={{ display:'flex', gap:'1rem', justifyContent:'center' }}>
                <button
                  onClick={next}
                  className="c-btn-pixel"
                  style={{ fontSize:'0.6rem', padding:'0.7rem 1.8rem', background:'rgba(201,64,64,0.15)', color:'#FCA5A5', border:'1px solid #C94040', boxShadow:'none' }}
                >✗ Miss</button>
                <button
                  onClick={handleGotIt}
                  className="c-btn-pixel"
                  style={{ fontSize:'0.6rem', padding:'0.7rem 1.8rem', background:'rgba(59,170,106,0.15)', color:'#6EE7B7', border:'1px solid #3BAA6A', boxShadow:'none' }}
                >✓ Got it</button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}
