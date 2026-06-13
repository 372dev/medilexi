import Link from 'next/link'

const rows = [
  {
    lang: 'WORD PARTS',
    tools: [
      { label: 'Prefix · Root · Suffix', href: '/wordparts',            live: true },
      { label: 'Flashcard',              href: '/wordparts/flashcard', live: true },
    ]
  },
  {
    lang: 'ENGLISH',
    tools: [
      { label: 'Glossary',   href: '/glossary',   live: true },
      { label: 'Flashcard',  href: '/flashcards', live: false },
    ]
  },
  {
    lang: 'KOREAN',
    tools: [
      { label: 'Glossary',   href: '/glossary/ko',   live: true },
      { label: 'Flashcard',  href: '/flashcards/ko', live: false },
    ]
  },
]

export default function Home() {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', paddingTop:'2rem', paddingBottom:'4rem' }}>
      <nav style={{ width:'100%', maxWidth:'560px', display:'flex', flexDirection:'column', gap:'1.25rem' }}>
        {rows.map((row, i) => (
          <div key={row.lang}>
            <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
              <span className="c-btn-pixel c-btn-pixel--locked" style={{ width:'5.5rem', textAlign:'center', cursor:'default', fontSize:'0.42rem', lineHeight:1.8 }}>
                {row.lang}
              </span>
              <div style={{ display:'flex', gap:'0.75rem', flexWrap:'wrap' }}>
                {row.tools.map(tool =>
                  tool.live
                    ? <Link key={tool.label} href={tool.href} className="c-btn-pixel" style={{ fontSize:'0.48rem' }}>{tool.label}</Link>
                    : <span key={tool.label} className="c-btn-pixel c-btn-pixel--locked" style={{ fontSize:'0.48rem' }}>{tool.label}</span>
                )}
              </div>
            </div>
            {i < rows.length - 1 && (
              <div style={{
                width:'100%', height:'2px', margin:'1.25rem 0 0',
                background:'repeating-linear-gradient(90deg,var(--color-border) 0px,var(--color-border) 6px,transparent 6px,transparent 12px)'
              }} />
            )}
          </div>
        ))}
      </nav>
      <p style={{ marginTop:'3rem', fontFamily:'var(--font-pixel)', fontSize:'0.5rem', color:'var(--color-text-dim)' }}>
        © 2026 SageMed · All rights reserved
      </p>
    </div>
  )
}
