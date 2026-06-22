import koData from '@/data/medical_vocab_ko.json'

const multilingualCount = (koData as { d_ko?: string }[]).filter(k => !!k.d_ko).length

const H2: React.CSSProperties = {
  fontFamily: 'var(--font-pixel)',
  fontSize: '0.6rem',
  color: 'var(--color-text)',
  lineHeight: 2.2,
  marginBottom: '0.75rem',
  borderLeft: '3px solid var(--color-gold)',
  paddingLeft: '0.75rem',
}

const PROSE: React.CSSProperties = {
  fontSize: '0.95rem',
  color: 'var(--color-text-dim)',
  lineHeight: 1.75,
  marginBottom: '0.75rem',
}

const STATS = [
  { n: '999',                       label: 'Medical Terms',        sub: '20+ clinical specialties' },
  { n: '408',                      label: 'Word Parts',           sub: 'Prefix · Root · Suffix' },
  { n: String(multilingualCount),  label: 'Multilingual Entries', sub: 'with full definitions' },
]

const AUDIENCES = [
  ['Students',               'Medical, nursing, and health sciences students building clinical vocabulary for exams, rotations, and licensing.'],
  ['Medical Interpreters',   'Accurate Korean–English terminology for oral interpretation in clinical and healthcare settings.'],
  ['Medical Translators',    'Reference and study tool for written translation of medical documents, records, and literature.'],
]

const LEVELS = [
  ['⭐⭐⭐ Essential',  'var(--color-gold)',   'Core terms encountered in everyday clinical settings.'],
  ['⭐⭐ Important',    'var(--color-accent)', 'Commonly seen in specific specialties or rotations.'],
  ['⭐ Good to know',  'var(--color-border)', 'Less frequent but useful for thorough comprehension.'],
]

export default function AboutPage() {
  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', padding: '1.5rem 0 4rem' }}>

      {/* ── Intro ── */}
      <div style={{ marginBottom: '2.5rem', paddingBottom: '1.5rem', borderBottom: '2px solid var(--color-border)' }}>
        <h1 style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.75rem', color: 'var(--color-gold)', lineHeight: 2.2, marginBottom: '1rem' }}>
          About Medi Lexi
        </h1>
        <p style={{ ...PROSE, marginBottom: 0 }}>
          Medi Lexi is a multilingual medical terminology reference and study platform for students,
          medical interpreters &amp; translators. It combines a structured glossary with interactive
          learning tools including flashcards and word-part breakdowns.
        </p>
      </div>

      {/* ── Stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '2.5rem' }}>
        {STATS.map(({ n, label, sub }) => (
          <div key={label} style={{ background: 'var(--color-panel)', border: '1px solid var(--color-border)', padding: '1rem 0.75rem', textAlign: 'center', boxShadow: '2px 2px 0 0 rgba(150,140,255,0.2)' }}>
            <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '1rem', color: 'var(--color-gold)', lineHeight: 1.6, marginBottom: '0.3rem' }}>{n}</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.15rem' }}>{label}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-dim)' }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* ── Who is it for ── */}
      <section style={{ marginBottom: '2rem' }}>
        <h2 style={H2}>Who Is It For?</h2>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {AUDIENCES.map(([who, what]) => (
            <li key={who} style={{ ...PROSE, marginBottom: 0, paddingLeft: '1rem', borderLeft: '2px solid var(--color-border)' }}>
              <strong style={{ color: 'var(--color-text)' }}>{who}</strong>
              {' — '}{what}
            </li>
          ))}
        </ul>
      </section>

      {/* ── Level system ── */}
      <section style={{ marginBottom: '2rem' }}>
        <h2 style={H2}>Importance Levels</h2>
        <p style={PROSE}>Each term is assigned one of three levels to guide study priority:</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {LEVELS.map(([lvl, color, desc]) => (
            <div key={lvl} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', padding: '0.6rem 0.75rem', background: 'var(--color-panel)', borderLeft: `3px solid ${color}` }}>
              <span style={{ fontSize: '0.85rem', whiteSpace: 'nowrap', minWidth: '130px', color: 'var(--color-text)' }}>{lvl}</span>
              <span style={{ fontSize: '0.88rem', color: 'var(--color-text-dim)', lineHeight: 1.6 }}>{desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Data & Sources ── */}
      <section style={{ marginBottom: '2rem' }}>
        <h2 style={H2}>Data &amp; Sources</h2>
        <p style={PROSE}>
          Vocabulary content and definitions were independently researched and compiled. Medical facts,
          terminology, and standard clinical definitions are not subject to copyright — only the specific
          expression is. All definitions on this site are written to prioritize clarity for study and
          interpretation contexts.
        </p>
        <p style={PROSE}>
          Korean translations follow standard medical Korean terminology as used in Korean healthcare and
          academic settings. The multilingual dataset currently includes{' '}
          <strong style={{ color: 'var(--color-text)' }}>{multilingualCount} Korean entries</strong>;
          additional languages are added progressively.
        </p>
        <p style={PROSE}>
          The word-parts system is based on classical Greek and Latin medical roots as documented in
          established medical etymology traditions.
        </p>
      </section>

      {/* ── Disclaimer ── */}
      <section style={{ marginBottom: '2rem', background: 'var(--color-panel)', border: '1px solid var(--color-border)', padding: '1.25rem 1.5rem' }}>
        <h2 style={{ ...H2, marginBottom: '0.75rem' }}>⚕ Disclaimer</h2>
        <p style={PROSE}>
          Medi Lexi is an <strong style={{ color: 'var(--color-text)' }}>educational resource only</strong>.
          It is not intended to provide medical advice, diagnosis, or treatment recommendations.
          Clinical decisions should always be made by qualified healthcare professionals in
          consultation with patients.
        </p>
        <p style={{ ...PROSE, marginBottom: 0 }}>
          Content may not reflect the most recent clinical guidelines, drug information, or diagnostic
          criteria. Always consult authoritative clinical references for patient care.
        </p>
      </section>

      {/* ── Terms of Use ── */}
      <section style={{ marginBottom: '2rem' }}>
        <h2 style={H2}>Terms of Use &amp; Copyright</h2>
        <p style={PROSE}>
          All content on Medi Lexi — including definitions, translations, word-part entries, and the
          dataset as a whole — is the original work of the Medi Lexi team and is protected under
          copyright law. © 2026 Medi Lexi. All rights reserved.
        </p>
        <p style={PROSE}>
          You may use this site for <strong style={{ color: 'var(--color-text)' }}>personal and educational purposes</strong> only.
          The following are not permitted without explicit written permission:
        </p>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '0.75rem' }}>
          {[
            'Reproducing or redistributing content in bulk',
            'Using the dataset to train AI or machine learning models',
            'Incorporating content into commercial products or services',
            'Scraping or automated extraction of data',
          ].map(item => (
            <li key={item} style={{ ...PROSE, marginBottom: 0, paddingLeft: '1rem', borderLeft: '2px solid var(--color-border)' }}>
              {item}
            </li>
          ))}
        </ul>
        <p style={{ ...PROSE, marginBottom: 0 }}>
          For licensing inquiries, please use the feedback form below.
        </p>
      </section>

      {/* ── Feedback ── */}
      <section>
        <h2 style={H2}>Feedback &amp; Contributions</h2>
        <p style={PROSE}>
          Found an error, missing term, or translation issue? We'd love to hear from you.
        </p>
        <a
          href="https://docs.google.com/forms/d/e/1FAIpQLSd7lvh6A2B8npmNCo3aarU4E-J7s4k3NxwsCqiTQ-MoYkgJaA/viewform"
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: 'inline-block', fontFamily: 'var(--font-pixel)', fontSize: '0.5rem', padding: '0.55rem 1.1rem', border: '1px solid var(--color-gold)', color: 'var(--color-gold)', textDecoration: 'none', letterSpacing: '0.04em', lineHeight: 2 }}
        >
          Open Feedback Form →
        </a>
      </section>

    </div>
  )
}
