// Search relevance tier (lower = better), shared by the English/Korean/French
// glossaries. Results are ordered by tier first, with the Fuse fuzzy score only
// breaking ties within a tier — so an exact term/abbreviation match always beats
// a stray fuzzy hit (e.g. searching "EEG" surfaces the exact abbreviation, not a
// fuzzy "…bleeding" hit).
//
//   0  exact match on a term field
//   1  a term field starts with the query
//   2  a word within a term field starts with the query
//   3  substring of a term field
//   4  fuzzy match on a term field (Fuse)
//   5  definition-only match
//
// `terms` are the entry's term-field values, `matchedKeys` the Fuse-matched keys,
// and `termKeys` the key names that count as term fields (vs. definition keys).
// `ql` is the already-lowercased query.
export function rankTier(
  terms: readonly (string | undefined)[],
  matchedKeys: readonly string[],
  termKeys: readonly string[],
  ql: string,
): number {
  const nonEmpty = terms.map(t => (t ?? '').toLowerCase()).filter(t => t !== '')
  if (nonEmpty.some(t => t === ql)) return 0
  if (nonEmpty.some(t => t.startsWith(ql))) return 1
  const wordStart = (s: string) => s.split(/[\s\-/]+/).some(w => w.startsWith(ql))
  if (nonEmpty.some(t => wordStart(t))) return 2
  if (nonEmpty.some(t => t.includes(ql))) return 3
  const keys = new Set(matchedKeys)
  if (termKeys.some(k => keys.has(k))) return 4
  return 5
}
