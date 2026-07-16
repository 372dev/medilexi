// Difficulty for a curated quiz-bank question. Difficulty is COMPUTED, never stored
// (an optional `diff_override` on a question wins). This mirrors scripts/validate_quiz.ps1 —
// if the formula changes there, change it here too.
//
//   score = STYLE + STAR + CLARITY + DIST
//   Easy <= 2  ·  Medium 3-4  ·  Hard >= 5

export type QuizStyle = 'meaning' | 'which_part' | 'term' | 'synonym'
export type Dist = 'far' | 'near' | 'confusable'
export type Clarity = 'clear' | 'neutral' | 'opaque'
export type Bucket = 'Easy' | 'Medium' | 'Hard'

export interface BankQuestion {
  id: string
  exam: string
  bundle: string | null
  wp: string
  style: QuizStyle
  dist: Dist
  diff_override?: Bucket
  prompt: string
  options: string[]
  answer: number
  explain: string
}

export interface BankBundle {
  id: string
  title: string
  order: number
  free: boolean
}

const STYLE_PTS: Record<QuizStyle, number> = { meaning: 0, which_part: 1, term: 1, synonym: 2 }
const STAR_PTS: Record<number, number> = { 3: 0, 2: 1, 1: 2 }
const CLARITY_PTS: Record<Clarity, number> = { clear: -1, neutral: 0, opaque: 1 }
const DIST_PTS: Record<Dist, number> = { far: 0, near: 1, confusable: 2 }

/** Split a combined wp ("pulm/o, pulmon/o") into its individual spellings. */
export function forms(wp: string): string[] {
  return wp.split(/,\s*/)
}

/** Build a spelling → canonical-wp lookup, so "pulm/o" resolves to "pulm/o, pulmon/o". */
export function buildSpellIndex(parts: { wp: string }[]): Map<string, string> {
  const m = new Map<string, string>()
  for (const p of parts) {
    m.set(p.wp, p.wp)
    for (const f of forms(p.wp)) m.set(f, p.wp)
  }
  return m
}

export function bucketOf(score: number): Bucket {
  if (score <= 2) return 'Easy'
  if (score <= 4) return 'Medium'
  return 'Hard'
}

/**
 * For `synonym`, CLARITY is read from the ANSWER doublet, not the prompt's wp —
 * the learner has to recognise the answer, so that is the end being measured.
 */
export function difficultyOf(
  q: BankQuestion,
  lvlOf: (wp: string) => number | undefined,
  clarityOf: (wp: string) => Clarity | undefined,
  spell: Map<string, string>,
): Bucket {
  if (q.diff_override) return q.diff_override

  const star = STAR_PTS[lvlOf(q.wp) ?? 3] ?? 0

  let clarityKey = q.wp
  if (q.style === 'synonym') {
    const ansWp = spell.get(q.options[q.answer])
    if (ansWp) clarityKey = ansWp
  }
  const clarity = CLARITY_PTS[clarityOf(clarityKey) ?? 'neutral'] ?? 0

  return bucketOf(STYLE_PTS[q.style] + star + clarity + DIST_PTS[q.dist])
}
