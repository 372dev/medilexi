import { useState, useRef, useCallback } from 'react'

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

  // Restart from the top when the query/filters change. Adjusted during render
  // so there's no intermediate frame showing the old (larger) slice.
  if (resetKey !== prevKey) {
    setPrevKey(resetKey)
    setVisible(initial)
  }

  // Latest total, read by the observer callback without recreating it.
  const totalRef = useRef(total)
  totalRef.current = total

  const observerRef = useRef<IntersectionObserver | null>(null)

  // Callback ref: (re)attach the observer the moment the sentinel node mounts.
  // This is robust to the node appearing *after* a skeleton / Suspense fallback —
  // an effect keyed on `total` would miss that, since `total` doesn't change on
  // mount, so the observer would never attach until the first search changed it.
  const sentinelRef = useCallback((node: HTMLDivElement | null) => {
    observerRef.current?.disconnect()
    if (!node) return
    observerRef.current = new IntersectionObserver(
      entries => { if (entries[0].isIntersecting) setVisible(v => Math.min(v + step, totalRef.current)) },
      { rootMargin: '600px' },
    )
    observerRef.current.observe(node)
  }, [step])

  return { visible, sentinelRef }
}
