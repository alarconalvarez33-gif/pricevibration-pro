'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
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

const STATUS_COLORS: Record<string, string> = {
  processed:  GREEN,
  duplicate:  CYAN,
  not_found:  AMBER,
  cancelled:  MUTED,
  failed:     RED,
  processing: AMBER,
}

interface WebhookLog {
  id: string
  provider: string
  numeroPedido: string | null
  hashPedido: string | null
  payload: Record<string, unknown>
  response: Record<string, unknown> | null
  status: string
  errorMsg: string | null
  userEmail: string | null
  createdAt: string
}

export default function WebhookLogsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [logs, setLogs]           = useState<WebhookLog[]>([])
  const [loading, setLoading]     = useState(true)
  const [filter, setFilter]       = useState<string>('all')
  const [expanded, setExpanded]   = useState<string | null>(null)
  const [retrying, setRetrying]   = useState<string | null>(null)
  const [retryResult, setRetryResult] = useState<Record<string, { ok: boolean; msg: string }>>({})

  const userEmail = session?.user?.email

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/login'); return }
    if (status === 'authenticated' && userEmail && !ADMIN_EMAILS.includes(userEmail)) router.push('/dashboard')
  }, [status, userEmail, router])

  const loadLogs = useCallback(() => {
    setLoading(true)
    const url = filter !== 'all' ? `/api/admin/webhook-logs?status=${filter}` : '/api/admin/webhook-logs'
    fetch(url)
      .then(r => r.json())
      .then(d => setLogs(d.logs ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [filter])

  useEffect(() => {
    if (status === 'authenticated' && userEmail && ADMIN_EMAILS.includes(userEmail)) loadLogs()
  }, [status, userEmail, loadLogs])

  const handleRetry = async (log: WebhookLog) => {
    setRetrying(log.id)
    try {
      const res = await fetch('/api/admin/webhook-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logId: log.id }),
      })
      const data = await res.json()
      setRetryResult(prev => ({
        ...prev,
        [log.id]: {
          ok: data.success,
          msg: data.alreadyProcessed
            ? 'Ya estaba activado'
            : data.success
              ? `✅ Activado: ${data.userEmail}`
              : data.errorMsg || data.error || 'Error',
        },
      }))
      if (data.success) loadLogs()
    } catch {
      setRetryResult(prev => ({ ...prev, [log.id]: { ok: false, msg: 'Error de conexión' } }))
    }
    setRetrying(null)
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: BG }}>
        <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: AMBER, borderTopColor: 'transparent' }} />
      </div>
    )
  }
  if (!userEmail || !ADMIN_EMAILS.includes(userEmail)) return null

  const FILTERS = [
    { key: 'all',        label: 'Todos'      },
    { key: 'processed',  label: 'Procesados' },
    { key: 'failed',     label: 'Fallidos'   },
    { key: 'duplicate',  label: 'Duplicados' },
    { key: 'not_found',  label: 'No encontrados' },
    { key: 'cancelled',  label: 'Cancelados' },
  ]

  return (
    <div className="min-h-screen px-4 py-10" style={{ backgroundColor: BG, fontFamily: "'Space Grotesk', sans-serif" }}>
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Logs de Webhook</h1>
            <p className="text-xs mt-1" style={{ color: MUTED }}>Historial de notificaciones PagoPar entrantes</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadLogs}
              className="text-xs uppercase tracking-widest px-4 py-2 border rounded transition-colors hover:text-white"
              style={{ borderColor: '#333', color: MUTED }}
            >
              Actualizar
            </button>
            <Link
              href="/admin/activate"
              className="text-xs uppercase tracking-widest px-4 py-2 border rounded transition-colors hover:text-white"
              style={{ borderColor: '#333', color: MUTED }}
            >
              ← Activaciones
            </Link>
          </div>
        </div>

        {/* Filter pills */}
        <div className="flex flex-wrap gap-2">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className="text-xs px-3 py-1.5 rounded-full border font-semibold transition-all"
              style={{
                borderColor: filter === f.key ? AMBER : '#333',
                backgroundColor: filter === f.key ? `${AMBER}15` : 'transparent',
                color: filter === f.key ? AMBER : MUTED,
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Logs table */}
        <div className="border rounded-xl overflow-hidden" style={{ backgroundColor: CARD, borderColor: BORDER }}>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: AMBER, borderTopColor: 'transparent' }} />
            </div>
          ) : logs.length === 0 ? (
            <div className="py-16 text-center" style={{ color: MUTED }}>
              <p className="text-sm">Sin logs{filter !== 'all' ? ` con estado "${filter}"` : ''}</p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: '#111' }}>
              {logs.map(log => (
                <div key={log.id}>
                  {/* Row */}
                  <div
                    className="flex items-center gap-3 px-5 py-3 hover:bg-white/[0.015] cursor-pointer"
                    onClick={() => setExpanded(prev => prev === log.id ? null : log.id)}
                  >
                    {/* Status badge */}
                    <span
                      className="text-[10px] font-bold uppercase px-2 py-0.5 rounded border shrink-0 w-28 text-center"
                      style={{
                        color: STATUS_COLORS[log.status] ?? MUTED,
                        borderColor: `${STATUS_COLORS[log.status] ?? MUTED}30`,
                      }}
                    >
                      {log.status}
                    </span>

                    {/* Date */}
                    <span className="text-xs font-mono shrink-0" style={{ color: MUTED }}>
                      {new Date(log.createdAt).toLocaleString('es-PY', {
                        day: '2-digit', month: '2-digit', year: '2-digit',
                        hour: '2-digit', minute: '2-digit', second: '2-digit',
                      })}
                    </span>

                    {/* Email */}
                    <span className="text-xs text-white truncate flex-1">
                      {log.userEmail ?? (log.hashPedido ? log.hashPedido.slice(0, 20) + '...' : '—')}
                    </span>

                    {/* Error */}
                    {log.errorMsg && (
                      <span className="text-xs truncate max-w-[200px]" style={{ color: RED }}>
                        {log.errorMsg}
                      </span>
                    )}

                    {/* Retry button for failed */}
                    {(log.status === 'failed' || log.status === 'not_found') && (
                      <button
                        onClick={e => { e.stopPropagation(); handleRetry(log) }}
                        disabled={retrying === log.id}
                        className="text-xs px-3 py-1 rounded font-bold uppercase shrink-0 transition-opacity hover:opacity-90 disabled:opacity-40"
                        style={{ backgroundColor: AMBER, color: '#000' }}
                      >
                        {retrying === log.id ? '...' : 'Retry'}
                      </button>
                    )}

                    {/* Retry result */}
                    {retryResult[log.id] && (
                      <span
                        className="text-xs shrink-0 font-semibold"
                        style={{ color: retryResult[log.id].ok ? GREEN : RED }}
                      >
                        {retryResult[log.id].msg}
                      </span>
                    )}

                    <span className="text-xs shrink-0" style={{ color: MUTED }}>
                      {expanded === log.id ? '▲' : '▼'}
                    </span>
                  </div>

                  {/* Expanded payload */}
                  {expanded === log.id && (
                    <div className="px-5 pb-4" style={{ backgroundColor: '#0d0d0e' }}>
                      <p className="text-[10px] uppercase tracking-widest mb-2 mt-3" style={{ color: MUTED }}>Payload</p>
                      <pre
                        className="text-xs rounded-lg p-4 overflow-auto max-h-64"
                        style={{ backgroundColor: '#060606', color: '#888', fontFamily: "'JetBrains Mono', monospace" }}
                      >
                        {JSON.stringify(log.payload, null, 2)}
                      </pre>
                      {log.response && (
                        <>
                          <p className="text-[10px] uppercase tracking-widest mb-2 mt-3" style={{ color: MUTED }}>Respuesta enviada</p>
                          <pre
                            className="text-xs rounded-lg p-4 overflow-auto max-h-32"
                            style={{ backgroundColor: '#060606', color: '#888', fontFamily: "'JetBrains Mono', monospace" }}
                          >
                            {JSON.stringify(log.response, null, 2)}
                          </pre>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
