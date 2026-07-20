import Link from 'next/link'

/* ─────────────────────────────────────────────────────────────────
   REDESIGN SAMPLE · DIRECTION B "SIGNAL"
   Energetic learning-app treatment. Palette tokens (--b-*) live in
   globals.css and hang off the existing `body.day` theme mechanism.
   Landing page only; the rest of the site is untouched.
   ───────────────────────────────────────────────────────────────── */

const display = { fontFamily: 'var(--b-display)' }

const STATS = [
  { n: '1,500+', l: 'medical terms' },
  { n: '600+',   l: 'word parts' },
  { n: '3',      l: 'languages' },
]

const WORDPART_LINKS = [
  { href: '/wordparts',           label: 'Glossary' },
  { href: '/wordparts/flashcard', label: 'Flashcard' },
  { href: '/wordparts/quiz',      label: 'Practice' },
  { href: '/wordparts/exam',      label: 'Exam ✦' },
]

type Deck = {
  tag: string
  title: string
  note: string
  links: { href: string; label: string }[]
  soon?: boolean
}

const LANGS: Deck[] = [
  {
    tag: 'English', title: 'English', note: '1,500+ clinical terms',
    links: [{ href: '/glossary', label: 'Glossary' }, { href: '/flashcards', label: 'Flashcard' }],
  },
  {
    tag: 'Abbreviations', title: 'Medical Abbr', note: '200+ · Abbr to Term',
    links: [{ href: '/flashcards/abbr', label: 'Flashcard' }],
  },
  {
    tag: 'Korean', title: '한국어', note: 'Bilingual · EN to KO',
    links: [{ href: '/glossary/ko', label: 'Glossary' }, { href: '/flashcards/ko', label: 'Flashcard' }],
  },
  {
    tag: 'French', title: 'Français', note: 'Bilingual · EN to FR',
    links: [], soon: true,
  },
]

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--b-bg)] px-5 pb-24 pt-16 text-[var(--b-text)]">
      <div className="mx-auto flex w-full max-w-[900px] flex-col gap-14">

        {/* ── Hero ── */}
        <header className="flex flex-col items-center gap-5 text-center">
          <span
            className="rounded-full border border-[var(--b-primary)] px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-[var(--b-primary)]"
            style={{ background: 'color-mix(in srgb, var(--b-primary) 12%, transparent)' }}
          >
            Free forever · EN / KO / FR
          </span>

          <h1
            className="m-0 max-w-[16ch] text-[clamp(2.4rem,7vw,4rem)] font-extrabold leading-[1.04] tracking-[-0.035em] text-balance"
            style={display}
          >
            Learn medicine{' '}
            <span className="text-[var(--b-primary)]">one part</span>{' '}
            at a time.
          </h1>

          <p className="m-0 max-w-[52ch] text-[1.02rem] leading-[1.65] text-[var(--b-dim)]">
            Every medical term is built from pieces you can learn once and reuse forever.
            Medi Lexi teaches the pieces, then the terms, in English, Korean, and French.
          </p>

          <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/wordparts"
              className="b-press b-glow rounded-2xl bg-[var(--b-primary)] px-6 py-3.5 text-[0.95rem] font-bold text-[var(--b-on-prim)]"
              style={display}
            >
              Start with word parts
            </Link>
            <Link
              href="/glossary"
              className="b-press rounded-2xl border border-[var(--b-border)] bg-[var(--b-panel)] px-6 py-3.5 text-[0.95rem] font-semibold text-[var(--b-text)]"
              style={display}
            >
              Browse the glossary
            </Link>
          </div>

          {/* Stat row */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {STATS.map(s => (
              <div key={s.l} className="flex flex-col items-center gap-0.5">
                <span
                  className="text-[1.75rem] font-extrabold leading-none tracking-[-0.03em] tabular-nums"
                  style={display}
                >
                  {s.n}
                </span>
                <span className="text-[0.78rem] font-medium text-[var(--b-dim)]">{s.l}</span>
              </div>
            ))}
          </div>
        </header>

        {/* ── Featured: word parts ── */}
        <section
          className="b-lift relative overflow-hidden rounded-[24px] border border-[var(--b-border)] bg-[var(--b-panel)] p-7 sm:p-9"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full opacity-[0.13]"
            style={{ background: 'var(--b-primary)', filter: 'blur(46px)' }}
          />
          <div className="relative flex flex-col gap-5">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-[0.72rem] font-bold uppercase tracking-[0.14em] text-[var(--b-primary)]">
                Start here
              </span>
              <span className="h-1 w-1 rounded-full bg-[var(--b-dim)]" aria-hidden="true" />
              <span className="text-[0.72rem] font-semibold text-[var(--b-dim)]">600+ entries</span>
            </div>

            <div className="flex flex-col gap-2">
              <h2
                className="m-0 text-[clamp(1.6rem,3.6vw,2.15rem)] font-bold leading-[1.15] tracking-[-0.028em]"
                style={display}
              >
                Prefix · Root · Suffix
              </h2>
              <p className="m-0 max-w-[54ch] text-[0.95rem] leading-[1.65] text-[var(--b-dim)]">
                Learn <strong className="font-semibold text-[var(--b-text)]">brady</strong>
                <span className="text-[var(--b-text)]">card</span>
                <strong className="font-semibold text-[var(--b-text)]">ia</strong>{' '}
                once and you can read a hundred terms you have never seen before.
                Build the vocabulary from the ground up.
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {WORDPART_LINKS.map(l => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="b-press rounded-xl border border-[var(--b-border)] bg-[var(--b-raised)] px-4 py-2.5 text-[0.85rem] font-semibold text-[var(--b-text)] hover:border-[var(--b-primary)] hover:text-[var(--b-primary)]"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── Language decks ── */}
        <section className="flex flex-col gap-4">
          <h2
            className="m-0 text-[0.78rem] font-bold uppercase tracking-[0.14em] text-[var(--b-dim)]"
          >
            Then pick a language
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {LANGS.map(d => (
              <div
                key={d.tag}
                className="b-lift flex flex-col gap-3 rounded-[20px] border border-[var(--b-border)] bg-[var(--b-panel)] p-6"
              >
                <span className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-[var(--b-dim)]">
                  {d.tag}
                </span>
                <div className="flex flex-col gap-1">
                  <span className="text-[1.35rem] font-bold leading-tight tracking-[-0.02em]" style={display}>
                    {d.title}
                  </span>
                  <span className="text-[0.83rem] text-[var(--b-dim)]">{d.note}</span>
                </div>

                <div className="mt-auto flex flex-wrap gap-2 pt-2">
                  {d.soon ? (
                    <span
                      className="rounded-xl border border-dashed border-[var(--b-border)] px-4 py-2 text-[0.82rem] font-semibold text-[var(--b-dim)]"
                      aria-disabled="true"
                    >
                      Coming soon
                    </span>
                  ) : (
                    d.links.map(l => (
                      <Link
                        key={l.href}
                        href={l.href}
                        className="b-press rounded-xl bg-[var(--b-raised)] px-4 py-2 text-[0.82rem] font-semibold text-[var(--b-text)] ring-1 ring-inset ring-[var(--b-border)] hover:ring-[var(--b-primary)] hover:text-[var(--b-primary)]"
                      >
                        {l.label}
                      </Link>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="flex flex-col items-center gap-4 border-t border-[var(--b-border)] pt-8 text-center">
          <p className="m-0 max-w-[70ch] text-[0.76rem] leading-[1.7] text-[var(--b-dim)]">
            ⚕ For educational purposes only · Not a substitute for professional medical advice,
            diagnosis, or treatment · Content is based on standard medical terminology references
            and may not reflect the latest clinical guidelines
          </p>
          <div className="flex flex-wrap justify-center gap-5">
            <Link href="/about" className="text-[0.84rem] font-semibold text-[var(--b-primary)] hover:underline">
              About &amp; Sources
            </Link>
            <Link href="/privacy" className="text-[0.84rem] font-semibold text-[var(--b-primary)] hover:underline">
              Privacy Policy
            </Link>
          </div>
          <p className="m-0 text-[0.76rem] text-[var(--b-dim)]">© 2026 Medi Lexi · All rights reserved</p>
        </footer>

      </div>
    </main>
  )
}
