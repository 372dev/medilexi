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
  '/flashcards':          'English Flashcard',
  '/flashcards/ko':       'Korean Flashcard',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isDay, setIsDay] = useState(false)
  const pathname = usePathname()
  const isHome = pathname === '/'
  const pageTitle = PAGE_TITLES[pathname] || 'Medi Lexi'

  useEffect(() => {
    const saved = localStorage.getItem('theme')
    if (saved === 'day') {
      setIsDay(true)
      document.body.classList.add('day')
    }
  }, [])

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
        <meta name="description" content="Medi Lexi — Multilingual Glossary · Bridging the Language of Health Care" />
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
              src="/images/hero.jpg"
              alt="Medi Lexi — Multilingual Glossary · Bridging the Language of Health Care"
              width={460}
              height={259}
              style={{ imageRendering:'pixelated', width:'100%', maxWidth:'460px', height:'auto', marginBottom:'2rem' }}
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
                <Image src="/images/icon.png" alt="Medi Lexi" width={22} height={22} style={{ imageRendering:'pixelated', flexShrink:0 }} />
                <span>Medi Lexi</span>
              </Link>

              {/* Centre: page title */}
              <div className="site-header__title">{pageTitle}</div>

              {/* Right: toggle */}
              <button className="site-header__toggle" onClick={toggleMode} title={isDay ? 'Switch to night mode' : 'Switch to day mode'}>
                {isDay ? '🌙' : '☀️'}
              </button>
            </header>
            <div className="site-body">
              <aside className="site-ad">Ad</aside>
              <main className="site-content">{children}</main>
              <aside className="site-ad">Ad</aside>
            </div>
          </>
        )}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
