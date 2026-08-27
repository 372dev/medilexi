import Link from 'next/link'
import HeroTerm from './HeroTerm'
import HeroCTA from './HeroCTA'

/* ─────────────────────────────────────────────────────────────────
   REDESIGN SAMPLE · DIRECTION B "SIGNAL"
   Energetic learning-app treatment. Palette tokens (--b-*) live in
   globals.css and hang off the existing `body.day` theme mechanism.
   Landing page only; the rest of the site is untouched.
   ───────────────────────────────────────────────────────────────── */

const display = { fontFamily: 'var(--b-display)' }

const WORDPART_LINKS = [
  { href: '/wordparts',           label: 'Glossary' },
  { href: '/wordparts/flashcard', label: 'Flashcard' },
  { href: '/wordparts/quiz',      label: 'Practice' },
  { href: '/wordparts/exam',      label: 'Exam ✦' },
]

type Sample = { lead: string; term: string; gloss: string }
type Deck = {
  tag: string
  title: string
  note: string
  links: { href: string; label: string }[]
  soon?: boolean
  sample?: Sample
}

const LANGS: Deck[] = [
  {
    tag: 'English', title: 'English', note: '1,900+ clinical terms',
    links: [{ href: '/glossary', label: 'Glossary' }, { href: '/flashcards', label: 'Flashcard' }],
    sample: { lead: 'For example', term: 'Hypertension', gloss: 'high blood pressure' },
  },
  {
    tag: 'Abbreviations', title: 'Medical Abbr', note: '200+ · Abbr to Term',
    links: [{ href: '/flashcards/abbr', label: 'Flashcard' }],
    sample: { lead: 'For example', term: 'COPD', gloss: 'Chronic obstructive pulmonary disease' },
  },
  {
    tag: '한국어', title: 'Korean ↔ English', note: 'Bilingual glossary + flashcards',
    links: [{ href: '/glossary/ko', label: 'Glossary' }, { href: '/flashcards/ko', label: 'Flashcard' }],
    sample: { lead: 'For example', term: '당뇨병', gloss: 'Diabetes' },
  },
  {
    tag: 'Français', title: 'French ↔ English', note: 'Bilingual glossary + flashcards',
    links: [{ href: '/glossary/fr', label: 'Glossary' }, { href: '/flashcards/fr', label: 'Flashcard' }],
    sample: { lead: 'For example', term: 'Grippe', gloss: 'Flu' },
  },
  {
    tag: 'Español', title: 'Spanish ↔ English', note: 'Coming soon',
    links: [], soon: true,
    sample: { lead: 'Will include', term: 'Cefalea', gloss: 'Headache' },
  },
]

/* Feature the English deck as a full-width card only when the remaining decks
   tile cleanly into the 2-column grid (an odd total leaves an even remainder).
   Add another deck and English drops back to a normal card automatically. */
const featureEnglish = LANGS.length % 2 === 1

function DeckActions({ d }: { d: Deck }) {
  if (d.soon) {
    return (
      <span
        className="rounded-xl border border-dashed border-[var(--b-border)] px-4 py-2 text-[0.82rem] font-semibold text-[var(--b-dim)]"
        aria-disabled="true"
      >
        Coming soon
      </span>
    )
  }
  return (
    <>
      {d.links.map(l => (
        <Link
          key={l.href}
          href={l.href}
          className="b-press rounded-xl bg-[var(--b-raised)] px-4 py-2 text-[0.82rem] font-semibold text-[var(--b-text)] ring-1 ring-inset ring-[var(--b-border)] hover:ring-[var(--b-primary)] hover:text-[var(--b-primary)]"
        >
          {l.label}
        </Link>
      ))}
    </>
  )
}

function DeckSample({ s, divider = true }: { s: Sample; divider?: boolean }) {
  return (
    <div className={divider ? 'border-t border-[var(--b-border)] pt-3' : 'mt-1.5'}>
      <span className="mb-1.5 block text-[0.66rem] font-semibold uppercase tracking-[0.08em] text-[var(--b-dim)]">
        {s.lead}
      </span>
      <span className="text-[0.85rem] text-[var(--b-dim)]">
        <b className="font-semibold text-[var(--b-text)]">{s.term}</b> · {s.gloss}
      </span>
    </div>
  )
}

function DeckCard({ d, featured = false }: { d: Deck; featured?: boolean }) {
  if (featured) {
    return (
      <div className="b-lift flex w-full flex-col gap-4 rounded-[20px] border border-[var(--b-border)] bg-[var(--b-panel)] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
        <div className="flex flex-col gap-1">
          <span className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-[var(--b-primary)]">
            {d.tag} · most complete
          </span>
          <span className="text-[1.6rem] font-semibold leading-tight tracking-[-0.01em]" style={display}>
            {d.title}
          </span>
          <span className="text-[0.85rem] text-[var(--b-dim)]">{d.note}</span>
          {d.sample && <DeckSample s={d.sample} divider={false} />}
        </div>
        <div className="flex flex-wrap gap-2">
          <DeckActions d={d} />
        </div>
      </div>
    )
  }
  return (
    <div className="b-lift flex flex-col gap-3 rounded-[20px] border border-[var(--b-border)] bg-[var(--b-panel)] p-6">
      <span className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-[var(--b-dim)]">{d.tag}</span>
      <div className="flex flex-col gap-1">
        <span className="text-[1.38rem] font-semibold leading-tight tracking-[-0.008em]" style={display}>
          {d.title}
        </span>
        <span className="text-[0.83rem] text-[var(--b-dim)]">{d.note}</span>
      </div>
      {d.sample && <DeckSample s={d.sample} />}
      <div className="mt-auto flex flex-wrap gap-2 pt-2">
        <DeckActions d={d} />
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--b-bg)] px-5 pb-24 pt-16 text-[var(--b-text)]">
      <div className="mx-auto flex w-full max-w-[900px] flex-col gap-14">

        {/* ── Hero ── */}
        <header className="flex flex-col items-center gap-5 text-center">
          <span className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--b-primary)]">
            For students, interpreters &amp; translators
          </span>

          <h1
            className="m-0 max-w-[20ch] text-[clamp(2rem,5.2vw,3.2rem)] font-bold leading-[1.04] tracking-[-0.025em] text-balance"
            style={display}
          >
            The chart says one thing. The patient says another.
          </h1>

          <p className="m-0 max-w-[52ch] text-[1.02rem] leading-[1.6] text-[var(--b-dim)] text-pretty">
            Medi Lexi gives you both: the clinical term, its abbreviation, and the
            everyday word people actually use, across languages.
          </p>

          <div className="mt-4 flex w-full justify-center">
            <HeroTerm />
          </div>

          <div className="mt-4">
            <HeroCTA />
          </div>
        </header>

        {/* ── Featured: word parts ── */}
        <section
          id="word-parts"
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
                className="m-0 text-[clamp(1.6rem,3.6vw,2.2rem)] font-semibold leading-[1.2] tracking-[-0.01em]"
                style={display}
              >
                Prefix · Root · Suffix
              </h2>
              <p className="m-0 max-w-[54ch] text-[0.95rem] leading-[1.65] text-[var(--b-dim)]">
                See that <strong className="b-part--p font-semibold">brady</strong> means slow,{' '}
                <strong className="b-part--r font-semibold">card</strong> heart, and{' '}
                <strong className="b-part--s font-semibold">-ia</strong> a condition, and the next
                unfamiliar term is already half-decoded. Learn the parts instead of memorizing every word.
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

          {featureEnglish && <DeckCard d={LANGS[0]} featured />}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {(featureEnglish ? LANGS.slice(1) : LANGS).map(d => (
              <DeckCard key={d.tag} d={d} />
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
