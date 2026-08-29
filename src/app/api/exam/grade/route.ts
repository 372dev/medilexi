import { NextResponse } from 'next/server'
import quizData from '@/data/medical_wordparts_quiz.json'
import { type BankQuestion } from '@/lib/quiz-difficulty'

/* Grade a submitted exam server-side. The client sends the selected option TEXT
   per question (it never had the answer key); we compare against the correct
   option and return score + per-question correctness, the correct text, and the
   explanation for review. This keeps the answer key off the client. */

const BANK = quizData as unknown as { questions: BankQuestion[]; bundles: { id: string; free: boolean }[] }
// Only grade free-bundle questions for now (mirrors /api/exam). Grading a known
// paid question id would otherwise leak its answer. Accounts will gate the rest.
const FREE = new Set(BANK.bundles.filter(b => b.free).map(b => b.id))
const byId = new Map<string, BankQuestion>()
for (const q of BANK.questions) if (q.bundle && FREE.has(q.bundle)) byId.set(q.id, q)

interface Answer { id: string; selected: string | null }

export async function POST(req: Request) {
  let body: { answers?: Answer[] }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'bad request' }, { status: 400 }) }
  const answers = Array.isArray(body.answers) ? body.answers.slice(0, 100) : []

  let score = 0
  const results: Record<string, { correct: boolean; correctText: string; explain: string }> = {}
  for (const a of answers) {
    const q = byId.get(a.id)
    if (!q) continue
    const correctText = q.options[q.answer]
    const correct = a.selected === correctText
    if (correct) score++
    results[q.id] = { correct, correctText, explain: q.explain }
  }

  return NextResponse.json({ score, total: answers.length, results }, { headers: { 'Cache-Control': 'no-store' } })
}
