'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

interface SubData {
  name: string | null
  email: string
  plan: string
  isPremium: boolean
  premiumUntil: string | null
  subscriptionStatus: string
  createdAt: string
  payments: { id: string; orderId: string; planType: string; amount: number; status: string; paidAt: string | null }[]
}

const PLAN_LABELS: Record<string, string> = {
  free: 'Gratuito', pro: 'Pro', whale: 'Whale', signal_hub: 'Signal Hub Pro',
}
const STATUS_COLOR: Record<string, string> = {
  active: '#00d26a', cancelled: '#c9a227', expired: '#ff4757', inactive: '#8a9bb3',
}

function fmtDate(s: string | null) {
  if (!s) return '—'
  return new Date(s).toLocaleDateString('es-PY', { day: '2-digit', month: 'long', year: 'numeric' })
}

export default function AccountPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [data, setData] = useState<SubData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login?redirect=/account')
  }, [status, router])

  useEffect(() => {
    if (status !== 'authenticated') return
    fetch('/api/user/subscription')
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false))
  }, [status])

  if (loading || status === 'loading') {
    return (
      <main className="min-h-screen bg-[#0d1421] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#c9a227] border-t-transparent rounded-full animate-spin" />
      </main>
    )
  }

  if (!data) return null

  const statusColor = STATUS_COLOR[data.subscriptionStatus] || '#8a9bb3'
  const paidPayments = data.payments.filter(p => p.status === 'paid')

  return (
    <main className="min-h-screen bg-[#0d1421]">
      <Navbar />
      <div className="pt-28 pb-24 px-4">
        <div className="max-w-3xl mx-auto">

          <h1 className="text-2xl font-bold text-white mb-8">Mi Cuenta</h1>

          <div className="grid md:grid-cols-2 gap-6">

            {/* Profile */}
            <div className="bg-[#131c2e] border border-[#1e2a3a] rounded-lg p-6">
              <h2 className="text-[#8a9bb3] text-[10px] uppercase tracking-widest mb-4">Perfil</h2>
              <div className="w-12 h-12 bg-[#1e2a3a] rounded-full flex items-center justify-center mb-4">
                <span className="text-[#c9a227] text-lg font-bold">
                  {(data.name || data.email).charAt(0).toUpperCase()}
                </span>
              </div>
              <p className="text-white font-semibold">{data.name || '—'}</p>
              <p className="text-[#8a9bb3] text-sm mt-1 break-all">{data.email}</p>
              <p className="text-[#8a9bb3] text-[10px] mt-3 uppercase tracking-widest">
                Miembro desde {fmtDate(data.createdAt)}
              </p>
            </div>

            {/* Subscription summary */}
            <div className="bg-[#131c2e] border border-[#1e2a3a] rounded-lg p-6">
              <h2 className="text-[#8a9bb3] text-[10px] uppercase tracking-widest mb-4">Suscripción</h2>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-white text-lg font-bold">{PLAN_LABELS[data.plan] || data.plan}</span>
                <span
                  className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded"
                  style={{ color: statusColor, backgroundColor: statusColor + '15' }}
                >
                  {data.subscriptionStatus}
                </span>
              </div>
              {data.premiumUntil && (
                <p className="text-[#8a9bb3] text-xs mb-4">
                  Acceso hasta <span className="text-white">{fmtDate(data.premiumUntil)}</span>
                </p>
              )}
              <Link
                href="/account/subscription"
                className="block w-full text-center px-4 py-2 bg-[#1e2a3a] hover:bg-[#2a3a4a] border border-[#1e2a3a] text-white text-xs font-medium rounded transition-colors"
              >
                Gestionar suscripción →
              </Link>
            </div>

          </div>

          {/* Quick links */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            {[
              { href: '/dashboard',             label: 'Dashboard'    },
              { href: '/dashboard',             label: 'Calculadora'  },
              { href: '/hub',                   label: 'Signal Hub'   },
              { href: '/account/subscription',  label: 'Suscripción'  },
            ].map(l => (
              <Link
                key={l.href}
                href={l.href}
                className="bg-[#131c2e] border border-[#1e2a3a] hover:border-[#c9a227] rounded-lg p-4 text-center text-xs font-semibold text-[#8a9bb3] hover:text-white transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Recent payments */}
          {paidPayments.length > 0 && (
            <div className="bg-[#131c2e] border border-[#1e2a3a] rounded-lg p-6 mt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[#8a9bb3] text-[10px] uppercase tracking-widest">Últimos pagos</h2>
                <Link href="/account/subscription" className="text-[#c9a227] text-[10px] hover:underline">Ver todos</Link>
              </div>
              <div className="space-y-2">
                {paidPayments.slice(0, 5).map(p => (
                  <div key={p.id} className="flex items-center justify-between py-1.5 border-b border-[#1e2a3a]/50 last:border-0">
                    <span className="text-[#8a9bb3] text-xs">{PLAN_LABELS[p.planType] || p.planType}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-white text-xs font-mono">{p.amount.toLocaleString('es-PY')} Gs.</span>
                      <span className="text-[#8a9bb3] text-[10px]">{fmtDate(p.paidAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
      <Footer />
    </main>
  )
}
