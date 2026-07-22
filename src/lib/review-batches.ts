/**
 * French-review batches. Each one is a slice of the glossary by primary
 * specialty, sized so a reviewer can finish it in a sitting.
 *
 * To add a batch: one line here. The slug becomes the URL
 * (/review/<slug>?k=...) and `fr` is what the reviewer sees as the heading.
 * `field` must match a value in the `f` enum exactly (CLAUDE.md 3b).
 */
export type ReviewBatch = { field: string; fr: string }

export const REVIEW_BATCHES: Record<string, ReviewBatch> = {
  cardiologie:               { field: 'Cardiology',              fr: 'Cardiologie' },
  dermatologie:              { field: 'Dermatology',             fr: 'Dermatologie' },
  neurologie:                { field: 'Neurology',               fr: 'Neurologie' },
  anatomie:                  { field: 'Anatomy',                 fr: 'Anatomie' },
  'medecine-generale':       { field: 'General Medicine',        fr: 'Médecine générale' },
  pharmacologie:             { field: 'Pharmacology',            fr: 'Pharmacologie' },
  urologie:                  { field: 'Urology',                 fr: 'Urologie' },
  gastroenterologie:         { field: 'Gastroenterology',        fr: 'Gastroentérologie' },
  orl:                       { field: 'Otolaryngology',          fr: 'ORL' },
  chirurgie:                 { field: 'Surgery',                 fr: 'Chirurgie' },
  'gynecologie-obstetrique': { field: 'Obstetrics & Gynecology', fr: 'Gynécologie-obstétrique' },
  endocrinologie:            { field: 'Endocrinology',           fr: 'Endocrinologie' },
}

export type ReviewEntry = {
  k: string          // en_h, the primary key
  el: string         // en_l
  ed: string         // d
  lv: number         // lvl
  fh: string         // fr_h
  fl: string         // fr_l
  fd: string         // d_fr
  fg: string[]       // advisory flags
}

/**
 * Flags are recall, not verdicts: they point the reviewer at entries worth a
 * second look. No 'tiret' flag - em dashes are swept in our own audit before a
 * batch is ever delivered, so surfacing them here would waste the reviewer's
 * attention on something already fixed.
 */
export function flagsFor(fr_h: string, d_fr: string, en_h: string): string[] {
  const out: string[] = []
  if (/\d/.test(d_fr)) out.push('chiffre')
  if (d_fr.length > 260) out.push('long')
  // An explicit Latin-1 range rather than \p{Lu}: unicode property escapes
  // need target ES2018+, and tsconfig sets no target. The range covers the
  // accented capitals French actually starts sentences with (É, À, Ç).
  if (/\.\s+[A-ZÀ-ÖØ-Þ]/.test(d_fr)) out.push('phrases')
  if (fr_h === en_h) out.push('identique')
  return out
}
