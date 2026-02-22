import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function CanalParaleloPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    redirect('/login')
  }

  const user = session.user as any
  const isAdmin = user.email === 'raul@sacredlevels.com' || user.role === 'admin'

  let hasPurchased = false
  let hasPending = false

  if (!isAdmin) {
    const paid = await prisma.productPurchase.findFirst({
      where: { userId: user.id, productId: 'canal-paralelo', status: 'paid' },
    })
    hasPurchased = !!paid

    if (!hasPurchased) {
      const pending = await prisma.productPurchase.findFirst({
        where: { userId: user.id, productId: 'canal-paralelo', status: 'pending' },
        orderBy: { createdAt: 'desc' },
      })
      hasPending = !!pending
    }
  }

  const hasAccess = isAdmin || hasPurchased

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <div className="border-b border-[#c9a227]/20 bg-[#0a0a0f]/95 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎓</span>
            <div>
              <h1 className="text-lg font-bold text-white">Canal Paralelo</h1>
              <p className="text-xs text-[#c9a227]">Estrategias de The Mentor — Curso Premium</p>
            </div>
          </div>
          <a href="/" className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2">
            ← Volver al inicio
          </a>
        </div>
      </div>

      {hasAccess ? (
        /* ── CONTENIDO DEL CURSO ── */
        <div className="max-w-5xl mx-auto px-4 py-12">
          <div className="mb-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Canal Paralelo</h2>
            <p className="text-gray-400 text-lg">Estrategias exclusivas de más de 15 años de experiencia</p>
          </div>

          {/* Disclaimer */}
          <div className="mb-6 p-5 rounded-xl border border-yellow-500/30 bg-yellow-500/5">
            <p className="text-yellow-300 text-xs font-bold uppercase tracking-widest mb-3">⚠️ Aviso Legal / Legal Disclaimer</p>
            <p className="text-gray-300 text-sm leading-relaxed mb-3">
              <span className="text-white font-semibold">ES —</span> Este contenido es exclusivamente para uso educativo e informativo. El trading conlleva riesgos significativos de pérdida de capital. Las estrategias presentadas no garantizan resultados. No compartás este material ni tus credenciales de acceso con terceros. El uso no autorizado puede resultar en la cancelación inmediata de tu acceso.
            </p>
            <p className="text-gray-300 text-sm leading-relaxed">
              <span className="text-white font-semibold">EN —</span> This content is exclusively for educational and informational purposes. Trading involves significant risk of capital loss. The strategies presented do not guarantee results. Do not share this material or your access credentials with third parties. Unauthorized use may result in immediate cancellation of your access.
            </p>
          </div>

          {/* Vimeo Player */}
          <div className="relative w-full rounded-2xl overflow-hidden border border-[#c9a227]/30 shadow-2xl shadow-[#c9a227]/10">
            <div style={{ padding: '56.25% 0 0 0', position: 'relative' }}>
              <iframe
                src="https://player.vimeo.com/video/1166149792?badge=0&autopause=0&player_id=0&app_id=58479&sharing=0"
                allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                title="Canal Paralelo"
              />
            </div>
          </div>

          <div className="mt-8 p-5 rounded-xl border border-[#c9a227]/20 bg-[#c9a227]/5">
            <p className="text-gray-300 text-sm leading-relaxed">
              <span className="text-[#c9a227] font-semibold">Nota:</span> Este contenido es exclusivo para miembros registrados. Por favor no compartás el material ni los links de acceso.
            </p>
          </div>
        </div>

      ) : hasPending ? (
        /* ── PAGO EN PROCESO ── */
        <div className="max-w-2xl mx-auto px-4 py-24 text-center">
          <div className="text-6xl mb-6">⏳</div>
          <h2 className="text-3xl font-bold mb-4 text-white">Verificando tu pago...</h2>
          <p className="text-gray-400 text-lg mb-4 leading-relaxed">
            Tu pago fue registrado y está siendo confirmado. Esto puede demorar unos minutos.
          </p>
          <p className="text-gray-500 text-sm mb-8">
            Una vez confirmado el pago, esta página se desbloqueará automáticamente.
          </p>
          <a
            href="/courses/canal-paralelo"
            className="inline-flex items-center gap-2 bg-[#c9a227] hover:bg-[#b8911f] text-black font-bold text-lg px-8 py-4 rounded-xl transition-all hover:scale-105"
          >
            🔄 Verificar nuevamente
          </a>
          <p className="text-gray-600 text-xs mt-6">
            ¿Pasaron más de 30 minutos? Escribinos a contacto para resolver tu acceso.
          </p>
        </div>

      ) : (
        /* ── SIN COMPRA ── */
        <div className="max-w-2xl mx-auto px-4 py-24 text-center">
          <div className="text-6xl mb-6">🔒</div>
          <h2 className="text-3xl font-bold mb-4 text-white">Acceso restringido</h2>
          <p className="text-gray-400 text-lg mb-3 leading-relaxed">
            Debés comprar el curso para poder ver el contenido.
          </p>
          <p className="text-gray-500 text-sm mb-8">
            <span className="text-[#c9a227] font-semibold">Canal Paralelo</span> — acceso único por{' '}
            <span className="text-white font-bold">320.000 GS</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/#mentors-vault"
              className="inline-flex items-center justify-center gap-2 bg-[#c9a227] hover:bg-[#b8911f] text-black font-bold text-lg px-8 py-4 rounded-xl transition-all hover:scale-105"
            >
              🎓 Comprar ahora
            </a>
            <a
              href="/courses/canal-paralelo"
              className="inline-flex items-center justify-center gap-2 border border-gray-600 hover:border-gray-400 text-gray-400 hover:text-white font-semibold text-base px-6 py-4 rounded-xl transition-all"
            >
              🔄 Ya pagué — verificar
            </a>
          </div>
          <p className="text-gray-600 text-xs mt-6">
            Si ya realizaste el pago y no tenés acceso, esperá unos minutos y hacé clic en &quot;Ya pagué — verificar&quot;.
          </p>
        </div>
      )}
    </main>
  )
}
