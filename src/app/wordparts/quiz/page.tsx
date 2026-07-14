'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import partsData from '@/data/medical_wordparts.json'
import { LVL_TEXT } from '@/lib/vocab-constants'

/* ─── Types ─── */
interface WordPart {
  wp: string; t: 'p'|'r'|'s'; lvl: 1|2|3
  d: string; ex: [string,string][]; syn?: string[]
}
interface Question {
  type: 1|2
  wp: string; t: 'p'|'r'|'s'; lvl: 1|2|3
  question: string
  options: string[]
  correctIdx: number
  feedback: string[]
}

/* ─── Static data ─── */
const ALL = partsData as WordPart[]
const LABELS = ['A','B','C','D']

/* ─── Helpers ─── */
function cleanDef(d: string) { return d.replace(/^\([^)]+\)\s*/, '').trim() }
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/* Distractors: exclude the entry, its synonyms, AND any part that shares its
   meaning (so no option is secretly also correct); prefer the same type. */
function distractors(entry: WordPart): WordPart[] {
  const excl = new Set([entry.wp, ...(entry.syn ?? [])])
  const answerDef = cleanDef(entry.d).toLowerCase()
  const eligible = ALL.filter(p => !excl.has(p.wp) && cleanDef(p.d).toLowerCase() !== answerDef)
  const sameType = eligible.filter(p => p.t === entry.t)
  const pool = sameType.length >= 3 ? sameType : eligible
  return shuffle(pool).slice(0, 3)
}

/* ─── Question builders (meaning + which-part only) ─── */
function q1(entry: WordPart): Question {
  const opts = shuffle([entry, ...distractors(entry)])
  return {
    type: 1, wp: entry.wp, t: entry.t, lvl: entry.lvl,
    question: `What does **${entry.wp}** mean?`,
    options: opts.map(e => cleanDef(e.d)),
    correctIdx: opts.indexOf(entry),
    feedback: opts.map(e => `${e.wp} = ${cleanDef(e.d)}`)
  }
}

function q2(entry: WordPart): Question {
  const opts = shuffle([entry, ...distractors(entry)])
  return {
    type: 2, wp: entry.wp, t: entry.t, lvl: entry.lvl,
    question: `Which word part means **"${cleanDef(entry.d)}"**?`,
    options: opts.map(e => e.wp),
    correctIdx: opts.indexOf(entry),
    feedback: opts.map(e => `${e.wp} = ${cleanDef(e.d)}`)
  }
}

/* Endless pool: q1 for every part, q2 for lvl>=2 (natural high-yield lean). */
function buildPool(): Question[] {
  const pool: Question[] = []
  for (const e of ALL) {
    pool.push(q1(e))
    if (e.lvl >= 2) pool.push(q2(e))
  }
  return shuffle(pool)
}

/* ─── Component ─── */
export default function WordPartsPractice() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [mode,      setMode]      = useState<'endless'|'retry'>('endless')
  const [qIdx,      setQIdx]      = useState(0)
  const [selected,  setSelected]  = useState<number | null>(null)
  const [score,     setScore]     = useState(0)
  const [missed,    setMissed]    = useState<Question[]>([])
  const [ended,     setEnded]     = useState(false)

  /* Build the first pool on the client (avoids SSR/Math.random hydration mismatch). */
  useEffect(() => { setQuestions(buildPool()) }, [])

  const q        = questions[qIdx]
  const answered = selected !== null
  const total    = score + missed.length

  /* ── Actions ── */
  function handleAnswer(i: number) {
    if (answered) return
    setSelected(i)
    if (i === q.correctIdx) setScore(s => s + 1)
    else setMissed(m => [...m, q])
  }

  function handleNext() {
    setSelected(null)
    const next = qIdx + 1
    if (next >= questions.length) {
      if (mode === 'endless') { setQuestions(buildPool()); setQIdx(0) }
      else { setEnded(true) }
    } else {
      setQIdx(next)
    }
  }

  function endSession() { setEnded(true) }

  function retryMissed() {
    setQuestions(shuffle([...missed]))
    setMode('retry'); setQIdx(0); setSelected(null); setScore(0); setMissed([]); setEnded(false)
  }

  function newPractice() {
    setQuestions(buildPool())
    setMode('endless'); setQIdx(0); setSelected(null); setScore(0); setMissed([]); setEnded(false)
  }

  /* ── Option colors ── */
  function optBg(i: number) {
    if (!answered) return 'var(--color-panel)'
    if (i === q.correctIdx) return 'rgba(59,170,106,0.15)'
    if (i === selected)     return 'rgba(201,64,64,0.15)'
    return 'var(--color-panel)'
  }
  function optBorder(i: number) {
    if (!answered) return 'var(--color-border)'
    if (i === q.correctIdx) return '#3BAA6A'
    if (i === selected)     return '#C94040'
    return 'var(--color-border)'
  }
  function optTextColor(i: number) {
    if (!answered) return 'var(--color-text)'
    if (i === q.correctIdx) return '#6EE7B7'
    if (i === selected)     return '#FCA5A5'
    return 'var(--color-text-dim)'
  }

  /* ── Question card helpers ── */
  function qBigTerm(question: string, wp: string) {
    const m = question.match(/\*\*"?([^"*]+)"?\*\*/)
    return m ? m[1] : wp
  }
  function qInstruction(type: 1|2) {
    return type === 1 ? 'What does this mean?' : 'Which word part means this?'
  }

  /* ── Loading (first client render before the pool is built) ── */
  if (!ended && questions.length === 0) {
    return (
      <div style={{ maxWidth:'640px', margin:'3rem auto 0', textAlign:'center', color:'var(--color-text-dim)', fontSize:'0.9rem' }}>
        Loading practice…
      </div>
    )
  }

  return (
    <>
      {/* ══ Practice Session ══ */}
      {!ended && q && (
        <div style={{ maxWidth:'640px', margin:'2rem auto 0' }}>

          {/* Tally row */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.75rem' }}>
            <div style={{ fontFamily:'var(--font-pixel)', fontSize:'0.5rem', color:'var(--color-text-dim)', lineHeight:1.8 }}>
              {mode === 'retry' ? 'Retry ' : 'Answered '}{total}
              <span style={{ marginLeft:'0.75rem', color:'#6EE7B7' }}>✓ {score}</span>
              <span style={{ marginLeft:'0.5rem', color:'#FCA5A5' }}>✗ {missed.length}</span>
            </div>
            <button onClick={endSession}
              style={{ fontFamily:'var(--font-pixel)', fontSize:'0.45rem', color:'var(--color-text-dim)', background:'none', border:'1px solid var(--color-border)', padding:'0.35rem 0.7rem', cursor:'pointer', lineHeight:1.8 }}>
              End session
            </button>
          </div>

          {/* Question card */}
          <div style={{ background:'var(--color-panel)', border:'1px solid var(--color-border)', boxShadow:'2px 2px 0 0 var(--color-border)', minHeight:'240px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'2.5rem 2rem', marginBottom:'1.25rem', textAlign:'center', gap:'0.85rem' }}>
            <span className={`c-stars c-stars--${q.lvl}`} role="img" aria-label={`Importance: ${LVL_TEXT[q.lvl]}`} style={{ fontSize:'1.2rem' }}>{'⭐'.repeat(q.lvl)}</span>
            <div style={{ fontSize:'2.2rem', fontWeight:700, color:'var(--color-gold)', lineHeight:1.2, wordBreak:'break-word', maxWidth:'100%' }}>
              {qBigTerm(q.question, q.wp)}
            </div>
            <div style={{ fontSize:'0.9rem', color:'var(--color-text-dim)', lineHeight:1.6 }}>
              {qInstruction(q.type)}
            </div>
          </div>

          {/* Options */}
          <div style={{ display:'flex', flexDirection:'column', gap:'0.6rem', marginBottom:'1.5rem' }}>
            {q.options.map((opt, i) => (
              <button key={i} onClick={() => handleAnswer(i)}
                style={{
                  display: 'block', width: '100%', padding: '1rem 1.25rem',
                  textAlign: 'left',
                  background: optBg(i),
                  border: `2px solid ${optBorder(i)}`,
                  cursor: answered ? 'default' : 'pointer',
                  transition: 'border-color 0.2s, background 0.2s',
                }}>
                <div style={{ display:'flex', alignItems:'flex-start', gap:'0.75rem' }}>
                  <span style={{ fontFamily:'var(--font-pixel)', fontSize:'0.45rem', color:optTextColor(i), flexShrink:0, marginTop:'0.3rem' }}>
                    {LABELS[i]}
                  </span>
                  <span style={{ color:optTextColor(i), fontWeight: answered && i===q.correctIdx ? 600 : 400, fontSize:'0.95rem', lineHeight:1.55, flex:1 }}>
                    {opt}
                  </span>
                  {answered && i === q.correctIdx && (
                    <span style={{ color:'#6EE7B7', flexShrink:0, fontSize:'1rem' }}>✓</span>
                  )}
                  {answered && i !== q.correctIdx && (
                    <span style={{ color: i === selected ? '#FCA5A5' : 'var(--color-text-dim)', flexShrink:0, fontSize:'1rem', opacity: i === selected ? 1 : 0.5 }}>✗</span>
                  )}
                </div>
                {answered && (
                  <div style={{ marginTop:'0.35rem', paddingLeft:'1.7rem', fontSize:'0.8rem', color:'var(--color-text-dim)', fontStyle:'italic' }}>
                    {q.feedback[i]}
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Next */}
          {answered && (
            <div style={{ display:'flex', justifyContent:'flex-end' }}>
              <button onClick={handleNext} className="c-btn-pixel" style={{ fontSize:'0.55rem', padding:'0.65rem 1.8rem' }}>
                Next →
              </button>
            </div>
          )}
        </div>
      )}

      {/* ══ Summary (after End session) ══ */}
      {ended && (
        <div style={{ maxWidth:'640px', margin:'2rem auto 0' }}>
          <div style={{ textAlign:'center', marginBottom:'2rem' }}>
            <div style={{ fontFamily:'var(--font-pixel)', fontSize:'1.4rem', color:'var(--color-gold)', marginBottom:'0.5rem' }}>
              ✓ {score} / {total}
            </div>
            <p style={{ fontSize:'0.95rem', color:'var(--color-text-dim)' }}>
              {total === 0 ? 'No questions answered yet.'
                : score === total ? 'Perfect — every one right!'
                : score >= total * 0.8 ? 'Great session!'
                : 'Keep practicing!'}
            </p>
          </div>

          {missed.length > 0 && (
            <div style={{ marginBottom:'1.75rem' }}>
              <div style={{ fontFamily:'var(--font-pixel)', fontSize:'0.5rem', color:'var(--color-text-dim)', marginBottom:'0.75rem', paddingBottom:'0.5rem', borderBottom:'1px solid var(--color-border)' }}>
                Missed ({missed.length})
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:'0.3rem', maxHeight:'340px', overflowY:'auto' }}>
                {missed.map((mq, i) => (
                  <div key={i} style={{ display:'grid', gridTemplateColumns:'minmax(0,1fr) minmax(0,2fr)', gap:'0.75rem', padding:'0.6rem 0.75rem', background:'var(--color-panel)', border:'1px solid var(--color-border)', fontSize:'0.85rem', lineHeight:1.5 }}>
                    <span style={{ fontWeight:700, color:'var(--color-gold)', fontFamily:'var(--font-pixel)', fontSize:'0.48rem', alignSelf:'center', wordBreak:'break-word' }}>
                      {mq.wp}
                    </span>
                    <span style={{ color:'var(--color-text-dim)' }}>
                      {mq.options[mq.correctIdx]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display:'flex', gap:'0.75rem', justifyContent:'center', flexWrap:'wrap' }}>
            {missed.length > 0 && (
              <button onClick={retryMissed} className="c-btn-pixel"
                style={{ fontSize:'0.5rem', padding:'0.65rem 1.5rem', background:'rgba(201,64,64,0.15)', color:'#FCA5A5', border:'1px solid #C94040', boxShadow:'none' }}>
                ✗ Retry ({missed.length})
              </button>
            )}
            <button onClick={newPractice} className="c-btn-pixel"
              style={{ fontSize:'0.5rem', padding:'0.65rem 1.5rem' }}>
              New practice
            </button>
          </div>

          <div style={{ textAlign:'center', marginTop:'1.75rem', display:'flex', flexDirection:'column', gap:'0.4rem' }}>
            <Link href="/wordparts" style={{ fontSize:'0.82rem', color:'var(--color-text-dim)', textDecoration:'underline' }}>
              ← Back to Word Parts
            </Link>
          </div>
        </div>
      )}
    </>
  )
}
