import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { slugify } from '@/lib/slug'
import { LVL_TEXT, normalizeLvl } from '@/lib/vocab-constants'
import vocabData from '@/data/medical_vocab.json'
import koData from '@/data/medical_vocab_ko.json'
import frData from '@/data/medical_vocab_fr.json'
import partsData from '@/data/medical_wordparts_simple.json'

const BASE_URL = 'https://medilexi.vercel.app'

type Vocab = { en_h: string; en_l?: string; abbr?: string; f: string[]; d: string; lvl: number; parts?: { p?: string[]; r?: string[]; s?: string[] } }
type Ko = { en_h: string; ko_h: string; ko_l?: string; d_ko?: string }
type Fr = { en_h: string; fr_h: string; fr_l?: string; d_fr?: string }
type Part = { wp: string; t: 'p' | 'r' | 's'; d: string }

const VOCAB = vocabData as unknown as Vocab[]
const KO = koData as unknown as Ko[]
const FR = frData as unknown as Fr[]
const PARTS = partsData as unknown as Part[]

const KO_BY_KEY = new Map(KO.map((e) => [e.en_h, e]))
const FR_BY_KEY = new Map(FR.map((e) => [e.en_h, e]))
const PART_BY_WP = new Map(PARTS.map((p) => [p.wp, p]))
const BY_SLUG = new Map(VOCAB.map((e) => [slugify(e.en_h), e]))

const PART_TYPE_LABEL: Record<Part['t'], string> = { p: 'Prefix', r: 'Root', s: 'Suffix' }
const PART_TYPE_COLOR: Record<Part['t'], string> = {
  p: 'var(--color-blue)',
  r: 'var(--color-green)',
  s: 'var(--color-red)',
}

export function generateStaticParams() {
  return VOCAB.map((e) => ({ slug: slugify(e.en_h) }))
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const entry = BY_SLUG.get(params.slug)
  if (!entry) return {}

  const ko = KO_BY_KEY.get(entry.en_h)
  const fr = FR_BY_KEY.get(entry.en_h)
  const url = `${BASE_URL}/term/${params.slug}`

  // Lead with the English definition, then name the translations so the snippet
  // is useful to a Korean or French searcher scanning results.
  const langs = [ko?.ko_h, fr?.fr_h].filter(Boolean).join(' · ')
  const description = langs ? `${entry.d} (${langs})` : entry.d
  const title = `${entry.en_h}${entry.abbr ? ` (${entry.abbr})` : ''} · Medi Lexi`

  return {
    title,
    description: description.slice(0, 300),
    alternates: { canonical: url },
    openGraph: { type: 'article', siteName: 'Medi Lexi', title, description, url },
    twitter: { card: 'summary_large_image', title, description },
  }
}

function jsonLd(entry: Vocab, ko?: Ko, fr?: Fr) {
  const url = `${BASE_URL}/term/${slugify(entry.en_h)}`
  return {
    '@context': 'https://schema.org',
    '@type': 'DefinedTerm',
    '@id': url,
    url,
    name: entry.en_h,
    description: entry.d,
    inDefinedTermSet: { '@type': 'DefinedTermSet', name: 'Medi Lexi', url: `${BASE_URL}/glossary` },
    ...(entry.en_l ? { alternateName: entry.en_l } : {}),
    ...(entry.abbr ? { termCode: entry.abbr } : {}),
    inLanguage: 'en',
    ...(ko || fr
      ? {
          workTranslation: [
            ...(ko ? [{ '@type': 'DefinedTerm', name: ko.ko_h, description: ko.d_ko, inLanguage: 'ko' }] : []),
            ...(fr ? [{ '@type': 'DefinedTerm', name: fr.fr_h, description: fr.d_fr, inLanguage: 'fr' }] : []),
          ],
        }
      : {}),
  }
}

/** Up to 8 other terms sharing this term's primary field — the internal-link graph. */
function relatedTerms(entry: Vocab): Vocab[] {
  const primary = entry.f[0]
  if (!primary) return []
  return VOCAB.filter((e) => e.en_h !== entry.en_h && e.f[0] === primary).slice(0, 8)
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2
        className="text-xs uppercase tracking-widest mb-3"
        style={{ color: 'var(--color-text-dim)', fontFamily: 'var(--font-pixel)' }}
      >
        {title}
      </h2>
      {children}
    </section>
  )
}

export default function TermPage({ params }: { params: { slug: string } }) {
  const entry = BY_SLUG.get(params.slug)
  if (!entry) notFound()

  const ko = KO_BY_KEY.get(entry.en_h)
  const fr = FR_BY_KEY.get(entry.en_h)
  const lvl = normalizeLvl(entry.lvl)
  const related = relatedTerms(entry)

  const partEntries = (['p', 'r', 's'] as const).flatMap((k) =>
    (entry.parts?.[k] ?? []).map((wp) => PART_BY_WP.get(wp)).filter((p): p is Part => Boolean(p)),
  )

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(entry, ko, fr)) }} />

      <nav className="mb-6 text-sm" style={{ color: 'var(--color-text-dim)' }}>
        <Link href="/glossary" style={{ color: 'var(--color-accent)' }}>
          ← Glossary
        </Link>
      </nav>

      <header>
        <h1 className="text-3xl font-semibold" style={{ color: 'var(--color-gold)' }}>
          {entry.en_h}
          {entry.abbr ? <span className="ml-2 text-xl" style={{ color: 'var(--color-text-dim)' }}>({entry.abbr})</span> : null}
        </h1>
        {entry.en_l ? (
          <p className="mt-1 text-base" style={{ color: 'var(--color-text-dim)' }}>
            Also called <em>{entry.en_l}</em>
          </p>
        ) : null}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {entry.f.map((field) => (
            <span
              key={field}
              className="rounded-full border px-3 py-1 text-xs"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-dim)' }}
            >
              {field}
            </span>
          ))}
          <span className="rounded-full px-3 py-1 text-xs" style={{ background: 'var(--color-gold)', color: 'var(--color-bg)' }}>
            {LVL_TEXT[lvl]}
          </span>
        </div>
      </header>

      <p className="mt-6 text-lg leading-relaxed" style={{ color: 'var(--color-text)' }}>
        {entry.d}
      </p>

      {ko ? (
        <Section title="Korean">
          <p className="text-xl" style={{ color: 'var(--color-text)' }} lang="ko">
            {ko.ko_h}
            {ko.ko_l ? <span className="ml-2 text-base" style={{ color: 'var(--color-text-dim)' }}>({ko.ko_l})</span> : null}
          </p>
          {ko.d_ko ? (
            <p className="mt-2 leading-relaxed" style={{ color: 'var(--color-text-dim)' }} lang="ko">
              {ko.d_ko}
            </p>
          ) : null}
        </Section>
      ) : null}

      {fr ? (
        <Section title="French">
          <p className="text-xl" style={{ color: 'var(--color-text)' }} lang="fr">
            {fr.fr_h}
            {fr.fr_l ? <span className="ml-2 text-base" style={{ color: 'var(--color-text-dim)' }}>({fr.fr_l})</span> : null}
          </p>
          {fr.d_fr ? (
            <p className="mt-2 leading-relaxed" style={{ color: 'var(--color-text-dim)' }} lang="fr">
              {fr.d_fr}
            </p>
          ) : null}
        </Section>
      ) : null}

      {partEntries.length > 0 ? (
        <Section title="Word parts">
          <ul className="space-y-2">
            {partEntries.map((p) => (
              <li key={p.wp} className="flex flex-wrap items-baseline gap-x-3">
                <code className="text-base font-semibold" style={{ color: PART_TYPE_COLOR[p.t] }}>
                  {p.wp}
                </code>
                <span className="text-xs uppercase tracking-wide" style={{ color: 'var(--color-text-dim)' }}>
                  {PART_TYPE_LABEL[p.t]}
                </span>
                <span style={{ color: 'var(--color-text)' }}>{p.d}</span>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {related.length > 0 ? (
        <Section title={`More in ${entry.f[0]}`}>
          <ul className="flex flex-wrap gap-x-4 gap-y-2">
            {related.map((r) => (
              <li key={r.en_h}>
                <Link href={`/term/${slugify(r.en_h)}`} style={{ color: 'var(--color-accent)' }}>
                  {r.en_h}
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}
    </main>
  )
}
