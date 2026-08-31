'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import SiteHeader from './SiteHeader'

/* App shell: the shared top nav (SiteHeader), footer, and cookie notice. On the
   landing the nav is revealed on scroll; on every other route it is sticky. */

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const [isDay, setIsDay] = useState(true)
  const [cookieDismissed, setCookieDismissed] = useState(true)
  const [revealed, setRevealed] = useState(false)
  const pathname = usePathname()
  // '/' redirects to Medi Lexi; the Inter Lexi landing lives at '/welcome'.
  // Medi Lexi's own landing is '/medical'.
  const isCommunity = pathname === '/welcome'
  const isHome = pathname === '/medical'

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  useEffect(() => {
    // Default to day mode; only an explicit saved choice of 'night' overrides it
    // (matches the pre-paint script in layout.tsx). The OS no longer decides.
    const day = localStorage.getItem('theme') !== 'night'
    setIsDay(day)
    document.body.classList.toggle('day', day)
    if (!localStorage.getItem('cookie-notice')) setCookieDismissed(false)
  }, [])

  // Landing only: reveal the nav once the visitor scrolls down from the hero.
  useEffect(() => {
    if (!isHome) { setRevealed(false); return }
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => setRevealed(window.scrollY > 120))
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf) }
  }, [isHome])

  function dismissCookieNotice() {
    localStorage.setItem('cookie-notice', '1')
    setCookieDismissed(true)
  }

  function toggleMode() {
    const next = !isDay
    setIsDay(next)
    if (next) {
      document.body.classList.add('day')
      localStorage.setItem('theme', 'day')
    } else {
      document.body.classList.remove('day')
      localStorage.setItem('theme', 'night')
    }
  }

  const toggleBtn = (
    <button
      onClick={toggleMode}
      className="b-press b-focus inline-flex items-center justify-center rounded-full border border-[var(--b-border)] bg-[var(--b-panel)] p-2.5 text-[var(--b-text)]"
      aria-label={isDay ? 'Switch to night mode' : 'Switch to day mode'}
      title={isDay ? 'Switch to night mode' : 'Switch to day mode'}
    >
      {isDay ? (
        /* day mode → show the moon (click to go night) */
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
        </svg>
      ) : (
        /* night mode → show the sun (click to go day) */
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      )}
    </button>
  )

  return (
    <>
      {isCommunity ? (
        /* Community workspace (placeholder for now). No Medi Lexi chrome; the
           page owns its own layout on the shared --b-* theme. */
        <div className="min-h-screen bg-[var(--b-bg)] text-[var(--b-text)]">{children}</div>
      ) : isHome ? (
        /* Landing: page.tsx owns the layout. The nav reveals on scroll; the
           floating toggle covers the top of the page where the nav is hidden. */
        <div className="relative">
          <SiteHeader toggle={toggleBtn} variant="reveal" shown={revealed} />
          <div
            className={`fixed right-4 top-4 z-50 transition-opacity duration-300 ${revealed ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
            aria-hidden={revealed}
          >
            {toggleBtn}
          </div>
          {children}
        </div>
      ) : (
        <div className="min-h-screen [overflow-x:clip] bg-[var(--b-bg)] text-[var(--b-text)]">
          <a
            href="#main-content"
            className="absolute left-2 top-[-48px] z-[300] rounded-lg bg-[var(--b-primary)] px-4 py-2 text-sm font-semibold text-[var(--b-on-prim)] transition-[top] focus:top-2"
          >
            Skip to content
          </a>

          <SiteHeader toggle={toggleBtn} variant="sticky" />

          <div className="site-body">
            <aside className="site-ad" aria-hidden="true">Ad</aside>
            <main id="main-content" className="site-content py-6">{children}</main>
            <aside className="site-ad" aria-hidden="true">Ad</aside>
          </div>

          <footer className="mt-12 border-t border-[var(--b-border)] px-5 py-8">
            <div className="mx-auto flex max-w-[900px] flex-col items-center gap-4 text-center">
              <p className="m-0 max-w-[74ch] text-[0.75rem] leading-[1.7] text-[var(--b-dim)]">
                ⚕ For educational purposes only · Not a substitute for professional medical advice,
                diagnosis, or treatment · Content is based on standard medical terminology references
                and may not reflect the latest clinical guidelines
              </p>
              <div className="flex flex-wrap justify-center gap-5">
                <Link href="/medical/about" className="b-focus text-[0.84rem] font-semibold text-[var(--b-primary)] hover:underline">
                  About &amp; Sources
                </Link>
                <Link href="/medical/privacy" className="b-focus text-[0.84rem] font-semibold text-[var(--b-primary)] hover:underline">
                  Privacy Policy
                </Link>
              </div>
              <p className="m-0 text-[0.75rem] text-[var(--b-dim)]">© 2026 Medi Lexi · All rights reserved</p>
            </div>
          </footer>

          {!cookieDismissed && (
            <div
              className="fixed inset-x-0 bottom-0 z-[200] flex flex-wrap items-center justify-center gap-4 border-t border-[var(--b-border)] bg-[var(--b-panel)] px-5 py-3"
              style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}
            >
              <p className="m-0 text-[0.82rem] leading-[1.6] text-[var(--b-dim)]">
                This site uses cookies for analytics.{' '}
                <Link href="/medical/privacy" className="font-semibold text-[var(--b-primary)] underline">Learn more</Link>
              </p>
              <button
                onClick={dismissCookieNotice}
                className="b-press b-focus rounded-xl bg-[var(--b-primary)] px-5 py-2 text-[0.82rem] font-bold text-[var(--b-on-prim)]"
              >
                OK
              </button>
            </div>
          )}
        </div>
      )}
      <Analytics />
      <SpeedInsights />
    </>
  )
}
