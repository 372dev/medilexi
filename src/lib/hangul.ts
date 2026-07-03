// Hangul jamo decomposition + search, used by the Korean glossary's exact /
// 초성 / partial-syllable matcher and its typo-tolerant jamo fuzzy fallback.

const CHO  = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ']
const JUNG = ['ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ']
const JONG = ['','ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ']
const JONG_SPLIT: Record<string,string[]> = {
  ㄳ:['ㄱ','ㅅ'], ㄵ:['ㄴ','ㅈ'], ㄶ:['ㄴ','ㅎ'],
  ㄺ:['ㄹ','ㄱ'], ㄻ:['ㄹ','ㅁ'], ㄼ:['ㄹ','ㅂ'],
  ㄽ:['ㄹ','ㅅ'], ㄾ:['ㄹ','ㅌ'], ㄿ:['ㄹ','ㅍ'],
  ㅀ:['ㄹ','ㅎ'], ㅄ:['ㅂ','ㅅ'],
}

// Returns each character as an array of its component jamo.
// Syllable blocks are decomposed; lone jamo and ASCII pass through unchanged.
export function syllableGroups(str: string): string[][] {
  const groups: string[][] = []
  for (const ch of str) {
    const cp = ch.charCodeAt(0)
    if (cp >= 0xAC00 && cp <= 0xD7A3) {
      const off = cp - 0xAC00
      const ci  = Math.floor(off / 28 / 21)
      const vi  = Math.floor(off / 28) % 21
      const fi  = off % 28
      const g   = [CHO[ci], JUNG[vi]]
      if (fi > 0) { const j = JONG[fi]; (JONG_SPLIT[j] ?? [j]).forEach(c => g.push(c)) }
      groups.push(g)
    } else {
      groups.push([ch])
    }
  }
  return groups
}

// Syllable-by-syllable match. The last query group uses prefix matching so
// partial syllables (e.g. mid-composition) and initial-consonant shortcuts
// work naturally. Returns the syllable index of the match, or -1.
export function hangulSearch(target: string, query: string): number {
  if (!query) return 0
  const t = syllableGroups(target)
  const q = syllableGroups(query)
  for (let i = 0; i <= t.length - q.length; i++) {
    let ok = true
    for (let j = 0; j < q.length; j++) {
      const qg = q[j].join(''), tg = t[i + j].join('')
      if (j === q.length - 1 ? !tg.startsWith(qg) : tg !== qg) { ok = false; break }
    }
    if (ok) return i
  }
  return -1
}

// Flat jamo string (한글 -> "ㅎㅏㄴㄱㅡㄹ") for typo-tolerant fuzzy matching.
export function jamoFlat(str: string): string {
  return syllableGroups(str).map(g => g.join('')).join('')
}

export function isKorean(str: string) {
  return /[가-힣ᄀ-ᇿ㄰-㆏]/.test(str)
}
