'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import './globals.css'

function SiteHeader({ toggleMode, isDay }: { toggleMode: () => void; isDay: boolean }) {
  const isHome = typeof window !== 'undefined' && window.location.pathname === '/'
  return (
    <header className="site-header">
      {!isHome && (
        <Link href="/" className="site-header__back">← Home</Link>
      )}
      {isHome && (
        <div style={{ width: '60px' }} />
      )}
      <div className="site-header__title">
        {isHome
          ? <Image src="/images/hero.jpg" alt="Sage's Medical Glossary" width={320} height={240} style={{ display: 'block', margin: '0 auto', imageRendering: 'pixelated', width: '100%', maxWidth: '320px', height: 'auto' }} priority />
          : "Sage's Medical Glossary"
        }
      </div>
      <button
        className="site-header__toggle"
        onClick={toggleMode}
        title={isDay ? 'Switch to night mode' : 'Switch to day mode'}
      >
        {isDay ? '🌙' : '☀️'}
      </button>
    </header>
  )
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isDay, setIsDay] = useState(false)

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
        <meta name="description" content="Your comprehensive bilingual medical reference guide" />
      </head>
      <body>
        <SiteHeader toggleMode={toggleMode} isDay={isDay} />
        <div className="site-body">
          <aside className="site-ad">Ad</aside>
          <main className="site-content">{children}</main>
          <aside className="site-ad">Ad</aside>
        </div>
      </body>
    </html>
  )
}
