'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReviewEntry } from '@/lib/review-batches'

type Verdict = 'ok' | 'fix' | null
type Edit = { v: Verdict; fh?: string; fl?: string; fd?: string; n?: string }
type State = Record<string, Edit>

const LVL_FR: Record<number, string> = { 3: 'Essentiel', 2: 'Important', 1: 'Utile' }
const MAX_FD = 260

const FLAG_HELP: Record<string, string> = {
  chiffre:
    "La définition contient un nombre. Vérifiez que ce n'est pas un seuil qui varie selon les pays (à reformuler) plutôt qu'un fait invariable (à garder).",
  phrases: 'La définition semble contenir plus d’une phrase.',
  identique:
    "Le terme français est identique à l'anglais. C'est souvent correct (Palpitation, Migraine) ; vérifiez seulement qu'il ne s'agit pas d'un oubli de traduction.",
  long: `La définition dépasse ${MAX_FD} caractères.`,
}

export default function ReviewClient({
  slug,
  title,
  entries,
  reviewKey,
}: {
  slug: string
  title: string
  entries: ReviewEntry[]
  reviewKey: string
}) {
  const storageKey = `medilexi-fr-review-${slug}`
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
      // Default v to null via the base object, not a leading literal: writing
      // { v: null, ...s[k], ...patch } is a "specified more than once" type
      // error, since both spreads also carry v.
      const prev: Edit = s[k] ?? { v: null }
      return { ...s, [k]: { ...prev, ...patch } }
    })
  }, [])

  const valueOf = (e: ReviewEntry, f: 'fh' | 'fl' | 'fd') => state[e.k]?.[f] ?? e[f]

  const done = useMemo(
    () => entries.filter((e) => state[e.k]?.v).length,
    [entries, state],
  )

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return entries.filter((e) => {
      const s = state[e.k]
      if (filter === 'todo' && s?.v) return false
      if (filter === 'flag' && e.fg.length === 0) return false
      if (filter === 'fix' && s?.v !== 'fix') return false
      if (q && !`${e.k} ${e.fh} ${e.fl}`.toLowerCase().includes(q)) return false
      return true
    })
  }, [entries, state, filter, query])

  const payload = useMemo(
    () =>
      entries.flatMap((e) => {
        const s = state[e.k]
        if (!s || (!s.v && !s.n)) return []
        const row: Record<string, string> = { en_h: e.k, verdict: s.v ?? 'commentaire' }
        if (s.fh !== undefined && s.fh !== e.fh) row.fr_h = s.fh
        if (s.fl !== undefined && s.fl !== e.fl) row.fr_l = s.fl
        if (s.fd !== undefined && s.fd !== e.fd) row.d_fr = s.fd
        if (s.n) row.note = s.n
        return [row]
      }),
    [entries, state],
  )

  async function send() {
    if (payload.length === 0) {
      setSaid('Aucune correction à envoyer pour l’instant.')
      return
    }
    setSending(true)
    setSaid('')
    setFallback('')
    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-review-key': reviewKey },
        body: JSON.stringify({ kind: 'fr_review', batch: title, payload }),
      })
      if (res.ok) {
        setSaid(`Envoyé. ${payload.length} fiche(s) reçue(s). Merci !`)
      } else {
        // Never strand the reviewer's work behind a network error: show the
        // JSON so it can be copied into an email instead.
        setSaid("L'envoi a échoué. Copiez le texte ci-dessous et envoyez-le par courriel.")
        setFallback(JSON.stringify(payload, null, 1))
      }
    } catch {
      setSaid("L'envoi a échoué. Copiez le texte ci-dessous et envoyez-le par courriel.")
      setFallback(JSON.stringify(payload, null, 1))
    } finally {
      setSending(false)
    }
  }

  const pct = entries.length ? Math.round((done / entries.length) * 100) : 0

  // The shell already renders <main>, so this is a plain wrapper. (A JSX
  // comment cannot sit here: {/* */} is only valid inside an element's
  // children, not at the top of a return expression.)
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-2">
      <header>
        <p className="rv-eyebrow">MEDI LEXI · RÉVISION DU FRANÇAIS</p>
        <h1
          className="mt-2 text-3xl"
          style={{ fontFamily: 'var(--b-display)', fontWeight: 600, color: 'var(--b-text)' }}
        >
          {title} · {entries.length} termes
        </h1>
        <p className="mt-3 max-w-[64ch]" style={{ color: 'var(--b-dim)' }}>
          L&apos;anglais d&apos;origine est à gauche, notre français à droite. Corrigez
          directement dans les champs de droite, puis indiquez si la fiche est correcte ou à
          modifier. Votre travail est enregistré dans ce navigateur au fur et à mesure, et
          l&apos;envoi nous le transmet directement.
        </p>

        <details className="b-card mt-5 px-4 py-3">
          <summary className="cursor-pointer font-semibold">
            Nos règles de rédaction (à lire avant de commencer)
          </summary>
          <ul className="mt-3 flex list-disc flex-col gap-2 pl-5 text-[0.92rem]" style={{ color: 'var(--b-dim)' }}>
            <li>
              <b style={{ color: 'var(--b-text)' }}>Français international.</b> Nous visons la
              forme comprise dans toute la francophonie, pas le québécois en particulier. En cas
              de divergence réelle, choisissez la forme internationale et préférez le terme
              francisé à l&apos;anglicisme.
            </li>
            <li>
              <b style={{ color: 'var(--b-text)' }}>Une seule phrase</b> par définition,
              {' '}{MAX_FD} caractères maximum.
            </li>
            <li>
              <b style={{ color: 'var(--b-text)' }}>Aucun seuil chiffré</b> qui varie d&apos;un
              pays à l&apos;autre. Les faits invariables se gardent (46 chromosomes, 28 premiers
              jours de vie).
            </li>
            <li>
              <b style={{ color: 'var(--b-text)' }}>Registre.</b> Le terme clinique est le terme
              principal, le terme courant est celui qu&apos;emploie réellement un patient. Jamais
              l&apos;inverse, et jamais une paraphrase descriptive : s&apos;il n&apos;existe pas
              de vrai mot courant, laissez le champ vide.
            </li>
            <li>
              <b style={{ color: 'var(--b-text)' }}>Traduction fidèle</b> de notre définition
              anglaise. Signalez plutôt que d&apos;inventer si vous n&apos;êtes pas sûr.
            </li>
          </ul>
          <dl className="rv-legend mt-4">
            {Object.entries(FLAG_HELP).map(([tag, help]) => (
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
              ['all', 'Toutes'],
              ['todo', 'À faire'],
              ['flag', 'Signalées'],
              ['fix', 'À corriger'],
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
          placeholder="Rechercher un terme…"
          aria-label="Rechercher un terme"
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
          const fd = valueOf(e, 'fd')
          const over = fd.length > MAX_FD
          return (
            <article
              key={e.k}
              className={`b-card overflow-hidden${s?.v === 'ok' ? ' rv-ok' : ''}${s?.v === 'fix' ? ' rv-fix' : ''}`}
            >
              <div className="flex flex-wrap items-baseline gap-2 px-4 pt-3">
                <span className="rv-idx">{String(i + 1).padStart(2, '0')}</span>
                <span
                  className="text-xl"
                  style={{ fontFamily: 'var(--b-display)', fontWeight: 600 }}
                >
                  {e.k}
                </span>
                <span className="ml-auto flex flex-wrap gap-1.5">
                  <span className={`b-lvl b-lvl--${e.lv}`}>{LVL_FR[e.lv]}</span>
                  {e.fg.map((f) => (
                    <span key={f} className="rv-flag" title={FLAG_HELP[f]}>
                      {f}
                    </span>
                  ))}
                </span>
              </div>

              <div className="rv-pair">
                <div className="rv-src">
                  <span className="rv-slab">Anglais · source</span>
                  <Field label="Terme clinique">
                    <span style={{ fontFamily: 'var(--b-display)', fontSize: '1.05rem' }}>{e.k}</span>
                  </Field>
                  <Field label="Terme courant">
                    {e.el ? e.el : <i style={{ color: 'var(--b-dim)' }}>aucun</i>}
                  </Field>
                  <Field label="Définition">{e.ed}</Field>
                </div>

                <div className="rv-tgt">
                  <span className="rv-slab">Français · à réviser</span>
                  <Field label="Terme clinique">
                    <input
                      className="rv-inp b-focus"
                      style={{ fontFamily: 'var(--b-display)' }}
                      value={valueOf(e, 'fh')}
                      onChange={(ev) => edit(e.k, { fh: ev.target.value, v: 'fix' })}
                    />
                  </Field>
                  <Field label="Terme courant (vide si aucun)">
                    <input
                      className="rv-inp b-focus"
                      value={valueOf(e, 'fl')}
                      onChange={(ev) => edit(e.k, { fl: ev.target.value, v: 'fix' })}
                    />
                  </Field>
                  <Field
                    label="Définition"
                    aside={
                      <span className={`rv-cnt${over ? ' rv-cnt--over' : ''}`}>
                        {fd.length} / {MAX_FD}
                      </span>
                    }
                  >
                    <textarea
                      className="rv-inp b-focus"
                      rows={4}
                      value={fd}
                      onChange={(ev) => edit(e.k, { fd: ev.target.value, v: 'fix' })}
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
                  ✓ Correct
                </button>
                <button
                  type="button"
                  className={`rv-vbtn b-focus${s?.v === 'fix' ? ' rv-vbtn--fix' : ''}`}
                  aria-pressed={s?.v === 'fix'}
                  onClick={() => edit(e.k, { v: s?.v === 'fix' ? null : 'fix' })}
                >
                  ✎ À corriger
                </button>
                <input
                  className="rv-inp b-focus"
                  style={{ flex: '1 1 200px', minWidth: 150 }}
                  placeholder="Commentaire (facultatif)"
                  value={s?.n ?? ''}
                  onChange={(ev) => edit(e.k, { n: ev.target.value })}
                />
              </div>
            </article>
          )
        })}
        {visible.length === 0 && (
          <p className="py-8 text-center" style={{ color: 'var(--b-dim)' }}>
            Aucune fiche ne correspond.
          </p>
        )}
      </div>

      <section className="b-card mt-8 px-5 py-5">
        <h2 className="text-xl" style={{ fontFamily: 'var(--b-display)', fontWeight: 600 }}>
          Envoyer vos corrections
        </h2>
        <p className="mt-2 max-w-[66ch]" style={{ color: 'var(--b-dim)' }}>
          Vous pouvez envoyer plusieurs fois : envoyez un premier lot dès qu&apos;une série de
          fiches est terminée, plutôt que d&apos;attendre la fin. Seules les fiches que vous avez
          modifiées ou jugées sont transmises.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="b-btn b-focus px-5 py-2.5"
            disabled={sending || payload.length === 0}
            onClick={send}
          >
            {sending ? 'Envoi…' : `Envoyer (${payload.length})`}
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
            aria-label="Corrections à copier"
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
