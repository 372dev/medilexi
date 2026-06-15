'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import vocabData from '@/data/medical_vocab_v1.18.json'

interface VocabEntry {
  en_h: string; en_l?: string; abbr?: string
  f: string[]; d: string; lvl: string
}

const vocab = vocabData as VocabEntry[]
const ALL_FIELDS = Array.from(new Set(vocab.flatMap(v => v.f))).sort()
const ALL_LEVELS = ['⭐⭐⭐ Essential', '⭐⭐ Important', '⭐ Good to know']
const STARS: Record<string, string> = {
  '⭐⭐⭐ Essential': '⭐⭐⭐',
  '⭐⭐ Important': '⭐⭐',
  '⭐ Good to know': '⭐',
}
const STAR_CLASS: Record<string, string> = {
  '⭐⭐⭐ Essential': 'c-stars--3',
  '⭐⭐ Important': 'c-stars--2',
  '⭐ Good to know': 'c-stars--1',
}

export default function FlashcardsPage() {
  const [lvlFilter, setLvl]     = useState<string | null>(null)
  const [fieldFilter, setField] = useState<string | null>(null)
  const [shuffle, setShuffle]   = useState(true)
  const [deck, setDeck]         = useState<VocabEntry[]>([])
  const [cardIdx, setCardIdx]   = useState(0)
  const [flipped, setFlipped]   = useState(false)
  const [known, setKnown]       = useState<Set<number>>(new Set())
  const [started, setStarted]   = useState(false)

  const filtered = useMemo(() => vocab.filter(v => {
    if (lvlFilter && v.lvl !== lvlFilter) return false
    if (fieldFilter && !v.f.includes(fieldFilter)) return false
    return true
  }), [lvlFilter, fieldFilter])

  function startDeck() {
    const arr = [...filtered]
    if (shuffle) arr.sort(() => Math.random() - 0.5)
    setDeck(arr)
    setCardIdx(0)
    setFlipped(false)
    setKnown(new Set())
    setStarted(true)
  }

  function next() {
    setFlipped(false)
    setTimeout(() => setCardIdx(i => i + 1), 150)
  }

  function prev() {
    if (cardIdx === 0) return
    setFlipped(false)
    setTimeout(() => setCardIdx(i => Math.max(0, i - 1)), 150)
  }

  function markKnown() {
    setKnown(s => { const n = new Set(s); n.add(cardIdx); return n })
    next()
  }

  function markUnknown() {
    setKnown(s => { const n = new Set(s); n.delete(cardIdx); return n })
    next()
  }

  useEffect(() => {
    if (!started) return
    function onKey(e: KeyboardEvent) {
      if (e.code === 'Space') {
        e.preventDefault()
        setFlipped(f => !f)
      } else if (e.code === 'ArrowRight') {
        setFlipped(false)
        setTimeout(() => setCardIdx(i => i + 1), 150)
      } else if (e.code === 'ArrowLeft') {
        setFlipped(false)
        setTimeout(() => setCardIdx(i => Math.max(0, i - 1)), 150)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [started])

  const card = deck[cardIdx]
  const done = started && cardIdx >= deck.length

  return (
    <>
      {/* ── Sticky filter bar ── */}
      <div className="c-filter-bar">
        <div className="c-search-row">
          <div className="c-filter-row" style={{ flex: 1, marginBottom: 0 }}>
            <button
              className={`c-pill ${!lvlFilter ? 'c-pill--active' : ''}`}
              onClick={() => { setLvl(null); setStarted(false) }}
            >All</button>
            {ALL_LEVELS.map(lvl => (
              <button
                key={lvl}
                className={`c-pill c-pill--star ${lvlFilter === lvl ? 'c-pill--active' : ''}`}
                onClick={() => { setLvl(lvlFilter === lvl ? null : lvl); setStarted(false) }}
              >{STARS[lvl]}</button>
            ))}
          </div>
          <select
            className="c-field-drop"
            style={{ width: 190, marginBottom: 0 }}
            value={fieldFilter || ''}
            onChange={e => { setField(e.target.value || null); setStarted(false) }}
          >
            <option value="">All Specialties</option>
            {ALL_FIELDS.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="c-count" style={{ marginBottom: 0 }}>{filtered.length} cards in deck</div>
          <button
            className={`c-pill ${shuffle ? 'c-pill--active' : ''}`}
            onClick={() => setShuffle(s => !s)}
            style={{ marginBottom: 0 }}
          >🔀 Shuffle</button>
          <Link href="/glossary" className="c-btn-pixel" style={{ fontSize: '0.46rem', padding: '0.4rem 0.8rem' }}>
            ← Glossary
          </Link>
        </div>
      </div>

      {/* ── Quiz area ── */}
      <div style={{ maxWidth: '640px', margin: '2rem auto 0' }}>

        {/* Start screen */}
        {!started && (
          <div style={{ textAlign: 'center', paddingTop: '2rem' }}>
            <p style={{ fontSize: '1rem', color: 'var(--color-text-dim)', marginBottom: '2rem' }}>
              {filtered.length} cards selected — ready to start?
            </p>
            <button className="c-btn-pixel" onClick={startDeck} style={{ fontSize: '0.55rem', padding: '0.7rem 2.5rem' }}>
              Start
            </button>
          </div>
        )}

        {/* Done screen */}
        {done && (
          <div style={{ textAlign: 'center', paddingTop: '3rem' }}>
            <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '1.4rem', color: 'var(--color-gold)', marginBottom: '0.75rem' }}>
              ✓ {known.size} / {deck.length}
            </div>
            <p style={{ color: 'var(--color-text-dim)', marginBottom: '2rem' }}>
              {known.size === deck.length
                ? 'Perfect score!'
                : known.size >= deck.length * 0.8
                ? 'Great job!'
                : 'Keep practicing!'}
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="c-btn-pixel" onClick={startDeck} style={{ fontSize: '0.5rem', padding: '0.6rem 1.5rem' }}>
                Try Again
              </button>
              <button className="c-btn-pixel" onClick={() => setStarted(false)} style={{ fontSize: '0.5rem', padding: '0.6rem 1.5rem' }}>
                Change Filters
              </button>
            </div>
          </div>
        )}

        {/* Active card */}
        {started && !done && card && (
          <>
            {/* Progress */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ height: '6px', background: 'var(--color-border)', borderRadius: '3px', overflow: 'hidden', marginBottom: '0.4rem' }}>
                <div style={{ height: '100%', background: 'var(--color-gold)', borderRadius: '3px', width: `${(cardIdx / deck.length) * 100}%`, transition: 'width 0.3s' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-pixel)', fontSize: '0.42rem', color: 'var(--color-text-dim)' }}>
                <span>{cardIdx + 1} / {deck.length}</span>
                <span>✓ {known.size} known</span>
              </div>
            </div>

            {/* Flip card */}
            <div
              onClick={() => setFlipped(f => !f)}
              style={{ perspective: '1000px', height: '360px', cursor: 'pointer', marginBottom: '1.25rem' }}
            >
              <div style={{
                position: 'relative', width: '100%', height: '100%',
                transformStyle: 'preserve-3d', transition: 'transform 0.45s ease',
                transform: flipped ? 'rotateY(180deg)' : 'none',
              }}>
                {/* Front */}
                <div style={{
                  position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  justifyContent: 'center', gap: '0.75rem', padding: '2rem',
                  background: 'var(--color-panel)', border: '1px solid var(--color-border)',
                  boxShadow: '2px 2px 0 0 var(--color-border)',
                }}>
                  <span className={`c-stars ${STAR_CLASS[card.lvl] || ''}`} style={{ fontSize: '1rem' }}>
                    {STARS[card.lvl]}
                  </span>
                  <div style={{ fontSize: '2.2rem', fontWeight: 700, color: 'var(--color-text)', textAlign: 'center', lineHeight: 1.3 }}>
                    {card.en_h}
                  </div>
                  {card.abbr && (
                    <span className="c-abbr">{card.abbr}</span>
                  )}
                  <p style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.46rem', color: 'var(--color-text-dim)', marginTop: 'auto' }}>
                    Space or tap to reveal
                  </p>
                </div>

                {/* Back */}
                <div style={{
                  position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                  display: 'flex', flexDirection: 'column',
                  padding: '1.5rem 2rem', gap: '0.6rem',
                  background: 'var(--color-panel)', border: '1px solid var(--color-gold-dim)',
                  overflowY: 'auto',
                }}>
                  <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--color-text)' }}>{card.en_h}</div>
                  {card.en_l && (
                    <div style={{ fontSize: '1rem', color: 'var(--color-text-dim)' }}>{card.en_l}</div>
                  )}
                  <p style={{ fontSize: '0.92rem', color: 'var(--color-text-dim)', lineHeight: 1.7 }}>{card.d}</p>
                  <div style={{ marginTop: 'auto', display: 'flex', flexWrap: 'wrap', gap: '0.3rem', alignItems: 'center' }}>
                    <span className={`c-stars ${STAR_CLASS[card.lvl] || ''}`} style={{ fontSize: '0.8rem', marginRight: '0.25rem' }}>
                      {STARS[card.lvl]}
                    </span>
                    {card.f.map(f => <span key={f} className="c-field-badge">{f}</span>)}
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation + mark buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={prev}
                className="c-btn-pixel"
                disabled={cardIdx === 0}
                style={{
                  fontSize: '0.55rem', padding: '0.6rem 1rem',
                  opacity: cardIdx === 0 ? 0.4 : 1,
                  background: 'var(--color-panel)', color: 'var(--color-text-dim)',
                  border: '1px solid var(--color-border)', boxShadow: 'none',
                }}
              >← Prev</button>
              {flipped ? (
                <>
                  <button
                    onClick={markUnknown}
                    className="c-btn-pixel"
                    style={{ fontSize: '0.6rem', padding: '0.6rem 1.5rem', background: 'rgba(201,64,64,0.15)', color: '#FCA5A5', border: '1px solid #C94040', boxShadow: 'none' }}
                  >✗ Review</button>
                  <button
                    onClick={markKnown}
                    className="c-btn-pixel"
                    style={{ fontSize: '0.6rem', padding: '0.6rem 1.5rem', background: 'rgba(59,170,106,0.15)', color: '#6EE7B7', border: '1px solid #3BAA6A', boxShadow: 'none' }}
                  >✓ Know It</button>
                </>
              ) : (
                <button
                  onClick={next}
                  className="c-btn-pixel"
                  style={{ fontSize: '0.55rem', padding: '0.6rem 1.2rem', background: 'var(--color-panel)', color: 'var(--color-text-dim)', border: '1px solid var(--color-border)', boxShadow: 'none' }}
                >Skip →</button>
              )}
            </div>

            {/* Keyboard hint */}
            <p style={{ textAlign: 'center', fontFamily: 'var(--font-pixel)', fontSize: '0.38rem', color: 'var(--color-text-dim)', marginTop: '1.25rem', opacity: 0.6 }}>
              ← → arrow keys · Space to flip
            </p>
          </>
        )}
      </div>
    </>
  )
}
