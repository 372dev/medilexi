import Image from 'next/image'
import Link from 'next/link'
import styles from './page.module.css'

const tools = [
  { id: 'glossary', label: 'Glossary', href: '/glossary', live: true },
  { id: 'flashcards', label: 'Flash', href: '/flashcards', live: false },
]

const languages = [
  { code: 'ENG', label: 'ENG', live: true },
  { code: 'KOR', label: 'KOR', live: false },
]

export default function Home() {
  return (
    <main className={styles.page}>

      {/* Hero image */}
      <div className={styles.heroWrap}>
        <Image
          src="/images/hero.jpg"
          alt="Sage's Medical Glossary"
          width={600}
          height={450}
          className={styles.heroImg}
          priority
        />
      </div>

      {/* Navigation grid */}
      <nav className={styles.nav}>
        {languages.map((lang, i) => (
          <div key={lang.code}>
            <div className={styles.langRow}>
              <span className={styles.langBadge}>{lang.label}</span>
              <div className={styles.buttons}>
                {tools.map(tool => {
                  const active = lang.live && tool.live
                  if (active) {
                    return (
                      <Link
                        key={tool.id}
                        href={`${tool.href}?lang=${lang.code.toLowerCase()}`}
                        className={styles.btn}
                      >
                        {tool.label}
                      </Link>
                    )
                  }
                  return (
                    <span key={tool.id} className={styles.btnLocked}>
                      {tool.label}
                    </span>
                  )
                })}
              </div>
            </div>
            {i < languages.length - 1 && <div className={styles.divider} />}
          </div>
        ))}
      </nav>

      <p className={styles.tagline}>your comprehensive guide</p>
    </main>
  )
}
