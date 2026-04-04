'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

const BG = '#0A0A0B'; const CARD = '#111112'; const BORDER = '#1e1e1f'
const CYAN = '#00E5FF'; const MUTED = '#555'; const GREEN = '#00ff88'
const SANS = "'Space Grotesk', sans-serif"; const MONO = "'JetBrains Mono', monospace"

interface Reservation { id: string; email: string; whatsapp: string | null; createdAt: string }

export default function AdminReservationsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [rows, setRows]       = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return
    if (status === 'unauthenticated') { router.replace('/login?redirect=/admin/reservations'); return }
    fetch('/api/reservations')
      .then(r => r.json())
      .then(d => { setRows(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [status])

  function exportCSV() {
    const header = 'Email,WhatsApp,Fecha\n'
    const body = rows.map(r =>
      `"${r.email}","${r.whatsapp || ''}","${new Date(r.createdAt).toLocaleString('es-PY')}"`
    ).join('\n')
    const blob = new Blob([header + body], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `reservaciones_${new Date().toISOString().slice(0,10)}.csv`
    a.click(); URL.revokeObjectURL(url)
  }

  if (status === 'loading') return <div style={{ background: BG, minHeight: '100vh' }} />

  return (
    <div style={{ background: BG, minHeight: '100vh', color: '#ccc', fontFamily: SANS }}>
      <div style={{ borderBottom: `1px solid ${BORDER}`, padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: 10, letterSpacing: '0.3em', color: CYAN, textTransform: 'uppercase', marginBottom: 4 }}>Admin</p>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#fff', margin: 0 }}>Reservaciones</h1>
          <p style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>
            {loading ? '...' : `${rows.length} reserva${rows.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button
          onClick={exportCSV}
          disabled={rows.length === 0}
          style={{
            background: 'transparent', border: `1px solid ${CYAN}`, color: CYAN,
            padding: '8px 18px', fontSize: 11, fontWeight: 700,
            letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer',
            opacity: rows.length === 0 ? 0.4 : 1, fontFamily: SANS,
          }}
        >
          Exportar CSV
        </button>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px' }}>
        {loading && (
          <p style={{ color: MUTED, fontSize: 13, textAlign: 'center', padding: 40 }}>Cargando...</p>
        )}

        {!loading && rows.length === 0 && (
          <p style={{ color: MUTED, fontSize: 13, textAlign: 'center', padding: 40,
            border: `1px solid ${BORDER}`, borderRadius: 6 }}>
            No hay reservaciones todavía.
          </p>
        )}

        {!loading && rows.length > 0 && (
          <div style={{ border: `1px solid ${BORDER}`, borderRadius: 6, overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', background: '#0d0d0e',
              borderBottom: `1px solid ${BORDER}`, padding: '10px 16px' }}>
              {['Email', 'WhatsApp', 'Fecha'].map(h => (
                <p key={h} style={{ fontSize: 9, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.2em', margin: 0 }}>{h}</p>
              ))}
            </div>

            {rows.map((r, i) => (
              <div
                key={r.id}
                style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr auto',
                  padding: '12px 16px', alignItems: 'center',
                  borderBottom: i < rows.length - 1 ? `1px solid ${BORDER}` : 'none',
                  background: CARD,
                }}
              >
                <p style={{ fontSize: 12, color: '#ccc', fontFamily: MONO, margin: 0, wordBreak: 'break-all' }}>{r.email}</p>
                <p style={{ fontSize: 12, color: r.whatsapp ? GREEN : MUTED, fontFamily: MONO, margin: 0 }}>
                  {r.whatsapp || '—'}
                </p>
                <p style={{ fontSize: 10, color: MUTED, margin: 0, whiteSpace: 'nowrap' }}>
                  {new Date(r.createdAt).toLocaleDateString('es-PY', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
