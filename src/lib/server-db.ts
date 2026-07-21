/**
 * Server-only Supabase access.
 *
 * Deliberately a plain `fetch` against PostgREST rather than @supabase/supabase-js:
 * there is no local Node in this project's working environment, so a new runtime
 * dependency could only be validated by a Vercel deploy. An insert is one HTTP
 * call, so the SDK buys nothing here. It earns its place when auth arrives
 * (session handling, OAuth callbacks) - add it then, with the accounts work.
 *
 * NEVER import this from a client component. The service-role key bypasses RLS.
 */

export type SubmissionKind = 'fr_review' | 'feedback'

export type SubmissionRow = {
  kind: SubmissionKind
  batch?: string | null
  payload: unknown
  note?: string | null
}

/** Read env lazily: at module scope this would throw during `next build`. */
function config() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  return { url, key, ready: Boolean(url && key) }
}

/** True when the deployment has its database credentials. Never exposes them. */
export function isDbConfigured(): boolean {
  return config().ready
}

export class DbNotConfiguredError extends Error {
  constructor() {
    super('Database is not configured on this deployment')
    this.name = 'DbNotConfiguredError'
  }
}

export async function insertSubmission(row: SubmissionRow): Promise<void> {
  const { url, key, ready } = config()
  if (!ready) throw new DbNotConfiguredError()

  const res = await fetch(`${url}/rest/v1/submissions`, {
    method: 'POST',
    headers: {
      apikey: key!,
      Authorization: `Bearer ${key!}`,
      'Content-Type': 'application/json',
      // Don't ask PostgREST to echo the inserted row back; we never use it.
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({
      kind: row.kind,
      batch: row.batch ?? null,
      payload: row.payload,
      note: row.note ?? null,
    }),
    cache: 'no-store',
  })

  if (!res.ok) {
    // Surface status only. The body can echo connection details, and this
    // string may reach a log the reviewer's browser can see.
    throw new Error(`Insert failed with status ${res.status}`)
  }
}
