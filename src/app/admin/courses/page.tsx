'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { isAdmin } from '@/lib/constants'

const COURSES = [
  {
    id: 'fibonacci',
    title: 'Curso de Fibonacci',
    icon: '📊',
    price: '499.000 GS',
    url: '/courses/fibonacci',
    vimeoSrc: 'https://player.vimeo.com/video/1171349347?h=a8a0610c95&badge=0&autopause=0&player_id=0&app_id=58479&sharing=0&fl=sv&fe=ci',
  },
  {
    id: 'canal-paralelo',
    title: 'Canal Paralelo',
    icon: '🎓',
    price: '320.000 GS',
    url: '/courses/canal-paralelo',
    vimeoSrc: 'https://player.vimeo.com/video/1166149792?badge=0&autopause=0&player_id=0&app_id=58479&sharing=0',
  },
  {
    id: 'expansion-matematica',
    title: 'Expansión Matemática',
    icon: '👑',
    price: '1.500.000 GS',
    url: '/courses/expansion-matematica',
    vimeoSrc: 'https://player.vimeo.com/video/1167191647?badge=0&autopause=0&player_id=0&app_id=58479&sharing=0&dnt=1',
  },
]

type Purchase = {
  id: string
  orderId: string
  productId: string
  status: string
  price: number
  paidAt: string | null
  createdAt: string
  user: { email: string; name: string | null }
}

const STATUS_STYLE: Record<string, string> = {
  paid:    'bg-green-600/20 text-green-400 border border-green-600/40',
  pending: 'bg-yellow-600/20 text-yellow-400 border border-yellow-600/40',
  failed:  'bg-red-600/20 text-red-400 border border-red-600/40',
}

export default function AdminCoursesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const user = session?.user as any
  const adminAccess = isAdmin(user?.email)

  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loadingPurchases, setLoadingPurchases] = useState(true)
  const [activeVideo, setActiveVideo] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'paid' | 'pending' | 'failed'>('all')

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
    if (status === 'authenticated' && !adminAccess) router.push('/')
  }, [status, adminAccess, router])

  const fetchPurchases = useCallback(async () => {
    setLoadingPurchases(true)
    try {
      const res = await fetch('/api/admin/purchases')
      if (res.ok) setPurchases(await res.json())
    } catch {}
    setLoadingPurchases(false)
  }, [])

  useEffect(() => {
    if (adminAccess) fetchPurchases()
  }, [adminAccess, fetchPurchases])

  if (status === 'loading' || !adminAccess) return null

  const filtered = filter === 'all' ? purchases : purchases.filter(p => p.status === filter)

  const stats = {
    total: purchases.length,
    paid: purchases.filter(p => p.status === 'paid').length,
    pending: purchases.filter(p => p.status === 'pending').length,
    failed: purchases.filter(p => p.status === 'failed').length,
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <div className="border-b border-[#c9a227]/20 bg-[#0a0a0f]/95 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎬</span>
            <div>
              <h1 className="text-lg font-bold text-white">Admin — Cursos & Pagos</h1>
              <p className="text-xs text-[#c9a227]">Revisar videos y monitorear compras</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchPurchases}
              className="text-xs bg-[#1a1a2e] border border-gray-700 hover:border-[#c9a227]/50 text-gray-400 hover:text-white px-3 py-1.5 rounded-lg transition-colors"
            >
              🔄 Actualizar
            </button>
            <a href="/admin/levels" className="text-sm text-gray-400 hover:text-white transition-colors">← Admin</a>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10 space-y-12">

        {/* ── SECTION 1: Videos ── */}
        <section>
          <h2 className="text-xl font-bold text-[#c9a227] mb-6">🎬 Videos de Cursos</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {COURSES.map(course => (
              <div
                key={course.id}
                className="bg-[#111120] border border-gray-800 rounded-xl overflow-hidden hover:border-[#c9a227]/40 transition-all"
              >
                <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{course.icon}</span>
                    <div>
                      <p className="text-white font-bold text-sm">{course.title}</p>
                      <p className="text-gray-500 text-xs">{course.price}</p>
                    </div>
                  </div>
                  <a
                    href={course.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-[#c9a227] hover:underline"
                  >
                    Ver página →
                  </a>
                </div>

                {activeVideo === course.id ? (
                  <div>
                    <div style={{ padding: '56.25% 0 0 0', position: 'relative' }}>
                      <iframe
                        src={course.vimeoSrc}
                        allow="autoplay; fullscreen; picture-in-picture"
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                        title={course.title}
                      />
                    </div>
                    <button
                      onClick={() => setActiveVideo(null)}
                      className="w-full py-2 text-xs text-gray-500 hover:text-white transition-colors bg-black/30"
                    >
                      ✕ Cerrar video
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setActiveVideo(course.id)}
                    className="w-full h-32 flex items-center justify-center gap-3 text-gray-400 hover:text-white hover:bg-[#1a1a2e] transition-all"
                  >
                    <span className="text-4xl">▶</span>
                    <span className="text-sm font-medium">Probar video</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── SECTION 2: Payment Monitor ── */}
        <section>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <h2 className="text-xl font-bold text-[#c9a227]">💳 Monitor de Pagos</h2>
            {/* Stats */}
            <div className="flex gap-3">
              <span className="text-xs px-3 py-1 rounded-full bg-green-600/20 text-green-400 border border-green-600/40 font-bold">
                ✅ {stats.paid} pagados
              </span>
              <span className="text-xs px-3 py-1 rounded-full bg-yellow-600/20 text-yellow-400 border border-yellow-600/40 font-bold">
                ⏳ {stats.pending} pendientes
              </span>
              <span className="text-xs px-3 py-1 rounded-full bg-red-600/20 text-red-400 border border-red-600/40 font-bold">
                ❌ {stats.failed} fallidos
              </span>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 mb-4">
            {(['all', 'paid', 'pending', 'failed'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${
                  filter === f
                    ? 'bg-[#c9a227] text-black'
                    : 'bg-[#111120] text-gray-400 border border-gray-800 hover:border-[#c9a227]/40'
                }`}
              >
                {f === 'all' ? `Todos (${stats.total})` : f}
              </button>
            ))}
          </div>

          {loadingPurchases ? (
            <div className="text-center text-gray-500 py-8">Cargando pagos...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center text-gray-600 py-8">No hay compras con este filtro.</div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-800">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800 bg-[#111120]">
                    <th className="text-left px-4 py-3 text-gray-400 font-medium">Usuario</th>
                    <th className="text-left px-4 py-3 text-gray-400 font-medium">Curso</th>
                    <th className="text-left px-4 py-3 text-gray-400 font-medium">Order ID</th>
                    <th className="text-left px-4 py-3 text-gray-400 font-medium">Estado</th>
                    <th className="text-left px-4 py-3 text-gray-400 font-medium">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(p => (
                    <tr key={p.id} className="border-b border-gray-800/50 hover:bg-[#111120] transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-white font-medium">{p.user.name || '—'}</p>
                        <p className="text-gray-500 text-xs">{p.user.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-gray-300 capitalize">{p.productId.replace(/-/g, ' ')}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-gray-500 font-mono text-xs">{p.orderId}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${STATUS_STYLE[p.status] || 'text-gray-400'}`}>
                          {p.status === 'paid' ? '✅ Pagado' : p.status === 'pending' ? '⏳ Pendiente' : '❌ Fallido'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                        {new Date(p.paidAt || p.createdAt).toLocaleDateString('es-ES', {
                          day: '2-digit', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

      </div>
    </div>
  )
}
