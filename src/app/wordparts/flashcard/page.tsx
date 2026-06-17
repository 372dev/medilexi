'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import Link from 'next/link'
import partsData from '@/data/medical_wordparts_v1.07.json'

interface WordPart {
  wp: string; t: 'p'|'r'|'s'; lvl: 1|2|3
  d: string; ex: [[string,string],[string,string]]
}

const parts = partsData as WordPart[]
const TYPE_LABEL: Record<string,string> = { p:'Prefix', r:'Root', s:'Suffix' }
const COUNT_OPTIONS: (number | null)[] = [null, 100, 50, 25]

export default function WordPartsFlashcard() {
  /* ── Settings ── */
  const [showSettings, setShowSettings] = useState(true)
  const [mode,        setMode]   = useState<'study'|'quiz'>('quiz')
  const [typeFilter,  setType]   = useState<'all'|'p'|'r'|'s'>('all')
  const [lvlFilter,   setLvl]    = useState<number|null>(null)
  const [countLimit,  setCount]  = useState<number|null>(null)

  /* ── Session ── */
  const [deck,    setDeck]    = useState<WordPart[]>([])
  const [cardIdx, setCardIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [score,   setScore]   = useState(0)
  const [started, setStarted] = useState(false)

  /* Refs for keyboard handler */
  const flippedRef = useRef(false)
  const cardIdxRef = useRef(0)
  const doneRef    = useRef(false)
  useEffect(() => { flippedRef.current = flipped }, [flipped])
  useEffect(() => { cardIdxRef.current = cardIdx }, [cardIdx])

  /* ── Derived ── */
  const filtered = useMemo(() => parts.filter(p => {
    if (typeFilter !== 'all' && p.t !== typeFilter) return false
    if (lvlFilter && p.lvl !== lvlFilter) return false
    return true
  }), [typeFilter, lvlFilter])

  const previewCount = countLimit ? Math.min(countLimit, filtered.length) : filtered.length
  const card = deck[cardIdx]
  const done = started && cardIdx >= deck.length

  useEffect(() => { doneRef.current = done }, [done])

  /* ── Actions ── */
  function startDeck() {
    const arr = [...filtered].sort(() => Math.random() - 0.5)
    const limited = countLimit ? arr.slice(0, countLimit) : arr
    setDeck(limited)
    setCardIdx(0); setFlipped(false); setScore(0)
    setStarted(true); setShowSettings(false)
  }
  function next() { setFlipped(false); setTimeout(() => setCardIdx(i => i + 1), 150) }
  function prev() {
    if (cardIdxRef.current === 0) return
    setFlipped(false)
    setTimeout(() => setCardIdx(i => Math.max(0, i - 1)), 150)
  }
  function handleGotIt() { setScore(s => s + 1); next() }

  /* ── Keyboard ── */
  useEffect(() => {
    if (!started || showSettings) return
    function onKey(e: KeyboardEvent) {
      if (doneRef.current) return
      if (e.code === 'Space') { e.preventDefault(); setFlipped(f => !f); return }
      if (mode === 'study') {
        if (e.code === 'ArrowRight') next()
        if (e.code === 'ArrowLeft')  prev()
      } else {
        if (e.code === 'ArrowRight' && flippedRef.current) handleGotIt()
        if (e.code === 'ArrowLeft'  && flippedRef.current) next()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [started, showSettings, mode])

  return (
    <>
      {/* ── Settings Modal ── */}
      {showSettings && (
        <div style={{ position:'fixed', inset:0, zIndex:200, background:'rgba(13,11,43,0.94)', display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}>
          <div style={{ background:'var(--color-panel)', border:'1px solid var(--color-border)', padding:'2rem', width:'100%', maxWidth:'420px', boxShadow:'4px 4px 0 0 rgba(240,180,41,0.2)' }}>
            <div style={{ fontFamily:'var(--font-pixel)', fontSize:'0.6rem', color:'var(--color-gold)', lineHeight:2, marginBottom:'1.75rem' }}>
              Flashcard Setup
            </div>

            {/* Mode */}
            <div style={{ marginBottom:'1.25rem' }}>
              <div style={{ fontSize:'0.8rem', color:'var(--color-text-dim)', marginBottom:'0.5rem' }}>Mode</div>
              <div className="c-toggle">
                <button className={`c-toggle__btn ${mode==='study'?'c-toggle__btn--active':''}`} onClick={() => setMode('study')}>Study</button>
                <button className={`c-toggle__btn ${mode==='quiz' ?'c-toggle__btn--active':''}`} onClick={() => setMode('quiz')}>Quiz</button>
              </div>
              <div style={{ fontSize:'0.78rem', color:'var(--color-text-dim)', marginTop:'0.5rem', opacity:0.7 }}>
                {mode === 'study'
                  ? 'Browse freely — Space to flip, ← → to navigate'
                  : "Mark each card — Space to flip, ← Miss · Got it →"}
              </div>
            </div>

            {/* Type */}
            <div style={{ marginBottom:'1.25rem' }}>
              <div style={{ fontSize:'0.8rem', color:'var(--color-text-dim)', marginBottom:'0.5rem' }}>Type</div>
              <div className="c-filter-row" style={{ marginBottom:0 }}>
                <button className={`c-pill ${typeFilter==='all'?'c-pill--active':''}`} onClick={() => setType('all')}>All</button>
                {(['p','r','s'] as const).map(t => (
                  <button key={t} className={`c-pill ${typeFilter===t?'c-pill--active':''}`} onClick={() => setType(t)}>{TYPE_LABEL[t]}s</button>
                ))}
              </div>
            </div>

            {/* Level */}
            <div style={{ marginBottom:'1.25rem' }}>
              <div style={{ fontSize:'0.8rem', color:'var(--color-text-dim)', marginBottom:'0.5rem' }}>Level</div>
              <div className="c-filter-row" style={{ marginBottom:0 }}>
                <button className={`c-pill ${!lvlFilter?'c-pill--active':''}`} onClick={() => setLvl(null)}>All</button>
                {[3,2,1].map(l => (
                  <button key={l} className={`c-pill c-pill--star ${lvlFilter===l?'c-pill--active':''}`} onClick={() => setLvl(lvlFilter===l?null:l)}>
                    {'⭐'.repeat(l)}
                  </button>
                ))}
              </div>
            </div>

            {/* Count */}
            <div style={{ marginBottom:'1.5rem' }}>
              <div style={{ fontSize:'0.8rem', color:'var(--color-text-dim)', marginBottom:'0.5rem' }}>Cards per session</div>
              <div className="c-toggle">
                {COUNT_OPTIONS.map(n => (
                  <button key={n ?? 'all'} className={`c-toggle__btn ${countLimit===n?'c-toggle__btn--active':''}`}
                    onClick={() => setCount(n)}>{n ?? 'All'}</button>
                ))}
              </div>
            </div>

            {/* Distribution */}
            <div style={{ borderTop:'1px solid var(--color-border)', paddingTop:'1rem', marginBottom:'1.25rem' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:'0.55rem' }}>
                <span style={{ fontFamily:'var(--font-pixel)', fontSize:'0.75rem', color:'var(--color-gold)' }}>{previewCount}</span>
                <span style={{ fontSize:'0.8rem', color:'var(--color-text-dim)' }}>
                  {countLimit && filtered.length > countLimit ? `random from ${filtered.length}` : 'cards selected'}
                </span>
              </div>
              <div style={{ height:'6px', display:'flex', borderRadius:'3px', overflow:'hidden', marginBottom:'0.55rem', background:'var(--color-border)' }}>
                {([3,2,1] as const).map((l, i) => {
                  const cnt = filtered.filter(p => p.lvl === l).length
                  const color = i===0 ? '#F0B429' : i===1 ? '#9B8FEF' : '#3D36A0'
                  return cnt > 0 ? <div key={l} style={{ width:`${(cnt/filtered.length)*100}%`, background:color, transition:'width 0.3s' }} /> : null
                })}
              </div>
              <div style={{ display:'flex', gap:'1rem' }}>
                {([3,2,1] as const).map((l, i) => {
                  const color = i===0 ? '#F0B429' : i===1 ? '#9B8FEF' : '#5A5490'
                  const label = i===0 ? '⭐⭐⭐' : i===1 ? '⭐⭐' : '⭐'
                  return (
                    <span key={l} style={{ fontSize:'0.78rem', color:'var(--color-text-dim)' }}>
                      <span style={{ color }}>{label}</span> {filtered.filter(p => p.lvl === l).length}
                    </span>
                  )
                })}
              </div>
            </div>

            <button className="c-btn-pixel" onClick={startDeck} disabled={previewCount===0}
              style={{ width:'100%', fontSize:'0.6rem', padding:'0.85rem', opacity:previewCount===0?0.4:1, cursor:previewCount===0?'not-allowed':'pointer' }}>
              Start →
            </button>

            <div style={{ textAlign:'center', marginTop:'1.25rem', display:'flex', flexDirection:'column', gap:'0.4rem' }}>
              <Link href="/wordparts" style={{ fontSize:'0.82rem', color:'var(--color-text-dim)', textDecoration:'underline' }}>
                ← Back to Word Parts
              </Link>
              <Link href="/" style={{ fontSize:'0.82rem', color:'var(--color-text-dim)', textDecoration:'underline', opacity:0.6 }}>
                ← Back to Main
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── Session area ── */}
      {started && !showSettings && (
        <div style={{ maxWidth:'640px', margin:'2rem auto 0' }}>

          {/* ── Active card ── */}
          {!done && card && (
            <>
              {/* Top row: progress + ⚙ */}
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'0.5rem' }}>
                <div style={{ fontFamily:'var(--font-pixel)', fontSize:'0.5rem', color:'var(--color-text-dim)' }}>
                  {cardIdx+1} / {deck.length}
                  {mode==='quiz'  && <span style={{ marginLeft:'0.75rem' }}>✓ {score}</span>}
                  {mode==='study' && <span style={{ marginLeft:'0.75rem', opacity:0.5 }}>Study</span>}
                </div>
                <button onClick={() => setShowSettings(true)}
                  style={{ fontFamily:'var(--font-pixel)', fontSize:'0.45rem', color:'var(--color-text-dim)', background:'none', border:'1px solid var(--color-border)', padding:'0.2rem 0.55rem', cursor:'pointer', lineHeight:1.8, opacity:0.7 }}>
                  ⚙
                </button>
              </div>

              {/* Progress bar */}
              <div style={{ height:'6px', background:'var(--color-border)', borderRadius:'3px', overflow:'hidden', marginBottom:'1.25rem' }}>
                <div style={{ height:'100%', background:'var(--color-gold)', borderRadius:'3px', width:`${(cardIdx/deck.length)*100}%`, transition:'width 0.3s' }} />
              </div>

              {/* Flip card */}
              <div onClick={() => setFlipped(f => !f)} style={{ perspective:'1000px', height:'380px', cursor:'pointer', marginBottom:'1.25rem' }}>
                <div style={{ position:'relative', width:'100%', height:'100%', transformStyle:'preserve-3d', transition:'transform 0.45s ease', transform:flipped?'rotateY(180deg)':'none' }}>
                  {/* Front */}
                  <div style={{ position:'absolute', inset:0, backfaceVisibility:'hidden', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'0.75rem', padding:'2rem', background:'var(--color-panel)', border:'1px solid var(--color-border)', boxShadow:'2px 2px 0 0 var(--color-border)' }}>
                    <span className={`c-badge c-badge--${card.t}`}>{TYPE_LABEL[card.t]}</span>
                    <div style={{ fontSize:'2.8rem', fontWeight:700, color:'var(--color-text)', textAlign:'center' }}>{card.wp}</div>
                    <span className={`c-stars c-stars--${card.lvl}`} style={{ fontSize:'1.4rem' }}>{'⭐'.repeat(card.lvl)}</span>
                    <p style={{ fontFamily:'var(--font-pixel)', fontSize:'0.5rem', color:'var(--color-text-dim)', marginTop:'auto' }}>Space or tap to reveal</p>
                  </div>
                  {/* Back */}
                  <div style={{ position:'absolute', inset:0, backfaceVisibility:'hidden', transform:'rotateY(180deg)', display:'flex', flexDirection:'column', alignItems:'center', padding:'1.5rem 2rem', gap:'0.75rem', background:'var(--color-panel)', border:'1px solid var(--color-gold-dim)', overflowY:'auto' }}>
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

              {/* Study: prev / next */}
              {mode === 'study' && (
                <>
                  <div style={{ display:'flex', gap:'1rem', justifyContent:'center' }}>
                    <button onClick={prev} className="c-btn-pixel" disabled={cardIdx===0}
                      style={{ fontSize:'0.55rem', padding:'0.6rem 1.5rem', opacity:cardIdx===0?0.35:1, background:'var(--color-panel)', color:'var(--color-text-dim)', border:'1px solid var(--color-border)', boxShadow:'none' }}>
                      ← Prev
                    </button>
                    <button onClick={next} className="c-btn-pixel" style={{ fontSize:'0.55rem', padding:'0.6rem 1.5rem' }}>
                      Next →
                    </button>
                  </div>
                  <p style={{ textAlign:'center', fontFamily:'var(--font-pixel)', fontSize:'0.5rem', color:'var(--color-text-dim)', marginTop:'1rem', opacity:0.5 }}>
                    Space · flip &nbsp;&nbsp; ← Prev &nbsp;&nbsp; Next →
                  </p>
                </>
              )}

              {/* Quiz: judge after flip */}
              {mode === 'quiz' && (
                flipped ? (
                  <div style={{ display:'flex', gap:'1rem', justifyContent:'center' }}>
                    <button onClick={next} className="c-btn-pixel"
                      style={{ fontSize:'0.6rem', padding:'0.7rem 1.8rem', background:'rgba(201,64,64,0.15)', color:'#FCA5A5', border:'1px solid #C94040', boxShadow:'none' }}>
                      ← ✗ Miss
                    </button>
                    <button onClick={handleGotIt} className="c-btn-pixel"
                      style={{ fontSize:'0.6rem', padding:'0.7rem 1.8rem', background:'rgba(59,170,106,0.15)', color:'#6EE7B7', border:'1px solid #3BAA6A', boxShadow:'none' }}>
                      ✓ Got it →
                    </button>
                  </div>
                ) : (
                  <p style={{ textAlign:'center', fontFamily:'var(--font-pixel)', fontSize:'0.5rem', color:'var(--color-text-dim)', opacity:0.55 }}>
                    Space · flip &nbsp;&nbsp; ← · miss &nbsp;&nbsp; got it · →
                  </p>
                )
              )}
            </>
          )}

          {/* ── Done screen ── */}
          {done && (
            <div style={{ textAlign:'center', paddingTop:'3rem' }}>
              <div style={{ fontFamily:'var(--font-pixel)', fontSize:'1.5rem', color:'var(--color-gold)', marginBottom:'0.75rem' }}>
                {mode==='quiz' ? `✓ ${score} / ${deck.length}` : 'All done!'}
              </div>
              <p style={{ color:'var(--color-text-dim)', marginBottom:'2rem' }}>
                {mode==='quiz'
                  ? (score===deck.length ? 'Perfect score!' : score>=deck.length*0.8 ? 'Great job!' : 'Keep practicing!')
                  : `${deck.length} cards reviewed.`}
              </p>
              <div style={{ display:'flex', gap:'1rem', justifyContent:'center', flexWrap:'wrap' }}>
                <button className="c-btn-pixel" onClick={startDeck} style={{ fontSize:'0.5rem', padding:'0.6rem 1.5rem' }}>
                  ↺ Try Again
                </button>
                <button className="c-btn-pixel" onClick={() => setShowSettings(true)}
                  style={{ fontSize:'0.5rem', padding:'0.6rem 1.5rem', background:'var(--color-panel)', color:'var(--color-text-dim)', border:'1px solid var(--color-border)', boxShadow:'none' }}>
                  New Session
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
}
