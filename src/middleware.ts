import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

const FREE_TRIAL_USES = 3
const TRIAL_COOKIE = 'sl_trial_start'
const TRIAL_COOKIE_MAX_AGE = 60 * 60 * 24 * 60 // 60 days persistence

// Routes that are always public — no auth or plan required
const PUBLIC_PATHS = new Set([
  // Landing page. Public by design: the gated half of the levels is filtered
  // out in the server component, so there is nothing here to protect at the
  // routing layer.
  '/',
  // Terminal — anonymous gets a 24h trial; gating runs server-side per request.
  '/terminal',
  '/login',
  '/register',
  '/billing',
  '/pricing',
  '/quantum',
  '/hub',        // Signal Hub handles its own auth/paywall internally
  '/qtrader',    // QTrader gates itself with activation code in client
  '/pago/exito', // post-payment confirmation polls session client-side
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
  '/api/ser/guest',  // SER guest mode — 5 free questions per IP, one-time
  '/api/signals/',   // Signal Hub check-limit and increment handle their own auth (guests allowed)
  '/qtrader/',       // /qtrader/admin gated by QTRADER_ADMIN_KEY header server-side
  '/api/qtrader/',   // activate is public; generate is gated by x-admin-key header
  '/api/terminal/',  // terminal endpoints; gating happens server-side per request
  '/api/payments/',  // payment APIs gate themselves (return 401 instead of redirect)
  '/api/cron/',      // cron endpoints gate themselves with CRON_SECRET header
  '/metalevels/',    // MetaLevels pages handle their own access (License check)
  '/metalevels',     // /metalevels index
  '/dashboard/',     // Dashboard and sub-pages handle their own auth via getServerSession
  '/dashboard',      // /dashboard index
  '/_next/',
]

const PAID_PLANS = ['pro', 'quantum', 'ser', 'ser-plus']

function withTrialCookie(request: NextRequest, response: NextResponse): NextResponse {
  if (request.cookies.has(TRIAL_COOKIE)) return response
  const ts = String(Date.now())
  // Mutate the request so downstream handlers (and the very next server
  // component render) can read the freshly-issued timestamp.
  request.cookies.set(TRIAL_COOKIE, ts)
  response.cookies.set({
    name: TRIAL_COOKIE,
    value: ts,
    maxAge: TRIAL_COOKIE_MAX_AGE,
    path: '/',
    sameSite: 'lax',
    httpOnly: false, // the client reads it for the countdown
  })
  return response
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public paths — but ensure the trial cookie exists so server pages
  // and APIs always see a deterministic trial-start timestamp.
  if (PUBLIC_PATHS.has(pathname)) return withTrialCookie(request, NextResponse.next())

  // Allow public prefixes
  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) return withTrialCookie(request, NextResponse.next())

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
