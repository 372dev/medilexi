'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'

const PAGE_TITLES: Record<string, string> = {
  '/glossary':            'English Glossary',
  '/glossary/ko':         'Korean Glossary',
  '/wordparts':           'Medical Word Parts',
  '/wordparts/flashcard': 'Word Parts Flashcard',
  '/wordparts/quiz':      'Word Parts Quiz',
  '/flashcards':          'English Flashcard',
  '/flashcards/ko':       'Korean Flashcard',
  '/about':               'About',
  '/privacy':             'Privacy Policy',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isDay, setIsDay] = useState(false)
  const [cookieDismissed, setCookieDismissed] = useState(true)
  const pathname = usePathname()
  const isHome = pathname === '/'
  const pageTitle = PAGE_TITLES[pathname] || 'Medi Lexi'

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  useEffect(() => {
    const saved = localStorage.getItem('theme')
    if (saved !== 'night') {
      setIsDay(true)
      document.body.classList.add('day')
    }
    if (!localStorage.getItem('cookie-notice')) {
      setCookieDismissed(false)
    }
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
    <html lang="en">
      <head>
        <title>{pageTitle} — Medi Lexi</title>
        <meta name="description" content="Medi Lexi — Multilingual Medical Glossary for students, medical interpreters &amp; translators" />
        <link rel="icon" href="/images/icon.png" type="image/png" />
      </head>
      <body>
        {isHome ? (
          /* ── LANDING PAGE ── */
          <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', padding:'2rem 1rem 4rem', position:'relative' }}>
            <button
              className="site-header__toggle"
              onClick={toggleMode}
              style={{ position:'absolute', top:'1rem', right:'1rem' }}
              title={isDay ? 'Switch to night mode' : 'Switch to day mode'}
            >{isDay ? '🌙' : '☀️'}</button>
            <Image
              src={isDay ? '/images/hero-day.png' : '/images/hero.jpg'}
              alt="Medi Lexi — Multilingual Glossary · Bridging the Language of Health Care"
              width={460}
              height={259}
              style={{ imageRendering:'pixelated', width:'100%', maxWidth:'520px', height:'auto', marginBottom:'1.5rem' }}
              priority
            />
            {children}
          </div>
        ) : (
          /* ── INNER PAGES ── */
          <>
            <header className="site-header">
              {/* Left: site name + icon */}
              <Link href="/" className="site-header__brand">
                <span>Medi Lexi</span>
              </Link>

              {/* Centre: page title */}
              <div className="site-header__title">{pageTitle}</div>

              {/* Right: About + toggle */}
              <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', justifySelf:'end' }}>
                <Link href="/about" style={{ fontFamily:'var(--font-pixel)', fontSize:'0.5rem', color:'var(--color-text-dim)', textDecoration:'none', lineHeight:1.8, opacity:0.7 }}
                  title="About & Sources">About</Link>
                <button className="site-header__toggle" onClick={toggleMode} title={isDay ? 'Switch to night mode' : 'Switch to day mode'}>
                  {isDay ? '🌙' : '☀️'}
                </button>
              </div>
            </header>
            <div className="site-body">
              <aside className="site-ad">Ad</aside>
              <main className="site-content">{children}</main>
              <aside className="site-ad">Ad</aside>
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
      </body>
    </html>
  )
}
