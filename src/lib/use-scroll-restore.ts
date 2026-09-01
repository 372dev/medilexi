import { useEffect, useRef } from 'react'

/* Remember where the user was in a glossary (scroll position + how many cards were
   revealed) so returning after opening a term page lands them back in the same
   spot instead of at the top. Keyed per list; state lives in sessionStorage so it
   survives the navigation but not a fresh tab. */
export function useScrollRestore(
  key: string,
  visible: number,
  setVisible: (fn: (n: number) => number) => void,
  ready: boolean,
) {
  const visibleRef = useRef(visible)
  visibleRef.current = visible
  const restored = useRef(false)

  // Persist on scroll (throttled).
  useEffect(() => {
    let t = 0
    const onScroll = () => {
      if (t) return
      t = window.setTimeout(() => {
        t = 0
        try { sessionStorage.setItem(key, JSON.stringify({ v: visibleRef.current, y: window.scrollY })) } catch {}
      }, 250)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { window.removeEventListener('scroll', onScroll); if (t) window.clearTimeout(t) }
  }, [key])

  // Restore once, after the list is mounted: bump the reveal count so the page is
  // tall enough, then scroll (a couple of attempts as cards/definitions settle).
  useEffect(() => {
    if (!ready || restored.current) return
    restored.current = true
    try {
      const raw = sessionStorage.getItem(key)
      if (!raw) return
      const { v, y } = JSON.parse(raw)
      if (typeof v === 'number' && v > 48) setVisible(n => Math.max(n, v))
      if (typeof y === 'number' && y > 0) {
        const go = () => window.scrollTo(0, y)
        requestAnimationFrame(() => requestAnimationFrame(go))
        window.setTimeout(go, 200)
      }
    } catch {}
  }, [ready, key, setVisible])
}
