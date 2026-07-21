'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import Link from 'next/link'
import vocabData from '@/data/medical_vocab.json'
import frData from '@/data/medical_vocab_fr.json'
import partsData from '@/data/medical_wordparts_simple.json'
import { ALL_LEVELS, LVL_TEXT, normalizeLvl } from '@/lib/vocab-constants'

/* Direction "Signal" redesign. Deck / session / keyboard / direction logic is
   unchanged from the live page; only the presentation moved to the .b-* kit. */

interface VocabEntry {
  en_h: string; en_l?: string; abbr?: string
  f: string[]; d: string; lvl: number
  parts?: { p?: string[]; r?: string[]; s?: string[] }
}
interface FrEntry {
  en_h: string; fr_h: string; fr_l?: string; d_fr?: string
}
interface MergedEntry extends VocabEntry {
  fr_h: string; fr_l?: string; d_fr?: string
}
interface WordPart { wp: string; t: 'p'|'r'|'s'; d: string }

const partsMap = Object.fromEntries((partsData as WordPart[]).map(p => [p.wp, p]))

const frMap = Object.fromEntries((frData as FrEntry[]).map(k => [k.en_h, k]))
const vocab = (vocabData as unknown as VocabEntry[])
  .map((v): MergedEntry => ({ ...v, ...frMap[v.en_h], lvl: normalizeLvl(v.lvl) }))
  .filter((v): v is MergedEntry => !!frMap[v.en_h])

const ALL_FIELDS = Array.from(new Set(vocab.flatMap(v => v.f))).sort()
const COUNT_OPTIONS: (number | null)[] = [null, 100, 50, 25]
const LVL_BAR: Record<number,string> = { 3:'var(--b-primary)', 2:'var(--b-amber)', 1:'var(--b-dim)' }
const display = { fontFamily: 'var(--b-display)' }

export default function FrFlashcardsPage() {
  /* ── Settings ── */
  const [showSettings, setShowSettings] = useState(true)
  const [mode,        setMode]      = useState<'study' | 'quiz'>('quiz')
  const [direction,   setDirection] = useState<'en-fr' | 'fr-en'>('en-fr')
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
  const isFrEn       = direction === 'fr-en'

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

  const cardParts = card?.parts
  const hasParts = !!cardParts && (['p','r','s'] as const).some(t => (cardParts[t]?.length ?? 0) > 0)

  return (
    <>
      {/* ── Settings modal ── */}
      {showSettings && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center overflow-y-auto p-4 backdrop-blur-sm"
          style={{ background: 'color-mix(in srgb, var(--b-bg) 94%, transparent)' }}
        >
          <div className="b-card b-lift w-full max-w-[440px] p-7">
            <div className="mb-6 flex flex-col gap-1">
              <span className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-[var(--b-primary)]">
                Français · French
              </span>
              <h1 className="m-0 text-[1.5rem] font-semibold tracking-[-0.008em]" style={display}>
                Flashcard setup
              </h1>
            </div>

            {/* Direction */}
            <div className="mb-5 flex flex-col gap-2">
              <span className="text-[0.78rem] font-semibold text-[var(--b-dim)]">Direction</span>
              <div className="inline-flex w-fit overflow-hidden rounded-xl border border-[var(--b-border)] bg-[var(--b-panel)]">
                {([['en-fr','EN → FR'],['fr-en','FR → EN']] as const).map(([d,label]) => (
                  <button
                    key={d}
                    onClick={() => setDirection(d)}
                    aria-pressed={direction===d}
                    className={`b-focus px-4 py-2 text-[0.82rem] font-semibold ${
                      direction===d ? 'bg-[var(--b-primary)] text-[var(--b-on-prim)]' : 'text-[var(--b-dim)]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mode */}
            <div className="mb-5 flex flex-col gap-2">
              <span className="text-[0.78rem] font-semibold text-[var(--b-dim)]">Mode</span>
              <div className="inline-flex w-fit overflow-hidden rounded-xl border border-[var(--b-border)] bg-[var(--b-panel)]">
                {(['study','quiz'] as const).map(m => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    aria-pressed={mode===m}
                    className={`b-focus px-5 py-2 text-[0.82rem] font-semibold capitalize ${
                      mode===m ? 'bg-[var(--b-primary)] text-[var(--b-on-prim)]' : 'text-[var(--b-dim)]'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
              <p className="m-0 text-[0.78rem] leading-[1.6] text-[var(--b-dim)]">
                {mode === 'study'
                  ? <>Browse freely. <kbd className="b-kbd">Space</kbd> to flip, <kbd className="b-kbd">←</kbd> <kbd className="b-kbd">→</kbd> to navigate</>
                  : <>Mark each card. <kbd className="b-kbd">Space</kbd> to flip, <kbd className="b-kbd">←</kbd> Review · Know it <kbd className="b-kbd">→</kbd></>}
              </p>
            </div>

            {/* Level */}
            <div className="mb-5 flex flex-col gap-2">
              <span className="text-[0.78rem] font-semibold text-[var(--b-dim)]">Level</span>
              <div className="flex flex-wrap gap-2">
                <button className={`b-fpill b-focus ${!lvlFilter?'b-fpill--active':''}`} onClick={() => setLvl(null)}>All</button>
                {ALL_LEVELS.map(lvl => (
                  <button
                    key={lvl}
                    className={`b-fpill b-focus ${lvlFilter===lvl?'b-fpill--active':''}`}
                    onClick={() => setLvl(lvlFilter===lvl?null:lvl)}
                  >
                    {LVL_TEXT[lvl]}
                  </button>
                ))}
              </div>
            </div>

            {/* Specialty */}
            <div className="mb-5 flex flex-col gap-2">
              <span className="text-[0.78rem] font-semibold text-[var(--b-dim)]">Specialty</span>
              <select
                className="b-select b-focus w-full"
                aria-label="Filter by specialty"
                value={fieldFilter || ''}
                onChange={e => setField(e.target.value || null)}
              >
                <option value="">All specialties</option>
                {ALL_FIELDS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>

            {/* Count */}
            <div className="mb-5 flex flex-col gap-2">
              <span className="text-[0.78rem] font-semibold text-[var(--b-dim)]">Cards per session</span>
              <div className="inline-flex w-fit overflow-hidden rounded-xl border border-[var(--b-border)] bg-[var(--b-panel)]">
                {COUNT_OPTIONS.map(n => (
                  <button
                    key={n ?? 'all'}
                    onClick={() => setCount(n)}
                    aria-pressed={countLimit===n}
                    className={`b-focus px-4 py-2 text-[0.82rem] font-semibold ${
                      countLimit===n ? 'bg-[var(--b-primary)] text-[var(--b-on-prim)]' : 'text-[var(--b-dim)]'
                    }`}
                  >
                    {n ?? 'All'}
                  </button>
                ))}
              </div>
            </div>

            {/* Level distribution */}
            <div className="mb-5 border-t border-[var(--b-border)] pt-4">
              <div className="mb-2 flex items-baseline justify-between">
                <span className="text-[1.4rem] font-semibold tabular-nums text-[var(--b-primary)]" style={display}>
                  {previewCount}
                </span>
                <span className="text-[0.8rem] text-[var(--b-dim)]">
                  {countLimit && filtered.length > countLimit ? `random from ${filtered.length}` : 'cards selected'}
                </span>
              </div>
              <div className="mb-2 flex h-1.5 overflow-hidden rounded-full bg-[var(--b-border)]">
                {([3,2,1] as const).map(l => {
                  const cnt = filtered.filter(v => v.lvl === l).length
                  return cnt > 0 && filtered.length > 0 ? (
                    <div key={l} style={{ width:`${(cnt/filtered.length)*100}%`, background:LVL_BAR[l], transition:'width 0.3s' }} />
                  ) : null
                })}
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {([3,2,1] as const).map(l => (
                  <span key={l} className="flex items-center gap-1.5 text-[0.76rem] text-[var(--b-dim)]">
                    <span className="h-2 w-2 rounded-full" style={{ background:LVL_BAR[l] }} aria-hidden="true" />
                    {LVL_TEXT[l]} <span className="tabular-nums">{filtered.filter(v => v.lvl === l).length}</span>
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={startDeck}
              disabled={previewCount===0}
              className="b-press b-glow b-focus w-full rounded-2xl bg-[var(--b-primary)] py-3.5 text-[0.95rem] font-bold text-[var(--b-on-prim)] disabled:cursor-not-allowed disabled:opacity-40"
              style={display}
            >
              Start →
            </button>

            <div className="mt-5 flex flex-col items-center gap-2">
              <Link href="/glossary/fr" className="b-focus text-[0.82rem] text-[var(--b-dim)] hover:text-[var(--b-text)] hover:underline">
                ← Back to French Glossary
              </Link>
              <Link href="/" className="b-focus text-[0.82rem] text-[var(--b-dim)] opacity-70 hover:text-[var(--b-text)] hover:underline">
                ← Back to Main
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── Session area ── */}
      {started && !showSettings && (
        <div className="mx-auto mt-4 w-full max-w-[640px]">

          {!done && card && (
            <>
              {/* Progress + settings */}
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-3 text-[0.82rem] font-semibold tabular-nums text-[var(--b-dim)]">
                  <span>{cardIdx+1} / {deck.length}</span>
                  <span className="opacity-60">{isFrEn ? 'FR → EN' : 'EN → FR'}</span>
                  {mode==='quiz' && <span className="text-[var(--b-primary)]">✓ {known.size}</span>}
                  {mode==='quiz' && <span className="text-[#FCA5A5]">✗ {Math.max(0, cardIdx - known.size)}</span>}
                </div>
                <button
                  onClick={() => setShowSettings(true)}
                  aria-label="Session settings"
                  className="b-press b-focus rounded-lg border border-[var(--b-border)] bg-[var(--b-panel)] px-2.5 py-1.5 text-[0.8rem] text-[var(--b-dim)]"
                >
                  ⚙
                </button>
              </div>

              {/* Progress bar */}
              <div className="mb-5 h-1.5 overflow-hidden rounded-full bg-[var(--b-border)]">
                <div
                  className="h-full rounded-full bg-[var(--b-primary)]"
                  style={{ width:`${(cardIdx/deck.length)*100}%`, transition:'width 0.3s' }}
                />
              </div>

              {/* Flip card */}
              <div
                onClick={() => setFlipped(f => !f)}
                className="mb-5 h-[380px] cursor-pointer"
                style={{ perspective:'1000px' }}
              >
                <div
                  className="relative h-full w-full"
                  style={{ transformStyle:'preserve-3d', transition:'transform 0.28s ease', transform:flipped?'rotateY(180deg)':'none' }}
                >
                  {/* Front */}
                  <div
                    className="b-card b-lift absolute inset-0 flex flex-col items-center justify-center gap-4 p-8"
                    style={{ backfaceVisibility:'hidden' }}
                  >
                    <span className={`b-lvl b-lvl--${card.lvl}`}>{LVL_TEXT[card.lvl]}</span>
                    {isFrEn ? (
                      <>
                        <div className="text-center text-[2.1rem] font-semibold leading-[1.2] tracking-[-0.01em] text-[var(--b-text)]" style={display}>{card.fr_h}</div>
                        {card.fr_l && <div className="text-center text-[1.15rem] text-[var(--b-dim)]">{card.fr_l}</div>}
                      </>
                    ) : (
                      <>
                        <div
                          className="text-center text-[2.1rem] font-semibold leading-[1.2] tracking-[-0.01em] text-[var(--b-text)]"
                          style={display}
                        >
                          {card.en_h}
                        </div>
                        {card.abbr && <span className="b-abbr">{card.abbr}</span>}
                      </>
                    )}
                    <p className="m-0 mt-auto text-[0.78rem] text-[var(--b-dim)]">
                      <kbd className="b-kbd">Space</kbd> or tap to reveal
                    </p>
                  </div>

                  {/* Back */}
                  <div
                    className="b-card b-lift absolute inset-0 flex flex-col gap-2.5 overflow-y-auto p-7"
                    style={{ backfaceVisibility:'hidden', transform:'rotateY(180deg)', borderColor:'var(--b-primary)' }}
                  >
                    {isFrEn ? (
                      <>
                        <div className="text-[1.4rem] font-semibold leading-tight text-[var(--b-text)]" style={display}>
                          {card.en_h}
                        </div>
                        {card.en_l && <div className="text-[1rem] text-[var(--b-dim)]">{card.en_l}</div>}
                        <p className="m-0 text-[0.92rem] leading-[1.65] text-[var(--b-dim)]">{card.d}</p>
                      </>
                    ) : (
                      <>
                        <div className="text-[1.45rem] font-semibold leading-tight text-[var(--b-primary)]" style={display}>{card.fr_h}</div>
                        {card.fr_l && <div className="text-[1rem] text-[var(--b-dim)]">{card.fr_l}</div>}
                        <p className="m-0 text-[0.92rem] leading-[1.65] text-[var(--b-dim)]">{(card.d_fr || card.d)}</p>
                      </>
                    )}

                    {hasParts && (
                      <div className="flex flex-col gap-1.5">
                        {(['p','r','s'] as const).flatMap(t =>
                          (cardParts?.[t] ?? []).map(wp => (
                            <div key={`${t}-${wp}`} className="b-ex">
                              <strong className={`b-part--${t}`}>{wp}</strong>
                              {partsMap[wp]?.d ? ` · ${partsMap[wp].d}` : ''}
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-2">
                      <span className={`b-lvl b-lvl--${card.lvl}`}>{LVL_TEXT[card.lvl]}</span>
                      {card.f.map(f => <span key={f} className="b-field">{f}</span>)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Study controls */}
              {mode === 'study' && (
                <>
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={prevCard}
                      disabled={cardIdx===0}
                      className="b-press b-focus rounded-xl border border-[var(--b-border)] bg-[var(--b-panel)] px-6 py-2.5 text-[0.85rem] font-semibold text-[var(--b-dim)] disabled:opacity-35"
                    >
                      ← Prev
                    </button>
                    <button
                      onClick={nextCard}
                      className="b-press b-glow b-focus rounded-xl bg-[var(--b-primary)] px-6 py-2.5 text-[0.85rem] font-bold text-[var(--b-on-prim)]"
                    >
                      Next →
                    </button>
                  </div>
                  <p className="mt-4 text-center text-[0.76rem] text-[var(--b-dim)] opacity-70">
                    <kbd className="b-kbd">Space</kbd> flip &nbsp; <kbd className="b-kbd">←</kbd> Prev &nbsp; Next <kbd className="b-kbd">→</kbd>
                  </p>
                </>
              )}

              {/* Quiz controls */}
              {mode === 'quiz' && (
                flipped ? (
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={markUnknown}
                      className="b-press b-focus rounded-xl border border-[#C94040] bg-[rgba(201,64,64,0.14)] px-7 py-3 text-[0.88rem] font-bold text-[#FCA5A5]"
                    >
                      <kbd className="b-kbd">←</kbd> Review
                    </button>
                    <button
                      onClick={markKnown}
                      className="b-press b-focus rounded-xl border border-[var(--b-primary)] px-7 py-3 text-[0.88rem] font-bold text-[var(--b-primary)]"
                      style={{ background: 'color-mix(in srgb, var(--b-primary) 16%, transparent)' }}
                    >
                      Know it <kbd className="b-kbd">→</kbd>
                    </button>
                  </div>
                ) : (
                  <p className="text-center text-[0.76rem] text-[var(--b-dim)] opacity-70">
                    <kbd className="b-kbd">Space</kbd> flip &nbsp; <kbd className="b-kbd">←</kbd> review &nbsp; know it <kbd className="b-kbd">→</kbd>
                  </p>
                )
              )}

              {/* Stats */}
              {mode === 'quiz' && (
                <div className="mt-6 flex border-t border-[var(--b-border)] pt-5">
                  {[
                    { n: Math.max(0, deck.length - cardIdx - 1), l: 'remaining', c: 'var(--b-text)' },
                    { n: known.size,                              l: 'known',     c: 'var(--b-primary)' },
                    { n: Math.max(0, cardIdx - known.size),       l: 'missed',    c: '#FCA5A5' },
                  ].map(s => (
                    <div key={s.l} className="flex-1 text-center">
                      <div className="text-[1.5rem] font-semibold tabular-nums" style={{ ...display, color:s.c }}>{s.n}</div>
                      <div className="text-[0.72rem] font-medium text-[var(--b-dim)]">{s.l}</div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ── Done ── */}
          {done && (
            mode === 'quiz' ? (
              <>
                <div className="mb-7 text-center">
                  <div className="mb-2 text-[2.4rem] font-semibold tabular-nums text-[var(--b-primary)]" style={display}>
                    {known.size} / {deck.length}
                  </div>
                  <p className="m-0 text-[0.95rem] text-[var(--b-dim)]">
                    {known.size === deck.length ? 'Perfect! All cards known.' : known.size >= deck.length * 0.8 ? 'Great job!' : 'Keep practicing!'}
                  </p>
                </div>

                {missedCards.length > 0 && (
                  <div className="mb-7">
                    <div className="mb-3 border-b border-[var(--b-border)] pb-2 text-[0.78rem] font-bold uppercase tracking-[0.12em] text-[var(--b-dim)]">
                      Review list ({missedCards.length})
                    </div>
                    <div className="flex max-h-[340px] flex-col gap-1.5 overflow-y-auto">
                      {missedCards.map((v, i) => (
                        <div key={i} className="b-card grid grid-cols-[1fr_1fr] gap-3 px-4 py-2.5 text-[0.85rem] leading-[1.5]">
                          <span className="font-bold text-[var(--b-text)]">{isFrEn ? v.fr_h : v.en_h}</span>
                          <span className="text-[var(--b-dim)]">{isFrEn ? v.en_h : v.fr_h}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap justify-center gap-3">
                  {missedCards.length > 0 && (
                    <button
                      onClick={startMissed}
                      className="b-press b-focus rounded-xl border border-[#C94040] bg-[rgba(201,64,64,0.14)] px-6 py-2.5 text-[0.85rem] font-bold text-[#FCA5A5]"
                    >
                      ↺ Retry ({missedCards.length})
                    </button>
                  )}
                  <button
                    onClick={() => setShowSettings(true)}
                    className="b-press b-focus rounded-xl border border-[var(--b-border)] bg-[var(--b-panel)] px-6 py-2.5 text-[0.85rem] font-semibold text-[var(--b-dim)]"
                  >
                    New session
                  </button>
                </div>
              </>
            ) : (
              <div className="pt-8 text-center">
                <div className="mb-3 text-[2rem] font-semibold text-[var(--b-primary)]" style={display}>All done</div>
                <p className="mb-7 text-[0.95rem] text-[var(--b-dim)]">{deck.length} cards reviewed.</p>
                <div className="flex flex-wrap justify-center gap-3">
                  <button
                    onClick={startDeck}
                    className="b-press b-glow b-focus rounded-xl bg-[var(--b-primary)] px-6 py-2.5 text-[0.85rem] font-bold text-[var(--b-on-prim)]"
                  >
                    ↺ Start over
                  </button>
                  <button
                    onClick={() => setShowSettings(true)}
                    className="b-press b-focus rounded-xl border border-[var(--b-border)] bg-[var(--b-panel)] px-6 py-2.5 text-[0.85rem] font-semibold text-[var(--b-dim)]"
                  >
                    New session
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
