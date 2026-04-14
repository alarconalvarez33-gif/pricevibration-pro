import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hasFullAccess } from '@/lib/constants'
import Link from 'next/link'
import PendingPaymentPoller from '@/components/PendingPaymentPoller'

const BG     = '#0A0A0B'
const CARD   = '#141415'
const BORDER = '#222222'
const CYAN   = '#00E5FF'
const MUTED  = '#555555'
const DARK   = '#0d0d0e'

export default async function AdxCoursePage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    redirect('/login?redirect=/courses/adx')
  }

  const user = session.user as any
  const vip  = hasFullAccess(user.email)

  let hasPurchased = false
  let hasPending   = false

  if (!vip) {
    const paid = await prisma.productPurchase.findFirst({
      where: { userId: user.id, productId: 'adx', status: 'paid' },
    })
    hasPurchased = !!paid

    if (!hasPurchased) {
      const pending = await prisma.productPurchase.findFirst({
        where: { userId: user.id, productId: 'adx', status: 'pending' },
        orderBy: { createdAt: 'desc' },
      })
      hasPending = !!pending
    }
  }

  const hasAccess = vip || hasPurchased

  return (
    <main className="min-h-screen" style={{ backgroundColor: BG, fontFamily: "'Inter', sans-serif" }}>

      {/* ── Header ── */}
      <div className="border-b" style={{ backgroundColor: DARK, borderColor: BORDER }}>
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Estrategia ADX
            </h1>
            <p className="text-[10px] mt-0.5" style={{ color: CYAN, fontFamily: "'JetBrains Mono', monospace" }}>
              Manual de trading — Sacred Levels
            </p>
          </div>
          <Link
            href="/"
            className="text-xs uppercase tracking-[0.15em] transition-colors hover:text-white"
            style={{ color: MUTED, fontFamily: "'Space Grotesk', sans-serif" }}
          >
            ← Inicio
          </Link>
        </div>
      </div>

      {hasAccess ? (

        /* ══════════════════════════════════════════
           CONTENIDO DESBLOQUEADO
        ══════════════════════════════════════════ */
        <div className="max-w-[860px] mx-auto px-6 py-14 space-y-10">

          {/* Title */}
          <div className="text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] mb-3"
              style={{ color: CYAN, fontFamily: "'Space Grotesk', sans-serif" }}>
              Curso Exclusivo
            </p>
            <h2 className="text-4xl font-bold text-white mb-3"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Estrategia ADX
            </h2>
            <p className="text-sm" style={{ color: MUTED }}>
              Direccional positivo y negativo aplicado al trading profesional
            </p>
          </div>

          {/* Vimeo embed */}
          <div className="w-full rounded-xl overflow-hidden"
            style={{ border: `1px solid ${BORDER}`, boxShadow: `0 0 40px ${CYAN}08` }}>
            <div style={{ padding: '56.25% 0 0 0', position: 'relative' }}>
              <iframe
                src="https://player.vimeo.com/video/1183184403?badge=0&autopause=0&player_id=0&app_id=58479"
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                title="Estrategia ADX — Sacred Levels"
              />
            </div>
          </div>

          {/* Vaso térmico promo */}
          <p className="text-center text-xs font-semibold uppercase tracking-[0.15em]"
            style={{ color: MUTED, fontFamily: "'Space Grotesk', sans-serif" }}>
            Promoción del Vaso Térmico Solo Para Usuarios de Asunción, Luque, San Lorenzo,
            Capiatá, Villa Elisa, Ñemby, Lambaré, Fernando de la Mora
          </p>

          {/* Description + download */}
          <div className="rounded-xl p-8" style={{ backgroundColor: CARD, border: `1px solid ${BORDER}` }}>
            <div className="h-px w-full mb-6"
              style={{ background: `linear-gradient(90deg, transparent, ${CYAN}60, transparent)` }} />

            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] mb-4"
              style={{ color: CYAN, fontFamily: "'Space Grotesk', sans-serif" }}>
              Mensaje del mentor
            </p>

            <blockquote className="text-white leading-relaxed text-base mb-6">
              Yo uso el direccional positivo para entradas en compra y el direccional negativo
              para entradas en venta. Cuido el riesgo y soy disciplinado. Si el mercado no
              tiene condiciones, no lo uso — pues ninguna estrategia funciona cuando el mercado
              está en rango o está lateral. Con el dominio de esta técnica los beneficios
              llegaron solos.{' '}
              <span style={{ color: CYAN }}>El mejor de los éxitos.</span>
            </blockquote>

            <p className="text-sm font-semibold mb-6" style={{ color: MUTED, fontFamily: "'Space Grotesk', sans-serif" }}>
              Descargá el manual completo con la técnica paso a paso:
            </p>

            <a
              href="/api/download/adx"
              className="inline-flex items-center gap-3 px-8 py-4 font-bold text-sm uppercase tracking-[0.12em] text-black rounded-lg transition-opacity hover:opacity-90"
              style={{ backgroundColor: CYAN, fontFamily: "'Space Grotesk', sans-serif" }}
            >
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Descargar Manual ADX — PDF
            </a>

            <div className="h-px w-full mt-6"
              style={{ background: `linear-gradient(90deg, transparent, ${BORDER}, transparent)` }} />
          </div>

          {/* Disclaimer */}
          <div className="rounded-xl p-6"
            style={{ backgroundColor: `${CYAN}06`, border: `1px solid ${CYAN}18` }}>
            <p className="text-[9px] font-bold uppercase tracking-[0.25em] mb-3"
              style={{ color: CYAN, fontFamily: "'Space Grotesk', sans-serif" }}>
              ⚠️ Aviso Legal / Legal Disclaimer
            </p>
            <p className="text-[11px] leading-relaxed mb-2" style={{ color: '#888' }}>
              <span className="text-white font-semibold">ES — </span>
              Este material es exclusivamente para fines educativos e informativos. El trading
              en mercados financieros conlleva un riesgo significativo de pérdida de capital.
              Las técnicas presentadas no garantizan resultados ni rendimientos futuros. El
              desempeño pasado no es indicativo de resultados futuros. Operá siempre con
              capital que puedas permitirte perder. Sacred Levels no se responsabiliza por
              pérdidas derivadas del uso de este material.
            </p>
            <p className="text-[11px] leading-relaxed" style={{ color: '#888' }}>
              <span className="text-white font-semibold">EN — </span>
              This material is for educational and informational purposes only. Trading
              financial markets involves significant risk of capital loss. The techniques
              presented do not guarantee results or future returns. Past performance is not
              indicative of future results. Only trade with capital you can afford to lose.
              Sacred Levels accepts no liability for losses resulting from the use of this
              material.
            </p>
          </div>

        </div>

      ) : hasPending ? (

        /* ══════════════════════════════════════════
           PAGO EN PROCESO
        ══════════════════════════════════════════ */
        <div className="max-w-2xl mx-auto px-4 py-24 text-center">
          <PendingPaymentPoller productId="adx" />
          <div className="text-6xl mb-6 animate-pulse">⏳</div>
          <h2 className="text-3xl font-bold mb-4 text-white"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Esperando confirmación de tu banco...
          </h2>
          <p className="text-base mb-4 leading-relaxed" style={{ color: MUTED }}>
            Tu pago fue registrado. Esta página se desbloqueará automáticamente en cuanto
            tu banco confirme la transacción.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm mb-8" style={{ color: CYAN }}>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Verificando cada 5 segundos...
          </div>
          <p className="text-xs" style={{ color: '#444' }}>
            ¿Pasaron más de 30 minutos? Escribinos a contacto para resolver tu acceso.
          </p>
        </div>

      ) : (

        /* ══════════════════════════════════════════
           PAYWALL — SIN COMPRA
        ══════════════════════════════════════════ */
        <div className="max-w-2xl mx-auto px-4 py-24 text-center">
          <div className="text-6xl mb-6">🔒</div>
          <h2 className="text-3xl font-bold mb-4 text-white"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Acceso restringido
          </h2>
          <p className="text-base mb-3 leading-relaxed" style={{ color: MUTED }}>
            Necesitás comprar la Estrategia ADX para acceder a este contenido.
          </p>
          <p className="text-sm mb-8" style={{ color: MUTED }}>
            <span style={{ color: CYAN }} className="font-semibold">Estrategia ADX</span>
            {' '}— acceso único por{' '}
            <span className="text-white font-bold">Gs. 220.000</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/#mentors-vault"
              className="inline-flex items-center justify-center gap-2 font-bold text-sm uppercase tracking-[0.12em] text-black px-8 py-4 rounded-lg transition-opacity hover:opacity-90"
              style={{ backgroundColor: CYAN, fontFamily: "'Space Grotesk', sans-serif" }}
            >
              ¡Quiero la Estrategia!
            </a>
            <a
              href="/courses/adx"
              className="inline-flex items-center justify-center gap-2 border font-semibold text-sm px-6 py-4 rounded-lg transition-colors hover:text-white"
              style={{ borderColor: BORDER, color: MUTED, fontFamily: "'Space Grotesk', sans-serif" }}
            >
              🔄 Ya pagué — verificar
            </a>
          </div>
          <p className="text-xs mt-6" style={{ color: '#444' }}>
            Si ya realizaste el pago y no tenés acceso, esperá unos minutos y hacé clic en
            &quot;Ya pagué — verificar&quot;.
          </p>
        </div>

      )}
    </main>
  )
}
