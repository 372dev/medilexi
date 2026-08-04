import { describe, it, expect, afterEach } from 'vitest'
import { normalizeUrl, pingDb, insertSubmission, DbNotConfiguredError } from '../server-db'

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

describe('db access without configuration', () => {
  // These run in CI where no Supabase env vars are set, so config().ready is
  // false and both functions must fail fast with the typed error BEFORE any
  // network call is attempted -- never hang or throw a generic error.
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env
  afterEach(() => {
    process.env.SUPABASE_URL = SUPABASE_URL
    process.env.SUPABASE_SERVICE_ROLE_KEY = SUPABASE_SERVICE_ROLE_KEY
  })

  it('pingDb throws DbNotConfiguredError when env is absent', async () => {
    delete process.env.SUPABASE_URL
    delete process.env.SUPABASE_SERVICE_ROLE_KEY
    await expect(pingDb()).rejects.toBeInstanceOf(DbNotConfiguredError)
  })

  it('insertSubmission throws DbNotConfiguredError when env is absent', async () => {
    delete process.env.SUPABASE_URL
    delete process.env.SUPABASE_SERVICE_ROLE_KEY
    await expect(
      insertSubmission({ kind: 'feedback', payload: { t: 1 } }),
    ).rejects.toBeInstanceOf(DbNotConfiguredError)
  })
})
