import { headers } from 'next/headers'
import type { Metadata } from 'next'
import ClientShell from './ClientShell'
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

const LANG: Record<string, string> = {
  '/glossary/ko':   'ko',
  '/flashcards/ko': 'ko',
}

const HREFLANG: Record<string, { en: string; ko: string }> = {
  '/glossary':      { en: '/glossary',   ko: '/glossary/ko' },
  '/glossary/ko':   { en: '/glossary',   ko: '/glossary/ko' },
  '/flashcards':    { en: '/flashcards', ko: '/flashcards/ko' },
  '/flashcards/ko': { en: '/flashcards', ko: '/flashcards/ko' },
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

export async function generateMetadata(): Promise<Metadata> {
  const pathname    = headers().get('x-pathname') || '/'
  const pageTitle   = PAGE_TITLES[pathname]
  const fullTitle   = pageTitle ? `${pageTitle} — Medi Lexi` : 'Medi Lexi — Multilingual Medical Glossary'
  const description = PAGE_DESCRIPTIONS[pathname] || PAGE_DESCRIPTIONS['/']
  const hreflang    = HREFLANG[pathname]

  const meta: Metadata = {
    metadataBase: new URL(BASE_URL),
    title: fullTitle,
    description,
    openGraph: {
      type:        'website',
      siteName:    'Medi Lexi',
      title:       fullTitle,
      description,
      url:         `${BASE_URL}${pathname}`,
      images: [{ url: '/images/OG.png', width: 1457, height: 720, alt: 'Medi Lexi — Multilingual Medical Glossary' }],
    },
    twitter: {
      card:        'summary_large_image',
      title:       fullTitle,
      description,
      images:      ['/images/OG.png'],
    },
    verification: {
      google: 'JZ95uplJM3cH6C9ILPnxMIjAgzjgiyrKDjIpmQ20gkQ',
    },
  }

  if (hreflang) {
    meta.alternates = {
      languages: {
        en:          `${BASE_URL}${hreflang.en}`,
        ko:          `${BASE_URL}${hreflang.ko}`,
        'x-default': `${BASE_URL}${hreflang.en}`,
      },
    }
  }

  return meta
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname    = headers().get('x-pathname') || '/'
  const htmlLang    = LANG[pathname] || 'en'
  const pageTitle   = PAGE_TITLES[pathname]
  const fullTitle   = pageTitle ? `${pageTitle} — Medi Lexi` : 'Medi Lexi — Multilingual Medical Glossary'
  const description = PAGE_DESCRIPTIONS[pathname] || PAGE_DESCRIPTIONS['/']
  const canonicalUrl = `${BASE_URL}${pathname}`
  const jsonLd      = getPageJsonLd(pathname, fullTitle, description, canonicalUrl)

  return (
    <html lang={htmlLang}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  )
}
