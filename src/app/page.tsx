import Link from 'next/link'

/* ─────────────────────────────────────────────────────────────────
   REDESIGN SAMPLE · DIRECTION C "STUDY"
   Calm editorial treatment. Palette tokens (--c-*) live in globals.css
   and hang off the existing `body.day` theme mechanism. Structure is
   deliberately rows-and-rules rather than cards.
   Landing page only; the rest of the site is untouched.
   ───────────────────────────────────────────────────────────────── */

const STATS = [
  { n: '1,300+', l: 'Terms' },
  { n: '600+',   l: 'Word parts' },
  { n: 'EN KO FR', l: 'Languages' },
]

const WORDPART_LINKS = [
  { href: '/wordparts',           label: 'Glossary' },
  { href: '/wordparts/flashcard', label: 'Flashcard' },
  { href: '/wordparts/quiz',      label: 'Practice' },
  { href: '/wordparts/exam',      label: 'Exam' },
]

type Row = {
  title: string
  native?: string
  note: string
  links: { href: string; label: string }[]
  soon?: boolean
}

const ROWS: Row[] = [
  {
    title: 'English', note: '1,300+ clinical terms with definitions, specialties, and word-part breakdowns.',
    links: [{ href: '/glossary', label: 'Glossary' }, { href: '/flashcards', label: 'Flashcard' }],
  },
  {
    title: 'Abbreviations', note: '135+ abbreviations, studied in either direction.',
    links: [{ href: '/flashcards/abbr', label: 'Flashcard' }],
  },
  {
    title: 'Korean', native: '한국어', note: 'Bilingual glossary with Korean definitions and IME-safe search.',
    links: [{ href: '/glossary/ko', label: 'Glossary' }, { href: '/flashcards/ko', label: 'Flashcard' }],
  },
  {
    title: 'French', native: 'Français', note: 'Bilingual glossary with French definitions.',
    links: [], soon: true,
  },
]

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--c-bg)] px-6 pb-24 pt-14 text-[var(--c-text)]">
      <div className="mx-auto flex w-full max-w-[720px] flex-col">

        {/* ── Masthead ── */}
        <div className="flex items-baseline justify-between gap-4 pb-10">
          <span className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-[var(--c-dim)]">
            Medi Lexi
          </span>
          <span className="text-[0.7rem] uppercase tracking-[0.14em] text-[var(--c-dim)]">
            Free reference
          </span>
        </div>

        {/* ── Hero ── */}
        <header className="flex flex-col gap-6">
          <h1 className="cs-display m-0 text-[clamp(2.5rem,6.5vw,3.9rem)] font-semibold leading-[1.08] tracking-[-0.02em] text-balance">
            The language of medicine,{' '}
            <em className="not-italic text-[var(--c-accent)]">taken apart</em>{' '}
            and explained.
          </h1>

          <p className="m-0 max-w-[58ch] text-[1.06rem] leading-[1.72] text-[var(--c-dim)]">
            A multilingual medical glossary for students, interpreters, and translators.
            Every term carries its definition, its clinical field, and the prefix, root,
            and suffix it was built from.
          </p>

          <div className="flex flex-wrap items-center gap-x-7 gap-y-3 pt-1">
            <Link
              href="/wordparts"
              className="rounded-[4px] bg-[var(--c-accent)] px-5 py-3 text-[0.88rem] font-semibold text-[var(--c-bg)]"
            >
              Begin with word parts
            </Link>
            <Link
              href="/glossary"
              className="cs-linkline text-[0.92rem] font-medium text-[var(--c-text)]"
            >
              Or browse the full glossary
            </Link>
          </div>
        </header>

        {/* ── Figures ── */}
        <div className="mt-14 flex flex-wrap gap-x-14 gap-y-6 border-y border-[var(--c-hair)] py-7">
          {STATS.map(s => (
            <div key={s.l} className="flex flex-col gap-1">
              <span className="cs-display text-[1.6rem] font-semibold leading-none tracking-[-0.02em] tabular-nums">
                {s.n}
              </span>
              <span className="text-[0.7rem] uppercase tracking-[0.16em] text-[var(--c-dim)]">{s.l}</span>
            </div>
          ))}
        </div>

        {/* ── Featured essay block: word parts ── */}
        <section className="mt-14 flex flex-col gap-5">
          <span className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-[var(--c-ochre)]">
            Where to start
          </span>

          <h2 className="cs-display m-0 text-[1.95rem] font-semibold leading-[1.2] tracking-[-0.018em]">
            Prefix, root, suffix
          </h2>

          <p className="m-0 max-w-[62ch] text-[0.98rem] leading-[1.72] text-[var(--c-dim)]">
            Medical vocabulary is not a list to be memorised. It is a system. Learn that{' '}
            <span className="text-[var(--c-text)]">brady</span> means slow,{' '}
            <span className="text-[var(--c-text)]">cardi</span> means heart, and{' '}
            <span className="text-[var(--c-text)]">ia</span> marks a condition, and{' '}
            <span className="cs-display italic text-[var(--c-text)]">bradycardia</span>{' '}
            reads itself. Six hundred parts unlock many thousands of terms.
          </p>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-1">
            {WORDPART_LINKS.map(l => (
              <Link
                key={l.href}
                href={l.href}
                className="cs-linkline text-[0.88rem] font-medium text-[var(--c-text)]"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </section>

        {/* ── Language rows ── */}
        <section className="mt-16 flex flex-col">
          <h2 className="m-0 pb-2 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-[var(--c-dim)]">
            The collections
          </h2>

          <ul className="m-0 flex list-none flex-col p-0">
            {ROWS.map(r => (
              <li
                key={r.title}
                className="cs-row cs-hairline flex flex-col gap-2 py-6 sm:flex-row sm:items-baseline sm:gap-8"
              >
                <div className="flex shrink-0 items-baseline gap-2.5 sm:w-[9.5rem]">
                  <span className="cs-display text-[1.22rem] font-semibold tracking-[-0.015em]">
                    {r.title}
                  </span>
                  {r.native && (
                    <span className="text-[0.85rem] text-[var(--c-dim)]">{r.native}</span>
                  )}
                </div>

                <p className="m-0 flex-1 text-[0.9rem] leading-[1.65] text-[var(--c-dim)]">
                  {r.note}
                </p>

                <div className="flex shrink-0 flex-wrap items-center gap-x-5 gap-y-1">
                  {r.soon ? (
                    <span className="text-[0.82rem] italic text-[var(--c-dim)]" aria-disabled="true">
                      Coming soon
                    </span>
                  ) : (
                    r.links.map(l => (
                      <Link
                        key={l.href}
                        href={l.href}
                        className="cs-linkline text-[0.85rem] font-medium text-[var(--c-text)]"
                      >
                        {l.label}
                      </Link>
                    ))
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* ── Footer ── */}
        <footer className="cs-hairline mt-16 flex flex-col gap-4 pt-8">
          <p className="m-0 max-w-[74ch] text-[0.76rem] leading-[1.75] text-[var(--c-dim)]">
            ⚕ For educational purposes only · Not a substitute for professional medical advice,
            diagnosis, or treatment · Content is based on standard medical terminology references
            and may not reflect the latest clinical guidelines
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <Link href="/about" className="cs-linkline text-[0.82rem] text-[var(--c-text)]">
              About &amp; Sources
            </Link>
            <Link href="/privacy" className="cs-linkline text-[0.82rem] text-[var(--c-text)]">
              Privacy Policy
            </Link>
            <span className="ml-auto text-[0.76rem] text-[var(--c-dim)]">
              © 2026 Medi Lexi
            </span>
          </div>
        </footer>

      </div>
    </main>
  )
}
