import Link from 'next/link'

const rows = [
  {
    lang: 'WORD PARTS',
    accent: 'var(--color-gold)',
    tools: [
      { label: 'Prefix · Root · Suffix', href: '/wordparts',           live: true },
      { label: 'Flashcard',              href: '/wordparts/flashcard',  live: true },
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
      <p style={{ fontSize:'0.88rem', color:'var(--color-text-dim)', lineHeight:1.7, maxWidth:'400px', textAlign:'center', marginBottom:'0.75rem' }}>
        844 medical terms · 319 word parts · Korean &amp; French support —
        for students, medical interpreters &amp; translators
      </p>
      <Link href="/about" style={{ fontSize:'0.82rem', color:'var(--color-accent)', textDecoration:'underline', marginBottom:'1.75rem' }}>
        About &amp; Sources
      </Link>
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
      <div style={{ marginTop:'2rem', textAlign:'center', display:'flex', flexDirection:'column', gap:'0.35rem', alignItems:'center' }}>
        <p style={{ fontSize:'0.75rem', color:'var(--color-text-dim)', opacity:0.5, lineHeight:1.6, maxWidth:'400px' }}>
          For educational purposes only · Not a substitute for professional medical advice
        </p>
        <p style={{ fontFamily:'var(--font-pixel)', fontSize:'0.5rem', color:'var(--color-text-dim)', opacity:0.4, lineHeight:1.8 }}>
          © 2026 Medi Lexi · All rights reserved
        </p>
      </div>
    </>
  )
}
