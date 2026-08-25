'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { PAGE_TITLES } from '@/lib/page-titles'

/* Direction B sample shell. The retro pixel header/footer are replaced so the
   restyled pages are not framed by the old design. Layout classes (.site-body,
   .site-ad) are reused as-is: they carry grid geometry only, no retro styling. */

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const [isDay, setIsDay] = useState(true)
  const [cookieDismissed, setCookieDismissed] = useState(true)
  const pathname = usePathname()
  const isHome = pathname === '/'
  const pageTitle = PAGE_TITLES[pathname] || 'Medi Lexi'

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
        /* night mode → show the sun (click to go day) — the sample's icon */
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      )}
    </button>
  )

  return (
    <>
      {isHome ? (
        /* The pixel hero image is gone; page.tsx owns the whole landing layout. */
        <div className="relative">
          <div className="fixed right-4 top-4 z-50">{toggleBtn}</div>
          {children}
        </div>
      ) : (
        <div className="min-h-screen bg-[var(--b-bg)] text-[var(--b-text)]">
          <a
            href="#main-content"
            className="absolute left-2 top-[-48px] z-[300] rounded-lg bg-[var(--b-primary)] px-4 py-2 text-sm font-semibold text-[var(--b-on-prim)] transition-[top] focus:top-2"
          >
            Skip to content
          </a>

          {/* Translucency goes through an inline style: Tailwind's `/90` opacity
              modifier would emit rgb(var(--b-bg) / .9), and --b-bg is a hex, not
              channels, so the background would silently drop out. */}
          <header
            className="sticky top-0 z-[100] border-b border-[var(--b-border)] backdrop-blur"
            style={{ background: 'color-mix(in srgb, var(--b-bg) 88%, transparent)' }}
          >
            <div className="mx-auto grid max-w-[1440px] grid-cols-[1fr_auto_1fr] items-center gap-3 px-5 py-3">
              <Link
                href="/"
                className="b-focus justify-self-start text-[1.1rem] font-semibold tracking-[-0.008em] text-[var(--b-text)] hover:opacity-80"
                style={{ fontFamily: 'var(--b-display)' }}
              >
                Medi<span className="text-[var(--b-primary)]">Lexi</span>
              </Link>

              <div
                className="truncate text-center text-[0.9rem] font-semibold tracking-[-0.01em] text-[var(--b-text)]"
                style={{ fontFamily: 'var(--b-display)' }}
              >
                {pageTitle}
              </div>

              <div className="flex items-center gap-3 justify-self-end">
                <Link
                  href="/about"
                  className="b-focus hidden text-[0.82rem] font-medium text-[var(--b-dim)] hover:text-[var(--b-text)] sm:block"
                  title="About & Sources"
                >
                  About
                </Link>
                {toggleBtn}
              </div>
            </div>
          </header>

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
                <Link href="/about" className="b-focus text-[0.84rem] font-semibold text-[var(--b-primary)] hover:underline">
                  About &amp; Sources
                </Link>
                <Link href="/privacy" className="b-focus text-[0.84rem] font-semibold text-[var(--b-primary)] hover:underline">
                  Privacy Policy
                </Link>
              </div>
              <p className="m-0 text-[0.75rem] text-[var(--b-dim)]">© 2026 Medi Lexi · All rights reserved</p>
            </div>
          </footer>

          {!cookieDismissed && (
            <div className="fixed inset-x-0 bottom-0 z-[200] flex flex-wrap items-center justify-center gap-4 border-t border-[var(--b-border)] bg-[var(--b-panel)] px-5 py-3">
              <p className="m-0 text-[0.82rem] leading-[1.6] text-[var(--b-dim)]">
                This site uses cookies for analytics.{' '}
                <Link href="/privacy" className="font-semibold text-[var(--b-primary)] underline">Learn more</Link>
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
