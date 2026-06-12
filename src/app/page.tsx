import Image from 'next/image'
import Link from 'next/link'
import styles from './page.module.css'

const nav = [
  {
    lang: 'ENG',
    live: true,
    tools: [
      { label: 'Glossary', href: '/glossary', live: true },
      { label: 'Flashcard',    href: '/flashcards', live: false },
    ]
  },
  {
    lang: 'KOR',
    live: true,
    tools: [
      { label: 'Glossary', href: '/glossary/ko', live: true },
      { label: 'Flashcard',    href: '/flashcards/ko', live: false },
    ]
  },
]

export default function Home() {
  return (
    <main className={styles.page}>
      <div className={styles.heroWrap}>
        <Image src="/images/hero.jpg" alt="Sage's Medical Glossary" width={600} height={450} className={styles.heroImg} priority />
      </div>

      <nav className={styles.nav}>
        {nav.map((row, i) => (
          <div key={row.lang}>
            <div className={styles.langRow}>
              <span className={styles.langBadge}>{row.lang}</span>
              <div className={styles.buttons}>
                {row.tools.map(tool => {
                  const active = row.live && tool.live
                  return active
                    ? <Link key={tool.label} href={tool.href} className={styles.btn}>{tool.label}</Link>
                    : <span key={tool.label} className={styles.btnLocked}>{tool.label}</span>
                })}
              </div>
            </div>
            {i < nav.length - 1 && <div className={styles.divider} />}
          </div>
        ))}
      </nav>

      <p className={styles.tagline}>© 2026 SageMed · All rights reserved</p>
    </main>
  )
}
