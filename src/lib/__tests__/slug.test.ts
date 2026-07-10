import { describe, it, expect } from 'vitest'
import { slugify, buildSlugMap } from '../slug'
import vocab from '@/data/medical_vocab.json'

describe('slugify', () => {
  it('lowercases and hyphenates', () => {
    expect(slugify('Myocardial infarction')).toBe('myocardial-infarction')
    expect(slugify('Deep vein thrombosis')).toBe('deep-vein-thrombosis')
  })

  it('drops apostrophes rather than turning them into separators', () => {
    expect(slugify("Cushing's syndrome")).toBe('cushings-syndrome')
    expect(slugify('’')).toBe('') // curly apostrophe alone yields nothing
  })

  it('strips diacritics', () => {
    expect(slugify('Guillain-Barré syndrome')).toBe('guillain-barre-syndrome')
  })

  it('expands the ampersand', () => {
    expect(slugify('Obstetrics & Gynecology')).toBe('obstetrics-and-gynecology')
  })

  it('handles slashes and hyphens', () => {
    expect(slugify('Vaccination / immunization')).toBe('vaccination-immunization')
    expect(slugify('Non-steroidal anti-inflammatory drug')).toBe('non-steroidal-anti-inflammatory-drug')
    expect(slugify('X-ray')).toBe('x-ray')
    expect(slugify('Fine-needle aspiration')).toBe('fine-needle-aspiration')
  })

  it('never emits leading, trailing, or doubled separators', () => {
    expect(slugify('  En bloc resection  ')).toBe('en-bloc-resection')
    expect(slugify('A / B')).toBe('a-b')
  })
})

describe('buildSlugMap over the real glossary', () => {
  const terms = (vocab as unknown as Array<{ en_h: string }>).map((e) => e.en_h)

  it('produces one unique, non-empty slug per term', () => {
    const map = buildSlugMap(terms) // throws on collision or empty slug
    expect(map.size).toBe(terms.length)
  })

  it('round-trips every term back to its en_h', () => {
    const map = buildSlugMap(terms)
    for (const enH of terms) {
      expect(map.get(slugify(enH))).toBe(enH)
    }
  })
})
