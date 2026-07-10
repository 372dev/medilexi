import type { Metadata } from 'next'
import Link from 'next/link'
import { slugify } from '@/lib/slug'
import vocabData from '@/data/medical_vocab.json'

const BASE_URL = 'https://medilexi.vercel.app'

type Vocab = { en_h: string; abbr?: string }
const VOCAB = vocabData as unknown as Vocab[]

export const metadata: Metadata = {
  title: 'All Medical Terms A–Z — Medi Lexi',
  description:
    'Browse every term in the Medi Lexi medical glossary, A to Z — 1,345 English medical terms with Korean and French translations, definitions, and word-part breakdowns.',
  alternates: { canonical: `${BASE_URL}/terms` },
  openGraph: {
    type: 'website',
    siteName: 'Medi Lexi',
    title: 'All Medical Terms A–Z — Medi Lexi',
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
        <h1 className="text-3xl font-semibold" style={{ color: 'var(--color-gold)' }}>
          All medical terms
        </h1>
        <p className="mt-2" style={{ color: 'var(--color-text-dim)' }}>
          Every term in the glossary — {VOCAB.length.toLocaleString()} entries, each with English,
          Korean, and French. Or{' '}
          <Link href="/glossary" style={{ color: 'var(--color-accent)' }}>
            search the glossary
          </Link>
          .
        </p>
      </header>

      {/* Jump nav */}
      <nav
        className="mb-8 flex flex-wrap gap-x-3 gap-y-1 border-y py-3 text-sm"
        style={{ borderColor: 'var(--color-border)' }}
        aria-label="Jump to letter"
      >
        {groups.map((g) => (
          <a key={g.letter} href={`#letter-${g.letter}`} style={{ color: 'var(--color-accent)' }}>
            {g.letter}
          </a>
        ))}
      </nav>

      {groups.map((g) => (
        <section key={g.letter} id={`letter-${g.letter}`} className="mb-8 scroll-mt-4">
          <h2 className="mb-3 text-2xl font-bold" style={{ color: 'var(--color-gold-dim)' }}>
            {g.letter}
          </h2>
          <ul className="grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
            {g.items.map((t) => (
              <li key={t.en_h}>
                <Link href={`/term/${slugify(t.en_h)}`} style={{ color: 'var(--color-text)' }}>
                  {t.en_h}
                  {t.abbr ? (
                    <span style={{ color: 'var(--color-text-dim)' }}> ({t.abbr})</span>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  )
}
