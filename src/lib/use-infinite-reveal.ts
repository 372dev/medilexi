import { useState, useEffect, useRef } from 'react'

/**
 * Progressive "infinite reveal" for long card lists. The caller still filters the
 * whole dataset (search stays 100% complete); this only caps how many cards are
 * painted, growing the count in `step` batches as a sentinel scrolls near the
 * viewport. Newly-mounted cards run their CSS entrance animation, so each batch
 * fades in — no "show more" button.
 *
 * `resetKey` should change when the query/filters change (pass the memoized
 * `filtered` array reference) so the list restarts from the top.
 */
export function useInfiniteReveal(total: number, resetKey: unknown, initial = 48, step = 24) {
  const [visible, setVisible] = useState(initial)
  const [prevKey, setPrevKey] = useState(resetKey)
  const sentinelRef = useRef<HTMLDivElement>(null)

  // Restart from the top when the query/filters change. Adjusted during render
  // so there's no intermediate frame showing the old (larger) slice.
  if (resetKey !== prevKey) {
    setPrevKey(resetKey)
    setVisible(initial)
  }

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const io = new IntersectionObserver(
      entries => { if (entries[0].isIntersecting) setVisible(v => Math.min(v + step, total)) },
      { rootMargin: '600px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [total, step])

  return { visible, sentinelRef }
}
