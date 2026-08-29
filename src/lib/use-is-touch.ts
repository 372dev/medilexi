import { useState, useEffect } from 'react'

// True on touch / coarse-pointer devices (no hover). Starts false so SSR and the
// first paint match the desktop markup, then flips after mount on touch devices.
export function useIsTouch(): boolean {
  const [touch, setTouch] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(hover: none) and (pointer: coarse)')
    const update = () => setTouch(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])
  return touch
}
