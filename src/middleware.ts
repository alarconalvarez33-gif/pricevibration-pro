import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Routes that are always public — no auth or plan required
const PUBLIC_PATHS = new Set([
  '/',
  '/login',
  '/register',
  '/billing',
  '/pricing',
  '/contact',
  '/terms',
  '/privacy',
  '/disclaimer',
  '/refund',
  '/brokers',
])

// Path prefixes that are always public
const PUBLIC_PREFIXES = [
  '/billing/',       // /billing/[hash] verify pages
  '/api/auth/',      // NextAuth internals
  '/api/pagopar/',   // Pagopar webhooks & payment routes
  '/api/contact',    // Contact form
  '/_next/',
]

const PAID_PLANS = ['quantum']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public paths
  if (PUBLIC_PATHS.has(pathname)) return NextResponse.next()

  // Allow public prefixes
  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) return NextResponse.next()

  // Decode JWT token (reads NEXTAUTH_SECRET automatically)
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

  // Not authenticated → redirect to login
  if (!token) {
    const url = new URL('/login', request.url)
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // Admin always has full access
  if (token.role === 'admin') return NextResponse.next()

  // Verify paid plan
  if (!PAID_PLANS.includes((token.plan as string) ?? '')) {
    const url = new URL('/billing', request.url)
    url.searchParams.set('locked', 'true')
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  // Run on every route except static assets
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf|otf|eot|css|js|map)).*)'],
}
