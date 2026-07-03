import { describe, it, expect } from 'vitest'
import Fuse from 'fuse.js'
import { jamoFlat } from '@/lib/hangul'

// Mirrors the Korean glossary's typo-tolerant fuzzy fallback: flatten each term's
// Korean field to a jamo string and fuzzy-match, so a single mistyped jamo
// (간염 vs 감염 — one jamo apart) still surfaces the intended term. This is the
// path that matters most for real searches, above the exact 초성 shortcut.
describe('jamo fuzzy fallback (typo tolerance)', () => {
  const terms = ['감염', '폐렴', '당뇨병', '고혈압', '골절']
  const fuse = new Fuse(
    terms.map(t => ({ term: t, jh: jamoFlat(t) })),
    { keys: [{ name: 'jh' }], threshold: 0.3, ignoreLocation: true, minMatchCharLength: 2 },
  )

  it('surfaces 감염 as the top hit for the one-jamo typo 간염', () => {
    const hits = fuse.search(jamoFlat('간염')).map(r => r.item.term)
    expect(hits[0]).toBe('감염')
  })

  it('surfaces the exact term for a correctly-spelled query', () => {
    const hits = fuse.search(jamoFlat('고혈압')).map(r => r.item.term)
    expect(hits[0]).toBe('고혈압')
  })

  it('confirms the typo differs from the target by exactly one jamo', () => {
    // 간염 → ㄱㅏㄴㅇㅕㅁ vs 감염 → ㄱㅏㅁㅇㅕㅁ  (ㄴ ↔ ㅁ at index 2)
    const typo = jamoFlat('간염')
    const target = jamoFlat('감염')
    expect(typo.length).toBe(target.length)
    const diffs = [...typo].filter((c, i) => c !== target[i]).length
    expect(diffs).toBe(1)
  })
})
