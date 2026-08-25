'use client'

import { useEffect, useState } from 'react'

/* Landing-hero showcase term. Echocardiogram: prefix + root + suffix, an
   abbreviation used identically in Korean and French, and a distinct patient
   form in both languages so the register pair holds up when it alternates.
   The connecting vowel "o" stays uncolored, exactly as the glossary renders it. */

const display = { fontFamily: 'var(--b-display)' }

const PARTS: { t: 'p' | 'r' | 's' | null; text: string; tip?: string }[] = [
  { t: 'p', text: 'Echo', tip: 'echo- · reflected sound' },
  { t: 'r', text: 'cardi', tip: 'cardi/o · heart' },
  { t: null, text: 'o' },
  { t: 's', text: 'gram', tip: '-gram · record, image' },
]

// Abbreviation (Echo) is the same in both languages, so only the clinical and
// patient forms alternate.
const LANGS = [
  { tag: '한국어', lang: 'ko', clinical: '심장 초음파 검사', patient: '심장 초음파' },
  { tag: 'Français', lang: 'fr', clinical: 'Échocardiogramme', patient: 'Écho cardiaque' },
]

const CARD = 'min-w-[132px] rounded-2xl px-5 py-3.5 text-left'
const LBL = 'mb-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.09em]'
const VAL = 'text-[clamp(1.2rem,3vw,1.5rem)] font-medium leading-tight'

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

  const s = LANGS[idx]
  const fade = `b-altfade${out ? ' is-out' : ''}`

  return (
    <div className="mt-9 flex flex-col items-center justify-center gap-6 sm:flex-row sm:gap-7">
      {/* headword with per-part tooltips */}
      <div
        className="text-[clamp(1.9rem,5vw,3rem)] font-semibold leading-none tracking-[-0.02em]"
        style={display}
      >
        {PARTS.map((p, i) =>
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
        <span
          className={`${fade} inline-flex items-center gap-1.5 text-[0.66rem] font-bold uppercase tracking-[0.14em] text-[var(--b-primary)]`}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: 0.8 }}>
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" />
          </svg>
          {s.tag}
        </span>

        <div className="flex flex-wrap justify-center gap-3">
          <div className={`${CARD} border border-[var(--b-border)] bg-[var(--b-panel)]`}>
            <div className={`${LBL} text-[var(--b-dim)]`}>Clinical term</div>
            <div className={`${fade} ${VAL}`} lang={s.lang}>
              {s.clinical}
            </div>
          </div>

          <div className={`${CARD} border border-dashed border-[var(--b-border)] bg-[var(--b-panel)]`}>
            <div className={`${LBL} text-[var(--b-dim)]`}>On the chart</div>
            <div className="text-[clamp(1.2rem,3vw,1.5rem)] font-bold leading-tight tracking-[0.06em]">Echo</div>
          </div>

          <div
            className={`${CARD} border`}
            style={{ borderColor: 'var(--b-primary)', background: 'color-mix(in srgb, var(--b-primary) 8%, var(--b-panel))' }}
          >
            <div className={`${LBL} text-[var(--b-primary)]`}>The patient says</div>
            <div className={`${fade} ${VAL}`} lang={s.lang}>
              {s.patient}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
