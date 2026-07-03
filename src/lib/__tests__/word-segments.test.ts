import { describe, it, expect } from 'vitest'
import { toLiteral, getSegments } from '@/lib/word-segments'

describe('toLiteral', () => {
  it('strips connecting vowels, hyphens, and slashes and lowercases', () => {
    expect(toLiteral('cardi/o')).toBe('cardi')
    expect(toLiteral('bacter/i')).toBe('bacter')
    expect(toLiteral('-ectomy')).toBe('ectomy')
    expect(toLiteral('-itis')).toBe('itis')
    expect(toLiteral('pre-')).toBe('pre')
  })
})

describe('getSegments', () => {
  it('returns one text segment when there are no parts', () => {
    expect(getSegments('Aspirin')).toEqual([{ text: 'Aspirin' }])
    expect(getSegments('Aspirin', undefined)).toEqual([{ text: 'Aspirin' }])
  })

  it('returns one text segment when no part is a substring', () => {
    expect(getSegments('Aspirin', { r: ['cardi/o'] })).toEqual([{ text: 'Aspirin' }])
  })

  it('marks root and suffix spans and preserves the original casing', () => {
    const segs = getSegments('Cardiology', { r: ['cardi/o'], s: ['-logy'] })
    expect(segs.map(s => [s.text, s.wp ?? null, s.type ?? null])).toEqual([
      ['Cardi', 'cardi/o', 'r'],
      ['o', null, null],
      ['logy', '-logy', 's'],
    ])
  })

  it('ignores a part whose literal is shorter than 2 characters', () => {
    expect(getSegments('Ebola', { p: ['e-'] })).toEqual([{ text: 'Ebola' }])
  })

  it('resolves part meanings via the injected resolver', () => {
    const segs = getSegments('Cardiology', { r: ['cardi/o'] }, wp => (wp === 'cardi/o' ? 'heart' : ''))
    expect(segs.find(s => s.wp === 'cardi/o')?.meaning).toBe('heart')
  })
})
