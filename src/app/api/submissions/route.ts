import { NextResponse } from 'next/server'
import { insertSubmission, isDbConfigured, DbNotConfiguredError, type SubmissionKind } from '@/lib/server-db'
import { reviewKeyMatches } from '@/lib/review-auth'

// Route Handlers run on the server on every request; nothing here is prerendered.
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const KINDS: SubmissionKind[] = ['fr_review', 'feedback']
const MAX_BYTES = 256 * 1024 // a 56-entry review batch is ~15 KB; this is generous
const MAX_NOTE = 2000

/** Health check: tells us whether env vars landed, without revealing them. */
export async function GET() {
  return NextResponse.json({ ok: true, configured: isDbConfigured() })
}

export async function POST(req: Request) {
  if (!isDbConfigured()) {
    return NextResponse.json({ error: 'not_configured' }, { status: 503 })
  }

  const raw = await req.text()
  if (raw.length > MAX_BYTES) {
    return NextResponse.json({ error: 'too_large' }, { status: 413 })
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return NextResponse.json({ error: 'bad_json' }, { status: 400 })
  }
  // `null`, an array, or a bare scalar all parse fine but have no `.kind`;
  // reading through them would throw rather than return a 400.
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return NextResponse.json({ error: 'bad_json' }, { status: 400 })
  }
  const body = parsed as Record<string, unknown>

  const kind = body.kind
  if (typeof kind !== 'string' || !KINDS.includes(kind as SubmissionKind)) {
    return NextResponse.json({ error: 'bad_kind' }, { status: 400 })
  }

  // fr_review is internal tooling, so it carries a shared key. Feedback stays
  // open because it is a public form. The key travels in a header, not the
  // query string, so it stays out of server and proxy access logs.
  if (kind === 'fr_review') {
    if (!reviewKeyMatches(req.headers.get('x-review-key'))) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }
  }

  if (body.payload === undefined || body.payload === null) {
    return NextResponse.json({ error: 'missing_payload' }, { status: 400 })
  }
  if (Array.isArray(body.payload) && body.payload.length === 0) {
    return NextResponse.json({ error: 'empty_payload' }, { status: 400 })
  }

  const batch = typeof body.batch === 'string' ? body.batch.slice(0, 120) : null
  const note = typeof body.note === 'string' ? body.note.slice(0, MAX_NOTE) : null

  try {
    await insertSubmission({ kind: kind as SubmissionKind, batch, payload: body.payload, note })
  } catch (err) {
    if (err instanceof DbNotConfiguredError) {
      return NextResponse.json({ error: 'not_configured' }, { status: 503 })
    }
    console.error('submission insert failed', err)
    return NextResponse.json({ error: 'insert_failed' }, { status: 502 })
  }

  return NextResponse.json({ ok: true }, { status: 201 })
}
