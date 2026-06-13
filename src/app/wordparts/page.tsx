'use client'

import { useState, useMemo } from 'react'
import partsData from '@/data/medical_wordparts_v1.05.json'
import styles from './wordparts.module.css'

interface WordPart {
  wp: string
  t: 'p' | 'r' | 's'
  lvl: 1 | 2 | 3
  d: string
  ex: [[string, string], [string, string]]
}

const parts = partsData as WordPart[]

const TYPE_LABEL: Record<string, string> = { p: 'Prefix', r: 'Root', s: 'Suffix' }
const STARS = (lvl: number) => '★'.repeat(lvl) + '☆'.repeat(3 - lvl)

export default function WordPartsPage() {
  const [mode, setMode]         = useState<'night' | 'day'>('night')
  const [tab, setTab]           = useState<'glossary' | 'flashcard'>('glossary')
  const [search, setSearch]     = useState('')
  const [typeFilter, setType]   = useState<'all' | 'p' | 'r' | 's'>('all')
  const [lvlFilter, setLvl]     = useState<number | null>(null)

  // Flashcard state
  const [deck, setDeck]         = useState<WordPart[]>([])
  const [cardIdx, setCardIdx]   = useState(0)
  const [flipped, setFlipped]   = useState(false)
  const [score, setScore]       = useState(0)
  const [started, setStarted]   = useState(false)

  const isDay = mode === 'day'

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return parts.filter(p => {
      if (typeFilter !== 'all' && p.t !== typeFilter) return false
      if (lvlFilter && p.lvl !== lvlFilter) return false
      if (!q) return true
      return (
        p.wp.toLowerCase().includes(q) ||
        p.d.toLowerCase().includes(q) ||
        p.ex[0][0].toLowerCase().includes(q) ||
        p.ex[1][0].toLowerCase().includes(q)
      )
    })
  }, [search, typeFilter, lvlFilter])

  const counts = useMemo(() => ({
    p: parts.filter(p => p.t === 'p').length,
    r: parts.filter(p => p.t === 'r').length,
    s: parts.filter(p => p.t === 's').length,
  }), [])

  function startFlashcards() {
    const d = [...filtered].sort(() => Math.random() - 0.5)
    setDeck(d)
    setCardIdx(0)
    setFlipped(false)
    setScore(0)
    setStarted(true)
  }

  function handleGotIt() {
    setScore(s => s + 1)
    next()
  }

  function next() {
    setFlipped(false)
    setTimeout(() => setCardIdx(i => i + 1), 150)
  }

  const card = deck[cardIdx]
  const done = started && cardIdx >= deck.length

  return (
    <div className={`${styles.page} ${isDay ? styles.day : styles.night}`}>

      {/* Header */}
      <header className={styles.header}>
        <a href="/" className={styles.back}>← Home</a>
        <h1 className={styles.title}>Word Parts</h1>
        <button
          className={styles.modeToggle}
          onClick={() => setMode(m => m === 'night' ? 'day' : 'night')}
          title="Toggle day/night mode"
        >
          {isDay ? '🌙' : '☀️'}
        </button>
      </header>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${tab === 'glossary' ? styles.tabActive : ''}`}
          onClick={() => setTab('glossary')}
        >Word Parts</button>
        <button
          className={`${styles.tab} ${tab === 'flashcard' ? styles.tabActive : ''}`}
          onClick={() => { setTab('flashcard'); setStarted(false) }}
        >Flashcard Quiz</button>
      </div>

      {/* ── GLOSSARY TAB ── */}
      {tab === 'glossary' && (
        <>
          <div className={styles.searchWrap}>
            <input
              className={styles.search}
              type="text"
              placeholder="Search word parts, definitions, examples..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Type filter */}
          <div className={styles.filterRow}>
            {(['all', 'p', 'r', 's'] as const).map(t => (
              <button
                key={t}
                className={`${styles.pill} ${typeFilter === t ? styles.pillActive : ''} ${t !== 'all' ? styles[`pill_${t}`] : ''}`}
                onClick={() => setType(t)}
              >
                {t === 'all' ? `All (${parts.length})` :
                 t === 'p' ? `Prefixes (${counts.p})` :
                 t === 'r' ? `Roots (${counts.r})` :
                 `Suffixes (${counts.s})`}
              </button>
            ))}
          </div>

          {/* Level filter */}
          <div className={styles.filterRow}>
            <button className={`${styles.pill} ${!lvlFilter ? styles.pillActive : ''}`} onClick={() => setLvl(null)}>All levels</button>
            {[3, 2, 1].map(l => (
              <button key={l} className={`${styles.pill} ${styles.pillStar} ${lvlFilter === l ? styles.pillStarActive : ''}`} onClick={() => setLvl(lvlFilter === l ? null : l)}>
                {'★'.repeat(l)}
              </button>
            ))}
          </div>

          {/* Legend */}
          <div className={styles.legend}>
            <span>★★★ Essential</span>
            <span>★★ Frequently used</span>
            <span>★ Good to know</span>
          </div>

          {/* Count */}
          <div className={styles.resultCount}>{filtered.length} entries</div>

          {/* Cards */}
          <div className={styles.grid}>
            {filtered.map((p, i) => (
              <div key={i} className={`${styles.card} ${styles[`card_${p.t}`]}`}>
                <div className={styles.cardTop}>
                  <span className={`${styles.badge} ${styles[`badge_${p.t}`]}`}>
                    {TYPE_LABEL[p.t]}
                  </span>
                  <span className={`${styles.stars} ${p.lvl === 3 ? styles.stars3 : p.lvl === 2 ? styles.stars2 : styles.stars1}`}>
                    {'★'.repeat(p.lvl)}
                  </span>
                </div>
                <div className={styles.wp}>{p.wp}</div>
                <div className={styles.def}>{p.d}</div>
                <div className={styles.examples}>
                  {p.ex.map(([term, def], j) => (
                    <div key={j} className={styles.exPill}>
                      <strong>{term}</strong> — {def}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className={styles.empty}>No word parts found.</div>
          )}
        </>
      )}

      {/* ── FLASHCARD TAB ── */}
      {tab === 'flashcard' && (
        <div className={styles.flashWrap}>
          {!started ? (
            <div className={styles.flashStart}>
              <div className={styles.filterRow}>
                {(['all', 'p', 'r', 's'] as const).map(t => (
                  <button key={t} className={`${styles.pill} ${typeFilter === t ? styles.pillActive : ''}`} onClick={() => setType(t)}>
                    {t === 'all' ? 'All' : TYPE_LABEL[t]}
                  </button>
                ))}
              </div>
              <div className={styles.filterRow}>
                <button className={`${styles.pill} ${!lvlFilter ? styles.pillActive : ''}`} onClick={() => setLvl(null)}>All levels</button>
                {[3, 2, 1].map(l => (
                  <button key={l} className={`${styles.pill} ${styles.pillStar} ${lvlFilter === l ? styles.pillStarActive : ''}`} onClick={() => setLvl(lvlFilter === l ? null : l)}>
                    {'★'.repeat(l)}
                  </button>
                ))}
              </div>
              <p className={styles.deckCount}>{filtered.length} cards in deck</p>
              <button className={styles.startBtn} onClick={startFlashcards}>Start Quiz</button>
            </div>
          ) : done ? (
            <div className={styles.flashDone}>
              <div className={styles.doneScore}>✓ {score} / {deck.length}</div>
              <p className={styles.doneMsg}>{score === deck.length ? 'Perfect score!' : score >= deck.length * 0.8 ? 'Great job!' : 'Keep practicing!'}</p>
              <button className={styles.startBtn} onClick={() => setStarted(false)}>New Round</button>
            </div>
          ) : (
            <div className={styles.flashCard}>
              {/* Progress */}
              <div className={styles.progress}>
                <div className={styles.progressBar}>
                  <div className={styles.progressFill} style={{ width: `${(cardIdx / deck.length) * 100}%` }} />
                </div>
                <div className={styles.progressText}>{cardIdx + 1} / {deck.length} · ✓ {score}</div>
              </div>

              {/* Card */}
              <div
                className={`${styles.flipCard} ${flipped ? styles.flipped : ''}`}
                onClick={() => setFlipped(f => !f)}
              >
                <div className={styles.flipInner}>
                  {/* Front */}
                  <div className={styles.flipFront}>
                    <span className={`${styles.badge} ${styles[`badge_${card.t}`]}`}>{TYPE_LABEL[card.t]}</span>
                    <div className={styles.flipWp}>{card.wp}</div>
                    <span className={styles.flipStars}>{'★'.repeat(card.lvl)}</span>
                    <p className={styles.flipHint}>Tap to reveal</p>
                  </div>
                  {/* Back */}
                  <div className={styles.flipBack}>
                    <div className={styles.flipWp}>{card.wp}</div>
                    <div className={styles.flipDef}>{card.d}</div>
                    <div className={styles.flipExamples}>
                      {card.ex.map(([term, def], j) => (
                        <div key={j} className={styles.exPill}>
                          <strong>{term}</strong> — {def}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              {flipped && (
                <div className={styles.flipBtns}>
                  <button className={styles.btnMiss} onClick={next}>✗ Miss</button>
                  <button className={styles.btnGot} onClick={handleGotIt}>✓ Got it</button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
