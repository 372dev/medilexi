import Link from 'next/link'

const rows = [
  {
    lang: 'WORD PARTS',
    accent: 'var(--color-gold)',
    tools: [
      { label: 'Prefix · Root · Suffix', href: '/wordparts',           live: true },
      { label: 'Flashcard',              href: '/wordparts/flashcard',  live: true },
      { label: 'Quiz',                   href: '/wordparts/quiz',       live: true },
    ]
  },
  {
    lang: 'ENGLISH',
    accent: 'var(--color-accent)',
    tools: [
      { label: 'Glossary',  href: '/glossary',   live: true },
      { label: 'Flashcard', href: '/flashcards',  live: true },
    ]
  },
  {
    lang: 'KOREAN',
    accent: '#3BAA6A',
    tools: [
      { label: 'Glossary',  href: '/glossary/ko',   live: true },
      { label: 'Flashcard', href: '/flashcards/ko',  live: true },
    ]
  },
  {
    lang: 'FRENCH',
    accent: '#3B82F6',
    tools: [
      { label: 'Glossary',  href: '/glossary/fr',   live: false },
      { label: 'Flashcard', href: '/flashcards/fr',  live: false },
    ]
  },
]

export default function Home() {
  return (
    <>
      <p style={{ fontFamily:'var(--font-pixel)', fontSize:'0.5rem', color:'var(--color-text-dim)', marginBottom:'0.5rem', letterSpacing:'0.04em', textAlign:'center', lineHeight:1.8 }}>
        Multilingual Medical Glossary
      </p>
      <p style={{ fontSize:'0.88rem', color:'var(--color-text-dim)', lineHeight:1.7, maxWidth:'400px', textAlign:'center', marginBottom:'1.75rem' }}>
        999 medical terms · 408 word parts · for students, medical interpreters &amp; translators · Multilingual support
      </p>
      <nav style={{ width:'100%', maxWidth:'480px', display:'flex', flexDirection:'column', gap:'0.5rem' }}>
        {rows.map((row) => (
          <div key={row.lang} style={{
            display:'flex', alignItems:'center', gap:'1rem',
            padding:'0.75rem 1rem',
            background:'var(--color-panel)',
            border:'1px solid var(--color-border)',
            borderLeft:`3px solid ${row.accent}`,
          }}>
            <span style={{
              fontFamily:'var(--font-pixel)',
              fontSize:'0.45rem',
              color:'var(--color-text-dim)',
              width:'4.5rem',
              flexShrink:0,
              lineHeight:1.8,
              letterSpacing:'0.03em',
            }}>
              {row.lang}
            </span>
            <div style={{ display:'flex', gap:'0.6rem', flexWrap:'wrap' }}>
              {row.tools.map(tool =>
                tool.live
                  ? <Link key={tool.label} href={tool.href} className="c-btn-pixel" style={{ fontSize:'0.5rem' }}>{tool.label}</Link>
                  : <span key={tool.label} className="c-btn-pixel c-btn-pixel--locked" style={{ fontSize:'0.5rem' }}>{tool.label}</span>
              )}
            </div>
          </div>
        ))}
      </nav>
      <div style={{ marginTop:'2rem', textAlign:'center', display:'flex', flexDirection:'column', gap:'0.5rem', alignItems:'center', maxWidth:'480px' }}>
        <p className="site-footer__disclaimer" style={{ textAlign:'center' }}>
          ⚕ For educational purposes only · Not a substitute for professional medical advice, diagnosis, or treatment ·
          Content is based on standard medical terminology references and may not reflect the latest clinical guidelines
        </p>
        <Link href="/about" style={{ fontSize:'0.82rem', color:'var(--color-accent)', textDecoration:'underline' }}>
          About &amp; Sources
        </Link>
        <p className="site-footer__copy">© 2026 Medi Lexi · All rights reserved</p>
      </div>
    </>
  )
}
