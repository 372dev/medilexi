'use client'

/* Single hero CTA: smooth-scrolls to the word-parts section and flashes it
   for a moment so the eye lands on it. */

export default function HeroCTA() {
  function go() {
    const el = document.getElementById('word-parts')
    if (!el) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' })
    el.classList.remove('b-flash')
    void el.offsetWidth // restart the animation if the button is clicked again
    el.classList.add('b-flash')
    window.setTimeout(() => el.classList.remove('b-flash'), 1400)
  }

  return (
    <button
      onClick={go}
      className="b-press b-glow inline-flex items-center gap-2 rounded-2xl bg-[var(--b-primary)] px-7 py-3.5 text-[0.95rem] font-bold text-[var(--b-on-prim)]"
    >
      Start with word parts
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
        <path d="M12 5v14M6 13l6 6 6-6" />
      </svg>
    </button>
  )
}
