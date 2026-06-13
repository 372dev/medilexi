'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import './globals.css'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isDay, setIsDay] = useState(false)
  const pathname = usePathname()
  const isHome = pathname === '/'

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
        <title>Sage's Medical Glossary</title>
        <meta name="description" content="Bridging the Language of Health Care" />
        <link rel="icon" href="/images/icon.png" type="image/png" />
      </head>
      <body>
        {isHome ? (
          /* ── LANDING PAGE — full page, no split ── */
          <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', padding:'2rem 1rem 4rem', position:'relative' }}>
            {/* Day/night toggle top-right */}
            <button
              className="site-header__toggle"
              onClick={toggleMode}
              style={{ position:'absolute', top:'1rem', right:'1rem' }}
              title={isDay ? 'Switch to night mode' : 'Switch to day mode'}
            >{isDay ? '🌙' : '☀️'}</button>

            {/* Hero image */}
            <Image
              src="/images/hero.jpg"
              alt="Sage's Medical Glossary — Bridging the Language of Health Care"
              width={600}
              height={338}
              style={{ imageRendering:'pixelated', width:'100%', maxWidth:'600px', height:'auto', marginBottom:'2.5rem' }}
              priority
            />

            {/* Nav buttons */}
            {children}
          </div>
        ) : (
          /* ── INNER PAGES — header + ad columns ── */
          <>
            <header className="site-header">
              <Link href="/" className="site-header__back">← Home</Link>
              <div className="site-header__title">
                <span style={{ display:'flex', alignItems:'center', gap:'0.6rem', justifyContent:'center' }}>
                  <Image src="/images/icon.png" alt="SG" width={24} height={24} style={{ imageRendering:'pixelated' }} />
                  Sage's Medical Glossary
                </span>
              </div>
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
      </body>
    </html>
  )
}
