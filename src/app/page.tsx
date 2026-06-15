import Link from 'next/link'

const rows = [
  {
    lang: 'WORD PARTS',
    tools: [
      { label: 'Prefix · Root · Suffix', href: '/wordparts',           live: true },
      { label: 'Flashcard',              href: '/wordparts/flashcard',  live: true },
    ]
  },
  {
    lang: 'ENGLISH',
    tools: [
      { label: 'Glossary',  href: '/glossary',   live: true },
      { label: 'Flashcard', href: '/flashcards',  live: true },
    ]
  },
  {
    lang: 'KOREAN',
    tools: [
      { label: 'Glossary',  href: '/glossary/ko',   live: true },
      { label: 'Flashcard', href: '/flashcards/ko',  live: true },
    ]
  },
]

export default function Home() {
  return (
    <>
      <p style={{ fontFamily:'var(--font-pixel)', fontSize:'0.5rem', color:'var(--color-text-dim)', marginBottom:'0.75rem', letterSpacing:'0.04em', textAlign:'center', lineHeight:1.8 }}>
        Multilingual Medical Glossary
      </p>
      <p style={{ fontSize:'0.88rem', color:'var(--color-text-dim)', lineHeight:1.7, maxWidth:'400px', textAlign:'center', marginBottom:'2rem' }}>
        844 medical terms · 319 word parts · Korean bilingual support —
        for students, medical interpreters &amp; translators
      </p>
      <nav style={{ width:'100%', maxWidth:'480px', display:'flex', flexDirection:'column', gap:'1rem' }}>
        {rows.map((row, i) => (
          <div key={row.lang}>
            <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
              {/* Language label — styled as plain text tag, not a button */}
              <span style={{
                fontFamily:'var(--font-pixel)',
                fontSize:'0.5rem',
                color:'var(--color-gold)',
                border:'1px solid var(--color-gold-dim)',
                padding:'0.35rem 0.5rem',
                width:'5.5rem',
                textAlign:'center',
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
            {i < rows.length - 1 && (
              <div style={{
                width:'100%', height:'2px', margin:'1rem 0 0',
                background:'repeating-linear-gradient(90deg,var(--color-border) 0px,var(--color-border) 6px,transparent 6px,transparent 12px)'
              }} />
            )}
          </div>
        ))}
      </nav>
      <div style={{ marginTop:'2.5rem', textAlign:'center', opacity:0.6, display:'flex', flexDirection:'column', gap:'0.4rem', alignItems:'center' }}>
        <p style={{ fontSize:'0.78rem', color:'var(--color-text-dim)', lineHeight:1.6, maxWidth:'400px' }}>
          For educational purposes only · Not a substitute for professional medical advice
        </p>
        <Link href="/about" style={{ fontSize:'0.82rem', color:'var(--color-accent)', textDecoration:'underline' }}>
          About &amp; Sources
        </Link>
        <p style={{ fontFamily:'var(--font-pixel)', fontSize:'0.5rem', color:'var(--color-text-dim)', lineHeight:1.8 }}>
          © 2026 Medi Lexi · All rights reserved
        </p>
      </div>
    </>
  )
}
