'use client'

import { useEffect, useState } from 'react'

/* Landing-hero showcase. The example alternates between two terms, each chosen
   to show the strongest register contrast in its own language:
     Korean  -> Intravenous   (정맥 주사, and the everyday word 링거)
     French  -> Echocardiogram (Échocardiogramme, and Écho cardiaque)
   Every part, abbreviation, and pair is real glossary data. The whole example
   crossfades on switch, so the change in headword width is never seen. */

const display = { fontFamily: 'var(--b-display)' }

type Part = { t: 'p' | 'r' | 's' | null; text: string; tip?: string }
type State = { tag: string; lang: string; parts: Part[]; abbr: string; clinical: string; patient: string }

const STATES: State[] = [
  {
    tag: '한국어',
    lang: 'ko',
    parts: [
      { t: 'p', text: 'Intra', tip: 'intra- · within, into' },
      { t: 'r', text: 'ven', tip: 'ven/o · vein' },
      { t: 's', text: 'ous', tip: '-ous · pertaining to' },
    ],
    abbr: 'IV',
    clinical: '정맥 주사',
    patient: '링거',
  },
  {
    tag: 'Français',
    lang: 'fr',
    parts: [
      { t: 'p', text: 'Echo', tip: 'echo- · reflected sound' },
      { t: 'r', text: 'cardi', tip: 'cardi/o · heart' },
      { t: null, text: 'o' },
      { t: 's', text: 'gram', tip: '-gram · record, image' },
    ],
    abbr: 'Echo',
    clinical: 'Échocardiogramme',
    patient: 'Écho cardiaque',
  },
]

/* Fixed card width + a value area that always reserves two lines, so the two
   terms (short Korean vs the longer French "Échocardiogramme") produce cards of
   identical size. That keeps the wrap count and total height constant, so the
   page never shifts when the example alternates. */
const CARD = 'w-[188px] rounded-2xl px-4 py-3.5 text-left'
const LBL = 'mb-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.09em]'
const VAL = 'flex min-h-[2.6em] items-center text-[clamp(1.15rem,2.8vw,1.45rem)] font-medium leading-tight [overflow-wrap:anywhere]'

export default function HeroTerm() {
  const [idx, setIdx] = useState(0)
  const [out, setOut] = useState(false)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let swap: ReturnType<typeof setTimeout> | undefined
    const tick = setInterval(() => {
      if (reduce) {
        setIdx((v) => 1 - v)
        return
      }
      setOut(true)
      swap = setTimeout(() => {
        setIdx((v) => 1 - v)
        setOut(false)
      }, 230)
    }, 4200)
    return () => {
      clearInterval(tick)
      if (swap) clearTimeout(swap)
    }
  }, [])

  const s = STATES[idx]

  return (
    <div
      className={`b-altfade${out ? ' is-out' : ''} flex flex-col items-center justify-center gap-6 sm:flex-row sm:gap-7`}
    >
      {/* headword with per-part tooltips */}
      <div
        className="text-[clamp(1.9rem,5vw,3rem)] font-semibold leading-none tracking-[-0.02em]"
        style={display}
      >
        {s.parts.map((p, i) =>
          p.t ? (
            <span key={i} tabIndex={0} data-tip={p.tip} className={`b-htip b-part--${p.t}`}>
              {p.text}
            </span>
          ) : (
            <span key={i}>{p.text}</span>
          ),
        )}
      </div>

      {/* arrow (rotates to point down when the row stacks) */}
      <div aria-hidden="true" className="shrink-0 rotate-90 text-[var(--b-primary)] sm:rotate-0">
        <svg width="56" height="22" viewBox="0 0 56 22" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M2 11h48m0 0-8-8m8 8-8 8" />
        </svg>
      </div>

      {/* alternating language group */}
      <div className="flex flex-col items-center gap-2.5">
        <span className="inline-flex items-center gap-1.5 text-[0.66rem] font-bold uppercase tracking-[0.14em] text-[var(--b-primary)]">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: 0.8 }}>
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" />
          </svg>
          {s.tag}
        </span>

        <div className="flex flex-wrap justify-center gap-3">
          <div className={`${CARD} border border-[var(--b-border)] bg-[var(--b-panel)]`}>
            <div className={`${LBL} text-[var(--b-dim)]`}>Clinical term</div>
            <div className={VAL} lang={s.lang}>
              {s.clinical}
            </div>
          </div>

          <div className={`${CARD} border border-dashed border-[var(--b-border)] bg-[var(--b-panel)]`}>
            <div className={`${LBL} text-[var(--b-dim)]`}>On the chart</div>
            <div className="flex min-h-[2.6em] items-center text-[clamp(1.15rem,2.8vw,1.45rem)] font-bold leading-tight tracking-[0.06em]">{s.abbr}</div>
          </div>

          <div
            className={`${CARD} border`}
            style={{ borderColor: 'var(--b-primary)', background: 'color-mix(in srgb, var(--b-primary) 8%, var(--b-panel))' }}
          >
            <div className={`${LBL} text-[var(--b-primary)]`}>The patient says</div>
            <div className={VAL} lang={s.lang}>
              {s.patient}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
