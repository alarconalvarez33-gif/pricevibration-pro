'use client'

import { useState, useEffect } from 'react'
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
  autoRenew: boolean
  cancelledAt: string | null
  nextBillingDate: string | null
  createdAt: string
  payments: {
    id: string
    orderId: string
    planType: string
    billingPeriod: string
    amount: number
    amountUsd: number
    status: string
    paidAt: string | null
    createdAt: string
  }[]
  subscriptionLogs: {
    id: string
    event: string
    plan: string | null
    note: string | null
    createdAt: string
  }[]
}

const PLAN_LABELS: Record<string, string> = {
  free: 'Gratuito', pro: 'Pro', whale: 'Whale', signal_hub: 'Signal Hub Pro',
}
const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  active:    { label: 'Activo',    color: '#00d26a' },
  cancelled: { label: 'Cancelado', color: '#c9a227' },
  expired:   { label: 'Expirado',  color: '#ff4757' },
  inactive:  { label: 'Inactivo',  color: '#8a9bb3' },
}
const EVENT_LABELS: Record<string, string> = {
  activated:    'Suscripción activada',
  cancelled:    'Suscripción cancelada',
  reactivated:  'Suscripción reactivada',
  expired:      'Suscripción expirada',
  reminder_sent:'Recordatorio enviado',
}

function fmtGs(n: number) { return n.toLocaleString('es-PY') + ' Gs.' }
function fmtDate(s: string | null) {
  if (!s) return '—'
  return new Date(s).toLocaleDateString('es-PY', { day: '2-digit', month: 'long', year: 'numeric' })
}
function daysUntil(s: string | null) {
  if (!s) return null
  return Math.ceil((new Date(s).getTime() - Date.now()) / 86400000)
}

export default function SubscriptionPage() {
  const { data: session, status, update: updateSession } = useSession()
  const router = useRouter()
  const [data, setData] = useState<SubData | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [confirmCancel, setConfirmCancel] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login?redirect=/account/subscription')
  }, [status, router])

  useEffect(() => {
    if (status !== 'authenticated') return
    fetch('/api/user/subscription')
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false))
  }, [status])

  async function handleCancel() {
    setActionLoading(true)
    setMessage(null)
    try {
      const res = await fetch('/api/subscription/cancel', { method: 'POST' })
      const json = await res.json()
      if (!res.ok) { setMessage({ type: 'error', text: json.error }); return }
      setMessage({ type: 'success', text: 'Tu suscripción fue cancelada. Mantenés el acceso hasta la fecha indicada.' })
      setConfirmCancel(false)
      await updateSession()
      // Re-fetch data
      const refreshed = await fetch('/api/user/subscription').then(r => r.json())
      setData(refreshed)
    } catch {
      setMessage({ type: 'error', text: 'Error al cancelar. Intentá de nuevo.' })
    } finally {
      setActionLoading(false)
    }
  }

  async function handleReactivate() {
    setActionLoading(true)
    setMessage(null)
    try {
      const res = await fetch('/api/subscription/reactivate', { method: 'POST' })
      const json = await res.json()
      if (!res.ok) { setMessage({ type: 'error', text: json.error }); return }
      setMessage({ type: 'success', text: 'Tu suscripción fue reactivada exitosamente.' })
      await updateSession()
      const refreshed = await fetch('/api/user/subscription').then(r => r.json())
      setData(refreshed)
    } catch {
      setMessage({ type: 'error', text: 'Error al reactivar. Intentá de nuevo.' })
    } finally {
      setActionLoading(false)
    }
  }

  if (loading || status === 'loading') {
    return (
      <main className="min-h-screen bg-[#0d1421] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#c9a227] border-t-transparent rounded-full animate-spin" />
      </main>
    )
  }

  if (!data) return null

  const statusInfo = STATUS_LABELS[data.subscriptionStatus] || STATUS_LABELS.inactive
  const days = daysUntil(data.premiumUntil)
  const canReactivate = data.subscriptionStatus === 'cancelled' && days !== null && days > 0

  return (
    <main className="min-h-screen bg-[#0d1421]">
      <Navbar />
      <div className="pt-28 pb-24 px-4">
        <div className="max-w-3xl mx-auto">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-8 text-[10px] uppercase tracking-widest text-[#8a9bb3]">
            <Link href="/account" className="hover:text-white transition-colors">Mi Cuenta</Link>
            <span>/</span>
            <span className="text-[#c9a227]">Suscripción</span>
          </div>

          <h1 className="text-2xl font-bold text-white mb-8">Gestionar Suscripción</h1>

          {/* Message */}
          {message && (
            <div className={`mb-6 px-4 py-3 rounded-lg border text-sm ${
              message.type === 'success'
                ? 'bg-[#00d26a]/10 border-[#00d26a]/30 text-[#00d26a]'
                : 'bg-[#ff4757]/10 border-[#ff4757]/30 text-[#ff4757]'
            }`}>
              {message.text}
            </div>
          )}

          {/* Plan status card */}
          <div className="bg-[#131c2e] border border-[#1e2a3a] rounded-lg p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-[#8a9bb3] text-[10px] uppercase tracking-widest mb-1">Plan actual</p>
                <h2 className="text-white text-xl font-bold">{PLAN_LABELS[data.plan] || data.plan}</h2>
              </div>
              <span
                className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded"
                style={{ color: statusInfo.color, backgroundColor: statusInfo.color + '15', border: `1px solid ${statusInfo.color}30` }}
              >
                {statusInfo.label}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <div>
                <p className="text-[#8a9bb3] text-[9px] uppercase tracking-widest mb-1">Acceso hasta</p>
                <p className="text-white text-sm font-mono">{fmtDate(data.premiumUntil)}</p>
                {days !== null && days > 0 && (
                  <p className="text-[#8a9bb3] text-[10px] mt-0.5">{days} día{days !== 1 ? 's' : ''} restante{days !== 1 ? 's' : ''}</p>
                )}
              </div>
              {data.subscriptionStatus === 'active' && data.nextBillingDate && (
                <div>
                  <p className="text-[#8a9bb3] text-[9px] uppercase tracking-widest mb-1">Próximo vencimiento</p>
                  <p className="text-white text-sm font-mono">{fmtDate(data.nextBillingDate)}</p>
                </div>
              )}
              {data.cancelledAt && (
                <div>
                  <p className="text-[#8a9bb3] text-[9px] uppercase tracking-widest mb-1">Cancelado el</p>
                  <p className="text-white text-sm font-mono">{fmtDate(data.cancelledAt)}</p>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3">
              {data.subscriptionStatus === 'active' && !confirmCancel && (
                <button
                  onClick={() => setConfirmCancel(true)}
                  className="px-4 py-2 text-xs font-semibold border border-[#ff4757]/50 text-[#ff4757] hover:bg-[#ff4757]/10 rounded transition-colors"
                >
                  Cancelar suscripción
                </button>
              )}

              {confirmCancel && (
                <div className="w-full bg-[#ff4757]/10 border border-[#ff4757]/30 rounded-lg p-4">
                  <p className="text-white text-sm font-semibold mb-1">¿Confirmás la cancelación?</p>
                  <p className="text-[#8a9bb3] text-xs mb-4">
                    Mantenés el acceso hasta <span className="text-white font-medium">{fmtDate(data.premiumUntil)}</span>. Podés reactivar antes de esa fecha.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={handleCancel}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-[#ff4757] hover:bg-[#ff6b6b] text-white text-xs font-bold rounded transition-colors disabled:opacity-50"
                    >
                      {actionLoading ? 'Cancelando...' : 'Sí, cancelar'}
                    </button>
                    <button
                      onClick={() => setConfirmCancel(false)}
                      className="px-4 py-2 border border-[#1e2a3a] text-[#8a9bb3] hover:text-white text-xs font-medium rounded transition-colors"
                    >
                      Volver
                    </button>
                  </div>
                </div>
              )}

              {canReactivate && (
                <button
                  onClick={handleReactivate}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-[#00d26a] hover:bg-[#00e070] text-black text-xs font-bold rounded transition-colors disabled:opacity-50"
                >
                  {actionLoading ? 'Reactivando...' : 'Reactivar suscripción'}
                </button>
              )}

              {(data.subscriptionStatus === 'expired' || data.subscriptionStatus === 'inactive' || data.plan === 'free') && (
                <Link
                  href="/billing"
                  className="px-4 py-2 bg-[#c9a227] hover:bg-[#d4af37] text-black text-xs font-bold rounded transition-colors"
                >
                  Ver planes
                </Link>
              )}
            </div>
          </div>

          {/* Payment history */}
          {data.payments.length > 0 && (
            <div className="bg-[#131c2e] border border-[#1e2a3a] rounded-lg p-6 mb-6">
              <h3 className="text-white text-sm font-semibold mb-4 uppercase tracking-widest">Historial de pagos</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-[#1e2a3a]">
                      <th className="text-left text-[#8a9bb3] text-[9px] uppercase tracking-widest pb-2">Fecha</th>
                      <th className="text-left text-[#8a9bb3] text-[9px] uppercase tracking-widest pb-2">Plan</th>
                      <th className="text-left text-[#8a9bb3] text-[9px] uppercase tracking-widest pb-2">Monto</th>
                      <th className="text-left text-[#8a9bb3] text-[9px] uppercase tracking-widest pb-2">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.payments.map(p => (
                      <tr key={p.id} className="border-b border-[#1e2a3a]/50">
                        <td className="py-2.5 text-[#8a9bb3] font-mono">{fmtDate(p.paidAt || p.createdAt)}</td>
                        <td className="py-2.5 text-white">{PLAN_LABELS[p.planType] || p.planType} · {p.billingPeriod === 'yearly' ? 'Anual' : 'Mensual'}</td>
                        <td className="py-2.5 text-white font-mono">{fmtGs(p.amount)}</td>
                        <td className="py-2.5">
                          <span className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded ${
                            p.status === 'paid' ? 'bg-[#00d26a]/15 text-[#00d26a]' :
                            p.status === 'failed' ? 'bg-[#ff4757]/15 text-[#ff4757]' :
                            'bg-[#8a9bb3]/15 text-[#8a9bb3]'
                          }`}>
                            {p.status === 'paid' ? 'Pagado' : p.status === 'failed' ? 'Fallido' : 'Pendiente'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Subscription log */}
          {data.subscriptionLogs.length > 0 && (
            <div className="bg-[#131c2e] border border-[#1e2a3a] rounded-lg p-6">
              <h3 className="text-white text-sm font-semibold mb-4 uppercase tracking-widest">Historial de suscripción</h3>
              <div className="space-y-2">
                {data.subscriptionLogs.map(log => (
                  <div key={log.id} className="flex items-start justify-between gap-4 py-2 border-b border-[#1e2a3a]/50 last:border-0">
                    <div>
                      <p className="text-white text-xs">{EVENT_LABELS[log.event] || log.event}</p>
                      {log.note && <p className="text-[#8a9bb3] text-[10px] mt-0.5">{log.note}</p>}
                    </div>
                    <span className="text-[#8a9bb3] text-[10px] font-mono whitespace-nowrap">{fmtDate(log.createdAt)}</span>
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
