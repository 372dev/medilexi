import { headers } from 'next/headers'
import type { Metadata } from 'next'
import ClientShell from './ClientShell'
import { PAGE_TITLES } from '@/lib/page-titles'
import './globals.css'

const BASE_URL = 'https://medilexi.vercel.app'

const PAGE_DESCRIPTIONS: Record<string, string> = {
  '/':                    'Free medical glossary in English, Korean, and French — 1,300+ terms with word-part breakdowns, flashcards, and quizzes for students, interpreters, and translators.',
  '/glossary':            'Search 1,300+ medical terms with definitions, clinical specialties, importance levels, and word-part breakdowns.',
  '/terms':               'Browse every Medi Lexi medical term A to Z — 1,300+ entries with English, Korean, and French translations and word-part breakdowns.',
  '/glossary/ko':         'Bilingual English–Korean medical glossary with Korean definitions, IME-safe search, and word-part highlights.',
  '/wordparts':           '600+ medical word parts — prefixes, roots, and suffixes — with meanings, examples, and clinical usage.',
  '/wordparts/flashcard': 'Study medical word parts with interactive flashcards. Quiz mode, level filters, and missed-card review.',
  '/wordparts/quiz':      'Test your knowledge of medical word parts with multiple-choice quiz mode.',
  '/wordparts/exam':      'Timed 20-question medical word-part exams with a curated question bank, review flags, and full explanations.',
  '/flashcards':          'English medical vocabulary flashcard. Study or quiz mode with level and specialty filters.',
  '/flashcards/ko':       'English–Korean medical vocabulary flashcard with EN↔KO direction toggle and quiz mode.',
  '/flashcards/abbr':    'Medical abbreviation flashcard. Study 135+ abbreviations with Abbr→Term and Term→Abbr direction toggle, quiz mode, and specialty filters.',
  '/glossary/fr':        'Bilingual English–French medical glossary with French definitions, field and level filters, and word-part highlights.',
  '/flashcards/fr':      'English–French medical vocabulary flashcard with EN↔FR direction toggle, quiz mode, and specialty filters.',
  '/about':               'About Medi Lexi — multilingual medical glossary for students, interpreters, and translators. Data sources and site info.',
  '/privacy':             'Medi Lexi privacy policy — how we handle analytics, cookies, and data.',
}

const LANG: Record<string, string> = {
  '/glossary/ko':   'ko',
  '/flashcards/ko': 'ko',
  '/glossary/fr':   'fr',
  '/flashcards/fr': 'fr',
}

const HREFLANG: Record<string, Record<string, string>> = {
  '/glossary':      { en: '/glossary',   ko: '/glossary/ko',   fr: '/glossary/fr' },
  '/glossary/ko':   { en: '/glossary',   ko: '/glossary/ko',   fr: '/glossary/fr' },
  '/glossary/fr':   { en: '/glossary',   ko: '/glossary/ko',   fr: '/glossary/fr' },
  '/flashcards':    { en: '/flashcards', ko: '/flashcards/ko', fr: '/flashcards/fr' },
  '/flashcards/ko': { en: '/flashcards', ko: '/flashcards/ko', fr: '/flashcards/fr' },
  '/flashcards/fr': { en: '/flashcards', ko: '/flashcards/ko', fr: '/flashcards/fr' },
}

const BASE_GRAPH = [
  {
    '@type': 'WebSite',
    '@id': `${BASE_URL}/#website`,
    url: BASE_URL,
    name: 'Medi Lexi',
    description: 'Free multilingual medical glossary for students, medical interpreters and translators.',
    inLanguage: ['en', 'ko', 'fr'],
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
  '/wordparts/exam': {
    '@type': 'LearningResource',
    learningResourceType: ['activity', 'assessment'],
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
  '/flashcards/abbr': {
    '@type': 'LearningResource',
    learningResourceType: ['flashcard', 'activity'],
    educationalLevel: 'university',
    inLanguage: 'en',
  },
  '/glossary/fr': {
    '@type': 'LearningResource',
    learningResourceType: 'reference',
    educationalLevel: 'university',
    inLanguage: ['en', 'fr'],
  },
  '/flashcards/fr': {
    '@type': 'LearningResource',
    learningResourceType: ['flashcard', 'activity'],
    educationalLevel: 'university',
    inLanguage: ['en', 'fr'],
  },
}

const BREADCRUMBS: Record<string, Array<{ name: string; path: string }>> = {
  '/glossary':            [{ name: 'Home', path: '/' }, { name: 'English Glossary',   path: '/glossary' }],
  '/terms':               [{ name: 'Home', path: '/' }, { name: 'All Terms A–Z',      path: '/terms' }],
  '/glossary/ko':         [{ name: 'Home', path: '/' }, { name: 'Korean Glossary',    path: '/glossary/ko' }],
  '/wordparts':           [{ name: 'Home', path: '/' }, { name: 'Word Parts',         path: '/wordparts' }],
  '/wordparts/flashcard': [{ name: 'Home', path: '/' }, { name: 'Word Parts',         path: '/wordparts' }, { name: 'Flashcard', path: '/wordparts/flashcard' }],
  '/wordparts/quiz':      [{ name: 'Home', path: '/' }, { name: 'Word Parts',         path: '/wordparts' }, { name: 'Quiz',      path: '/wordparts/quiz' }],
  '/wordparts/exam':      [{ name: 'Home', path: '/' }, { name: 'Word Parts',         path: '/wordparts' }, { name: 'Exam',      path: '/wordparts/exam' }],
  '/flashcards':          [{ name: 'Home', path: '/' }, { name: 'English Flashcard',       path: '/flashcards' }],
  '/flashcards/ko':       [{ name: 'Home', path: '/' }, { name: 'Korean Flashcard',       path: '/flashcards/ko' }],
  '/flashcards/abbr':    [{ name: 'Home', path: '/' }, { name: 'Abbreviation Flashcard', path: '/flashcards/abbr' }],
  '/glossary/fr':        [{ name: 'Home', path: '/' }, { name: 'French Glossary',        path: '/glossary/fr' }],
  '/flashcards/fr':      [{ name: 'Home', path: '/' }, { name: 'French Flashcard',       path: '/flashcards/fr' }],
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
        ...Object.fromEntries(Object.entries(hreflang).map(([lang, path]) => [lang, `${BASE_URL}${path}`])),
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
        {/* Set the theme class before first paint to avoid a flash. An explicit
            saved preference wins; otherwise follow the OS (dark OS → night). */}
        <script
          dangerouslySetInnerHTML={{ __html: "try{var s=localStorage.getItem('theme');var d=s?s==='night':matchMedia('(prefers-color-scheme: dark)').matches;if(!d)document.body.classList.add('day')}catch(e){}" }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  )
}
