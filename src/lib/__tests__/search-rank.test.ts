import { describe, it, expect } from 'vitest'
import { rankTier } from '@/lib/search-rank'

const EN = ['en_h', 'abbr', 'en_l']

describe('rankTier', () => {
  it('tier 0 — exact match on a term field', () => {
    expect(rankTier(['Aspirin', '', ''], [], EN, 'aspirin')).toBe(0)
  })

  it('tier 0 — an exact abbreviation match beats everything', () => {
    expect(rankTier(['Electroencephalogram', 'EEG', ''], [], EN, 'eeg')).toBe(0)
  })

  it('tier 1 — a field starts with the query', () => {
    expect(rankTier(['Aspirin'], [], EN, 'asp')).toBe(1)
  })

  it('tier 2 — a word within a field starts with the query', () => {
    expect(rankTier(['Heart attack'], [], EN, 'att')).toBe(2)
  })

  it('tier 3 — substring of a field', () => {
    expect(rankTier(['Cardiomegaly'], [], EN, 'ome')).toBe(3)
  })

  it('tier 4 — only a fuzzy match on a term field', () => {
    expect(rankTier(['Xyz'], ['en_h'], EN, 'abc')).toBe(4)
  })

  it('tier 5 — match only in the definition', () => {
    expect(rankTier(['Xyz'], ['d'], EN, 'abc')).toBe(5)
  })

  it('an exact term outranks a fuzzy hit on a different entry', () => {
    const exact = rankTier(['Gastritis'], [], EN, 'gastritis')
    const fuzzy = rankTier(['Gastrointestinal bleeding'], ['en_h'], EN, 'gastritis')
    expect(exact).toBeLessThan(fuzzy)
  })
})
