import { NextResponse } from 'next/server'
import { pingDb, isDbConfigured, DbNotConfiguredError } from '@/lib/server-db'

// Runs on the server on every request; never prerendered.
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Health probe + Supabase keepalive.
 *
 * Unlike `GET /api/submissions` (which only reads env vars and never touches the
 * database), this performs a trivial `select id limit 1` so the Supabase free
 * tier sees real activity and does not pause after ~7 days idle. It returns only
 * reachability, never row content. Hit weekly by
 * `.github/workflows/keepalive.yml`; also safe to call by hand.
 */
export async function GET() {
  if (!isDbConfigured()) {
    return NextResponse.json({ ok: false, db: 'not_configured' }, { status: 503 })
  }
  try {
    await pingDb()
    return NextResponse.json({ ok: true, db: 'reachable' })
  } catch (err) {
    if (err instanceof DbNotConfiguredError) {
      return NextResponse.json({ ok: false, db: 'not_configured' }, { status: 503 })
    }
    // Log the detail server-side; return only up/down to the caller.
    console.error('health ping failed', err)
    return NextResponse.json({ ok: false, db: 'unreachable' }, { status: 502 })
  }
}
