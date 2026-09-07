'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReviewEntry } from '@/lib/review-batches'
import type { ReviewLang } from '@/lib/review-langs'
import { LANG_META } from '@/lib/review-langs'
import { RV_COPY } from '@/lib/review-copy'

type Verdict = 'ok' | 'fix' | null
// Generic target edit: h = head, l = lay, d = definition, n = note.
type Edit = { v: Verdict; h?: string; l?: string; d?: string; n?: string }
type State = Record<string, Edit>

export default function ReviewClient({
  lang,
  slug,
  title,
  entries,
  reviewKey,
}: {
  lang: ReviewLang
  slug: string
  title: string
  entries: ReviewEntry[]
  reviewKey: string
}) {
  const c = RV_COPY[lang]
  const MAX_D = LANG_META[lang].dLimit
  const storageKey = `medilexi-review-${lang}-${slug}`

  const [state, setState] = useState<State>({})
  const [filter, setFilter] = useState<'all' | 'todo' | 'flag' | 'fix'>('all')
  const [query, setQuery] = useState('')
  const [sending, setSending] = useState(false)
  const [said, setSaid] = useState('')
  const [fallback, setFallback] = useState('')

  // Load once on mount. Not during render: localStorage does not exist on the
  // server and reading it there would break hydration.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey)
      if (raw) setState(JSON.parse(raw) as State)
    } catch {
      /* corrupt or unavailable storage just means starting fresh */
    }
  }, [storageKey])

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state))
    } catch {
      /* quota or private mode: the reviewer can still submit */
    }
  }, [state, storageKey])

  const edit = useCallback((k: string, patch: Partial<Edit>) => {
    setState((s) => {
      const prev: Edit = s[k] ?? { v: null }
      return { ...s, [k]: { ...prev, ...patch } }
    })
  }, [])

  // Field getter: the edited value if present, else the original target field.
  const valueOf = (e: ReviewEntry, f: 'h' | 'l' | 'd') => {
    const edited = state[e.k]?.[f]
    if (edited !== undefined) return edited
    return f === 'h' ? e.th : f === 'l' ? e.tl : e.td
  }

  const done = useMemo(() => entries.filter((e) => state[e.k]?.v).length, [entries, state])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return entries.filter((e) => {
      const s = state[e.k]
      if (filter === 'todo' && s?.v) return false
      if (filter === 'flag' && e.fg.length === 0) return false
      if (filter === 'fix' && s?.v !== 'fix') return false
      if (q && !`${e.k} ${e.th} ${e.tl}`.toLowerCase().includes(q)) return false
      return true
    })
  }, [entries, state, filter, query])

  const payload = useMemo(
    () =>
      entries.flatMap((e) => {
        const s = state[e.k]
        if (!s || (!s.v && !s.n)) return []
        const row: Record<string, string> = { en_h: e.k, verdict: s.v ?? 'commentaire' }
        // Neutral field names (h/l/d) so one shape serves every language; the
        // pull script maps them back onto {lang}_h / {lang}_l / d_{lang}.
        if (s.h !== undefined && s.h !== e.th) row.h = s.h
        if (s.l !== undefined && s.l !== e.tl) row.l = s.l
        if (s.d !== undefined && s.d !== e.td) row.d = s.d
        if (s.n) row.note = s.n
        return [row]
      }),
    [entries, state],
  )

  async function send() {
    if (payload.length === 0) {
      setSaid(c.nothingToSend)
      return
    }
    setSending(true)
    setSaid('')
    setFallback('')
    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-review-key': reviewKey },
        body: JSON.stringify({ kind: 'review', lang, batch: slug, payload }),
      })
      if (res.ok) {
        setSaid(`${c.sentPrefix}${payload.length}${c.sentMid}${c.sentSuffix}`)
      } else {
        // Never strand the reviewer's work behind a network error: show the JSON
        // so it can be copied into an email instead.
        setSaid(c.sendFailed)
        setFallback(JSON.stringify(payload, null, 1))
      }
    } catch {
      setSaid(c.sendFailed)
      setFallback(JSON.stringify(payload, null, 1))
    } finally {
      setSending(false)
    }
  }

  const pct = entries.length ? Math.round((done / entries.length) * 100) : 0

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-2">
      <header>
        <p className="rv-eyebrow">{c.eyebrow}</p>
        <h1 className="mt-2 text-3xl" style={{ fontFamily: 'var(--b-display)', fontWeight: 600, color: 'var(--b-text)' }}>
          {title} · {entries.length} {c.termsWord}
        </h1>
        <p className="mt-3 max-w-[64ch]" style={{ color: 'var(--b-dim)' }}>
          {c.intro}
        </p>

        <details className="b-card mt-5 px-4 py-3">
          <summary className="cursor-pointer font-semibold">{c.rulesSummary}</summary>
          <ul className="mt-3 flex list-disc flex-col gap-2 pl-5 text-[0.92rem]" style={{ color: 'var(--b-dim)' }}>
            {c.rules.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
          <dl className="rv-legend mt-4">
            {Object.entries(c.flagHelp).map(([tag, help]) => (
              <div key={tag} className="contents">
                <dt>
                  <span className="rv-flag">{tag}</span>
                </dt>
                <dd style={{ color: 'var(--b-dim)' }}>{help}</dd>
              </div>
            ))}
          </dl>
        </details>
      </header>

      <div className="rv-bar mt-6 flex flex-wrap items-center gap-2 py-3">
        <div className="flex flex-wrap gap-1.5">
          {(
            [
              ['all', c.filters.all],
              ['todo', c.filters.todo],
              ['flag', c.filters.flag],
              ['fix', c.filters.fix],
            ] as const
          ).map(([f, label]) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              aria-pressed={filter === f}
              className={`b-fpill b-focus${filter === f ? ' b-fpill--active' : ''}`}
            >
              {label}
            </button>
          ))}
        </div>
        <input
          type="search"
          className="b-search b-focus"
          style={{ flex: '1 1 180px', minWidth: 150, width: 'auto' }}
          placeholder={c.searchPlaceholder}
          aria-label={c.searchPlaceholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <span className="rv-prog">
          {done} / {entries.length}
          <span className="rv-track">
            <span className="rv-fill" style={{ width: `${pct}%` }} />
          </span>
        </span>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {visible.map((e, i) => {
          const s = state[e.k]
          const d = valueOf(e, 'd')
          const over = d.length > MAX_D
          return (
            <article
              key={e.k}
              className={`b-card overflow-hidden${s?.v === 'ok' ? ' rv-ok' : ''}${s?.v === 'fix' ? ' rv-fix' : ''}`}
            >
              <div className="flex flex-wrap items-baseline gap-2 px-4 pt-3">
                <span className="rv-idx">{String(i + 1).padStart(2, '0')}</span>
                <span className="text-xl" style={{ fontFamily: 'var(--b-display)', fontWeight: 600 }}>
                  {e.k}
                </span>
                <span className="ml-auto flex flex-wrap gap-1.5">
                  <span className={`b-lvl b-lvl--${e.lv}`}>{c.levels[e.lv]}</span>
                  {e.fg.map((f) => (
                    <span key={f} className="rv-flag" title={c.flagHelp[f]}>
                      {f}
                    </span>
                  ))}
                </span>
              </div>

              {e.cn && (
                <div
                  className="mx-4 mt-2 rounded-lg border-l-[3px] border-[var(--b-amber)] bg-[var(--b-raised)] px-3 py-2 text-[0.9rem] leading-relaxed"
                  style={{ color: 'var(--b-text)' }}
                >
                  <span className="font-semibold text-[var(--b-amber)]">{c.check} </span>
                  {e.cn}
                </div>
              )}

              <div className="rv-pair">
                <div className="rv-src">
                  <span className="rv-slab">{c.sourceLabel}</span>
                  <Field label={c.fClinical}>
                    <span style={{ fontFamily: 'var(--b-display)', fontSize: '1.05rem' }}>{e.k}</span>
                  </Field>
                  <Field label={c.fLay}>
                    {e.el ? e.el : <i style={{ color: 'var(--b-dim)' }}>{c.fLayNone}</i>}
                  </Field>
                  <Field label={c.fDef}>{e.ed}</Field>
                </div>

                <div className="rv-tgt">
                  <span className="rv-slab">{c.targetLabel}</span>
                  <Field label={c.fClinicalTgt}>
                    <input
                      className="rv-inp b-focus"
                      style={{ fontFamily: 'var(--b-display)' }}
                      value={valueOf(e, 'h')}
                      onChange={(ev) => edit(e.k, { h: ev.target.value, v: 'fix' })}
                    />
                  </Field>
                  <Field label={c.fLayTgt}>
                    <input
                      className="rv-inp b-focus"
                      value={valueOf(e, 'l')}
                      onChange={(ev) => edit(e.k, { l: ev.target.value, v: 'fix' })}
                    />
                  </Field>
                  <Field
                    label={c.fDef}
                    aside={<span className={`rv-cnt${over ? ' rv-cnt--over' : ''}`}>{d.length} / {MAX_D}</span>}
                  >
                    <textarea
                      className="rv-inp b-focus"
                      rows={4}
                      value={d}
                      onChange={(ev) => edit(e.k, { d: ev.target.value, v: 'fix' })}
                    />
                  </Field>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 border-t px-4 py-3" style={{ borderColor: 'var(--b-border)' }}>
                <button
                  type="button"
                  className={`rv-vbtn b-focus${s?.v === 'ok' ? ' rv-vbtn--ok' : ''}`}
                  aria-pressed={s?.v === 'ok'}
                  onClick={() => edit(e.k, { v: s?.v === 'ok' ? null : 'ok' })}
                >
                  {c.correct}
                </button>
                <button
                  type="button"
                  className={`rv-vbtn b-focus${s?.v === 'fix' ? ' rv-vbtn--fix' : ''}`}
                  aria-pressed={s?.v === 'fix'}
                  onClick={() => edit(e.k, { v: s?.v === 'fix' ? null : 'fix' })}
                >
                  {c.toFix}
                </button>
                <input
                  className="rv-inp b-focus"
                  style={{ flex: '1 1 200px', minWidth: 150 }}
                  placeholder={c.notePlaceholder}
                  value={s?.n ?? ''}
                  onChange={(ev) => edit(e.k, { n: ev.target.value })}
                />
              </div>
            </article>
          )
        })}
        {visible.length === 0 && (
          <p className="py-8 text-center" style={{ color: 'var(--b-dim)' }}>
            {c.noMatch}
          </p>
        )}
      </div>

      <section className="b-card mt-8 px-5 py-5">
        <h2 className="text-xl" style={{ fontFamily: 'var(--b-display)', fontWeight: 600 }}>
          {c.submitTitle}
        </h2>
        <p className="mt-2 max-w-[66ch]" style={{ color: 'var(--b-dim)' }}>
          {c.submitIntro}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="b-btn b-focus px-5 py-2.5"
            disabled={sending || payload.length === 0}
            onClick={send}
          >
            {sending ? c.sending : `${c.submitBtn} (${payload.length})`}
          </button>
          <span role="status" aria-live="polite" style={{ color: 'var(--b-primary)', fontWeight: 600 }}>
            {said}
          </span>
        </div>
        {fallback && (
          <textarea
            readOnly
            className="rv-inp mt-3 w-full font-mono text-xs"
            rows={8}
            value={fallback}
            onFocus={(e) => e.currentTarget.select()}
            aria-label={c.submitTitle}
          />
        )}
      </section>
    </div>
  )
}

function Field({
  label,
  aside,
  children,
}: {
  label: string
  aside?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="mb-3 last:mb-0">
      <span className="rv-flab">
        {label}
        {aside}
      </span>
      <div className="text-[0.94rem] leading-relaxed">{children}</div>
    </div>
  )
}
