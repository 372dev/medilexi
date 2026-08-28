import { MetadataRoute } from 'next'
import { slugify } from '@/lib/slug'
import vocabData from '@/data/medical_vocab.json'

const BASE_URL = 'https://interlexi.com'
const MED = '/medical' // Medi Lexi lives under this subdirectory

// One timestamp per build, rather than a hand-edited date that goes stale.
const LAST_MOD = new Date()

// Community (root) + product-home routes.
const ROOT_ROUTES: Array<{ path: string; priority: number }> = [
  { path: '/',   priority: 1.0 },  // community workspace
  { path: MED,   priority: 0.95 }, // Medi Lexi home
]

// Medi Lexi routes, served under /medical.
const MED_ROUTES: Array<{ path: string; priority: number }> = [
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
    url: `${BASE_URL}${MED}/term/${slugify(e.en_h)}`,
    lastModified: LAST_MOD,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  const roots = ROOT_ROUTES.map((r) => ({
    url: `${BASE_URL}${r.path}`,
    lastModified: LAST_MOD,
    changeFrequency: 'weekly' as const,
    priority: r.priority,
  }))

  const meds = MED_ROUTES.map((r) => ({
    url: `${BASE_URL}${MED}${r.path}`,
    lastModified: LAST_MOD,
    changeFrequency: 'weekly' as const,
    priority: r.priority,
  }))

  return [...roots, ...meds, ...terms]
}
