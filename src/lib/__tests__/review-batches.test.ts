import { describe, it, expect } from 'vitest'
import { flagsFor, REVIEW_BATCHES } from '../review-batches'

describe('flagsFor', () => {
  it('flags a digit, which may or may not be a real threshold', () => {
    expect(flagsFor('Bradycardie', 'moins de 60 battements par minute.', 'Bradycardia')).toContain('chiffre')
  })

  it('does not flag a clean definition', () => {
    expect(flagsFor('Bradycardie', 'Fréquence cardiaque anormalement lente.', 'Bradycardia')).toEqual([])
  })

  it('flags a French term identical to the English', () => {
    expect(flagsFor('Migraine', 'Céphalée récurrente.', 'Migraine')).toContain('identique')
  })

  it('detects a second sentence starting with an ACCENTED capital', () => {
    // The reason this test exists: \p{Lu} needed ES2018 and had to be replaced
    // with a literal range, which would silently miss É, À and Ç if wrong.
    expect(flagsFor('X', 'Première phrase. État second.', 'Y')).toContain('phrases')
    expect(flagsFor('X', 'Première phrase. Ça continue.', 'Y')).toContain('phrases')
    expect(flagsFor('X', 'Première phrase. Autre chose.', 'Y')).toContain('phrases')
  })

  it('does not treat a decimal or an abbreviation as a sentence break', () => {
    expect(flagsFor('X', 'Environ 1.5 mg par jour.', 'Y')).not.toContain('phrases')
  })

  it('flags an over-long definition', () => {
    expect(flagsFor('X', 'a'.repeat(261), 'Y')).toContain('long')
    expect(flagsFor('X', 'a'.repeat(260), 'Y')).not.toContain('long')
  })
})

describe('REVIEW_BATCHES', () => {
  it('uses slugs that are URL-safe', () => {
    for (const slug of Object.keys(REVIEW_BATCHES)) {
      expect(slug).toMatch(/^[a-z0-9-]+$/)
    }
  })
})
