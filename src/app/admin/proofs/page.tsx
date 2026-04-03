'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

const BG = '#0A0A0B'; const CARD = '#111112'; const BORDER = '#1e1e1f'
const CYAN = '#00E5FF'; const RED = '#ff4466'; const MUTED = '#555'
const SANS = "'Space Grotesk', sans-serif"; const MONO = "'JetBrains Mono', monospace"

interface Proof { id: string; imageUrl: string; caption: string; order: number }

export default function AdminProofsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [proofs, setProofs] = useState<Proof[]>([])
  const [imageUrl, setImageUrl] = useState('')
  const [caption, setCaption] = useState('')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    if (status === 'loading') return
    if (status === 'unauthenticated') { router.replace('/login?redirect=/admin/proofs'); return }
    loadProofs()
  }, [status])

  async function loadProofs() {
    const res = await fetch('/api/proofs')
    const data = await res.json()
    setProofs(data)
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setMsg('')
    const res = await fetch('/api/proofs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl, caption, order: proofs.length }),
    })
    if (res.ok) {
      setImageUrl(''); setCaption('')
      setMsg('Captura agregada correctamente')
      loadProofs()
    } else {
      const d = await res.json()
      setMsg(d.error || 'Error al guardar')
    }
    setSaving(false)
  }

  async function handleDelete(id: string) {
    await fetch('/api/proofs', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    loadProofs()
  }

  if (status === 'loading') return <div style={{ background: BG, minHeight: '100vh' }} />

  return (
    <div style={{ background: BG, minHeight: '100vh', color: '#ccc', fontFamily: SANS }}>
      <div style={{ borderBottom: `1px solid ${BORDER}`, padding: '16px 24px' }}>
        <p style={{ fontSize: 10, letterSpacing: '0.3em', color: CYAN, textTransform: 'uppercase', marginBottom: 4 }}>Admin</p>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#fff', margin: 0 }}>Gestión de Capturas</h1>
        <p style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>Capturas que aparecen en la sección &quot;Niveles en Acción&quot; del home</p>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px' }}>
        {/* Add form */}
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 6, padding: 20, marginBottom: 24 }}>
          <p style={{ fontSize: 11, color: CYAN, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 16 }}>Agregar nueva captura</p>
          <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ fontSize: 11, color: MUTED, display: 'block', marginBottom: 4 }}>URL de imagen</label>
              <input
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                placeholder="https://... o /proof1.jpg"
                required
                style={{ width: '100%', background: BG, border: `1px solid ${BORDER}`, color: '#ccc', padding: '10px 12px', fontSize: 12, fontFamily: MONO, borderRadius: 4, boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, color: MUTED, display: 'block', marginBottom: 4 }}>Descripción</label>
              <input
                value={caption}
                onChange={e => setCaption(e.target.value)}
                placeholder="XAUUSD — Rebote exacto en nivel Q3"
                required
                style={{ width: '100%', background: BG, border: `1px solid ${BORDER}`, color: '#ccc', padding: '10px 12px', fontSize: 12, fontFamily: MONO, borderRadius: 4, boxSizing: 'border-box' }}
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              style={{ background: CYAN, color: '#000', border: 'none', padding: '10px 20px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', cursor: 'pointer', opacity: saving ? 0.5 : 1, alignSelf: 'flex-start', borderRadius: 4, fontFamily: SANS }}
            >
              {saving ? 'Guardando...' : 'Agregar Captura'}
            </button>
            {msg && <p style={{ fontSize: 12, color: msg.includes('Error') ? RED : CYAN }}>{msg}</p>}
          </form>
        </div>

        {/* List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {proofs.length === 0 && (
            <p style={{ fontSize: 12, color: MUTED, textAlign: 'center', padding: 32 }}>No hay capturas. Agrega la primera arriba.</p>
          )}
          {proofs.map((p) => (
            <div key={p.id} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 6, padding: 16, display: 'flex', gap: 16, alignItems: 'center' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.imageUrl} alt={p.caption} style={{ width: 80, height: 50, objectFit: 'cover', borderRadius: 4, background: '#0d0d0e', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 12, color: '#ccc', fontFamily: MONO }}>{p.caption}</p>
                <p style={{ fontSize: 10, color: MUTED, marginTop: 2 }}>{p.imageUrl.substring(0, 60)}{p.imageUrl.length > 60 ? '...' : ''}</p>
              </div>
              <button
                onClick={() => handleDelete(p.id)}
                style={{ background: 'transparent', border: `1px solid ${RED}40`, color: RED, padding: '6px 12px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', cursor: 'pointer', borderRadius: 4, fontFamily: SANS, flexShrink: 0 }}
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
