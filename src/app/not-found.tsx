import Link from 'next/link'

/* Branded 404. Renders inside ClientShell (the request path is not '/'), so it
   inherits the header and footer; this file supplies only the inner content.
   Built on the --b-* tokens so it reads as part of the redesigned site instead
   of Next's unstyled default. */

const display = { fontFamily: 'var(--b-display)' }

const LINKS = [
  { href: '/medical/glossary', label: 'English glossary' },
  { href: '/medical/wordparts', label: 'Word parts' },
  { href: '/medical/terms', label: 'All terms A to Z' },
]

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[52vh] w-full max-w-[560px] flex-col items-center justify-center gap-6 px-5 py-16 text-center">
      <span className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--b-primary)]">
        Error 404
      </span>

      <h1
        className="m-0 text-[clamp(1.8rem,5vw,2.6rem)] font-semibold leading-[1.1] tracking-[-0.02em]"
        style={display}
      >
        We could not find that page.
      </h1>

      <p className="m-0 max-w-[44ch] text-[1rem] leading-[1.6] text-[var(--b-dim)]">
        The link may be broken, or the page may have moved. Try one of these instead.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-2.5">
        <Link
          href="/medical"
          className="b-press b-focus rounded-xl bg-[var(--b-primary)] px-5 py-2.5 text-[0.88rem] font-bold text-[var(--b-on-prim)]"
        >
          Back to home
        </Link>
        {LINKS.map(l => (
          <Link
            key={l.href}
            href={l.href}
            className="b-press b-focus rounded-xl border border-[var(--b-border)] bg-[var(--b-panel)] px-5 py-2.5 text-[0.88rem] font-semibold text-[var(--b-text)] hover:border-[var(--b-primary)] hover:text-[var(--b-primary)]"
          >
            {l.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
