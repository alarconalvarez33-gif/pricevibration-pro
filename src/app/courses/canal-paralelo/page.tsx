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
  const isAdmin =
    user.email === 'raul@sacredlevels.com' || user.role === 'admin'

  let hasPurchased = false

  if (!isAdmin) {
    const purchase = await prisma.productPurchase.findFirst({
      where: {
        userId: user.id,
        productId: 'canal-paralelo',
        status: 'paid',
      },
    })
    hasPurchased = !!purchase
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
              <p className="text-xs text-[#c9a227]">Mentor&apos;s Vault — Premium Course</p>
            </div>
          </div>
          <a
            href="/"
            className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2"
          >
            ← Back to Home
          </a>
        </div>
      </div>

      {hasAccess ? (
        /* Course Content */
        <div className="max-w-5xl mx-auto px-4 py-12">
          <div className="mb-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              Canal Paralelo
            </h2>
            <p className="text-gray-400 text-lg">
              Exclusive trading strategies from 15+ years of experience
            </p>
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
                src="https://player.vimeo.com/video/1166149792?badge=0&autopause=0&player_id=0&app_id=58479"
                allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                }}
                title="Canal Paralelo"
              />
            </div>
          </div>

          <div className="mt-8 p-6 rounded-xl border border-[#c9a227]/20 bg-[#c9a227]/5">
            <p className="text-gray-300 text-sm leading-relaxed">
              <span className="text-[#c9a227] font-semibold">Note:</span> This
              content is exclusively for registered members. Please do not share
              access credentials or video links.
            </p>
          </div>
        </div>
      ) : (
        /* Purchase Required */
        <div className="max-w-2xl mx-auto px-4 py-24 text-center">
          <div className="text-6xl mb-6">🔒</div>
          <h2 className="text-3xl font-bold mb-4">Purchase Required</h2>
          <p className="text-gray-400 text-lg mb-8 leading-relaxed">
            Access to <span className="text-white font-semibold">Canal Paralelo</span> requires
            a one-time purchase of{' '}
            <span className="text-[#c9a227] font-bold">$49 USD</span>.
          </p>
          <a
            href="/#mentors-vault"
            className="inline-flex items-center gap-2 bg-[#c9a227] hover:bg-[#b8911f] text-black font-bold text-lg px-8 py-4 rounded-xl transition-all hover:scale-105"
          >
            🎓 Get Access Now
          </a>
          <p className="text-gray-600 text-sm mt-6">
            Already purchased? Make sure you&apos;re logged in with the same account used for payment.
          </p>
        </div>
      )}
    </main>
  )
}
