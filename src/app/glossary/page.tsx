'use client'

import { useState, useMemo } from 'react'
import vocabData from '@/data/medical_vocab_v1.18.json'
import styles from './glossary.module.css'

interface VocabEntry {
  en_h: string
  en_l?: string
  abbr?: string
  ko_h: string
  ko_l?: string
  f: string[]
  d: string
  lvl: string
  parts?: {
    p?: string[]
    r?: string[]
    s?: string[]
  }
}

const vocab = vocabData as VocabEntry[]

const LEVEL_STARS: Record<string, string> = {
  '⭐⭐⭐ Essential': '⭐⭐⭐',
  '⭐⭐ Important':  '⭐⭐',
  '⭐ Good to know': '⭐',
}

const LEVEL_CLASS: Record<string, string> = {
  '⭐⭐⭐ Essential': styles.lvlEssential,
  '⭐⭐ Important':  styles.lvlImportant,
  '⭐ Good to know': styles.lvlGood,
}

// Collect all unique fields
const ALL_FIELDS = Array.from(
  new Set(vocab.flatMap(v => v.f))
).sort()

const ALL_LEVELS = ['⭐⭐⭐ Essential', '⭐⭐ Important', '⭐ Good to know']

export default function GlossaryPage() {
  const [search, setSearch]       = useState('')
  const [fieldFilter, setField]   = useState<string | null>(null)
  const [levelFilter, setLevel]   = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return vocab.filter(v => {
      if (fieldFilter && !v.f.includes(fieldFilter)) return false
      if (levelFilter && v.lvl !== levelFilter) return false
      if (!q) return true
      return (
        v.en_h.toLowerCase().includes(q) ||
        (v.en_l || '').toLowerCase().includes(q) ||
        v.ko_h.toLowerCase().includes(q) ||
        (v.ko_l || '').toLowerCase().includes(q) ||
        (v.abbr || '').toLowerCase().includes(q)
      )
    })
  }, [search, fieldFilter, levelFilter])

  return (
    <div className={styles.page}>

      {/* Header */}
      <header className={styles.header}>
        <a href="/" className={styles.back}>← Home</a>
        <h1 className={styles.title}>Medical Glossary</h1>
        <span className={styles.count}>{filtered.length} terms</span>
      </header>

      {/* Search */}
      <div className={styles.searchWrap}>
        <input
          className={styles.search}
          type="text"
          placeholder="Search terms, abbreviations, 한국어..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Level filter */}
      <div className={styles.filterRow}>
        <button
          className={`${styles.pill} ${levelFilter === null ? styles.pillActive : ''}`}
          onClick={() => setLevel(null)}
        >All</button>
        {ALL_LEVELS.map(lvl => (
          <button
            key={lvl}
            className={`${styles.pill} ${levelFilter === lvl ? styles.pillActive : ''}`}
            onClick={() => setLevel(levelFilter === lvl ? null : lvl)}
          >
            {LEVEL_STARS[lvl]}
          </button>
        ))}
      </div>

      {/* Field filter */}
      <div className={styles.filterRow}>
        <button
          className={`${styles.pill} ${fieldFilter === null ? styles.pillActive : ''}`}
          onClick={() => setField(null)}
        >All Fields</button>
        {ALL_FIELDS.map(f => (
          <button
            key={f}
            className={`${styles.pill} ${fieldFilter === f ? styles.pillActive : ''}`}
            onClick={() => setField(fieldFilter === f ? null : f)}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className={styles.grid}>
        {filtered.map((v, i) => (
          <div key={i} className={styles.card}>

            {/* Top row: level + abbr */}
            <div className={styles.cardTop}>
              <span className={`${styles.lvl} ${LEVEL_CLASS[v.lvl] || ''}`}>
                {LEVEL_STARS[v.lvl]}
              </span>
              {v.abbr && <span className={styles.abbr}>{v.abbr}</span>}
            </div>

            {/* English */}
            <div className={styles.enH}>{v.en_h}</div>
            {v.en_l && <div className={styles.enL}>{v.en_l}</div>}

            {/* Korean */}
            <div className={styles.koH}>{v.ko_h}</div>
            {v.ko_l && <div className={styles.koL}>{v.ko_l}</div>}

            {/* Definition */}
            <p className={styles.def}>{v.d}</p>

            {/* Fields */}
            <div className={styles.fields}>
              {v.f.map(f => (
                <span key={f} className={styles.fieldBadge}>{f}</span>
              ))}
            </div>

            {/* Parts — shown on hover via CSS */}
            {v.parts && (
              <div className={styles.parts}>
                {v.parts.p?.map(p => (
                  <span key={p} className={`${styles.part} ${styles.partP}`}>{p}</span>
                ))}
                {v.parts.r?.map(r => (
                  <span key={r} className={`${styles.part} ${styles.partR}`}>{r}</span>
                ))}
                {v.parts.s?.map(s => (
                  <span key={s} className={`${styles.part} ${styles.partS}`}>{s}</span>
                ))}
              </div>
            )}

          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className={styles.empty}>No terms found. Try a different search.</div>
      )}

    </div>
  )
}
