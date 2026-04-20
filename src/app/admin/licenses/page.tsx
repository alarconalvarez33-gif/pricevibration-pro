'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface License {
  id: string
  code: string
  productType: string
  status: string
  issuedAt: string
  revokedAt: string | null
  revokedReason: string | null
  pineScriptVersion: string
  user: { email: string; name: string | null }
}

interface Stats {
  total: number
  active: number
  revoked: number
}

const STATUS_COLORS: Record<string, string> = {
  active:  '#00D26A',
  revoked: '#FF4757',
  expired: '#c9a227',
}

export default function AdminLicensesPage() {
  const [licenses, setLicenses] = useState<License[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [productFilter, setProductFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [msg, setMsg] = useState('')

  const load = async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (productFilter) params.set('productType', productFilter)
    if (statusFilter) params.set('status', statusFilter)
    const res = await fetch(`/api/admin/licenses?${params}`)
    const data = await res.json()
    setLicenses(data.licenses || [])
    setStats(data.stats || null)
    setLoading(false)
  }

  useEffect(() => { load() }, [productFilter, statusFilter])

  const doAction = async (licenseId: string, action: 'revoke' | 'reactivate', reason?: string) => {
    setActionLoading(licenseId)
    setMsg('')
    const res = await fetch('/api/admin/licenses', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ licenseId, action, reason }),
    })
    const data = await res.json()
    setMsg(data.message || data.error || '')
    setActionLoading(null)
    load()
  }

  const handleRevoke = (license: License) => {
    const reason = prompt(`Razón para revocar la licencia de ${license.user.email}:`)
    if (reason === null) return // cancelled
    doAction(license.id, 'revoke', reason)
  }

  return (
    <div className="min-h-screen px-6 py-10" style={{ backgroundColor: '#0A0A0B', fontFamily: "'Inter', sans-serif", color: '#fff' }}>
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Licencias MetaLevels
            </h1>
            <p className="text-sm mt-1" style={{ color: '#555' }}>Panel de gestión de licencias Pine Script</p>
          </div>
          <Link
            href="/admin/activate"
            className="text-xs uppercase tracking-[0.15em] px-4 py-2 border"
            style={{ borderColor: '#333', color: '#555' }}
          >
            ← Activaciones
          </Link>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Total', value: stats.total, color: '#888' },
              { label: 'Activas', value: stats.active, color: '#00D26A' },
              { label: 'Revocadas', value: stats.revoked, color: '#FF4757' },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl p-5 text-center"
                style={{ backgroundColor: '#141415', border: '1px solid #222' }}
              >
                <div className="text-3xl font-bold mb-1" style={{ color: s.color, fontFamily: "'JetBrains Mono', monospace" }}>
                  {s.value}
                </div>
                <div className="text-xs uppercase tracking-[0.2em]" style={{ color: '#555' }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-3 mb-6">
          <select
            value={productFilter}
            onChange={(e) => setProductFilter(e.target.value)}
            className="px-3 py-2 text-xs border text-white"
            style={{ backgroundColor: '#141415', borderColor: '#333' }}
          >
            <option value="">Todos los productos</option>
            <option value="metalevels">MetaLevels</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs border text-white"
            style={{ backgroundColor: '#141415', borderColor: '#333' }}
          >
            <option value="">Todos los estados</option>
            <option value="active">Activas</option>
            <option value="revoked">Revocadas</option>
            <option value="expired">Expiradas</option>
          </select>
          <button
            onClick={load}
            className="px-4 py-2 text-xs border uppercase tracking-[0.12em]"
            style={{ borderColor: '#333', color: '#555' }}
          >
            Actualizar
          </button>
        </div>

        {msg && (
          <div className="mb-4 px-4 py-3 rounded text-sm" style={{ backgroundColor: '#141415', border: '1px solid #333', color: '#00E5FF' }}>
            {msg}
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="text-center py-20" style={{ color: '#444' }}>Cargando...</div>
        ) : licenses.length === 0 ? (
          <div className="text-center py-20" style={{ color: '#444' }}>No hay licencias registradas</div>
        ) : (
          <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid #222' }}>
            <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#141415', borderBottom: '1px solid #222' }}>
                  {['Usuario', 'Código', 'Producto', 'Estado', 'Emitida', 'Versión', 'Acciones'].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-xs uppercase tracking-[0.15em] font-semibold"
                      style={{ color: '#555', fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {licenses.map((lic, i) => (
                  <tr
                    key={lic.id}
                    style={{
                      backgroundColor: i % 2 === 0 ? '#0A0A0B' : '#0d0d0e',
                      borderBottom: '1px solid #1a1a1a',
                    }}
                  >
                    <td className="px-4 py-3">
                      <div className="text-xs font-medium text-white">{lic.user.email}</div>
                      {lic.user.name && (
                        <div className="text-[10px]" style={{ color: '#555' }}>{lic.user.name}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <code
                        className="text-xs tracking-[0.1em] select-all"
                        style={{ color: '#00E5FF', fontFamily: "'JetBrains Mono', monospace" }}
                      >
                        {lic.code}
                      </code>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="text-[10px] px-2 py-0.5 rounded uppercase tracking-wider font-bold"
                        style={{ backgroundColor: '#c9a22715', color: '#c9a227' }}
                      >
                        {lic.productType}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="text-[10px] px-2 py-0.5 rounded uppercase tracking-wider font-bold"
                        style={{
                          backgroundColor: `${STATUS_COLORS[lic.status] || '#888'}15`,
                          color: STATUS_COLORS[lic.status] || '#888',
                        }}
                      >
                        {lic.status}
                      </span>
                      {lic.revokedReason && (
                        <div className="text-[10px] mt-1" style={{ color: '#555' }}>
                          {lic.revokedReason}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: '#555', fontFamily: "'JetBrains Mono', monospace" }}>
                      {new Date(lic.issuedAt).toLocaleDateString('es-PY')}
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: '#555' }}>
                      {lic.pineScriptVersion}
                    </td>
                    <td className="px-4 py-3">
                      {lic.status === 'active' ? (
                        <button
                          onClick={() => handleRevoke(lic)}
                          disabled={actionLoading === lic.id}
                          className="text-[10px] px-3 py-1 border uppercase tracking-widest transition-colors hover:border-red-500 hover:text-red-400 disabled:opacity-50"
                          style={{ borderColor: '#333', color: '#555' }}
                        >
                          Revocar
                        </button>
                      ) : lic.status === 'revoked' ? (
                        <button
                          onClick={() => doAction(lic.id, 'reactivate')}
                          disabled={actionLoading === lic.id}
                          className="text-[10px] px-3 py-1 border uppercase tracking-widest transition-colors disabled:opacity-50"
                          style={{ borderColor: '#00D26A30', color: '#00D26A' }}
                        >
                          {actionLoading === lic.id ? '...' : 'Reactivar'}
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
