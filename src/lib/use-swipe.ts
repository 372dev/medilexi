import { useRef, useState } from 'react'
import type { CSSProperties, TouchEvent } from 'react'

/* Tinder-style card drag for the flashcards. The card follows the finger
   (translate + tilt + fade); releasing past the threshold flings it off in that
   direction and fires the action, otherwise it snaps back. Returns a `style` to
   spread on the card, the touch handlers, and a `swiped` ref so the card's
   onClick skips the flip when the gesture was a drag rather than a tap. */

const THRESHOLD = 95   // px of travel that commits to a fling
const ENGAGE = 8       // px before a horizontal drag takes over from a tap/scroll

export function useSwipe(opts: { onLeft?: () => void; onRight?: () => void }) {
  const start = useRef<{ x: number; y: number } | null>(null)
  const active = useRef(false)
  const dx = useRef(0)
  const raf = useRef(0)
  const swiped = useRef(false)
  const [drag, setDrag] = useState<{ x: number; anim: boolean }>({ x: 0, anim: false })

  const style: CSSProperties = {
    transform: drag.x ? `translateX(${drag.x}px) rotate(${drag.x * 0.05}deg)` : undefined,
    opacity: drag.x ? Math.max(0.35, 1 - Math.abs(drag.x) / 650) : undefined,
    transition: drag.anim ? 'transform 0.24s ease, opacity 0.24s ease' : 'none',
    willChange: 'transform',
  }

  return {
    swiped,
    style,
    handlers: {
      onTouchStart: (e: TouchEvent) => {
        start.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
        active.current = false
        dx.current = 0
        swiped.current = false
      },
      onTouchMove: (e: TouchEvent) => {
        const s = start.current
        if (!s) return
        const mx = e.touches[0].clientX - s.x
        const my = e.touches[0].clientY - s.y
        if (!active.current) {
          if (Math.abs(my) > 12 && Math.abs(my) >= Math.abs(mx)) { start.current = null; return }  // vertical: let it scroll
          if (Math.abs(mx) < ENGAGE) return
          active.current = true
        }
        dx.current = mx
        cancelAnimationFrame(raf.current)
        raf.current = requestAnimationFrame(() => setDrag({ x: mx, anim: false }))
      },
      onTouchEnd: () => {
        start.current = null
        cancelAnimationFrame(raf.current)
        if (!active.current) return          // a tap: leave the flip to onClick
        active.current = false
        swiped.current = true                 // a drag: block the tap-flip
        const x = dx.current
        if (Math.abs(x) > THRESHOLD) {
          const dir = x < 0 ? -1 : 1
          const w = typeof window !== 'undefined' ? window.innerWidth : 500
          setDrag({ x: dir * (w + 120), anim: true })
          if (dir > 0) opts.onRight?.()
          else opts.onLeft?.()
          window.setTimeout(() => setDrag({ x: 0, anim: false }), 190)  // recenter on the next card
        } else {
          setDrag({ x: 0, anim: true })       // snap back
        }
      },
    },
  }
}
