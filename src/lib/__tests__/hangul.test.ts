import { describe, it, expect } from 'vitest'
import { syllableGroups, hangulSearch, jamoFlat, isKorean } from '@/lib/hangul'

describe('syllableGroups', () => {
  it('decomposes syllable blocks into component jamo', () => {
    expect(syllableGroups('한글')).toEqual([['ㅎ', 'ㅏ', 'ㄴ'], ['ㄱ', 'ㅡ', 'ㄹ']])
  })

  it('splits a compound 받침 (ㅄ → ㅂ, ㅅ)', () => {
    expect(syllableGroups('값')).toEqual([['ㄱ', 'ㅏ', 'ㅂ', 'ㅅ']])
  })

  it('passes ASCII and lone jamo through unchanged', () => {
    expect(syllableGroups('a1')).toEqual([['a'], ['1']])
    expect(syllableGroups('ㄱ')).toEqual([['ㄱ']])
  })
})

describe('hangulSearch', () => {
  it('matches identical strings at index 0', () => {
    expect(hangulSearch('감염', '감염')).toBe(0)
  })

  it('matches a leading initial-consonant (초성) prefix', () => {
    expect(hangulSearch('감염', 'ㄱ')).toBe(0)
  })

  it('matches a partial trailing syllable (mid-composition)', () => {
    expect(hangulSearch('홍길동', '홍길ㄷ')).toBe(0)
  })

  it('returns the syllable index of an interior match', () => {
    expect(hangulSearch('저혈당', '혈당')).toBe(1)
  })

  it('returns -1 when there is no match', () => {
    expect(hangulSearch('감염', '폐렴')).toBe(-1)
  })

  it('treats an empty query as a match at index 0', () => {
    expect(hangulSearch('감염', '')).toBe(0)
  })
})

describe('jamoFlat', () => {
  it('flattens a string to its jamo sequence', () => {
    expect(jamoFlat('한글')).toBe('ㅎㅏㄴㄱㅡㄹ')
    expect(jamoFlat('값')).toBe('ㄱㅏㅂㅅ')
  })
})

describe('isKorean', () => {
  it('detects Hangul syllables and letters', () => {
    expect(isKorean('감염')).toBe(true)
    expect(isKorean('ㄱ')).toBe(true)
  })

  it('is false for non-Korean input', () => {
    expect(isKorean('flu')).toBe(false)
    expect(isKorean('123')).toBe(false)
    expect(isKorean('')).toBe(false)
  })
})
