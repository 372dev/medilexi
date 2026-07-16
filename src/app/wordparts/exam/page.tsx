'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import quizData from '@/data/medical_wordparts_quiz.json'
import partsData from '@/data/medical_wordparts.json'
import {
  difficultyOf, buildSpellIndex,
  type BankQuestion, type BankBundle, type Clarity, type Bucket,
} from '@/lib/quiz-difficulty'

/* ─── Static data ─── */
const BANK = quizData as unknown as {
  bundles: BankBundle[]
  clarity: Record<string, Clarity>
  questions: BankQuestion[]
}
const PARTS = partsData as unknown as { wp: string; lvl: number }[]

const SPELL = buildSpellIndex(PARTS)
const LVL   = new Map<string, number>(PARTS.map(p => [p.wp, p.lvl] as [string, number]))
const lvlOf     = (wp: string) => LVL.get(wp)
const clarityOf = (wp: string) => BANK.clarity[wp]

const LABELS       = ['A', 'B', 'C', 'D']
const PASS_PCT     = 80          // RULES 9b
const EXAM_MINUTES = 20          // 1 min/question
const STORE_KEY    = 'medilexi.exam.results'

/* ─── Types ─── */
interface ExamQuestion extends BankQuestion {
  bucket: Bucket
  shown: string[]      // options in display order (ALWAYS shuffled — RULES 9b)
  correctIdx: number   // index of the answer within `shown`
}
interface SavedResult { score: number; total: number; updatedAt: string }

/* ─── Helpers ─── */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Easy → Medium → Hard, shuffled within each block; options shuffled (RULES 9b). */
function buildExam(bundleId: string): ExamQuestion[] {
  const mine = BANK.questions.filter(q => q.bundle === bundleId)
  const byBucket: Record<Bucket, BankQuestion[]> = { Easy: [], Medium: [], Hard: [] }
  for (const q of mine) byBucket[difficultyOf(q, lvlOf, clarityOf, SPELL)].push(q)

  const ordered = [
    ...shuffle(byBucket.Easy),
    ...shuffle(byBucket.Medium),
    ...shuffle(byBucket.Hard),
  ]

  return ordered.map(q => {
    const order = shuffle(q.options.map((_, i) => i))
    return {
      ...q,
      bucket: difficultyOf(q, lvlOf, clarityOf, SPELL),
      shown: order.map(i => q.options[i]),
      correctIdx: order.indexOf(q.answer),
    }
  })
}

function readResults(): Record<string, SavedResult> {
  try { return JSON.parse(localStorage.getItem(STORE_KEY) ?? '{}') } catch { return {} }
}
/** Overwrite on re-attempt — latest wins, no history (RULES 9b). */
function writeResult(bundleId: string, score: number, total: number) {
  try {
    const all = readResults()
    all[bundleId] = { score, total, updatedAt: new Date().toISOString() }
    localStorage.setItem(STORE_KEY, JSON.stringify(all))
  } catch { /* storage unavailable — the exam still works, it just won't persist */ }
}

function mmss(s: number) {
  const m = Math.floor(s / 60)
  return `${m}:${String(s % 60).padStart(2, '0')}`
}

/* ─── Component ─── */
export default function WordPartsExam() {
  const [bundleId, setBundleId] = useState<string | null>(null)
  const [qs,       setQs]       = useState<ExamQuestion[]>([])
  const [answers,  setAnswers]  = useState<(number | null)[]>([])
  const [marked,   setMarked]   = useState<boolean[]>([])
  const [qIdx,     setQIdx]     = useState(0)
  const [deadline, setDeadline] = useState(0)
  const [left,     setLeft]     = useState(EXAM_MINUTES * 60)
  const [submitted, setSubmitted] = useState(false)
  const [results,  setResults]  = useState<Record<string, SavedResult>>({})

  useEffect(() => { setResults(readResults()) }, [])

  const bundle = BANK.bundles.find(b => b.id === bundleId) ?? null
  const score  = qs.reduce((n, q, i) => n + (answers[i] === q.correctIdx ? 1 : 0), 0)
  const pct    = qs.length ? Math.round((score / qs.length) * 100) : 0
  const passed = pct >= PASS_PCT

  const submit = useCallback(() => {
    if (submitted || qs.length === 0) return
    const s = qs.reduce((n, q, i) => n + (answers[i] === q.correctIdx ? 1 : 0), 0)
    if (bundleId) {
      writeResult(bundleId, s, qs.length)
      setResults(readResults())
    }
    setSubmitted(true)
  }, [submitted, qs, answers, bundleId])

  /* Countdown. Driven off a wall-clock deadline, not a decrement, so it neither drifts
     while the tab is backgrounded nor resets when `submit` changes on every answer. */
  useEffect(() => {
    if (!bundleId || submitted || deadline === 0) return
    const tick = () => setLeft(Math.max(0, Math.ceil((deadline - Date.now()) / 1000)))
    tick()
    const id = setInterval(tick, 500)
    return () => clearInterval(id)
  }, [bundleId, submitted, deadline])

  /* Auto-submit when time runs out. */
  useEffect(() => {
    if (bundleId && !submitted && deadline !== 0 && left === 0) submit()
  }, [bundleId, submitted, deadline, left, submit])

  function start(id: string) {
    const built = buildExam(id)
    setBundleId(id)
    setQs(built)
    setAnswers(Array(built.length).fill(null))
    setMarked(Array(built.length).fill(false))
    setQIdx(0)
    setLeft(EXAM_MINUTES * 60)
    setDeadline(Date.now() + EXAM_MINUTES * 60 * 1000)
    setSubmitted(false)
  }
  function quit() { setBundleId(null); setQs([]); setDeadline(0); setSubmitted(false) }
  function choose(i: number) {
    setAnswers(a => { const n = [...a]; n[qIdx] = i; return n })
  }
  function toggleMark() {
    setMarked(m => { const n = [...m]; n[qIdx] = !n[qIdx]; return n })
  }

  /* ══ 1. Exam selection ══ */
  if (!bundleId) {
    return (
      <div style={{ maxWidth: '640px', margin: '2rem auto 0' }}>
        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-dim)', lineHeight: 1.7, marginBottom: '1.75rem' }}>
          Curated 20-question exams. Every exam is the same difficulty. You can move between questions and
          flag any of them; nothing is revealed until you submit. Pass mark {PASS_PCT}%.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[...BANK.bundles].sort((a, b) => a.order - b.order).map(b => {
            const r = results[b.id]
            return (
              <div key={b.id}
                style={{
                  background: 'var(--color-panel)',
                  border: `1px solid ${b.free ? 'var(--color-gold)' : 'var(--color-border)'}`,
                  padding: '1.1rem 1.25rem',
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  opacity: b.free ? 1 : 0.55,
                }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '1rem', color: b.free ? 'var(--color-text)' : 'var(--color-text-dim)', marginBottom: '0.25rem' }}>
                    {b.title}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-text-dim)' }}>
                    20 questions
                    {r && b.free && (
                      <span style={{ marginLeft: '0.6rem', color: r.score / r.total * 100 >= PASS_PCT ? '#6EE7B7' : '#FCA5A5' }}>
                        · last: {r.score}/{r.total}
                      </span>
                    )}
                  </div>
                </div>
                {b.free ? (
                  <button onClick={() => start(b.id)} className="c-btn-pixel" style={{ fontSize: '0.5rem', padding: '0.6rem 1.2rem' }}>
                    {r ? 'Retake' : 'Start'}
                  </button>
                ) : (
                  <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.45rem', color: 'var(--color-text-dim)', border: '1px solid var(--color-border)', padding: '0.45rem 0.7rem', lineHeight: 1.8 }}>
                    🔒 Coming soon
                  </span>
                )}
              </div>
            )
          })}
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.75rem' }}>
          <Link href="/wordparts" style={{ fontSize: '0.82rem', color: 'var(--color-text-dim)', textDecoration: 'underline' }}>
            ← Back to Word Parts
          </Link>
        </div>
      </div>
    )
  }

  /* ══ 3. Result ══ */
  if (submitted) {
    return (
      <div style={{ maxWidth: '720px', margin: '2rem auto 0' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '1.4rem', color: passed ? '#6EE7B7' : '#FCA5A5', marginBottom: '0.5rem' }}>
            {score} / {qs.length} · {pct}%
          </div>
          <p style={{ fontSize: '0.95rem', color: passed ? '#6EE7B7' : '#FCA5A5', fontWeight: 600 }}>
            {passed ? `PASS — at or above ${PASS_PCT}%` : `FAIL — ${PASS_PCT}% needed to pass`}
          </p>
          <p style={{ fontSize: '0.82rem', color: 'var(--color-text-dim)', marginTop: '0.4rem' }}>
            {bundle?.title} · result saved (a retake replaces it)
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.75rem' }}>
          {qs.map((q, i) => {
            const you = answers[i]
            const ok  = you === q.correctIdx
            return (
              <div key={q.id} style={{ background: 'var(--color-panel)', border: `1px solid ${ok ? '#3BAA6A' : '#C94040'}`, padding: '0.9rem 1.1rem' }}>
                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.45rem', color: 'var(--color-text-dim)', flexShrink: 0, marginTop: '0.25rem' }}>{i + 1}</span>
                  <span style={{ fontSize: '0.9rem', color: 'var(--color-text)', lineHeight: 1.55, flex: 1 }}>{q.prompt}</span>
                  <span style={{ color: ok ? '#6EE7B7' : '#FCA5A5', flexShrink: 0 }}>{ok ? '✓' : '✗'}</span>
                </div>
                <div style={{ paddingLeft: '1.4rem', fontSize: '0.85rem', lineHeight: 1.6 }}>
                  <div style={{ color: '#6EE7B7' }}>Correct: {q.shown[q.correctIdx]}</div>
                  {!ok && (
                    <div style={{ color: '#FCA5A5' }}>
                      Your answer: {you === null ? <em>(not answered)</em> : q.shown[you]}
                    </div>
                  )}
                  <div style={{ color: 'var(--color-text-dim)', marginTop: '0.35rem', fontStyle: 'italic' }}>{q.explain}</div>
                </div>
              </div>
            )
          })}
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => start(bundleId)} className="c-btn-pixel" style={{ fontSize: '0.5rem', padding: '0.65rem 1.5rem' }}>
            Retake
          </button>
          <button onClick={quit} className="c-btn-pixel" style={{ fontSize: '0.5rem', padding: '0.65rem 1.5rem', background: 'none', color: 'var(--color-text-dim)', boxShadow: 'none' }}>
            All exams
          </button>
        </div>
      </div>
    )
  }

  /* ══ 2. Playing ══ */
  const q = qs[qIdx]
  if (!q) return null   // exam is built in `start()`, so this is only a transient frame

  const answeredCount = answers.filter(a => a !== null).length
  const low = left <= 60

  return (
    <div style={{ maxWidth: '720px', margin: '2rem auto 0' }}>

      {/* Status bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.5rem', color: 'var(--color-text-dim)', lineHeight: 1.8 }}>
          {bundle?.title} · {answeredCount}/{qs.length} answered
        </div>
        <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.6rem', color: low ? '#FCA5A5' : 'var(--color-gold)', lineHeight: 1.8 }}
          role="timer" aria-live="off">
          ⏱ {mmss(left)}
        </div>
      </div>

      {/* Navigator — gray unanswered · green answered · yellow marked (RULES 9b) */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '1.25rem' }}>
        {qs.map((_, i) => {
          const isMarked = marked[i]
          const isDone   = answers[i] !== null
          const bg = isMarked ? '#F0B429' : isDone ? '#3BAA6A' : 'var(--color-border)'
          const fg = isMarked || isDone ? '#0D0B2B' : 'var(--color-text-dim)'
          return (
            <button key={i} onClick={() => setQIdx(i)}
              aria-label={`Question ${i + 1}${isMarked ? ', marked for review' : isDone ? ', answered' : ', not answered'}`}
              aria-current={i === qIdx ? 'true' : undefined}
              style={{
                width: '2rem', height: '2rem', flexShrink: 0, cursor: 'pointer',
                background: bg, color: fg,
                border: i === qIdx ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
                fontFamily: 'var(--font-pixel)', fontSize: '0.45rem', lineHeight: 1,
              }}>
              {i + 1}
            </button>
          )
        })}
      </div>

      {/* Question */}
      <div style={{ background: 'var(--color-panel)', border: '1px solid var(--color-border)', padding: '1.5rem 1.35rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.9rem' }}>
          <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.5rem', color: 'var(--color-text-dim)', lineHeight: 1.8 }}>
            Question {qIdx + 1} of {qs.length}
          </span>
          <button onClick={toggleMark}
            aria-pressed={marked[qIdx]}
            style={{
              fontFamily: 'var(--font-pixel)', fontSize: '0.45rem', cursor: 'pointer', lineHeight: 1.8,
              padding: '0.35rem 0.7rem', flexShrink: 0,
              background: marked[qIdx] ? '#F0B429' : 'none',
              color: marked[qIdx] ? '#0D0B2B' : 'var(--color-text-dim)',
              border: `1px solid ${marked[qIdx] ? '#F0B429' : 'var(--color-border)'}`,
            }}>
            {marked[qIdx] ? '★ Marked' : '☆ Mark'}
          </button>
        </div>
        <div style={{ fontSize: '1.05rem', color: 'var(--color-text)', lineHeight: 1.6 }}>{q.prompt}</div>
      </div>

      {/* Options — no feedback until submit (RULES 9b) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem' }}>
        {q.shown.map((opt, i) => {
          const sel = answers[qIdx] === i
          return (
            <button key={i} onClick={() => choose(i)}
              style={{
                display: 'block', width: '100%', padding: '0.95rem 1.15rem', textAlign: 'left', cursor: 'pointer',
                background: sel ? 'rgba(155,143,239,0.15)' : 'var(--color-panel)',
                border: `2px solid ${sel ? 'var(--color-accent)' : 'var(--color-border)'}`,
                transition: 'border-color 0.15s, background 0.15s',
              }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.45rem', color: sel ? 'var(--color-accent)' : 'var(--color-text-dim)', flexShrink: 0, marginTop: '0.3rem' }}>
                  {LABELS[i]}
                </span>
                <span style={{ color: 'var(--color-text)', fontSize: '0.95rem', lineHeight: 1.55, flex: 1 }}>{opt}</span>
              </div>
            </button>
          )
        })}
      </div>

      {/* Nav */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
        <button onClick={() => setQIdx(i => Math.max(0, i - 1))} disabled={qIdx === 0} className="c-btn-pixel"
          style={{ fontSize: '0.5rem', padding: '0.6rem 1.2rem', background: 'none', color: 'var(--color-text-dim)', boxShadow: 'none', opacity: qIdx === 0 ? 0.4 : 1, cursor: qIdx === 0 ? 'default' : 'pointer' }}>
          ← Prev
        </button>
        {qIdx < qs.length - 1 ? (
          <button onClick={() => setQIdx(i => Math.min(qs.length - 1, i + 1))} className="c-btn-pixel" style={{ fontSize: '0.5rem', padding: '0.6rem 1.2rem' }}>
            Next →
          </button>
        ) : (
          <button onClick={submit} className="c-btn-pixel" style={{ fontSize: '0.5rem', padding: '0.6rem 1.4rem', background: 'var(--color-gold)', color: 'var(--color-bg)' }}>
            Submit exam
          </button>
        )}
      </div>

      <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
        <button onClick={submit}
          style={{ fontSize: '0.8rem', color: 'var(--color-text-dim)', background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer' }}>
          Submit now ({answeredCount}/{qs.length} answered)
        </button>
      </div>
    </div>
  )
}
