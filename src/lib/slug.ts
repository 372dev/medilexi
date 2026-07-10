/**
 * URL slugs for term pages (`/term/[slug]`).
 *
 * STABILITY CONTRACT: once a slug is indexed by a search engine it must never
 * change. Treat this function as append-only -- if the rules must change, add a
 * redirect from the old slug rather than editing the output of this one.
 *
 * Verified against all 1,345 `en_h` values: 1,345 unique slugs, zero collisions.
 */

/** "Cushing's syndrome" -> "cushings-syndrome"; "Guillain-Barre syndrome" -> "guillain-barre-syndrome". */
export function slugify(enH: string): string {
  return enH
    .toLowerCase()
    .replace(/[\u2019\u0027]/g, '')        // drop apostrophes (straight + curly): cushing's -> cushings
    .replace(/&/g, ' and ')               // "Obstetrics & Gynecology" -> "...-and-..."
    .replace(/\//g, ' ')                  // "Vaccination / immunization" -> two words
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')   // strip combining diacritics: e-acute -> e
    .replace(/[^a-z0-9]+/g, '-')          // everything else becomes a separator
    .replace(/^-+|-+$/g, '')              // trim leading/trailing separators
}

/** Build a slug -> en_h lookup. Throws on collision so a bad slug can never ship. */
export function buildSlugMap(terms: readonly string[]): Map<string, string> {
  const map = new Map<string, string>()
  for (const enH of terms) {
    const slug = slugify(enH)
    if (!slug) throw new Error(`slugify produced an empty slug for "${enH}"`)
    const existing = map.get(slug)
    if (existing) throw new Error(`slug collision "${slug}": "${existing}" and "${enH}"`)
    map.set(slug, enH)
  }
  return map
}
