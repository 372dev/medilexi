import { MetadataRoute } from 'next'
import { slugify } from '@/lib/slug'
import vocabData from '@/data/medical_vocab.json'

const BASE_URL = 'https://medilexi.vercel.app'

// One timestamp per build, rather than a hand-edited date that goes stale.
const LAST_MOD = new Date()

const STATIC_ROUTES: Array<{ path: string; priority: number }> = [
  { path: '/',                    priority: 1.0 },
  { path: '/glossary',            priority: 0.9 },
  { path: '/terms',               priority: 0.8 },
  { path: '/glossary/ko',         priority: 0.9 },
  { path: '/glossary/fr',         priority: 0.9 },
  { path: '/wordparts',           priority: 0.8 },
  { path: '/wordparts/flashcard', priority: 0.6 },
  { path: '/wordparts/quiz',      priority: 0.6 },
  { path: '/wordparts/exam',      priority: 0.7 },
  { path: '/flashcards',          priority: 0.6 },
  { path: '/flashcards/ko',       priority: 0.6 },
  { path: '/flashcards/fr',       priority: 0.6 },
  { path: '/flashcards/abbr',     priority: 0.6 },
  { path: '/about',               priority: 0.3 },
  { path: '/privacy',             priority: 0.3 },
]

export default function sitemap(): MetadataRoute.Sitemap {
  const terms = (vocabData as unknown as Array<{ en_h: string }>).map((e) => ({
    url: `${BASE_URL}/term/${slugify(e.en_h)}`,
    lastModified: LAST_MOD,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  const statics = STATIC_ROUTES.map((r) => ({
    url: `${BASE_URL}${r.path}`,
    lastModified: LAST_MOD,
    changeFrequency: 'weekly' as const,
    priority: r.priority,
  }))

  return [...statics, ...terms]
}
