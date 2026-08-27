'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

/* When the header's feedback (bug) button routes here with ?to=feedback, scroll
   to the feedback section and glow the form button after a short delay, echoing
   the landing CTA. Renders nothing. */

export default function FeedbackHighlighter() {
  const to = useSearchParams().get('to')

  useEffect(() => {
    if (to !== 'feedback') return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const section = document.getElementById('feedback')
    const btn = document.getElementById('feedback-form')

    // Scroll after ClientShell's on-navigation scroll-to-top has run.
    const t1 = window.setTimeout(() => {
      section?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' })
    }, 140)

    let t2 = 0
    let t3 = 0
    if (!reduce && btn) {
      t2 = window.setTimeout(() => {
        btn.classList.remove('b-flash')
        void btn.offsetWidth // restart the animation on repeat visits
        btn.classList.add('b-flash')
        t3 = window.setTimeout(() => btn.classList.remove('b-flash'), 1400)
      }, 950)
    }

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [to])

  return null
}
