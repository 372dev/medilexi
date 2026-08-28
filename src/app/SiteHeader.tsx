'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

/* Shared top nav. Two variants:
   - "sticky": always visible at the top of interior pages (position: sticky).
   - "reveal": for the landing. Hidden at the top of the page, slides in once
     the parent says it is scrolled (the `shown` prop); position: fixed so it
     takes no layout space while hidden and the hero starts flush at the top.
   Height is dominated by the toggle button (unchanged), so the 57px sticky
   sub-bars on the glossary / terms pages stay aligned. */

const display = { fontFamily: 'var(--b-display)' }

const GLOSSARIES = [
  { label: 'English', href: '/glossary' },
  { label: '한국어', href: '/glossary/ko' },
  { label: 'Français', href: '/glossary/fr' },
]

type Props = {
  toggle: React.ReactNode
  variant?: 'sticky' | 'reveal'
  shown?: boolean
}

export default function SiteHeader({ toggle, variant = 'sticky', shown = true }: Props) {
  const pathname = usePathname()
  const [glossOpen, setGlossOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const glossRef = useRef<HTMLDivElement>(null)

  // Close everything on navigation.
  useEffect(() => { setGlossOpen(false); setMenuOpen(false) }, [pathname])

  // Click outside closes the glossary dropdown.
  useEffect(() => {
    if (!glossOpen) return
    function onDown(e: MouseEvent) {
      if (glossRef.current && !glossRef.current.contains(e.target as Node)) setGlossOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [glossOpen])

  // Feedback: navigate to /about?to=feedback normally, but if we're already on
  // /about a query change won't re-trigger the reveal, so fire an event instead.
  const onFeedback = (e: React.MouseEvent) => {
    if (pathname === '/about') {
      e.preventDefault()
      window.dispatchEvent(new Event('medilexi:feedback'))
    }
    setMenuOpen(false)
  }

  const glossActive = pathname.startsWith('/glossary')
  const link = (active: boolean) =>
    `b-focus rounded-lg px-2.5 py-1.5 text-[0.84rem] font-semibold transition-colors ${
      active ? 'text-[var(--b-primary)]' : 'text-[var(--b-dim)] hover:text-[var(--b-text)]'
    }`

  const pos = variant === 'reveal' ? 'fixed left-0 right-0' : 'sticky'
  const vis = variant === 'reveal' && !shown ? '-translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'

  return (
    <header
      className={`${pos} top-0 z-[100] border-b border-[var(--b-border)] backdrop-blur transition-[transform,opacity] duration-300 ${vis}`}
      style={{ background: 'color-mix(in srgb, var(--b-bg) 88%, transparent)' }}
      aria-hidden={variant === 'reveal' && !shown}
    >
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-3 px-5 py-3">
        {/* left: wordmark + desktop nav */}
        <div className="flex items-center gap-1">
          <Link
            href="/"
            className="b-focus mr-2 text-[1.1rem] font-semibold tracking-[-0.008em] text-[var(--b-text)] hover:opacity-80"
            style={display}
          >
            Medi<span className="text-[var(--b-primary)]">Lexi</span>
          </Link>

          <nav className="hidden items-center gap-0.5 md:flex">
            <Link href="/wordparts" className={link(pathname.startsWith('/wordparts'))}>Word parts</Link>

            <div ref={glossRef} className="relative">
              <button
                type="button"
                onClick={() => setGlossOpen(o => !o)}
                className={`${link(glossActive)} inline-flex items-center gap-1`}
                aria-haspopup="menu"
                aria-expanded={glossOpen}
              >
                Glossary
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={`transition-transform ${glossOpen ? 'rotate-180' : ''}`}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {glossOpen && (
                <div className="b-lift absolute left-0 top-[calc(100%+8px)] z-[110] min-w-[190px] overflow-hidden rounded-xl border border-[var(--b-border)] bg-[var(--b-panel)] py-1" role="menu">
                  {GLOSSARIES.map(g => (
                    <Link
                      key={g.href}
                      href={g.href}
                      role="menuitem"
                      className={`block px-4 py-2 text-[0.86rem] font-medium hover:bg-[var(--b-raised)] ${pathname === g.href ? 'text-[var(--b-primary)]' : 'text-[var(--b-text)]'}`}
                    >
                      {g.label}
                    </Link>
                  ))}
                  <span className="block px-4 py-2 text-[0.86rem] font-medium text-[var(--b-dim)]">
                    Español <span className="text-[0.72rem]">· soon</span>
                  </span>
                </div>
              )}
            </div>

            <Link href="/flashcards/abbr" className={link(pathname.startsWith('/flashcards/abbr'))}>Abbreviations</Link>
          </nav>
        </div>

        {/* right: about + toggle + mobile menu button */}
        <div className="flex items-center gap-2">
          <Link href="/about" className={`${link(pathname.startsWith('/about'))} hidden md:inline-block`}>About</Link>
          <Link
            href="/about?to=feedback"
            onClick={onFeedback}
            aria-label="Send feedback"
            title="Send feedback"
            className="b-press b-focus hidden items-center justify-center rounded-full border border-[var(--b-border)] bg-[var(--b-panel)] p-2.5 text-[var(--b-dim)] hover:text-[var(--b-primary)] md:inline-flex"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m8 2 1.88 1.88" /><path d="M14.12 3.88 16 2" /><path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1" /><path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6" /><path d="M12 20v-9" /><path d="M6.53 9C4.6 8.8 3 7.1 3 5" /><path d="M6 13H2" /><path d="M3 21c0-2.1 1.7-3.9 3.8-4" /><path d="M20.97 5c0 2.1-1.6 3.8-3.5 4" /><path d="M22 13h-4" /><path d="M17.2 17c2.1.1 3.8 1.9 3.8 4" />
            </svg>
          </Link>
          {toggle}
          <button
            type="button"
            onClick={() => setMenuOpen(o => !o)}
            className="b-focus inline-flex items-center justify-center rounded-full border border-[var(--b-border)] bg-[var(--b-panel)] p-2.5 text-[var(--b-text)] md:hidden"
            aria-label="Menu"
            aria-expanded={menuOpen}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              {menuOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {/* mobile menu panel */}
      {menuOpen && (
        <div className="border-t border-[var(--b-border)] bg-[var(--b-panel)] px-3 py-3 md:hidden">
          <nav className="flex flex-col gap-0.5">
            <Link href="/wordparts" className={link(pathname.startsWith('/wordparts'))}>Word parts</Link>
            <span className="px-2.5 pb-0.5 pt-3 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-[var(--b-dim)]">Glossary</span>
            {GLOSSARIES.map(g => (
              <Link key={g.href} href={g.href} className={link(pathname === g.href)}>{g.label}</Link>
            ))}
            <span className="rounded-lg px-2.5 py-1.5 text-[0.84rem] font-semibold text-[var(--b-dim)] opacity-70">Español · soon</span>
            <Link href="/flashcards/abbr" className={`${link(pathname.startsWith('/flashcards/abbr'))} mt-2`}>Abbreviations</Link>
            <Link href="/about" className={link(pathname.startsWith('/about'))}>About</Link>
            <Link href="/about?to=feedback" onClick={onFeedback} className={link(false)}>Send feedback</Link>
          </nav>
        </div>
      )}
    </header>
  )
}
