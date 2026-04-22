'use client'

import { useSession } from 'next-auth/react'
import { useRouter }  from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'

const ADMIN_EMAILS = ['raul@sacredlevels.com', 'alarconalvarez33@gmail.com']

const BG     = '#0A0A0B'
const CARD   = '#141415'
const BORDER = '#222222'
const MUTED  = '#555555'
const AMBER  = '#fbbf24'
const RED    = '#FF4757'
const GREEN  = '#00D26A'
const CYAN   = '#00E5FF'

interface LogEntry {
  id:             string
  paymentId:      string
  paymentType:    string
  userId:         string
  pagoparStatus:  string
  previousStatus: string
  newStatus:      string
  action:         string
  source:         string
  errorMsg:       string | null
  createdAt:      string
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('es-PY', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

function actionColor(action: string) {
  if (action === 'activated') return GREEN
  if (action === 'error')     return RED
  return MUTED
}

export default function ReconciliationLogsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [logs, setLogs]           = useState<LogEntry[]>([])
  const [loading, setLoading]     = useState(true)
  const [running, setRunning]     = useState(false)
  const [runResult, setRunResult] = useState<{ ok: boolean; msg: string } | null>(null)
  const [filter, setFilter]       = useState<'all' | 'activated' | 'error'>('all')

  const userEmail = session?.user?.email

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/login'); return }
    if (status === 'authenticated' && userEmail && !ADMIN_EMAILS.includes(userEmail)) router.push('/dashboard')
  }, [status, userEmail, router])

  const loadLogs = useCallback(() => {
    setLoading(true)
    fetch('/api/admin/reconciliation-logs')
      .then(r => r.json())
      .then(d => { if (d.logs) setLogs(d.logs) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (status === 'authenticated' && userEmail && ADMIN_EMAILS.includes(userEmail)) {
      loadLogs()
    }
  }, [status, userEmail, loadLogs])

  const handleRunNow = async () => {
    setRunning(true)
    setRunResult(null)
    try {
      const res  = await fetch('/api/admin/reconcile-now', { method: 'POST' })
      const data = await res.json()
      if (data.ok) {
        setRunResult({
          ok:  true,
          msg: `Completado — revisados: ${data.checked}, activados: ${data.activated}, sin acción: ${data.noAction}, errores: ${data.errors}`,
        })
        loadLogs()
      } else {
        setRunResult({ ok: false, msg: data.error || 'Error desconocido' })
      }
    } catch {
      setRunResult({ ok: false, msg: 'Error de conexión' })
    }
    setRunning(false)
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: BG }}>
        <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: AMBER, borderTopColor: 'transparent' }} />
      </div>
    )
  }
  if (!userEmail || !ADMIN_EMAILS.includes(userEmail)) return null

  const filtered = filter === 'all' ? logs : logs.filter(l => l.action === filter)

  const stats = {
    activated: logs.filter(l => l.action === 'activated').length,
    errors:    logs.filter(l => l.action === 'error').length,
    noAction:  logs.filter(l => l.action === 'no_action').length,
  }

  return (
    <div className="min-h-screen px-4 py-10" style={{ backgroundColor: BG, fontFamily: "'Space Grotesk', sans-serif" }}>
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Reconciliación de Pagos</h1>
            <p className="text-xs mt-1" style={{ color: MUTED }}>
              Historial del cron automático + ejecuciones manuales
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Link
              href="/admin/activate"
              className="text-xs uppercase tracking-widest px-4 py-2 border rounded transition-colors hover:text-white"
              style={{ borderColor: '#333', color: MUTED }}
            >
              Activaciones
            </Link>
            <button
              onClick={handleRunNow}
              disabled={running}
              className="text-xs uppercase tracking-widest px-4 py-2 border rounded font-bold transition-all disabled:opacity-40"
              style={{ borderColor: `${CYAN}40`, color: CYAN }}
            >
              {running ? 'Ejecutando...' : 'Ejecutar ahora'}
            </button>
          </div>
        </div>

        {/* Run result */}
        {runResult && (
          <div
            className="px-4 py-3 rounded-lg border text-sm font-semibold"
            style={{
              borderColor: runResult.ok ? `${GREEN}40` : `${RED}40`,
              backgroundColor: runResult.ok ? `${GREEN}08` : `${RED}08`,
              color: runResult.ok ? GREEN : RED,
            }}
          >
            {runResult.msg}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Activados', value: stats.activated, color: GREEN },
            { label: 'Sin acción', value: stats.noAction,  color: MUTED  },
            { label: 'Errores',   value: stats.errors,    color: RED   },
          ].map(s => (
            <div key={s.label} className="border rounded-xl p-4 text-center" style={{ backgroundColor: CARD, borderColor: BORDER }}>
              <p className="text-3xl font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs mt-1 uppercase tracking-widest" style={{ color: MUTED }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2">
          {(['all', 'activated', 'error'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="text-xs uppercase tracking-widest px-4 py-2 border rounded transition-all"
              style={{
                borderColor: filter === f ? `${AMBER}60` : '#333',
                color:       filter === f ? AMBER : MUTED,
                backgroundColor: filter === f ? `${AMBER}08` : 'transparent',
              }}
            >
              {f === 'all' ? 'Todos' : f === 'activated' ? 'Activados' : 'Errores'}
            </button>
          ))}
          <button
            onClick={loadLogs}
            className="ml-auto text-xs uppercase tracking-widest px-4 py-2 border rounded transition-colors hover:text-white"
            style={{ borderColor: '#333', color: MUTED }}
          >
            Actualizar
          </button>
        </div>

        {/* Logs table */}
        <div className="border rounded-xl overflow-hidden" style={{ backgroundColor: CARD, borderColor: BORDER }}>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: AMBER, borderTopColor: 'transparent' }} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center" style={{ color: MUTED }}>
              <p className="text-sm">Sin registros</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b" style={{ borderColor: BORDER }}>
                    {['Fecha', 'Tipo', 'Pago ID', 'PagoPar', 'Estado ant.', 'Estado nuevo', 'Acción', 'Origen'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[10px] uppercase tracking-widest" style={{ color: MUTED }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: '#111' }}>
                  {filtered.map(log => (
                    <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3 font-mono" style={{ color: MUTED }}>{fmtDate(log.createdAt)}</td>
                      <td className="px-4 py-3">
                        <span style={{ color: log.paymentType === 'subscription' ? CYAN : '#c9a227' }}>
                          {log.paymentType === 'subscription' ? 'sub' : 'prod'}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-white">{log.paymentId.slice(0, 8)}…</td>
                      <td className="px-4 py-3 font-mono" style={{ color: '#888' }}>{log.pagoparStatus}</td>
                      <td className="px-4 py-3 font-mono" style={{ color: '#666' }}>{log.previousStatus}</td>
                      <td className="px-4 py-3 font-mono" style={{ color: '#aaa' }}>{log.newStatus}</td>
                      <td className="px-4 py-3">
                        <span
                          className="px-2 py-0.5 border rounded font-bold uppercase"
                          style={{
                            color: actionColor(log.action),
                            borderColor: `${actionColor(log.action)}30`,
                          }}
                        >
                          {log.action}
                        </span>
                        {log.errorMsg && (
                          <p className="mt-1 text-[10px]" style={{ color: RED }}>{log.errorMsg.slice(0, 60)}</p>
                        )}
                      </td>
                      <td className="px-4 py-3" style={{ color: MUTED }}>{log.source}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
