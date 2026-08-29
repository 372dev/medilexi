import { NextResponse } from 'next/server'
import quizData from '@/data/medical_wordparts_quiz.json'
import partsData from '@/data/medical_wordparts.json'
import { difficultyOf, buildSpellIndex, type BankQuestion, type Clarity, type Bucket } from '@/lib/quiz-difficulty'

/* Serve a word-part exam WITHOUT the answer key. The full bank (answers +
   explanations) stays on the server; this returns only { id, prompt, options }
   with options shuffled per request, difficulty-ordered (Easy -> Medium ->
   Hard). Grading happens server-side in /api/exam/grade. */

const BANK = quizData as unknown as { clarity: Record<string, Clarity>; questions: BankQuestion[]; bundles: { id: string; free: boolean }[] }
const PARTS = partsData as unknown as { wp: string; lvl: number }[]

// Only free bundles are served for now; paid bundles (b2-b5) are "coming soon".
// When accounts land, replace this with a per-user entitlement check.
const FREE = new Set(BANK.bundles.filter(b => b.free).map(b => b.id))

const SPELL = buildSpellIndex(PARTS)
const LVL = new Map<string, number>(PARTS.map(p => [p.wp, p.lvl] as [string, number]))
const lvlOf = (wp: string) => LVL.get(wp)
const clarityOf = (wp: string) => BANK.clarity[wp]

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function GET(req: Request) {
  const bundle = new URL(req.url).searchParams.get('bundle') || ''
  if (!FREE.has(bundle)) return NextResponse.json({ error: 'not available' }, { status: 403 })
  const mine = BANK.questions.filter(q => q.bundle === bundle)
  if (!mine.length) return NextResponse.json({ error: 'unknown bundle' }, { status: 404 })

  const byBucket: Record<Bucket, BankQuestion[]> = { Easy: [], Medium: [], Hard: [] }
  for (const q of mine) byBucket[difficultyOf(q, lvlOf, clarityOf, SPELL)].push(q)
  const ordered = [...shuffle(byBucket.Easy), ...shuffle(byBucket.Medium), ...shuffle(byBucket.Hard)]

  const out = ordered.map(q => ({
    id: q.id,
    prompt: q.prompt,
    options: shuffle(q.options),   // answer position not revealed
  }))

  return NextResponse.json(out, { headers: { 'Cache-Control': 'no-store' } })
}
