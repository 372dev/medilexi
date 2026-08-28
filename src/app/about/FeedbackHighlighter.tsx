'use client'

import { useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'

/* Scrolls to the feedback section and glows the form button. Triggered two ways:
   arriving from another page with ?to=feedback, or — when already on /about — a
   `medilexi:feedback` window event dispatched by the header's bug button. */

export default function FeedbackHighlighter() {
  const to = useSearchParams().get('to')
  const timers = useRef<number[]>([])

  useEffect(() => {
    const clear = () => { timers.current.forEach(clearTimeout); timers.current = [] }

    const run = () => {
      clear()
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const section = document.getElementById('feedback')
      const btn = document.getElementById('feedback-form')
      timers.current.push(window.setTimeout(() => {
        section?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' })
      }, 140))
      if (!reduce && btn) {
        timers.current.push(window.setTimeout(() => {
          btn.classList.remove('b-flash')
          void btn.offsetWidth
          btn.classList.add('b-flash')
          timers.current.push(window.setTimeout(() => btn.classList.remove('b-flash'), 1400))
        }, 950))
      }
    }

    if (to === 'feedback') run()
    window.addEventListener('medilexi:feedback', run)
    return () => { window.removeEventListener('medilexi:feedback', run); clear() }
  }, [to])

  return null
}
