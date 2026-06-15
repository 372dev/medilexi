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
      <p style={{ fontFamily:'var(--font-pixel)', fontSize:'0.38rem', color:'var(--color-text-dim)', marginBottom:'1.5rem', letterSpacing:'0.04em', textAlign:'center' }}>
        Multilingual Glossary
      </p>
      <nav style={{ width:'100%', maxWidth:'480px', display:'flex', flexDirection:'column', gap:'1rem' }}>
        {rows.map((row, i) => (
          <div key={row.lang}>
            <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
              {/* Language label — styled as plain text tag, not a button */}
              <span style={{
                fontFamily:'var(--font-pixel)',
                fontSize:'0.42rem',
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
                    ? <Link key={tool.label} href={tool.href} className="c-btn-pixel" style={{ fontSize:'0.46rem' }}>{tool.label}</Link>
                    : <span key={tool.label} className="c-btn-pixel c-btn-pixel--locked" style={{ fontSize:'0.46rem' }}>{tool.label}</span>
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
      <p style={{ marginTop:'2.5rem', fontFamily:'var(--font-pixel)', fontSize:'0.5rem', color:'var(--color-text-dim)' }}>
        © 2026 Medi Lexi · All rights reserved
      </p>
    </>
  )
}
