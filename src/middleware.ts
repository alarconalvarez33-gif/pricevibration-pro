import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

const FREE_TRIAL_USES = 3

// Routes that are always public — no auth or plan required
const PUBLIC_PATHS = new Set([
  '/',
  '/login',
  '/register',
  '/billing',
  '/pricing',
  '/quantum',
  '/courses',
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
  '/api/trial/',     // Trial use API must be reachable by free users
  '/api/quantum/',   // Quantum access API reachable by free/guest users
  '/api/free-usage', // Anti-abuse free usage tracking (called by unauthenticated users)
  '/api/markets',    // Market prices — public data, used internally by SER
  '/api/results',    // Public proof results (landing page)
  '/api/user/',      // Purchases/subscription info needed by course-only users
  '/courses/',       // Course pages handle their own access (ProductPurchase check)
  '/cursos/',        // Public course catalog + marketing pages
  '/cursos',         // /cursos index
  '/curso',          // /curso and /curso/* handle their own access (cursoPurchased check)
  '/api/curso/',     // check-access must be reachable by course-only users
  '/api/proofs',     // proof images shown publicly on home page
  '/api/reservations', // reservation form is public
  '/admin/',         // Admin pages handle their own auth internally
  '/api/admin/',     // Admin API routes handle their own auth internally (check session + ADMIN_EMAILS internally)
  '/api/ser/guest',  // SER guest mode — 4 free questions without registration, rate-limited by IP
  '/metalevels/',    // MetaLevels pages handle their own access (License check)
  '/metalevels',     // /metalevels index
  '/dashboard/',     // Dashboard and sub-pages handle their own auth via getServerSession
  '/dashboard',      // /dashboard index
  '/_next/',
]

const PAID_PLANS = ['quantum', 'ser', 'ser-plus']

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

  // Paid plan → full access
  if (PAID_PLANS.includes((token.plan as string) ?? '')) return NextResponse.next()

  // Free users with remaining trial uses → allow through (dashboard enforces the limit)
  const trialExpired = token.trialExpired as boolean | undefined
  const trialUses = (token.trialUses as number) || 0
  if (!trialExpired && trialUses < FREE_TRIAL_USES) return NextResponse.next()

  // No plan, no trial left → paywall
  const url = new URL('/billing', request.url)
  url.searchParams.set('locked', 'true')
  return NextResponse.redirect(url)
}

export const config = {
  // Run on every route except static assets
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf|otf|eot|css|js|map)).*)'],
}
