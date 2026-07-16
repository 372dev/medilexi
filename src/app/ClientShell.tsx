'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { PAGE_TITLES } from '@/lib/page-titles'

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const [isDay, setIsDay] = useState(false)
  const [cookieDismissed, setCookieDismissed] = useState(true)
  const pathname = usePathname()
  const isHome = pathname === '/'
  const pageTitle = PAGE_TITLES[pathname] || 'Medi Lexi'

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    // Explicit saved preference wins; otherwise follow the OS. Re-applies live
    // when the OS theme changes, unless the user has manually overridden it.
    const apply = () => {
      const saved = localStorage.getItem('theme')
      const night = saved ? saved === 'night' : mq.matches
      setIsDay(!night)
      document.body.classList.toggle('day', !night)
    }
    apply()
    mq.addEventListener('change', apply)
    if (!localStorage.getItem('cookie-notice')) setCookieDismissed(false)
    return () => mq.removeEventListener('change', apply)
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

  return (
    <>
      {isHome ? (
        /* Direction B sample: the pixel hero image is gone and page.tsx owns the
           whole landing layout. The toggle floats over it. */
        <div className="relative">
          <button
            onClick={toggleMode}
            className="b-press fixed right-4 top-4 z-50 rounded-full border border-[var(--b-border)] bg-[var(--b-panel)] px-3 py-2 text-base leading-none"
            aria-label={isDay ? 'Switch to night mode' : 'Switch to day mode'}
            title={isDay ? 'Switch to night mode' : 'Switch to day mode'}
          ><span aria-hidden="true">{isDay ? '🌙' : '☀️'}</span></button>
          {children}
        </div>
      ) : (
        <>
          <a href="#main-content" className="skip-link">Skip to content</a>
          <header className="site-header">
            <Link href="/" className="site-header__brand">
              <span>Medi Lexi</span>
            </Link>
            <div className="site-header__title">{pageTitle}</div>
            <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', justifySelf:'end' }}>
              <Link href="/about" style={{ fontFamily:'var(--font-pixel)', fontSize:'0.5rem', color:'var(--color-text-dim)', textDecoration:'none', lineHeight:1.8, opacity:0.7 }}
                title="About & Sources">About</Link>
              <button className="site-header__toggle" onClick={toggleMode} aria-label={isDay ? 'Switch to night mode' : 'Switch to day mode'} title={isDay ? 'Switch to night mode' : 'Switch to day mode'}>
                <span aria-hidden="true">{isDay ? '🌙' : '☀️'}</span>
              </button>
            </div>
          </header>
          <div className="site-body">
            <aside className="site-ad" aria-hidden="true">Ad</aside>
            <main id="main-content" className="site-content">{children}</main>
            <aside className="site-ad" aria-hidden="true">Ad</aside>
          </div>
          <footer className="site-footer">
            <p className="site-footer__disclaimer">
              ⚕ For educational purposes only · Not a substitute for professional medical advice, diagnosis, or treatment ·
              Content is based on standard medical terminology references and may not reflect the latest clinical guidelines
            </p>
            <p style={{ fontSize: '0.82rem', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/about" style={{ color: 'var(--color-accent)', textDecoration: 'underline' }}>About &amp; Sources</Link>
              <Link href="/privacy" style={{ color: 'var(--color-accent)', textDecoration: 'underline' }}>Privacy Policy</Link>
            </p>
            <p className="site-footer__copy">© 2026 Medi Lexi · All rights reserved</p>
          </footer>
          {!cookieDismissed && (
            <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 200, background: 'var(--color-panel)', borderTop: '1px solid var(--color-border)', padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-text-dim)', margin: 0, lineHeight: 1.6 }}>
                This site uses cookies for analytics.{' '}
                <Link href="/privacy" style={{ color: 'var(--color-accent)', textDecoration: 'underline' }}>Learn more</Link>
              </p>
              <button
                onClick={dismissCookieNotice}
                style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.5rem', padding: '0.35rem 0.9rem', background: 'var(--color-gold)', color: 'var(--color-bg)', border: 'none', cursor: 'pointer', letterSpacing: '0.04em', lineHeight: 2 }}
              >
                OK
              </button>
            </div>
          )}
        </>
      )}
      <Analytics />
      <SpeedInsights />
    </>
  )
}
