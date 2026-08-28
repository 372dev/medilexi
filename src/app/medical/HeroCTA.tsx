'use client'

/* Single hero CTA: smooth-scrolls to the word-parts section, then (after the
   scroll settles) glows the card and cascades a glow across its four buttons
   in order, so the eye is led from the section down into the first steps. */

function flash(node: Element, cls: 'b-flash' | 'b-flash-sm', dur: number) {
  node.classList.remove(cls)
  void (node as HTMLElement).offsetWidth // restart the animation on repeat clicks
  node.classList.add(cls)
  window.setTimeout(() => node.classList.remove(cls), dur)
}

export default function HeroCTA() {
  function go() {
    const el = document.getElementById('word-parts')
    if (!el) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' })
    if (reduce) return // animations are disabled, so skip the glow choreography

    const CARD_DELAY = 520 // let the smooth scroll get going before the card glows
    window.setTimeout(() => flash(el, 'b-flash', 1400), CARD_DELAY)

    el.querySelectorAll('[data-wp-glow]').forEach((btn, i) => {
      window.setTimeout(() => flash(btn, 'b-flash-sm', 1000), CARD_DELAY + 720 + i * 260)
    })
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
