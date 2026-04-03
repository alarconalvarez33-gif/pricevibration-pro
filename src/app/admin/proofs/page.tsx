'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

const BG = '#0A0A0B'; const CARD = '#111112'; const BORDER = '#1e1e1f'
const CYAN = '#00E5FF'; const RED = '#ff4466'; const MUTED = '#555'
const SANS = "'Space Grotesk', sans-serif"; const MONO = "'JetBrains Mono', monospace"

interface Proof { id: string; imageUrl: string; caption: string }

export default function AdminProofsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [proofs, setProofs]     = useState<Proof[]>([])
  const [caption, setCaption]   = useState('')
  const [preview, setPreview]   = useState<string | null>(null)
  const [base64, setBase64]     = useState<string | null>(null)
  const [saving, setSaving]     = useState(false)
  const [msg, setMsg]           = useState('')
  const fileRef                 = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (status === 'loading') return
    if (status === 'unauthenticated') { router.replace('/login?redirect=/admin/proofs'); return }
    loadProofs()
  }, [status])

  async function loadProofs() {
    const res = await fetch('/api/proofs')
    setProofs(await res.json())
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const result = ev.target?.result as string
      setBase64(result)
      setPreview(result)
    }
    reader.readAsDataURL(file)
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!base64 || !caption.trim()) { setMsg('Seleccioná una imagen y escribí la descripción'); return }
    setSaving(true); setMsg('')
    const res = await fetch('/api/proofs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl: base64, caption: caption.trim() }),
    })
    if (res.ok) {
      setCaption(''); setBase64(null); setPreview(null)
      if (fileRef.current) fileRef.current.value = ''
      setMsg('Captura subida correctamente')
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
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#fff', margin: 0 }}>Capturas del Home</h1>
        <p style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>
          Máximo 3 imágenes · al subir una nueva se elimina la más antigua automáticamente
        </p>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px' }}>

        {/* Upload form */}
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 6, padding: 20, marginBottom: 24 }}>
          <p style={{ fontSize: 11, color: CYAN, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 16 }}>
            Subir nueva captura ({proofs.length}/3)
          </p>
          <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* File picker */}
            <div>
              <label style={{ fontSize: 11, color: MUTED, display: 'block', marginBottom: 6 }}>Imagen</label>
              <label style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 10, padding: '18px 0', border: `1px dashed ${BORDER}`,
                borderRadius: 6, cursor: 'pointer', color: MUTED, fontSize: 12,
                background: BG, transition: 'border-color 0.2s',
              }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = CYAN + '60')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = BORDER)}
              >
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                {preview ? 'Cambiar imagen' : 'Seleccionar imagen'}
                <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
              </label>
            </div>

            {/* Preview */}
            {preview && (
              <div style={{ borderRadius: 6, overflow: 'hidden', border: `1px solid ${BORDER}`, background: '#0d0d0e' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="preview" style={{ width: '100%', maxHeight: 220, objectFit: 'contain', display: 'block' }} />
              </div>
            )}

            {/* Caption */}
            <div>
              <label style={{ fontSize: 11, color: MUTED, display: 'block', marginBottom: 6 }}>Descripción</label>
              <input
                value={caption}
                onChange={e => setCaption(e.target.value)}
                placeholder="Escribí la descripción de esta captura"
                required
                style={{ width: '100%', background: BG, border: `1px solid ${BORDER}`, color: '#ccc', padding: '10px 12px', fontSize: 12, fontFamily: MONO, borderRadius: 4, boxSizing: 'border-box' }}
              />
            </div>

            <button
              type="submit"
              disabled={saving || !base64}
              style={{
                background: base64 ? CYAN : '#222', color: base64 ? '#000' : MUTED,
                border: 'none', padding: '11px 24px', fontSize: 11, fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.15em',
                cursor: base64 ? 'pointer' : 'not-allowed',
                opacity: saving ? 0.6 : 1, alignSelf: 'flex-start', borderRadius: 4, fontFamily: SANS,
              }}
            >
              {saving ? 'Subiendo...' : 'Publicar en Home'}
            </button>

            {msg && (
              <p style={{ fontSize: 12, color: msg.includes('Error') || msg.includes('Seleccioná') ? RED : CYAN }}>
                {msg}
              </p>
            )}
          </form>
        </div>

        {/* Current proofs */}
        <p style={{ fontSize: 9, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.3em', marginBottom: 10 }}>
          Capturas activas
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {proofs.length === 0 && (
            <p style={{ fontSize: 12, color: MUTED, textAlign: 'center', padding: 32, border: `1px solid ${BORDER}`, borderRadius: 6 }}>
              No hay capturas activas. Subí la primera arriba.
            </p>
          )}
          {proofs.map((p, i) => (
            <div key={p.id} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 6, padding: 14, display: 'flex', gap: 14, alignItems: 'center' }}>
              <div style={{ fontSize: 9, color: MUTED, width: 14, flexShrink: 0, textAlign: 'center' }}>{i + 1}</div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.imageUrl} alt={p.caption} style={{ width: 90, height: 56, objectFit: 'cover', borderRadius: 4, background: '#0d0d0e', flexShrink: 0 }} />
              <p style={{ flex: 1, fontSize: 12, color: '#ccc', fontFamily: MONO }}>{p.caption}</p>
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
