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

export default function PrivacyPage() {
  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', padding: '1.5rem 0 4rem' }}>

      <div style={{ marginBottom: '2.5rem', paddingBottom: '1.5rem', borderBottom: '2px solid var(--color-border)' }}>
        <h1 style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.75rem', color: 'var(--color-gold)', lineHeight: 2.2, marginBottom: '0.5rem' }}>
          Privacy Policy
        </h1>
        <p style={{ ...PROSE, marginBottom: 0, fontSize: '0.82rem' }}>
          Last updated: June 2026
        </p>
      </div>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={H2}>Overview</h2>
        <p style={PROSE}>
          Medi Lexi (<strong style={{ color: 'var(--color-text)' }}>medilexi.vercel.app</strong>) is a
          free educational reference site. We do not require accounts, collect personal information,
          or sell any data. This policy explains what limited data is collected automatically through
          the services that run this site.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={H2}>Data We Collect</h2>

        <p style={{ ...PROSE, fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.3rem' }}>
          Site Analytics (Vercel Analytics &amp; Speed Insights)
        </p>
        <p style={PROSE}>
          This site uses Vercel Analytics and Vercel Speed Insights to understand traffic patterns and
          performance. These services collect:
        </p>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.3rem', marginBottom: '0.75rem' }}>
          {[
            'Page URLs visited',
            'Approximate country/region (derived from IP — IP address is not stored)',
            'Browser type and device category',
            'Page load timing',
          ].map(item => (
            <li key={item} style={{ ...PROSE, marginBottom: 0, paddingLeft: '1rem', borderLeft: '2px solid var(--color-border)' }}>
              {item}
            </li>
          ))}
        </ul>
        <p style={PROSE}>
          No personally identifiable information is stored. Vercel's privacy policy is available at{' '}
          <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer"
            style={{ color: 'var(--color-accent)' }}>
            vercel.com/legal/privacy-policy
          </a>.
        </p>

        <p style={{ ...PROSE, fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.3rem' }}>
          Cookies &amp; Local Storage
        </p>
        <p style={PROSE}>
          This site stores a single preference in your browser's local storage:
        </p>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.3rem', marginBottom: '0.75rem' }}>
          <li style={{ ...PROSE, marginBottom: 0, paddingLeft: '1rem', borderLeft: '2px solid var(--color-border)' }}>
            <code style={{ fontSize: '0.9em' }}>theme</code> — your day/night display preference
          </li>
        </ul>
        <p style={PROSE}>
          No tracking cookies are set by Medi Lexi itself. In the future, if advertising is enabled
          (Google AdSense), third-party cookies may be used to serve relevant ads. Google's advertising
          privacy policy is available at{' '}
          <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer"
            style={{ color: 'var(--color-accent)' }}>
            policies.google.com/technologies/ads
          </a>.
        </p>

        <p style={{ ...PROSE, fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.3rem' }}>
          Feedback Form (Voluntary)
        </p>
        <p style={PROSE}>
          The feedback link on the About page opens a Google Form hosted by Google. If you submit
          feedback, the data you provide is governed by{' '}
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer"
            style={{ color: 'var(--color-accent)' }}>
            Google's Privacy Policy
          </a>.
          Submission is entirely voluntary — Medi Lexi does not prompt or require it.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={H2}>Data We Do Not Collect</h2>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          {[
            'Names, email addresses, or contact information',
            'Account credentials',
            'Payment information',
            'Search queries entered on this site',
            'Precise location data',
          ].map(item => (
            <li key={item} style={{ ...PROSE, marginBottom: 0, paddingLeft: '1rem', borderLeft: '2px solid var(--color-border)' }}>
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={H2}>Third-Party Services</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {[
            ['Vercel', 'Hosting and analytics', 'https://vercel.com/legal/privacy-policy'],
            ['Google Forms', 'Voluntary feedback only', 'https://policies.google.com/privacy'],
            ['Google AdSense', 'Advertising (planned)', 'https://policies.google.com/technologies/ads'],
          ].map(([name, role, url]) => (
            <div key={name} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', padding: '0.6rem 0.75rem', background: 'var(--color-panel)', border: '1px solid var(--color-border)' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap', minWidth: '120px', color: 'var(--color-text)' }}>{name}</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-text-dim)', flex: 1 }}>{role}</span>
              <a href={url} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: '0.78rem', color: 'var(--color-accent)', whiteSpace: 'nowrap' }}>
                Privacy policy →
              </a>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={H2}>Your Rights</h2>
        <p style={PROSE}>
          Since Medi Lexi does not collect personal data, there is generally no data to access,
          correct, or delete. You can clear your browser's local storage at any time to remove the
          saved theme preference.
        </p>
        <p style={PROSE}>
          If you submitted feedback through the Google Form and wish to have it removed, please contact
          us via the feedback form with a deletion request.
        </p>
      </section>

      <section>
        <h2 style={H2}>Contact</h2>
        <p style={{ ...PROSE, marginBottom: 0 }}>
          Questions about this privacy policy? Use the{' '}
          <a href="/about" style={{ color: 'var(--color-accent)' }}>feedback form on the About page</a>.
        </p>
      </section>

    </div>
  )
}
