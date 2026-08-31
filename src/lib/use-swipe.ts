import { useRef } from 'react'
import type { TouchEvent } from 'react'

// Horizontal swipe detection for the flashcards. Returns touch handlers to spread
// on the card plus a `swiped` ref so the card's onClick can skip the flip when the
// gesture was a swipe rather than a tap. A swipe needs enough horizontal travel
// and to be clearly more horizontal than vertical (so scrolling isn't hijacked).
export function useSwipe(opts: { onLeft?: () => void; onRight?: () => void }) {
  const start = useRef<{ x: number; y: number } | null>(null)
  const swiped = useRef(false)

  return {
    swiped,
    handlers: {
      onTouchStart: (e: TouchEvent) => {
        start.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
        swiped.current = false
      },
      onTouchEnd: (e: TouchEvent) => {
        const s = start.current
        start.current = null
        if (!s) return
        const dx = e.changedTouches[0].clientX - s.x
        const dy = e.changedTouches[0].clientY - s.y
        if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.4) {
          swiped.current = true
          if (dx < 0) opts.onLeft?.()
          else opts.onRight?.()
        }
      },
    },
  }
}
