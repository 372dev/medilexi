import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// The canonical domain. Traffic on the old Vercel alias is 301'd here, path for
// path, so Search Console's Change of Address can validate the domain move.
const CANONICAL_HOST = 'interlexi.com'
const OLD_HOST = 'medilexi.vercel.app'

export function middleware(request: NextRequest) {
  const host = request.headers.get('host')

  if (host === OLD_HOST) {
    const url = new URL(
      request.nextUrl.pathname + request.nextUrl.search,
      `https://${CANONICAL_HOST}`,
    )
    // Explicit 301 (Next's redirects() config emits 308; the Change of Address
    // validator checks specifically for a 301).
    return NextResponse.redirect(url, 301)
  }

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-pathname', request.nextUrl.pathname)
  return NextResponse.next({ request: { headers: requestHeaders } })
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico|images/|sitemap\\.xml|robots\\.txt).*)'],
}
