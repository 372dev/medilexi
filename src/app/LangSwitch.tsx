'use client'

import { useState, useRef, useEffect } from 'react'
import { useLocale, LOCALES } from '@/lib/i18n'

/* Header language switch. Changes the interface language IN PLACE — nav, buttons,
   filters and other chrome re-render in the chosen language while the reader stays
   on the same page. It does NOT navigate. Languages ship one at a time (Korean
   first); the rest show as coming soon. */

const SOON = [
  { label: 'Français' },
  { label: 'Español' },
]

export default function LangSwitch() {
  const { locale, setLocale } = useLocale()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const cur = LOCALES.find(l => l.code === locale) ?? LOCALES[0]

  useEffect(() => {
    if (!open) return
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Change language"
        title="Language"
        className="b-press b-focus inline-flex h-[38px] w-[38px] items-center justify-center rounded-full border border-[var(--b-border)] bg-[var(--b-panel)] text-[0.78rem] font-bold text-[var(--b-dim)] hover:text-[var(--b-primary)]"
      >
        {cur.short}
      </button>
      {open && (
        <div className="b-lift absolute right-0 top-[calc(100%+8px)] z-[110] min-w-[150px] overflow-hidden rounded-xl border border-[var(--b-border)] bg-[var(--b-panel)] py-1" role="menu">
          {LOCALES.map(l => (
            <button
              key={l.code}
              type="button"
              role="menuitem"
              onClick={() => { setOpen(false); setLocale(l.code) }}
              className={`block w-full px-4 py-2 text-left text-[0.86rem] font-medium hover:bg-[var(--b-raised)] ${locale === l.code ? 'text-[var(--b-primary)]' : 'text-[var(--b-text)]'}`}
            >
              {l.label}
            </button>
          ))}
          {SOON.map(s => (
            <span key={s.label} className="block px-4 py-2 text-[0.86rem] font-medium text-[var(--b-dim)]">
              {s.label} <span className="text-[0.72rem]">· soon</span>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
