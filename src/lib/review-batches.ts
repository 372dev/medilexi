/**
 * Review batches. Each one is a slice of the glossary by primary specialty,
 * sized so a reviewer can finish it in a sitting. Shared by every `live`
 * language (FR, KO): both slice the same specialties, only the target column
 * differs (fr_* vs ko_*).
 *
 * To add a batch: one line here. The slug becomes the URL
 * (/review/<lang>/<slug>?k=...); `fr` is the French heading (used for the fr
 * route); other languages fall back to the English `field` as the heading.
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

/** One entry the reviewer sees: English source + the editable target triple.
 *  `t*` = target (fr_* / ko_* / …), kept language-neutral so one client serves
 *  every language. */
export type ReviewEntry = {
  k: string          // en_h, the primary key
  el: string         // en_l
  ed: string         // d (English definition)
  lv: number         // lvl
  th: string         // target head  (fr_h / ko_h / …)
  tl: string         // target lay   (fr_l / ko_l / …)
  td: string         // target def   (d_fr / d_ko / …)
  fg: string[]       // advisory flags
  cn: string         // the specific concern to answer (from the flag queue)
}

/**
 * Flags are recall, not verdicts: they point the reviewer at entries worth a
 * second look. Language-neutral keys (the UI renders them):
 *   num  - a digit in the definition (guideline-variable threshold?)
 *   long - definition over the language's char limit
 *   sent - looks like more than one sentence (Latin-script langs only; CJK
 *          does not put a space after a full stop, so the check is skipped there)
 *   same - target head is byte-identical to the English (untranslated?)
 * No em-dash flag: em dashes are swept in our own audit before delivery.
 */
export function flagsFor(lang: string, target_h: string, target_d: string, en_h: string): string[] {
  const out: string[] = []
  if (/\d/.test(target_d)) out.push('num')
  const limit = lang === 'ko' || lang === 'ja' ? 160 : 260
  if (target_d.length > limit) out.push('long')
  if ((lang === 'fr' || lang === 'es') && /\.\s+[A-Za-zÀ-ÖØ-öø-ÿ]/.test(target_d)) out.push('sent')
  if (target_h === en_h) out.push('same')
  return out
}
