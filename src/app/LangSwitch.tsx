'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

/* Header language switch. Keeps the reader in place: from a glossary or flashcard
   view it jumps to the same view in the chosen language (the EN/KO/FR routes are
   parallel); from anywhere else it lands on that language's glossary. Spanish is
   shown as coming soon. */

type Lang = 'en' | 'ko' | 'fr'
const LANGS: { code: Lang; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'ko', label: '한국어' },
  { code: 'fr', label: 'Français' },
]

function currentLang(pathname: string): Lang {
  if (/\/(glossary|flashcards)\/ko(\/|$)/.test(pathname)) return 'ko'
  if (/\/(glossary|flashcards)\/fr(\/|$)/.test(pathname)) return 'fr'
  return 'en'
}

function routeFor(pathname: string, lang: Lang): string {
  const s = lang === 'en' ? '' : `/${lang}`
  if (/^\/medical\/glossary(\/(ko|fr))?$/.test(pathname)) return `/medical/glossary${s}`
  if (/^\/medical\/flashcards(\/(ko|fr))?$/.test(pathname)) return `/medical/flashcards${s}`
  return `/medical/glossary${s}`
}

export default function LangSwitch() {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const cur = currentLang(pathname)

  useEffect(() => { setOpen(false) }, [pathname])
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
        className="b-press b-focus inline-flex items-center justify-center rounded-full border border-[var(--b-border)] bg-[var(--b-panel)] px-3 py-2 text-[0.78rem] font-bold uppercase text-[var(--b-dim)] hover:text-[var(--b-primary)]"
      >
        {cur}
      </button>
      {open && (
        <div className="b-lift absolute right-0 top-[calc(100%+8px)] z-[110] min-w-[150px] overflow-hidden rounded-xl border border-[var(--b-border)] bg-[var(--b-panel)] py-1" role="menu">
          {LANGS.map(l => (
            <button
              key={l.code}
              type="button"
              role="menuitem"
              onClick={() => { setOpen(false); router.push(routeFor(pathname, l.code)) }}
              className={`block w-full px-4 py-2 text-left text-[0.86rem] font-medium hover:bg-[var(--b-raised)] ${cur === l.code ? 'text-[var(--b-primary)]' : 'text-[var(--b-text)]'}`}
            >
              {l.label}
            </button>
          ))}
          <span className="block px-4 py-2 text-[0.86rem] font-medium text-[var(--b-dim)]">
            Español <span className="text-[0.72rem]">· soon</span>
          </span>
        </div>
      )}
    </div>
  )
}
