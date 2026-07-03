import { describe, it, expect } from 'vitest'
import { normalizeLvl } from '@/lib/vocab-constants'

describe('normalizeLvl', () => {
  it('passes valid integer levels through', () => {
    expect(normalizeLvl(3)).toBe(3)
    expect(normalizeLvl(2)).toBe(2)
    expect(normalizeLvl(1)).toBe(1)
  })

  it('maps legacy star strings to their integer level', () => {
    expect(normalizeLvl('⭐⭐⭐ Essential')).toBe(3)
    expect(normalizeLvl('⭐⭐ Important')).toBe(2)
    expect(normalizeLvl('⭐ Good to know')).toBe(1)
  })

  it('falls back to 1 for anything unrecognized', () => {
    expect(normalizeLvl('nonsense')).toBe(1)
    expect(normalizeLvl(0)).toBe(1)
    expect(normalizeLvl(undefined)).toBe(1)
    expect(normalizeLvl(null)).toBe(1)
  })
})
