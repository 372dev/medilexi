'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import Link from 'next/link'
import vocabData from '@/data/medical_vocab.json'
import koData from '@/data/medical_vocab_ko.json'
import partsData from '@/data/medical_wordparts_simple.json'
import { ALL_LEVELS, STARS, STAR_CLASS, normalizeLvl } from '@/lib/vocab-constants'

interface VocabEntry {
  en_h: string; en_l?: string; abbr?: string
  f: string[]; d: string; lvl: number
  parts?: { p?: string[]; r?: string[]; s?: string[] }
}
interface KoEntry {
  en_h: string; ko_h: string; ko_l?: string; d_ko: string
}
interface MergedEntry extends VocabEntry {
  ko_h: string; ko_l?: string; d_ko: string
}
interface WordPart { wp: string; t: 'p'|'r'|'s'; d: string }

const partsMap   = Object.fromEntries((partsData as WordPart[]).map(p => [p.wp, p]))
const PART_COLOR = { p: '#3B82F6', r: '#3BAA6A', s: '#C94040' } as const

const koMap = Object.fromEntries((koData as KoEntry[]).map(k => [k.en_h, k]))
const vocab = (vocabData as any[])
  .map(v => ({ ...v, ...koMap[v.en_h], lvl: normalizeLvl(v.lvl) }))
  .filter((v): v is MergedEntry => !!koMap[v.en_h])

const ALL_FIELDS = Array.from(new Set(vocab.flatMap(v => v.f))).sort()
const COUNT_OPTIONS: (number | null)[] = [null, 100, 50, 25]

export default function KoFlashcardsPage() {
  /* ── Settings ── */
  const [showSettings, setShowSettings] = useState(true)
  const [mode,        setMode]      = useState<'study' | 'quiz'>('quiz')
  const [direction,   setDirection] = useState<'en-ko' | 'ko-en'>('en-ko')
  const [lvlFilter,   setLvl]       = useState<number | null>(null)
  const [countLimit,  setCount]     = useState<number | null>(null)
  const [fieldFilter, setField]     = useState<string | null>(null)

  /* ── Session ── */
  const [deck,    setDeck]    = useState<MergedEntry[]>([])
  const [cardIdx, setCardIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [known,   setKnown]   = useState<Set<number>>(new Set())
  const [started, setStarted] = useState(false)

  /* Refs */
  const flippedRef = useRef(false)
  const cardIdxRef = useRef(0)
  const doneRef    = useRef(false)
  useEffect(() => { flippedRef.current = flipped }, [flipped])
  useEffect(() => { cardIdxRef.current = cardIdx }, [cardIdx])

  /* ── Derived ── */
  const filtered = useMemo(() => vocab.filter(v => {
    if (lvlFilter   && v.lvl !== lvlFilter)        return false
    if (fieldFilter && !v.f.includes(fieldFilter)) return false
    return true
  }), [lvlFilter, fieldFilter])

  const previewCount = countLimit ? Math.min(countLimit, filtered.length) : filtered.length
  const card         = deck[cardIdx]
  const done         = started && cardIdx >= deck.length
  const missedCards  = done ? deck.filter((_, i) => !known.has(i)) : []
  const isKoEn       = direction === 'ko-en'

  useEffect(() => { doneRef.current = done }, [done])

  /* ── Actions ── */
  function startDeck() {
    const arr = [...filtered].sort(() => Math.random() - 0.5)
    const limited = countLimit ? arr.slice(0, countLimit) : arr
    setDeck(limited)
    setCardIdx(0); setFlipped(false); setKnown(new Set())
    setStarted(true); setShowSettings(false)
  }

  function startMissed() {
    const missed = deck.filter((_, i) => !known.has(i))
    setDeck([...missed].sort(() => Math.random() - 0.5))
    setCardIdx(0); setFlipped(false); setKnown(new Set())
  }

  function markKnown() {
    setKnown(s => { const n = new Set(s); n.add(cardIdxRef.current); return n })
    setFlipped(false)
    setTimeout(() => setCardIdx(i => i + 1), 150)
  }
  function markUnknown() {
    setFlipped(false)
    setTimeout(() => setCardIdx(i => i + 1), 150)
  }
  function prevCard() {
    if (cardIdxRef.current === 0) return
    setFlipped(false)
    setTimeout(() => setCardIdx(i => Math.max(0, i - 1)), 150)
  }
  function nextCard() {
    setFlipped(false)
    setTimeout(() => setCardIdx(i => i + 1), 150)
  }

  /* ── Keyboard ── */
  useEffect(() => {
    if (!started || showSettings) return
    function onKey(e: KeyboardEvent) {
      if (doneRef.current) return
      if (e.code === 'Space') { e.preventDefault(); setFlipped(f => !f); return }
      if (mode === 'study') {
        if (e.code === 'ArrowRight') nextCard()
        if (e.code === 'ArrowLeft')  prevCard()
      } else {
        if (e.code === 'ArrowRight' && flippedRef.current) markKnown()
        if (e.code === 'ArrowLeft'  && flippedRef.current) markUnknown()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [started, showSettings, mode])

  /* ════════════════════════════════════
     RENDER
  ════════════════════════════════════ */
  return (
    <>
      {/* ── Settings Modal ── */}
      {showSettings && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(13,11,43,0.94)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'var(--color-panel)', border: '1px solid var(--color-border)', padding: '2rem', width: '100%', maxWidth: '420px', boxShadow: '4px 4px 0 0 rgba(240,180,41,0.2)' }}>
            <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.6rem', color: 'var(--color-gold)', lineHeight: 2, marginBottom: '1.75rem' }}>
              Korean Flashcard Setup
            </div>

            {/* Mode */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-dim)', marginBottom: '0.5rem' }}>Mode</div>
              <div className="c-toggle">
                <button className={`c-toggle__btn ${mode === 'study' ? 'c-toggle__btn--active' : ''}`} onClick={() => setMode('study')}>Study</button>
                <button className={`c-toggle__btn ${mode === 'quiz'  ? 'c-toggle__btn--active' : ''}`} onClick={() => setMode('quiz')}>Quiz</button>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-dim)', marginTop: '0.5rem', opacity: 0.7 }}>
                {mode === 'study'
                  ? <>Browse freely — <kbd>Space</kbd> to flip, <kbd>←</kbd> <kbd>→</kbd> to navigate</>
                  : <>Mark each card — <kbd>Space</kbd> to flip, <kbd>←</kbd> Don't know · Know it <kbd>→</kbd></>}
              </div>
            </div>

            {/* Direction — EN→KO first */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-dim)', marginBottom: '0.5rem' }}>Direction</div>
              <div className="c-toggle">
                <button className={`c-toggle__btn ${!isKoEn ? 'c-toggle__btn--active' : ''}`} onClick={() => setDirection('en-ko')}>EN → KO</button>
                <button className={`c-toggle__btn ${isKoEn  ? 'c-toggle__btn--active' : ''}`} onClick={() => setDirection('ko-en')}>KO → EN</button>
              </div>
            </div>

            {/* Level */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-dim)', marginBottom: '0.5rem' }}>Level</div>
              <div className="c-filter-row" style={{ marginBottom: 0 }}>
                <button className={`c-pill ${!lvlFilter ? 'c-pill--active' : ''}`} onClick={() => setLvl(null)}>All</button>
                {ALL_LEVELS.map(lvl => (
                  <button key={lvl} className={`c-pill c-pill--star ${lvlFilter === lvl ? 'c-pill--active' : ''}`}
                    onClick={() => setLvl(lvlFilter === lvl ? null : lvl)}>{STARS[lvl]}</button>
                ))}
              </div>
            </div>

            {/* Specialty */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-dim)', marginBottom: '0.5rem' }}>Specialty</div>
              <select className="c-field-drop" style={{ marginBottom: 0, width: '100%', maxWidth: '100%' }}
                value={fieldFilter || ''} onChange={e => setField(e.target.value || null)}>
                <option value="">All Specialties</option>
                {ALL_FIELDS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>

            {/* Count */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-dim)', marginBottom: '0.5rem' }}>Cards per session</div>
              <div className="c-toggle">
                {COUNT_OPTIONS.map(n => (
                  <button key={n ?? 'all'} className={`c-toggle__btn ${countLimit === n ? 'c-toggle__btn--active' : ''}`}
                    onClick={() => setCount(n)}>{n ?? 'All'}</button>
                ))}
              </div>
            </div>

            {/* Level distribution */}
            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.55rem' }}>
                <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.75rem', color: 'var(--color-gold)' }}>{previewCount}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-dim)' }}>
                  {countLimit && filtered.length > countLimit ? `random from ${filtered.length}` : 'cards selected'}
                </span>
              </div>
              <div style={{ height: '6px', display: 'flex', borderRadius: '3px', overflow: 'hidden', marginBottom: '0.55rem', background: 'var(--color-border)' }}>
                {([3, 2, 1] as const).map((lvl, i) => {
                  const cnt = filtered.filter(v => v.lvl === lvl).length
                  const color = i === 0 ? '#F0B429' : i === 1 ? '#9B8FEF' : '#3D36A0'
                  return cnt > 0 ? <div key={lvl} style={{ width: `${(cnt/filtered.length)*100}%`, background: color, transition: 'width 0.3s' }} /> : null
                })}
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                {([[3,'⭐⭐⭐','#F0B429'],[2,'⭐⭐','#9B8FEF'],[1,'⭐','#5A5490']] as const).map(([lvl, label, color]) => (
                  <span key={lvl} style={{ fontSize: '0.78rem', color: 'var(--color-text-dim)' }}>
                    <span style={{ color }}>{label}</span> {filtered.filter(v => v.lvl === lvl).length}
                  </span>
                ))}
              </div>
            </div>

            <button className="c-btn-pixel" onClick={startDeck} disabled={previewCount === 0}
              style={{ width: '100%', fontSize: '0.6rem', padding: '0.85rem', opacity: previewCount === 0 ? 0.4 : 1, cursor: previewCount === 0 ? 'not-allowed' : 'pointer' }}>
              Start →
            </button>

            <div style={{ textAlign: 'center', marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <Link href="/glossary/ko" style={{ fontSize: '0.82rem', color: 'var(--color-text-dim)', textDecoration: 'underline' }}>
                ← Back to Korean Glossary
              </Link>
              <Link href="/" style={{ fontSize: '0.82rem', color: 'var(--color-text-dim)', textDecoration: 'underline', opacity: 0.6 }}>
                ← Back to Main
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── Session area ── */}
      {started && !showSettings && (
        <div style={{ maxWidth: '620px', margin: '2rem auto 0' }}>

          {/* ── Active card ── */}
          {!done && card && (
            <>
              {/* Top row: progress label + setup button */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.5rem', color: 'var(--color-text-dim)' }}>
                  {cardIdx + 1} / {deck.length}
                  {mode === 'quiz'  && <span style={{ marginLeft: '0.75rem', color: '#6EE7B7' }}>✓ {known.size}</span>}
                  {mode === 'quiz'  && <span style={{ marginLeft: '0.5rem', color: '#FCA5A5' }}>✗ {Math.max(0, cardIdx - known.size)}</span>}
                  {mode === 'study' && <span style={{ marginLeft: '0.75rem', opacity: 0.5 }}>{isKoEn ? 'KO→EN' : 'EN→KO'}</span>}
                </div>
                <button onClick={() => setShowSettings(true)}
                  style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.45rem', color: 'var(--color-text-dim)', background: 'none', border: '1px solid var(--color-border)', padding: '0.2rem 0.55rem', cursor: 'pointer', lineHeight: 1.8, opacity: 0.7 }}>
                  ⚙
                </button>
              </div>

              {/* Progress bar */}
              <div style={{ height: '6px', background: 'var(--color-border)', borderRadius: '3px', overflow: 'hidden', marginBottom: '1.25rem' }}>
                <div style={{ height: '100%', background: 'var(--color-gold)', borderRadius: '3px', width: `${(cardIdx / deck.length) * 100}%`, transition: 'width 0.3s' }} />
              </div>

              {/* Flip card */}
              <div onClick={() => setFlipped(f => !f)}
                style={{ perspective: '1000px', height: '380px', cursor: 'pointer', marginBottom: '1.25rem' }}>
                <div style={{ position: 'relative', width: '100%', height: '100%', transformStyle: 'preserve-3d', transition: 'transform 0.2s ease', transform: flipped ? 'rotateY(180deg)' : 'none' }}>
                  {/* Front */}
                  <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '2rem', background: 'var(--color-panel)', border: '1px solid var(--color-border)', boxShadow: '2px 2px 0 0 var(--color-border)' }}>
                    <span className={`c-stars ${STAR_CLASS[card.lvl] || ''}`} style={{ fontSize: '1rem' }}>{STARS[card.lvl]}</span>
                    {isKoEn ? (
                      <>
                        <div className="ko-h" style={{ fontSize: '2.4rem', textAlign: 'center' }}>{card.ko_h}</div>
                        {card.ko_l && <div className="ko-l" style={{ fontSize: '1.2rem' }}>{card.ko_l}</div>}
                      </>
                    ) : (
                      <>
                        <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-text)', textAlign: 'center', lineHeight: 1.3 }}>{card.en_h}</div>
                        {card.abbr && <span className="c-abbr">{card.abbr}</span>}
                      </>
                    )}
                    <p style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.5rem', color: 'var(--color-text-dim)', marginTop: 'auto' }}><kbd>Space</kbd> or tap to reveal</p>
                  </div>
                  {/* Back */}
                  <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', display: 'flex', flexDirection: 'column', padding: '1.5rem 2rem', gap: '0.6rem', background: 'var(--color-panel)', border: '1px solid var(--color-gold-dim)', overflowY: 'auto' }}>
                    {isKoEn ? (
                      <>
                        <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--color-text)' }}>{card.en_h}</div>
                        {card.en_l && <div style={{ fontSize: '1rem', color: 'var(--color-text-dim)' }}>{card.en_l}</div>}
                        <p style={{ fontSize: '0.92rem', color: 'var(--color-text-dim)', lineHeight: 1.7 }}>{card.d}</p>
                      </>
                    ) : (
                      <>
                        <div className="ko-h" style={{ fontSize: '1.6rem' }}>{card.ko_h}</div>
                        {card.ko_l && <div className="ko-l">{card.ko_l}</div>}
                        <p style={{ fontSize: '0.92rem', color: 'var(--color-text-dim)', lineHeight: 1.7 }}>{card.d_ko}</p>
                      </>
                    )}
                    {card.parts && (['p','r','s'] as const).some(t => (card.parts?.[t]?.length ?? 0) > 0) && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                        {(['p','r','s'] as const).flatMap(t =>
                          (card.parts?.[t] ?? []).map(wp => {
                            const color = PART_COLOR[t]
                            const meaning = partsMap[wp]?.d ?? ''
                            return (
                              <span key={wp} style={{ fontSize: '0.75rem', padding: '0.1rem 0.45rem', border: `1px solid ${color}`, color, lineHeight: 1.8 }}>
                                {wp}{meaning ? ` · ${meaning}` : ''}
                              </span>
                            )
                          })
                        )}
                      </div>
                    )}
                    <div style={{ marginTop: 'auto', display: 'flex', flexWrap: 'wrap', gap: '0.3rem', alignItems: 'center' }}>
                      <span className={`c-stars ${STAR_CLASS[card.lvl] || ''}`} style={{ fontSize: '0.8rem', marginRight: '0.25rem' }}>{STARS[card.lvl]}</span>
                      {card.f.map(f => <span key={f} className="c-field-badge">{f}</span>)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Study: prev / next */}
              {mode === 'study' && (
                <>
                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <button onClick={prevCard} className="c-btn-pixel" disabled={cardIdx === 0}
                      style={{ fontSize: '0.55rem', padding: '0.6rem 1.5rem', opacity: cardIdx === 0 ? 0.35 : 1, background: 'var(--color-panel)', color: 'var(--color-text-dim)', border: '1px solid var(--color-border)', boxShadow: 'none' }}>
                      ← Prev
                    </button>
                    <button onClick={nextCard} className="c-btn-pixel" style={{ fontSize: '0.55rem', padding: '0.6rem 1.5rem' }}>
                      Next →
                    </button>
                  </div>
                  <p style={{ textAlign: 'center', fontFamily: 'var(--font-pixel)', fontSize: '0.5rem', color: 'var(--color-text-dim)', marginTop: '1rem', opacity: 0.5 }}>
                    <kbd>Space</kbd> · flip &nbsp;&nbsp; <kbd>←</kbd> Prev &nbsp;&nbsp; Next <kbd>→</kbd>
                  </p>
                </>
              )}

              {/* Quiz: judge after flip */}
              {mode === 'quiz' && (
                flipped ? (
                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <button onClick={markUnknown} className="c-btn-pixel"
                      style={{ fontSize: '0.6rem', padding: '0.7rem 1.75rem', background: 'rgba(201,64,64,0.15)', color: '#FCA5A5', border: '1px solid #C94040', boxShadow: 'none' }}>
                      <kbd>←</kbd> ✗ Review
                    </button>
                    <button onClick={markKnown} className="c-btn-pixel"
                      style={{ fontSize: '0.6rem', padding: '0.7rem 1.75rem', background: 'rgba(59,170,106,0.15)', color: '#6EE7B7', border: '1px solid #3BAA6A', boxShadow: 'none' }}>
                      ✓ Know It <kbd>→</kbd>
                    </button>
                  </div>
                ) : (
                  <p style={{ textAlign: 'center', fontFamily: 'var(--font-pixel)', fontSize: '0.5rem', color: 'var(--color-text-dim)', opacity: 0.55 }}>
                    <kbd>Space</kbd> · flip &nbsp;&nbsp; <kbd>←</kbd> · <span style={{ color:'#FCA5A5' }}>review</span> &nbsp;&nbsp; <span style={{ color:'#6EE7B7' }}>know it</span> · <kbd>→</kbd>
                  </p>
                )
              )}

              {/* Stats row */}
              {mode === 'quiz' && (
                <div style={{ display:'flex', marginTop:'1.5rem', paddingTop:'1.25rem', borderTop:'1px solid var(--color-border)' }}>
                  <div style={{ flex:1, textAlign:'center' }}>
                    <div style={{ fontSize:'1.4rem', fontWeight:700, color:'var(--color-gold)', marginBottom:'0.2rem' }}>{Math.max(0, deck.length - cardIdx - 1)}</div>
                    <div style={{ fontFamily:'var(--font-pixel)', fontSize:'0.45rem', color:'var(--color-text-dim)' }}>remaining</div>
                  </div>
                  <div style={{ flex:1, textAlign:'center' }}>
                    <div style={{ fontSize:'1.4rem', fontWeight:700, color:'#6EE7B7', marginBottom:'0.2rem' }}>{known.size}</div>
                    <div style={{ fontFamily:'var(--font-pixel)', fontSize:'0.45rem', color:'var(--color-text-dim)' }}>known</div>
                  </div>
                  <div style={{ flex:1, textAlign:'center' }}>
                    <div style={{ fontSize:'1.4rem', fontWeight:700, color:'#FCA5A5', marginBottom:'0.2rem' }}>{Math.max(0, cardIdx - known.size)}</div>
                    <div style={{ fontFamily:'var(--font-pixel)', fontSize:'0.45rem', color:'var(--color-text-dim)' }}>missed</div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── Done screen ── */}
          {done && (
            mode === 'quiz' ? (
              <>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                  <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '1.4rem', color: 'var(--color-gold)', marginBottom: '0.5rem' }}>✓ {known.size} / {deck.length}</div>
                  <p style={{ fontSize: '0.95rem', color: 'var(--color-text-dim)' }}>
                    {known.size === deck.length ? 'Perfect — all cards known!' : known.size >= deck.length * 0.8 ? 'Great job!' : 'Keep practicing!'}
                  </p>
                </div>
                {missedCards.length > 0 && (
                  <div style={{ marginBottom: '1.75rem' }}>
                    <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.5rem', color: 'var(--color-text-dim)', marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--color-border)' }}>
                      Review list ({missedCards.length})
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', maxHeight: '340px', overflowY: 'auto' }}>
                      {missedCards.map((v, i) => (
                        <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', padding: '0.5rem 0.75rem', background: 'var(--color-panel)', border: '1px solid var(--color-border)', fontSize: '0.88rem', lineHeight: 1.5 }}>
                          {isKoEn ? (
                            <>
                              <span style={{ fontWeight: 700, color: 'var(--color-text)', fontFamily: 'Noto Sans KR, sans-serif' }}>{v.ko_h}</span>
                              <span style={{ color: 'var(--color-text-dim)' }}>{v.en_h}</span>
                            </>
                          ) : (
                            <>
                              <span style={{ fontWeight: 700, color: 'var(--color-text)' }}>{v.en_h}</span>
                              <span style={{ color: 'var(--color-text-dim)', fontFamily: 'Noto Sans KR, sans-serif' }}>{v.ko_h}</span>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                  {missedCards.length > 0 && (
                    <button onClick={startMissed} className="c-btn-pixel"
                      style={{ fontSize: '0.5rem', padding: '0.65rem 1.5rem', background: 'rgba(201,64,64,0.15)', color: '#FCA5A5', border: '1px solid #C94040', boxShadow: 'none' }}>
                      ✗ Retry ({missedCards.length})
                    </button>
                  )}
                  <button onClick={() => setShowSettings(true)} className="c-btn-pixel"
                    style={{ fontSize: '0.5rem', padding: '0.65rem 1.5rem', background: 'var(--color-panel)', color: 'var(--color-text-dim)', border: '1px solid var(--color-border)', boxShadow: 'none' }}>
                    New Session
                  </button>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', paddingTop: '2rem' }}>
                <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '1rem', color: 'var(--color-gold)', lineHeight: 2, marginBottom: '0.75rem' }}>All done!</div>
                <p style={{ fontSize: '0.95rem', color: 'var(--color-text-dim)', marginBottom: '2rem' }}>{deck.length} cards reviewed.</p>
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button onClick={startDeck} className="c-btn-pixel" style={{ fontSize: '0.5rem', padding: '0.65rem 1.5rem' }}>↺ Start Over</button>
                  <button onClick={() => setShowSettings(true)} className="c-btn-pixel"
                    style={{ fontSize: '0.5rem', padding: '0.65rem 1.5rem', background: 'var(--color-panel)', color: 'var(--color-text-dim)', border: '1px solid var(--color-border)', boxShadow: 'none' }}>
                    New Session
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </>
  )
}
