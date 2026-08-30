import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import crypto from 'crypto'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { checkIPRateLimit } from '@/lib/ser/rateLimiting'
import {
  COUNT_COOKIE,
  HIDE_COOKIE,
  HIDE_MS,
  PROMO_EVENTS,
  PROMO_SLUGS,
  VISITOR_COOKIE,
  VISITOR_MAX_AGE,
  nextDismissal,
  parseDismissals,
  serialiseDismissals,
  weekRemainingSeconds,
} from '@/lib/promo/boardPromo'

/**
 * Impresiones, clics y cierres de los bloques de conversión.
 *
 * Público a propósito: la mayoría de las impresiones son de visitantes sin
 * sesión, y son justo las que interesa medir. La cuenta queda asociada cuando
 * hay sesión; si no, la fila queda atada al id anónimo de la cookie sl_vid.
 *
 * El cierre (`dismiss`) además devuelve las cookies de ocultamiento, así el
 * estado lo fija el servidor y no un valor editable desde la consola.
 */

export const dynamic = 'force-dynamic'

const isProduction = process.env.NODE_ENV === 'production'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/

function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return request.headers.get('x-real-ip') || 'unknown'
}

export async function POST(request: NextRequest) {
  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const promo = String(body?.promo ?? '')
  const event = String(body?.event ?? '')

  // Lista blanca: un endpoint abierto no puede aceptar slugs arbitrarios o la
  // tabla se llena de basura que después no se puede separar del dato real.
  if (!PROMO_SLUGS.has(promo) || !PROMO_EVENTS.has(event)) {
    return NextResponse.json({ error: 'Unknown promo or event' }, { status: 400 })
  }

  const { allowed } = await checkIPRateLimit(`promo:${clientIp(request)}`, 60, 60)
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const now = Date.now()

  const existingVisitor = request.cookies.get(VISITOR_COOKIE)?.value ?? ''
  const freshVisitor = !UUID.test(existingVisitor)
  const visitorId = freshVisitor ? crypto.randomUUID() : existingVisitor

  const session = await getServerSession(authOptions)
  // Por id del JWT no: puede apuntar a una cuenta ya borrada y la clave foránea
  // tiraría el insert. El email se resuelve contra la tabla.
  const user = session?.user?.email
    ? await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      })
    : null

  try {
    await prisma.promoEvent.create({
      data: {
        promo,
        event,
        userId: user?.id ?? null,
        visitorId,
        path: typeof body?.path === 'string' ? body.path.slice(0, 200) : null,
      },
    })
  } catch (error) {
    // Un fallo de escritura no puede romper el cierre del bloque: el visitante
    // ya hizo clic y espera que se oculte.
    console.error('[promo/track] no se pudo registrar el evento', error)
  }

  const response = NextResponse.json({ ok: true })

  if (freshVisitor) {
    response.cookies.set({
      name: VISITOR_COOKIE,
      value: visitorId,
      maxAge: VISITOR_MAX_AGE,
      path: '/',
      sameSite: 'lax',
      httpOnly: true,
      secure: isProduction,
    })
  }

  if (event === 'dismiss') {
    const dismissals = nextDismissal(parseDismissals(request.cookies.get(COUNT_COOKIE)?.value, now), now)

    response.cookies.set({
      name: COUNT_COOKIE,
      value: serialiseDismissals(dismissals),
      // Vence con la ventana semanal, así el conteo se reinicia solo.
      maxAge: weekRemainingSeconds(dismissals, now),
      path: '/',
      sameSite: 'lax',
      httpOnly: true,
      secure: isProduction,
    })

    response.cookies.set({
      name: HIDE_COOKIE,
      value: String(now + HIDE_MS),
      maxAge: HIDE_MS / 1000,
      path: '/',
      sameSite: 'lax',
      httpOnly: true,
      secure: isProduction,
    })
  }

  return response
}
