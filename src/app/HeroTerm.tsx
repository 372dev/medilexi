'use client'

/* Bridge hero example: one term shown across three languages at once.
   The headword's morphemes carry hover tooltips (reusing .b-htip / .b-part--*);
   the three cards show the everyday word people actually use, with the clinical
   term beneath. Static by design, so there is no layout shift. */

const display = { fontFamily: 'var(--b-display)' }

type Part = { t: 'p' | 'r' | 's' | null; text: string; tip?: string }

const PARTS: Part[] = [
  { t: 'p', text: 'Intra', tip: 'intra- · within, into' },
  { t: 'r', text: 'ven', tip: 'ven/o · vein' },
  { t: 's', text: 'ous', tip: '-ous · pertaining to' },
]

const CARDS = [
  { lang: 'English', word: 'a drip', gloss: 'the IV line' },
  { lang: '한국어', word: '링거', gloss: '정맥 주사' },
  { lang: 'Français', word: 'perfusion', gloss: 'intraveineuse' },
]

export default function HeroTerm() {
  return (
    <div className="flex w-full max-w-[640px] flex-col items-center gap-7 text-center">
      {/* hint + headword: the hint sits directly above the term */}
      <div className="flex flex-col items-center gap-3">
        <p className="inline-flex items-center gap-1.5 text-[0.8rem] text-[var(--b-dim)]">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4M12 8h.01" />
          </svg>
          Hover any part of the word to see what it means.
        </p>

        <div className="flex flex-wrap items-baseline justify-center gap-x-3.5 gap-y-2">
          <h2
            className="m-0 text-[clamp(2.4rem,8vw,3.6rem)] font-bold leading-none tracking-[-0.02em]"
            style={display}
          >
            {PARTS.map((p, i) =>
              p.t
                ? <span key={i} className={`b-htip b-part--${p.t}`} data-tip={p.tip}>{p.text}</span>
                : <span key={i}>{p.text}</span>
            )}
          </h2>
          <span
            className="rounded-full px-4 py-1.5 text-[1.25rem] font-bold leading-none text-[var(--b-primary)]"
            style={{ background: 'color-mix(in srgb, var(--b-primary) 15%, transparent)' }}
          >
            IV
          </span>
        </div>
      </div>

      {/* what people actually say */}
      <div className="flex w-full flex-col gap-3">
        <span className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-[var(--b-dim)]">
          What people actually say
        </span>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {CARDS.map(c => (
            <div
              key={c.lang}
              className="b-lift flex flex-col gap-1 rounded-2xl border border-[var(--b-border)] bg-[var(--b-panel)] p-4 text-left"
            >
              <span className="text-[0.7rem] font-semibold uppercase tracking-[0.07em] text-[var(--b-primary)]">
                {c.lang}
              </span>
              <span className="text-[1.3rem] font-semibold leading-tight tracking-[-0.01em] text-[var(--b-text)]">
                {c.word}
              </span>
              <span className="text-[0.85rem] text-[var(--b-dim)]">{c.gloss}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
