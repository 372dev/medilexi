'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'

const BASE_URL = 'https://medilexi.vercel.app'

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

const PAGE_DESCRIPTIONS: Record<string, string> = {
  '/':                    'Learn medical vocabulary with prefix · root · suffix breakdowns, 999-term glossary, flashcards and quiz. Free study tool for medical students.',
  '/glossary':            'Search 999 medical terms with definitions, clinical specialties, importance levels, and word-part breakdowns.',
  '/glossary/ko':         'Bilingual English–Korean medical glossary with Korean definitions, IME-safe search, and word-part highlights.',
  '/wordparts':           '408 medical word parts — prefixes, roots, and suffixes — with meanings, examples, and clinical usage.',
  '/wordparts/flashcard': 'Study medical word parts with interactive flashcards. Quiz mode, level filters, and missed-card review.',
  '/wordparts/quiz':      'Test your knowledge of medical word parts with multiple-choice quiz mode.',
  '/flashcards':          'English medical vocabulary flashcard. Study or quiz mode with level and specialty filters.',
  '/flashcards/ko':       'English–Korean medical vocabulary flashcard with EN↔KO direction toggle and quiz mode.',
  '/about':               'About Medi Lexi — multilingual medical glossary for students, interpreters, and translators. Data sources and site info.',
  '/privacy':             'Medi Lexi privacy policy — how we handle analytics, cookies, and data.',
}

const BASE_GRAPH = [
  {
    '@type': 'WebSite',
    '@id': `${BASE_URL}/#website`,
    url: BASE_URL,
    name: 'Medi Lexi',
    description: 'Free multilingual medical glossary for students, medical interpreters and translators.',
    inLanguage: ['en', 'ko'],
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${BASE_URL}/glossary?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  },
  {
    '@type': 'EducationalOrganization',
    '@id': `${BASE_URL}/#org`,
    name: 'Medi Lexi',
    url: BASE_URL,
    description: 'Free multilingual medical terminology reference and study platform.',
  },
]

const HREFLANG: Record<string, { en: string; ko: string }> = {
  '/glossary':      { en: '/glossary',   ko: '/glossary/ko' },
  '/glossary/ko':   { en: '/glossary',   ko: '/glossary/ko' },
  '/flashcards':    { en: '/flashcards', ko: '/flashcards/ko' },
  '/flashcards/ko': { en: '/flashcards', ko: '/flashcards/ko' },
}

const LANG: Record<string, string> = {
  '/glossary/ko':   'ko',
  '/flashcards/ko': 'ko',
}

const PAGE_SCHEMA: Record<string, object> = {
  '/glossary': {
    '@type': 'LearningResource',
    learningResourceType: 'reference',
    educationalLevel: 'university',
    inLanguage: 'en',
  },
  '/glossary/ko': {
    '@type': 'LearningResource',
    learningResourceType: 'reference',
    educationalLevel: 'university',
    inLanguage: ['en', 'ko'],
  },
  '/wordparts': {
    '@type': ['LearningResource', 'DefinedTermSet'],
    learningResourceType: 'reference',
    educationalLevel: 'university',
    inLanguage: 'en',
  },
  '/wordparts/flashcard': {
    '@type': 'LearningResource',
    learningResourceType: ['flashcard', 'activity'],
    educationalLevel: 'university',
    inLanguage: 'en',
  },
  '/wordparts/quiz': {
    '@type': 'LearningResource',
    learningResourceType: ['activity', 'quiz'],
    educationalLevel: 'university',
    inLanguage: 'en',
  },
  '/flashcards': {
    '@type': 'LearningResource',
    learningResourceType: ['flashcard', 'activity'],
    educationalLevel: 'university',
    inLanguage: 'en',
  },
  '/flashcards/ko': {
    '@type': 'LearningResource',
    learningResourceType: ['flashcard', 'activity'],
    educationalLevel: 'university',
    inLanguage: ['en', 'ko'],
  },
}

const BREADCRUMBS: Record<string, Array<{ name: string; path: string }>> = {
  '/glossary':            [{ name: 'Home', path: '/' }, { name: 'English Glossary',   path: '/glossary' }],
  '/glossary/ko':         [{ name: 'Home', path: '/' }, { name: 'Korean Glossary',    path: '/glossary/ko' }],
  '/wordparts':           [{ name: 'Home', path: '/' }, { name: 'Word Parts',         path: '/wordparts' }],
  '/wordparts/flashcard': [{ name: 'Home', path: '/' }, { name: 'Word Parts',         path: '/wordparts' }, { name: 'Flashcard', path: '/wordparts/flashcard' }],
  '/wordparts/quiz':      [{ name: 'Home', path: '/' }, { name: 'Word Parts',         path: '/wordparts' }, { name: 'Quiz',      path: '/wordparts/quiz' }],
  '/flashcards':          [{ name: 'Home', path: '/' }, { name: 'English Flashcard',  path: '/flashcards' }],
  '/flashcards/ko':       [{ name: 'Home', path: '/' }, { name: 'Korean Flashcard',   path: '/flashcards/ko' }],
  '/about':               [{ name: 'Home', path: '/' }, { name: 'About',              path: '/about' }],
  '/privacy':             [{ name: 'Home', path: '/' }, { name: 'Privacy Policy',     path: '/privacy' }],
}

function getPageJsonLd(pathname: string, title: string, description: string, url: string) {
  const pageBase = PAGE_SCHEMA[pathname]
  const crumbs   = BREADCRUMBS[pathname]

  const graph = [
    ...BASE_GRAPH,
    ...(pageBase ? [{
      ...pageBase,
      name: title,
      description,
      url,
      isPartOf: { '@id': `${BASE_URL}/#website` },
      provider: { '@id': `${BASE_URL}/#org` },
    }] : []),
    ...(crumbs ? [{
      '@type': 'BreadcrumbList',
      itemListElement: crumbs.map((c, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: c.name,
        item: `${BASE_URL}${c.path}`,
      })),
    }] : []),
  ]

  return { '@context': 'https://schema.org', '@graph': graph }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isDay, setIsDay] = useState(false)
  const [cookieDismissed, setCookieDismissed] = useState(true)
  const pathname = usePathname()
  const isHome = pathname === '/'
  const pageTitle = PAGE_TITLES[pathname] || 'Medi Lexi'
  const fullTitle = isHome ? 'Medi Lexi — Multilingual Medical Glossary' : `${pageTitle} — Medi Lexi`
  const description = PAGE_DESCRIPTIONS[pathname] || PAGE_DESCRIPTIONS['/']
  const canonicalUrl = `${BASE_URL}${pathname}`
  const htmlLang = LANG[pathname] || 'en'
  const hreflang = HREFLANG[pathname]

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
    <html lang={htmlLang}>
      <head>
        <title>{fullTitle}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonicalUrl} />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Medi Lexi" />
        <meta property="og:title" content={fullTitle} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={`${BASE_URL}/images/OG.png`} />
        <meta property="og:image:alt" content="Medi Lexi — Multilingual Medical Glossary" />

        {/* hreflang alternates */}
        {hreflang && <>
          <link rel="alternate" hrefLang="en"        href={`${BASE_URL}${hreflang.en}`} />
          <link rel="alternate" hrefLang="ko"        href={`${BASE_URL}${hreflang.ko}`} />
          <link rel="alternate" hrefLang="x-default" href={`${BASE_URL}${hreflang.en}`} />
        </>}

        {/* Google Search Console */}
        <meta name="google-site-verification" content="JZ95uplJM3cH6C9ILPnxMIjAgzjgiyrKDjIpmQ20gkQ" />

        {/* JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(getPageJsonLd(pathname, fullTitle, description, canonicalUrl)) }}
        />
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
