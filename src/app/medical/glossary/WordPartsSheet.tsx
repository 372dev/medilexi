'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { LVL_TEXT } from '@/lib/vocab-constants'
import type { Segment } from '@/lib/word-segments'

/* Mobile bottom sheet: opened when a glossary term is tapped on a touch device.
   Shows the term's word-part breakdown (reusing the fetched segments), plus the
   definition and, for the KO/FR lists, the translation. Dismiss by tapping the
   scrim, the close button, Escape, or dragging the sheet down. Shared by the
   English, Korean, and French glossary lists. */

export interface SheetData {
  en_h: string
  slug: string
  segs: Segment[] | null
  d: string
  lvl: number
  f: string[]
  en_l?: string
  head2?: string        // translation headword (ko_h / fr_h)
  sub2?: string         // translation lay term (ko_l / fr_l)
  def2?: string         // translated definition (d_ko / d_fr)
  lang2?: string        // 'ko' | 'fr' for the translation block
}

const TYPE_LABEL: Record<string, string> = { p: 'Prefix', r: 'Root', s: 'Suffix' }

export default function WordPartsSheet({ data, onClose }: { data: SheetData | null; onClose: () => void }) {
  const [open, setOpen] = useState(false)
  const [dragY, setDragY] = useState(0)
  const dragging = useRef(false)
  const startY = useRef(0)

  useEffect(() => {
    if (!data) return
    const id = requestAnimationFrame(() => setOpen(true))
    return () => cancelAnimationFrame(id)
  }, [data])

  useEffect(() => {
    if (!data) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  function close() {
    setOpen(false)
    setTimeout(onClose, 240)
  }

  if (!data) return null

  const parts = (data.segs ?? []).filter(s => s.wp)
  const hasSegs = !!data.segs?.some(s => s.wp)
  const translateY = open ? dragY : 520

  return (
    <div
      className="fixed inset-0 z-[300] flex items-end justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={`${data.en_h} details`}
    >
      <div
        className="absolute inset-0 bg-black/40 transition-opacity duration-200"
        style={{ opacity: open ? 1 : 0 }}
        onClick={close}
      />
      <div
        className="relative w-full max-w-[520px] rounded-t-[22px] border-t border-[var(--b-border)] bg-[var(--b-panel)] px-5 pb-7 pt-2.5"
        style={{
          transform: `translateY(${translateY}px)`,
          transition: dragging.current ? 'none' : 'transform 240ms cubic-bezier(0.22,1,0.36,1)',
          maxHeight: '86vh',
          overflowY: 'auto',
        }}
        onTouchStart={e => { dragging.current = e.currentTarget.scrollTop <= 0; startY.current = e.touches[0].clientY }}
        onTouchMove={e => {
          if (!dragging.current) return
          const dy = e.touches[0].clientY - startY.current
          if (dy > 0) setDragY(dy)
        }}
        onTouchEnd={() => {
          dragging.current = false
          if (dragY > 90) close()
          else setDragY(0)
        }}
      >
        <div className="mx-auto mb-3.5 h-1 w-9 rounded-full bg-[var(--b-border)]" />

        <div
          className="text-[1.7rem] font-bold leading-none tracking-[-0.01em] text-[var(--b-text)]"
          style={{ fontFamily: 'var(--b-display)' }}
        >
          {hasSegs
            ? data.segs!.map((s, i) => s.wp
                ? <span key={i} className={`b-part--${s.type}`}>{s.text}</span>
                : <span key={i}>{s.text}</span>)
            : data.en_h}
        </div>

        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          <span className={`b-lvl b-lvl--${data.lvl}`}>{LVL_TEXT[data.lvl]}</span>
          {data.f.map(f => <span key={f} className="b-chip">{f}</span>)}
        </div>

        {data.en_l && <div className="mt-2 text-[0.95rem] text-[var(--b-dim)]">Also called {data.en_l}</div>}

        <p className="mt-3 text-[0.9rem] leading-[1.55] text-[var(--b-text)]">{data.d}</p>

        {(data.head2 || data.def2) && (
          <div className="mt-3 rounded-xl border border-[var(--b-border)] bg-[var(--b-raised)] p-3" lang={data.lang2}>
            {data.head2 && (
              <div className="text-[1.05rem] font-semibold text-[var(--b-text)]">
                {data.head2}
                {data.sub2 && <span className="ml-2 text-[0.9rem] font-normal text-[var(--b-dim)]">({data.sub2})</span>}
              </div>
            )}
            {data.def2 && <div className="mt-1 text-[0.84rem] leading-[1.5] text-[var(--b-dim)]">{data.def2}</div>}
          </div>
        )}

        {parts.length > 0 && (
          <>
            <div className="mb-1.5 mt-4 text-[0.7rem] font-bold uppercase tracking-[0.08em] text-[var(--b-dim)]">
              Word parts
            </div>
            <div className="flex flex-col">
              {parts.map((s, i) => (
                <div key={i} className={`flex items-center gap-3 py-2 ${i ? 'border-t border-[var(--b-border)]' : ''}`}>
                  <code
                    className={`b-part--${s.type} min-w-[62px] text-[0.95rem] font-semibold`}
                    style={{ fontFamily: 'var(--b-display)' }}
                  >
                    {s.wp}
                  </code>
                  <span className={`b-badge b-badge--${s.type}`}>{TYPE_LABEL[s.type!]}</span>
                  <span className="text-[0.9rem] text-[var(--b-text)]">{s.meaning}</span>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="mt-4 flex items-center justify-between border-t border-[var(--b-border)] pt-3">
          <Link href={`/medical/term/${data.slug}`} className="b-focus text-[0.86rem] font-semibold text-[var(--b-primary)]">
            See full entry →
          </Link>
          <button
            onClick={close}
            aria-label="Close"
            className="b-focus rounded-full p-1.5 text-[var(--b-dim)] hover:text-[var(--b-text)]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
