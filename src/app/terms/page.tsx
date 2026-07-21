import type { Metadata } from 'next'
import Link from 'next/link'
import { slugify } from '@/lib/slug'
import vocabData from '@/data/medical_vocab.json'

const BASE_URL = 'https://medilexi.vercel.app'

type Vocab = { en_h: string; abbr?: string }
const VOCAB = vocabData as unknown as Vocab[]

export const metadata: Metadata = {
  title: 'All Medical Terms A–Z · Medi Lexi',
  description:
    'Browse every term in the Medi Lexi medical glossary, A to Z. 1,500+ English medical terms with Korean and French translations, definitions, and word-part breakdowns.',
  alternates: { canonical: `${BASE_URL}/terms` },
  openGraph: {
    type: 'website',
    siteName: 'Medi Lexi',
    title: 'All Medical Terms A–Z · Medi Lexi',
    description: 'Browse every term in the Medi Lexi medical glossary, A to Z.',
    url: `${BASE_URL}/terms`,
  },
}

/** Group terms by uppercase first letter; anything non-alphabetic falls under '#'. */
function groupByLetter(terms: Vocab[]): { letter: string; items: Vocab[] }[] {
  const sorted = [...terms].sort((a, b) => a.en_h.localeCompare(b.en_h, 'en'))
  const groups = new Map<string, Vocab[]>()
  for (const t of sorted) {
    const c = t.en_h[0]?.toUpperCase() ?? '#'
    const letter = c >= 'A' && c <= 'Z' ? c : '#'
    const bucket = groups.get(letter)
    if (bucket) bucket.push(t)
    else groups.set(letter, [t])
  }
  return Array.from(groups.entries())
    .sort(([a], [b]) => (a === '#' ? 1 : b === '#' ? -1 : a.localeCompare(b)))
    .map(([letter, items]) => ({ letter, items }))
}

export default function TermsIndexPage() {
  const groups = groupByLetter(VOCAB)

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10">
      <header className="mb-6">
        <h1
          className="text-3xl"
          style={{ fontFamily: 'var(--b-display)', fontWeight: 600, color: 'var(--b-text)', lineHeight: 1.25 }}
        >
          All medical terms
        </h1>
        <p className="mt-2" style={{ color: 'var(--b-dim)' }}>
          Every term in the glossary. {VOCAB.length.toLocaleString()} entries, each with English,
          Korean, and French. Or{' '}
          <Link href="/glossary" className="b-link">
            search the glossary
          </Link>
          .
        </p>
      </header>

      {/* Jump nav — sticky, so the letters stay reachable down a 1,500-row page */}
      <nav className="b-jump mb-8 py-2.5" aria-label="Jump to letter">
        <div className="b-scroll-x gap-1.5">
          {groups.map((g) => (
            <a key={g.letter} href={`#letter-${g.letter}`} className="b-fpill b-focus">
              {g.letter}
            </a>
          ))}
        </div>
      </nav>

      {groups.map((g) => (
        <section key={g.letter} id={`letter-${g.letter}`} className="mb-8 scroll-mt-28">
          <h2
            className="mb-3 text-2xl"
            style={{ fontFamily: 'var(--b-display)', fontWeight: 600, color: 'var(--b-primary)' }}
          >
            {g.letter}
          </h2>
          <ul className="grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
            {g.items.map((t) => (
              <li key={t.en_h}>
                <Link href={`/term/${slugify(t.en_h)}`} className="b-tlink b-focus">
                  {t.en_h}
                  {t.abbr ? <span style={{ color: 'var(--b-dim)' }}> ({t.abbr})</span> : null}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  )
}
