import { describe, it, expect } from 'vitest'
import { normalizeUrl } from '../server-db'

describe('normalizeUrl', () => {
  it('leaves a clean project URL alone', () => {
    expect(normalizeUrl('https://abc.supabase.co')).toBe('https://abc.supabase.co')
  })

  it('strips the REST endpoint suffix shown on the Supabase API page', () => {
    // The settings page displays `.../rest/v1/`, which is the natural thing to
    // copy when the Project URL is wanted; appending our own path to it would
    // produce `/rest/v1//rest/v1/submissions` and 404 every insert.
    expect(normalizeUrl('https://abc.supabase.co/rest/v1/')).toBe('https://abc.supabase.co')
    expect(normalizeUrl('https://abc.supabase.co/rest/v1')).toBe('https://abc.supabase.co')
  })

  it('strips trailing slashes', () => {
    expect(normalizeUrl('https://abc.supabase.co/')).toBe('https://abc.supabase.co')
    expect(normalizeUrl('https://abc.supabase.co///')).toBe('https://abc.supabase.co')
  })

  it('trims whitespace picked up when pasting', () => {
    expect(normalizeUrl('  https://abc.supabase.co \n')).toBe('https://abc.supabase.co')
  })

  it('does not eat a path that merely resembles the suffix', () => {
    expect(normalizeUrl('https://abc.supabase.co/rest/v1/submissions')).toBe(
      'https://abc.supabase.co/rest/v1/submissions',
    )
  })
})
