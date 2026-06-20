import React from 'react'
import Link from 'next/link'

const outline = (color: string): React.CSSProperties => ({
  display: 'block',
  fontFamily: 'var(--font-pixel)',
  fontSize: '0.5rem',
  padding: '0.38rem 0.9rem',
  border: `1px solid ${color}`,
  background: 'transparent',
  color,
  textDecoration: 'none',
  lineHeight: 2,
  letterSpacing: '0.03em',
  textAlign: 'center',
})

const tileBase = (accentColor: string): React.CSSProperties => ({
  background: 'var(--color-panel)',
  borderTop: `3px solid ${accentColor}`,
  borderRight: '1px solid var(--color-border)',
  borderBottom: '1px solid var(--color-border)',
  borderLeft: '1px solid var(--color-border)',
  padding: '1rem 1.2rem',
})

export default function Home() {
  return (
    <>
      <p style={{ fontFamily:'var(--font-pixel)', fontSize:'0.5rem', color:'var(--color-text-dim)', marginBottom:'0.5rem', letterSpacing:'0.04em', textAlign:'center', lineHeight:1.8 }}>
        Multilingual Medical Glossary
      </p>
      <p style={{ fontSize:'0.88rem', color:'var(--color-text-dim)', lineHeight:1.7, maxWidth:'460px', textAlign:'center', marginBottom:'1.75rem' }}>
        999 medical terms · 408 word parts · for students, medical interpreters &amp; translators
      </p>

      <nav style={{ width:'100%', maxWidth:'520px', display:'flex', flexDirection:'column', gap:'0.65rem' }}>

        {/* ── WORD PARTS ── featured tile */}
        <div style={tileBase('var(--color-gold)')}>
          <div style={{ fontFamily:'var(--font-pixel)', fontSize:'0.45rem', color:'var(--color-gold)', letterSpacing:'0.1em', marginBottom:'0.25rem' }}>
            WORD PARTS
          </div>
          <div style={{ fontSize:'1rem', color:'var(--color-text)', marginBottom:'0.15rem' }}>Prefix · Root · Suffix</div>
          <div style={{ fontSize:'0.82rem', color:'var(--color-text-dim)', marginBottom:'0.85rem' }}>
            408 entries · Build medical vocabulary from the ground up
          </div>
          <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap' }}>
            <Link href="/wordparts" style={outline('var(--color-gold)')}>Glossary</Link>
            <Link href="/wordparts/flashcard" style={outline('var(--color-gold)')}>Flashcard</Link>
            <Link href="/wordparts/quiz" className="c-btn-pixel" style={{ fontSize:'0.5rem' }}>Quiz ✦</Link>
          </div>
        </div>

        {/* ── ENGLISH + KOREAN ── 2-col grid */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.65rem' }}>

          <div style={tileBase('var(--color-accent)')}>
            <div style={{ fontFamily:'var(--font-pixel)', fontSize:'0.45rem', color:'var(--color-accent)', letterSpacing:'0.1em', marginBottom:'0.25rem' }}>
              ENGLISH
            </div>
            <div style={{ fontSize:'0.95rem', color:'var(--color-text)', marginBottom:'0.15rem' }}>English</div>
            <div style={{ fontSize:'0.78rem', color:'var(--color-text-dim)', marginBottom:'0.85rem' }}>999 clinical terms</div>
            <div style={{ display:'flex', flexDirection:'column', gap:'0.4rem' }}>
              <Link href="/glossary" style={outline('var(--color-accent)')}>Glossary</Link>
              <Link href="/flashcards" style={outline('var(--color-accent)')}>Flashcard</Link>
            </div>
          </div>

          <div style={tileBase('#3BAA6A')}>
            <div style={{ fontFamily:'var(--font-pixel)', fontSize:'0.45rem', color:'#3BAA6A', letterSpacing:'0.1em', marginBottom:'0.25rem' }}>
              KOREAN
            </div>
            <div style={{ fontSize:'0.95rem', color:'var(--color-text)', marginBottom:'0.15rem' }}>한국어</div>
            <div style={{ fontSize:'0.78rem', color:'var(--color-text-dim)', marginBottom:'0.85rem' }}>Bilingual · EN↔KO</div>
            <div style={{ display:'flex', flexDirection:'column', gap:'0.4rem' }}>
              <Link href="/glossary/ko" style={outline('#3BAA6A')}>Glossary</Link>
              <Link href="/flashcards/ko" style={outline('#3BAA6A')}>Flashcard</Link>
            </div>
          </div>

        </div>

        {/* ── FRENCH ── coming soon */}
        <div style={{ ...tileBase('#3B82F6'), borderRight:'1px dashed var(--color-border)', borderBottom:'1px dashed var(--color-border)', borderLeft:'1px dashed var(--color-border)', opacity:0.45 }}>
          <div style={{ fontFamily:'var(--font-pixel)', fontSize:'0.45rem', color:'#3B82F6', letterSpacing:'0.1em', marginBottom:'0.25rem' }}>
            FRENCH · COMING SOON
          </div>
          <div style={{ fontSize:'0.9rem', color:'var(--color-text)' }}>Français</div>
        </div>

      </nav>

      <div style={{ marginTop:'2rem', textAlign:'center', display:'flex', flexDirection:'column', gap:'0.5rem', alignItems:'center', maxWidth:'520px' }}>
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
