'use client'

import { useState } from 'react'
import Link from 'next/link'
import partsData from '@/data/medical_wordparts.json'

/* ─── Types ─── */
interface WordPart {
  wp: string; t: 'p'|'r'|'s'; lvl: 1|2|3
  d: string; ex: [string,string][]; syn?: string[]
}
interface Question {
  type: 1|2|3|4
  wp: string; t: 'p'|'r'|'s'; lvl: 1|2|3
  question: string
  options: string[]
  correctIdx: number
  feedback: string[]
}

/* ─── Static data ─── */
const ALL = partsData as WordPart[]
const COUNT_OPTIONS = [10, 20, 30] as const
const LABELS = ['A','B','C','D']

/* ─── Helpers ─── */
function cleanDef(d: string) { return d.replace(/^\([^)]+\)\s*/, '').trim() }
function simpleDef(d: string) { return cleanDef(d).split(/[;,]/)[0].trim().toLowerCase() }
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const WRAPPERS = [
  'Inflammation of', 'Surgical removal of', 'Surgical repair of',
  'Study of', 'Visual examination of', 'Examination of',
  'Abnormal enlargement of', 'Tumor of', 'Infection of',
  'Surgical incision of', 'Imaging of', 'Fixation of',
]
function detectWrapper(def: string) {
  return WRAPPERS.find(w => def.toLowerCase().startsWith(w.toLowerCase())) ?? null
}

/* ─── Question builders ─── */
function q1(entry: WordPart): Question {
  const excl = new Set([entry.wp, ...(entry.syn ?? [])])
  const dist = shuffle(ALL.filter(p => !excl.has(p.wp))).slice(0, 3)
  const opts = shuffle([entry, ...dist])
  const ci = opts.indexOf(entry)
  return {
    type: 1, wp: entry.wp, t: entry.t, lvl: entry.lvl,
    question: `What does **${entry.wp}** mean?`,
    options: opts.map(e => cleanDef(e.d)),
    correctIdx: ci,
    feedback: opts.map(e => `${e.wp} = ${cleanDef(e.d)}`)
  }
}

function q2(entry: WordPart): Question {
  const excl = new Set([entry.wp, ...(entry.syn ?? [])])
  const dist = shuffle(ALL.filter(p => !excl.has(p.wp))).slice(0, 3)
  const opts = shuffle([entry, ...dist])
  const ci = opts.indexOf(entry)
  return {
    type: 2, wp: entry.wp, t: entry.t, lvl: entry.lvl,
    question: `Which word part means **"${cleanDef(entry.d)}"**?`,
    options: opts.map(e => e.wp),
    correctIdx: ci,
    feedback: opts.map(e => `${e.wp} = ${cleanDef(e.d)}`)
  }
}

function q3(entry: WordPart): Question | null {
  if (entry.t !== 'r') return null
  for (const [term, def] of entry.ex) {
    const wrapper = detectWrapper(def)
    if (!wrapper) continue
    const excl = new Set([entry.wp, ...(entry.syn ?? [])])
    const dist = shuffle(ALL.filter(p => p.t === 'r' && !excl.has(p.wp))).slice(0, 3)
    if (dist.length < 3) return null
    const correctText = `${wrapper} the ${simpleDef(entry.d)}`
    const items = shuffle([
      { text: correctText,                                ref: entry, correct: true  },
      ...dist.map(d => ({ text: `${wrapper} the ${simpleDef(d.d)}`, ref: d, correct: false }))
    ])
    const ci = items.findIndex(o => o.correct)
    return {
      type: 3, wp: entry.wp, t: entry.t, lvl: entry.lvl,
      question: `What does **"${term}"** mean?`,
      options: items.map(o => o.text),
      correctIdx: ci,
      feedback: items.map(o => `${o.ref.wp} = ${cleanDef(o.ref.d)}`)
    }
  }
  return null
}

function q4(entry: WordPart): Question | null {
  if (!entry.syn?.length) return null
  const synEntry = ALL.find(p => p.wp === entry.syn![0])
  if (!synEntry) return null
  const excl = new Set([entry.wp, ...(entry.syn ?? [])])
  const sameT = ALL.filter(p => p.t === entry.t && !excl.has(p.wp))
  const distPool = sameT.length >= 3 ? sameT : ALL.filter(p => !excl.has(p.wp))
  const dist = shuffle(distPool).slice(0, 3)
  const opts = shuffle([synEntry, ...dist])
  const ci = opts.indexOf(synEntry)
  return {
    type: 4, wp: entry.wp, t: entry.t, lvl: entry.lvl,
    question: `Which word part shares the same meaning as **${entry.wp}**?`,
    options: opts.map(e => e.wp),
    correctIdx: ci,
    feedback: opts.map(e => `${e.wp} = ${cleanDef(e.d)}`)
  }
}

/* ─── Pool builder ─── */
function buildPool(filtered: WordPart[]): Question[] {
  const pool: Question[] = []
  for (const e of filtered) {
    pool.push(q1(e))
    if (e.lvl >= 2) pool.push(q2(e))
    if (e.lvl >= 3) {
      const bonus = e.syn?.length ? q4(e) : e.t === 'r' ? q3(e) : null
      pool.push(bonus ?? q1(e))
    }
  }
  return pool
}

/* ─── Component ─── */
export default function WordPartsQuiz() {
  /* Setup */
  const [showSetup,  setShowSetup]  = useState(true)
  const [lvlFilter,  setLvl]        = useState<number | null>(null)
  const [count,      setCount]      = useState<number>(20)

  /* Session */
  const [started,   setStarted]    = useState(false)
  const [questions, setQuestions]  = useState<Question[]>([])
  const [qIdx,      setQIdx]       = useState(0)
  const [selected,  setSelected]   = useState<number | null>(null)
  const [score,     setScore]      = useState(0)
  const [missed,    setMissed]     = useState<Question[]>([])

  /* Derived */
  const filtered  = ALL.filter(p => !lvlFilter || p.lvl === lvlFilter)
  const poolSize  = filtered.reduce((s, p) => s + p.lvl, 0)
  const q         = questions[qIdx]
  const answered  = selected !== null
  const done      = started && !showSetup && qIdx >= questions.length

  /* ── Actions ── */
  function startSession() {
    const pool = shuffle(buildPool(filtered)).slice(0, count)
    setQuestions(pool); setMissed([]); setScore(0)
    setQIdx(0); setSelected(null)
    setStarted(true); setShowSetup(false)
  }

  function retryMissed() {
    setQuestions(shuffle([...missed])); setMissed([]); setScore(0)
    setQIdx(0); setSelected(null)
  }

  function handleAnswer(i: number) {
    if (answered) return
    setSelected(i)
    if (i === q.correctIdx) setScore(s => s + 1)
    else setMissed(m => [...m, q])
  }

  function handleNext() { setSelected(null); setQIdx(i => i + 1) }

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

  /* ── Bold renderer ── */
  function renderQ(text: string) {
    return text.split('**').map((seg, i) =>
      i % 2 === 1
        ? <strong key={i} style={{ color: 'var(--color-gold)', fontFamily: 'var(--font-pixel)', fontSize: '0.85rem', wordBreak: 'break-word' }}>{seg}</strong>
        : <span key={i}>{seg}</span>
    )
  }

  return (
    <>
      {/* ══ Setup Modal ══ */}
      {showSetup && (
        <div style={{ position:'fixed', inset:0, zIndex:200, background:'rgba(13,11,43,0.94)', display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}>
          <div style={{ background:'var(--color-panel)', border:'1px solid var(--color-border)', padding:'2rem', width:'100%', maxWidth:'420px', boxShadow:'4px 4px 0 0 rgba(240,180,41,0.2)' }}>

            <div style={{ fontFamily:'var(--font-pixel)', fontSize:'0.6rem', color:'var(--color-gold)', lineHeight:2, marginBottom:'1.75rem' }}>
              Quiz Setup
            </div>

            {/* Level */}
            <div style={{ marginBottom:'1.25rem' }}>
              <div style={{ fontSize:'0.8rem', color:'var(--color-text-dim)', marginBottom:'0.5rem' }}>Level</div>
              <div className="c-filter-row" style={{ marginBottom:0 }}>
                <button className={`c-pill ${!lvlFilter ? 'c-pill--active' : ''}`} onClick={() => setLvl(null)}>All</button>
                {[3,2,1].map(l => (
                  <button key={l} className={`c-pill c-pill--star ${lvlFilter===l ? 'c-pill--active' : ''}`}
                    onClick={() => setLvl(lvlFilter===l ? null : l)}>
                    {'⭐'.repeat(l)}
                  </button>
                ))}
              </div>
            </div>

            {/* Count */}
            <div style={{ marginBottom:'1.5rem' }}>
              <div style={{ fontSize:'0.8rem', color:'var(--color-text-dim)', marginBottom:'0.5rem' }}>Questions per session</div>
              <div className="c-toggle">
                {COUNT_OPTIONS.map(n => (
                  <button key={n} className={`c-toggle__btn ${count===n ? 'c-toggle__btn--active' : ''}`}
                    onClick={() => setCount(n)}>{n}</button>
                ))}
              </div>
            </div>

            {/* Distribution */}
            <div style={{ borderTop:'1px solid var(--color-border)', paddingTop:'1rem', marginBottom:'1.25rem' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:'0.55rem' }}>
                <span style={{ fontFamily:'var(--font-pixel)', fontSize:'0.75rem', color:'var(--color-gold)' }}>
                  {Math.min(count, poolSize)}
                </span>
                <span style={{ fontSize:'0.8rem', color:'var(--color-text-dim)' }}>
                  {poolSize > count ? `random from ${poolSize} quiz pool` : 'questions selected'}
                </span>
              </div>
              <div style={{ height:'6px', display:'flex', borderRadius:'3px', overflow:'hidden', marginBottom:'0.55rem', background:'var(--color-border)' }}>
                {([3,2,1] as const).map((l, i) => {
                  const cnt = filtered.filter(p => p.lvl === l).length
                  const color = i===0 ? '#F0B429' : i===1 ? '#9B8FEF' : '#3D36A0'
                  return cnt > 0
                    ? <div key={l} style={{ width:`${(cnt/filtered.length)*100}%`, background:color, transition:'width 0.3s' }} />
                    : null
                })}
              </div>
              <div style={{ display:'flex', gap:'1rem', marginBottom:'0.6rem' }}>
                {([3,2,1] as const).map((l, i) => {
                  const color = i===0 ? '#F0B429' : i===1 ? '#9B8FEF' : '#5A5490'
                  const label = i===0 ? '⭐⭐⭐' : i===1 ? '⭐⭐' : '⭐'
                  return (
                    <span key={l} style={{ fontSize:'0.78rem', color:'var(--color-text-dim)' }}>
                      <span style={{ color }}>{label}</span> {filtered.filter(p => p.lvl===l).length}
                    </span>
                  )
                })}
              </div>
            </div>

            <button className="c-btn-pixel" onClick={startSession} disabled={poolSize===0}
              style={{ width:'100%', fontSize:'0.6rem', padding:'0.85rem', opacity:poolSize===0?0.4:1, cursor:poolSize===0?'not-allowed':'pointer' }}>
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

      {/* ══ Quiz Area ══ */}
      {started && !showSetup && !done && q && (
        <div style={{ maxWidth:'640px', margin:'2rem auto 0' }}>

          {/* Progress row */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'0.5rem' }}>
            <div style={{ fontFamily:'var(--font-pixel)', fontSize:'0.5rem', color:'var(--color-text-dim)' }}>
              {qIdx + 1} / {questions.length}
              <span style={{ marginLeft:'0.75rem' }}>✓ {score}</span>
            </div>
            <button onClick={() => setShowSetup(true)}
              style={{ fontFamily:'var(--font-pixel)', fontSize:'0.45rem', color:'var(--color-text-dim)', background:'none', border:'1px solid var(--color-border)', padding:'0.2rem 0.55rem', cursor:'pointer', lineHeight:1.8, opacity:0.7 }}>
              ⚙
            </button>
          </div>

          {/* Progress bar */}
          <div style={{ height:'6px', background:'var(--color-border)', borderRadius:'3px', overflow:'hidden', marginBottom:'1.5rem' }}>
            <div style={{ height:'100%', background:'var(--color-gold)', borderRadius:'3px', width:`${(qIdx/questions.length)*100}%`, transition:'width 0.3s' }} />
          </div>

          {/* Question card */}
          <div style={{ background:'var(--color-panel)', border:'1px solid var(--color-border)', padding:'1.5rem', marginBottom:'1.25rem', boxShadow:'2px 2px 0 0 var(--color-border)' }}>
            <div style={{ display:'flex', gap:'0.5rem', alignItems:'center', marginBottom:'1rem' }}>
              <span className={`c-stars c-stars--${q.lvl}`}>{'⭐'.repeat(q.lvl)}</span>
              <span style={{ fontFamily:'var(--font-pixel)', fontSize:'0.4rem', color:'var(--color-text-dim)', marginLeft:'auto', opacity:0.45 }}>
                Type {q.type}
              </span>
            </div>
            <div style={{ fontSize:'1.05rem', color:'var(--color-text)', lineHeight:1.6 }}>
              {renderQ(q.question)}
            </div>
          </div>

          {/* Options */}
          <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem', marginBottom:'1.25rem' }}>
            {q.options.map((opt, i) => (
              <button key={i} onClick={() => handleAnswer(i)}
                style={{
                  display: 'block', width: '100%', padding: '0.85rem 1rem',
                  textAlign: 'left',
                  background: optBg(i),
                  border: `2px solid ${optBorder(i)}`,
                  cursor: answered ? 'default' : 'pointer',
                  transition: 'border-color 0.2s, background 0.2s',
                }}>
                <div style={{ display:'flex', alignItems:'flex-start', gap:'0.65rem' }}>
                  <span style={{ fontFamily:'var(--font-pixel)', fontSize:'0.45rem', color:optTextColor(i), flexShrink:0, marginTop:'0.25rem' }}>
                    {LABELS[i]}
                  </span>
                  <span style={{ color:optTextColor(i), fontWeight: answered && i===q.correctIdx ? 600 : 400, fontSize:'0.92rem', lineHeight:1.5, flex:1 }}>
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

      {/* ══ Done Screen ══ */}
      {done && (
        <div style={{ maxWidth:'640px', margin:'2rem auto 0' }}>
          <div style={{ textAlign:'center', marginBottom:'2rem' }}>
            <div style={{ fontFamily:'var(--font-pixel)', fontSize:'1.4rem', color:'var(--color-gold)', marginBottom:'0.5rem' }}>
              ✓ {score} / {questions.length}
            </div>
            <p style={{ fontSize:'0.95rem', color:'var(--color-text-dim)' }}>
              {score === questions.length ? 'Perfect score!' : score >= questions.length * 0.8 ? 'Great job!' : 'Keep practicing!'}
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
            <button onClick={() => { setShowSetup(true) }} className="c-btn-pixel"
              style={{ fontSize:'0.5rem', padding:'0.65rem 1.5rem', background:'var(--color-panel)', color:'var(--color-text-dim)', border:'1px solid var(--color-border)', boxShadow:'none' }}>
              New Session
            </button>
          </div>
        </div>
      )}
    </>
  )
}
