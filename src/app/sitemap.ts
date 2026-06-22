import { MetadataRoute } from 'next'

const BASE_URL = 'https://medilexi.vercel.app'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${BASE_URL}/`,                    changeFrequency: 'monthly', priority: 1.0 },
    { url: `${BASE_URL}/glossary`,            changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE_URL}/glossary/ko`,         changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/wordparts`,           changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/wordparts/flashcard`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/flashcards`,          changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/flashcards/ko`,       changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/about`,               changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/privacy`,             changeFrequency: 'yearly',  priority: 0.4 },
  ]
}
