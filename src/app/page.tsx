import Link from 'next/link'

/* Community root (interlexi.com/). Placeholder until the terminology workspace
   is built; for now it introduces the platform and points to the live product,
   Medi Lexi, at /medical. Renders inside ClientShell's community branch, so it
   owns its own layout on the shared --b-* theme. */

const display = { fontFamily: 'var(--b-display)' }

const PRODUCTS = [
  {
    href: '/medical',
    tag: 'Medi Lexi',
    title: 'Medical glossary',
    note: '1,900+ terms across English, Korean, and French, with word parts, flashcards, and practice.',
    live: true,
  },
  {
    tag: 'Case Lexi',
    title: 'Law, insurance & finance',
    note: 'A curated glossary for the other side of an interpreter’s caseload.',
    live: false,
  },
]

export default function CommunityHome() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[820px] flex-col justify-center gap-12 px-5 py-20">
      <header className="flex flex-col items-center gap-5 text-center">
        <span className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--b-primary)]">
          For interpreters &amp; translators
        </span>
        <h1
          className="m-0 text-[clamp(2.4rem,7vw,3.6rem)] font-bold leading-[1.02] tracking-[-0.02em]"
          style={display}
        >
          Inter<span className="text-[var(--b-primary)]">Lexi</span>
        </h1>
        <p className="m-0 max-w-[52ch] text-[1.02rem] leading-[1.6] text-[var(--b-dim)]">
          Verified, register-correct terminology across the domains interpreters actually work in.
          A shared terminology workspace is on the way. The first glossary is live now.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {PRODUCTS.map(p => {
          const inner = (
            <>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-[var(--b-primary)]">
                  {p.tag}
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[0.66rem] font-bold uppercase tracking-[0.08em] ${
                    p.live
                      ? 'bg-[color-mix(in_srgb,var(--b-primary)_16%,transparent)] text-[var(--b-primary)]'
                      : 'border border-dashed border-[var(--b-border)] text-[var(--b-dim)]'
                  }`}
                >
                  {p.live ? 'Live' : 'Soon'}
                </span>
              </div>
              <span
                className="text-[1.34rem] font-semibold leading-tight tracking-[-0.008em] text-[var(--b-text)]"
                style={display}
              >
                {p.title}
              </span>
              <span className="text-[0.86rem] leading-[1.6] text-[var(--b-dim)]">{p.note}</span>
            </>
          )
          return p.href ? (
            <Link
              key={p.tag}
              href={p.href}
              className="b-lift flex flex-col gap-2.5 rounded-[20px] border border-[var(--b-border)] bg-[var(--b-panel)] p-6 no-underline transition-colors hover:border-[var(--b-primary)]"
            >
              {inner}
            </Link>
          ) : (
            <div
              key={p.tag}
              className="flex flex-col gap-2.5 rounded-[20px] border border-dashed border-[var(--b-border)] bg-[var(--b-panel)] p-6 opacity-80"
            >
              {inner}
            </div>
          )
        })}
      </section>

      <footer className="border-t border-[var(--b-border)] pt-6 text-center">
        <p className="m-0 text-[0.75rem] text-[var(--b-dim)]">© 2026 Inter Lexi</p>
      </footer>
    </main>
  )
}
