import { MetadataRoute } from 'next'

const BASE_URL = 'https://medilexi.vercel.app'
const LAST_MOD   = '2026-06-25'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${BASE_URL}/`,                      lastModified: LAST_MOD },
    { url: `${BASE_URL}/glossary`,              lastModified: LAST_MOD },
    { url: `${BASE_URL}/glossary/ko`,           lastModified: LAST_MOD },
    { url: `${BASE_URL}/wordparts`,             lastModified: LAST_MOD },
    { url: `${BASE_URL}/wordparts/flashcard`,   lastModified: LAST_MOD },
    { url: `${BASE_URL}/wordparts/quiz`,        lastModified: LAST_MOD },
    { url: `${BASE_URL}/flashcards`,            lastModified: LAST_MOD },
    { url: `${BASE_URL}/flashcards/ko`,         lastModified: LAST_MOD },
    { url: `${BASE_URL}/flashcards/abbr`,       lastModified: LAST_MOD },
    { url: `${BASE_URL}/glossary/fr`,           lastModified: LAST_MOD },
    { url: `${BASE_URL}/flashcards/fr`,         lastModified: LAST_MOD },
    { url: `${BASE_URL}/about`,                 lastModified: LAST_MOD },
    { url: `${BASE_URL}/privacy`,               lastModified: LAST_MOD },
  ]
}
