'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef, useCallback } from 'react'
import Link from 'next/link'

const ADMIN_EMAILS = ['raul@sacredlevels.com', 'alarconalvarez33@gmail.com']
const MAX_SIZE_MB = 2
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp']

// ── Design tokens ──────────────────────────────────────────────────────────────
const BG     = '#0A0A0B'
const CARD   = '#141415'
const BORDER = '#222222'
const MUTED  = '#555555'
const AMBER  = '#fbbf24'
const RED    = '#FF4757'
const GREEN  = '#00D26A'

interface ResultSlot {
  id: string
  description: string
  date: string
  active: boolean
  order: number
}

interface SlotState {
  // Existing record (from DB)
  existing: ResultSlot | null
  // Editing state
  description: string
  date: string
  // New upload pending
  pendingFile: File | null
  pendingPreview: string | null  // data URL for preview
  // UI
  loading: boolean
  error: string
  success: string
  confirmDelete: boolean
}

function emptySlot(): SlotState {
  return {
    existing: null,
    description: '',
    date: '',
    pendingFile: null,
    pendingPreview: null,
    loading: false,
    error: '',
    success: '',
    confirmDelete: false,
  }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function SlotCard({
  index,
  slot,
  onChange,
  onSave,
  onDelete,
  onToggleActive,
}: {
  index: number
  slot: SlotState
  onChange: (patch: Partial<SlotState>) => void
  onSave: () => void
  onDelete: () => void
  onToggleActive: () => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const handleFile = useCallback((file: File) => {
    if (!ACCEPTED.includes(file.type)) {
      onChange({ error: 'Formato no permitido. Usá JPG, PNG o WebP.' })
      return
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      onChange({ error: `La imagen no puede superar ${MAX_SIZE_MB} MB.` })
      return
    }
    const preview = URL.createObjectURL(file)
    onChange({ pendingFile: file, pendingPreview: preview, error: '', success: '' })
  }, [onChange])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const imageUrl = slot.pendingPreview || (slot.existing ? `/api/results/image/${slot.existing.id}` : null)

  return (
    <div
      className="border rounded-xl overflow-hidden flex flex-col"
      style={{ backgroundColor: CARD, borderColor: slot.existing?.active === false ? '#333' : BORDER }}
    >
      {/* Slot header */}
      <div
        className="flex items-center justify-between px-4 py-2.5 border-b text-xs font-semibold uppercase tracking-widest"
        style={{ borderColor: BORDER, backgroundColor: '#0d0d0e', color: MUTED }}
      >
        <span>Resultado {index + 1}</span>
        {slot.existing && (
          <button
            onClick={onToggleActive}
            disabled={slot.loading}
            className="text-[10px] px-2 py-0.5 border rounded font-bold transition-colors"
            style={{
              borderColor: slot.existing.active ? `${GREEN}40` : '#333',
              color: slot.existing.active ? GREEN : '#444',
            }}
          >
            {slot.existing.active ? 'ACTIVO' : 'INACTIVO'}
          </button>
        )}
      </div>

      <div className="p-4 space-y-4 flex-1 flex flex-col">
        {/* Image area */}
        {imageUrl ? (
          <div className="relative rounded-lg overflow-hidden bg-black" style={{ aspectRatio: '16/9' }}>
            <img
              src={imageUrl}
              alt={slot.description || `Resultado ${index + 1}`}
              className="w-full h-full object-contain"
            />
            {/* Overlay to change image */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
              style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
            >
              <span className="text-white text-xs font-semibold bg-black/60 px-3 py-1.5 rounded">
                Cambiar imagen
              </span>
            </button>
          </div>
        ) : (
          // Drop zone
          <div
            onDragEnter={() => setDragging(true)}
            onDragLeave={() => setDragging(false)}
            onDragOver={e => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors"
            style={{
              aspectRatio: '16/9',
              borderColor: dragging ? AMBER : '#2a2a2a',
              backgroundColor: dragging ? `${AMBER}08` : 'transparent',
            }}
          >
            <span className="text-3xl mb-2">📷</span>
            <p className="text-xs font-semibold" style={{ color: MUTED }}>
              {dragging ? 'Soltá la imagen' : 'Click o arrastrá una imagen'}
            </p>
            <p className="text-[10px] mt-1" style={{ color: '#333' }}>
              JPG · PNG · WebP · máx {MAX_SIZE_MB} MB
            </p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={e => {
            const file = e.target.files?.[0]
            if (file) handleFile(file)
            e.target.value = ''
          }}
        />

        {/* Description */}
        <div>
          <label className="block text-[10px] uppercase tracking-widest mb-1.5" style={{ color: MUTED }}>
            Descripción
          </label>
          <input
            type="text"
            value={slot.description}
            onChange={e => onChange({ description: e.target.value, success: '' })}
            placeholder="XAUUSD — Rebote en nivel R4"
            className="w-full border rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none transition-colors"
            style={{ backgroundColor: BG, borderColor: BORDER }}
            onFocus={e => { (e.target as HTMLInputElement).style.borderColor = `${AMBER}60` }}
            onBlur={e  => { (e.target as HTMLInputElement).style.borderColor = BORDER }}
          />
        </div>

        {/* Date */}
        <div>
          <label className="block text-[10px] uppercase tracking-widest mb-1.5" style={{ color: MUTED }}>
            Fecha
          </label>
          <input
            type="date"
            value={slot.date}
            onChange={e => onChange({ date: e.target.value, success: '' })}
            className="w-full border rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none transition-colors"
            style={{ backgroundColor: BG, borderColor: BORDER, colorScheme: 'dark' }}
            onFocus={e => { (e.target as HTMLInputElement).style.borderColor = `${AMBER}60` }}
            onBlur={e  => { (e.target as HTMLInputElement).style.borderColor = BORDER }}
          />
        </div>

        {/* Feedback */}
        {slot.error && (
          <p className="text-xs" style={{ color: RED }}>{slot.error}</p>
        )}
        {slot.success && (
          <p className="text-xs" style={{ color: GREEN }}>{slot.success}</p>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-auto pt-2">
          <button
            onClick={onSave}
            disabled={slot.loading}
            className="flex-1 min-h-[44px] text-xs font-bold uppercase tracking-wider rounded-lg transition-opacity hover:opacity-90 disabled:opacity-40"
            style={{ backgroundColor: AMBER, color: '#000' }}
          >
            {slot.loading ? 'Guardando...' : slot.existing ? 'Actualizar' : 'Subir'}
          </button>

          {slot.existing && !slot.confirmDelete && (
            <button
              onClick={() => onChange({ confirmDelete: true })}
              disabled={slot.loading}
              className="min-h-[44px] px-4 text-xs font-bold uppercase tracking-wider rounded-lg border transition-colors hover:bg-red-900/20"
              style={{ borderColor: `${RED}40`, color: RED }}
            >
              Eliminar
            </button>
          )}
          {slot.existing && slot.confirmDelete && (
            <div className="flex gap-1">
              <button
                onClick={onDelete}
                disabled={slot.loading}
                className="min-h-[44px] px-3 text-[10px] font-bold uppercase rounded-lg"
                style={{ backgroundColor: RED, color: '#fff' }}
              >
                ¿Confirmar?
              </button>
              <button
                onClick={() => onChange({ confirmDelete: false })}
                className="min-h-[44px] px-3 text-[10px] font-bold uppercase rounded-lg border"
                style={{ borderColor: '#333', color: MUTED }}
              >
                No
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function AdminResultsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [slots, setSlots] = useState<SlotState[]>([emptySlot(), emptySlot(), emptySlot()])
  const [loading, setLoading] = useState(true)
  const [globalError, setGlobalError] = useState('')

  const email = session?.user?.email

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/login'); return }
    if (status === 'authenticated' && email && !ADMIN_EMAILS.includes(email)) {
      router.push('/dashboard'); return
    }
  }, [status, email, router])

  // Load existing results
  useEffect(() => {
    if (status !== 'authenticated' || !email || !ADMIN_EMAILS.includes(email)) return
    fetch('/api/admin/results')
      .then(r => r.json())
      .then(data => {
        if (!data.results) return
        setSlots(prev => {
          const next: SlotState[] = [emptySlot(), emptySlot(), emptySlot()]
          data.results.slice(0, 3).forEach((r: ResultSlot, i: number) => {
            next[i] = {
              ...emptySlot(),
              existing: r,
              description: r.description,
              date: r.date || '',
            }
          })
          return next
        })
      })
      .catch(() => setGlobalError('Error cargando resultados'))
      .finally(() => setLoading(false))
  }, [status, email])

  const updateSlot = (index: number, patch: Partial<SlotState>) => {
    setSlots(prev => prev.map((s, i) => i === index ? { ...s, ...patch } : s))
  }

  const handleSave = async (index: number) => {
    const slot = slots[index]
    if (!slot.description.trim()) {
      updateSlot(index, { error: 'La descripción es requerida.' })
      return
    }

    updateSlot(index, { loading: true, error: '', success: '' })

    try {
      // New upload
      if (!slot.existing) {
        if (!slot.pendingFile) {
          updateSlot(index, { loading: false, error: 'Seleccioná una imagen primero.' })
          return
        }
        const imageData = await fileToBase64(slot.pendingFile)
        const res = await fetch('/api/admin/results', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageData,
            mimeType: slot.pendingFile.type,
            description: slot.description.trim(),
            date: slot.date || null,
          }),
        })
        const data = await res.json()
        if (!res.ok) {
          updateSlot(index, { loading: false, error: data.error || 'Error al subir.' })
          return
        }
        // Refresh — reload page for simplicity
        window.location.reload()
        return
      }

      // Update existing
      const res = await fetch(`/api/admin/results/${slot.existing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: slot.description.trim(),
          date: slot.date || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        updateSlot(index, { loading: false, error: data.error || 'Error al actualizar.' })
        return
      }
      updateSlot(index, { loading: false, success: '¡Guardado!', confirmDelete: false })
    } catch {
      updateSlot(index, { loading: false, error: 'Error de conexión.' })
    }
  }

  const handleDelete = async (index: number) => {
    const slot = slots[index]
    if (!slot.existing) return
    updateSlot(index, { loading: true })
    try {
      const res = await fetch(`/api/admin/results/${slot.existing.id}`, { method: 'DELETE' })
      if (!res.ok) {
        updateSlot(index, { loading: false, error: 'Error al eliminar.' })
        return
      }
      window.location.reload()
    } catch {
      updateSlot(index, { loading: false, error: 'Error de conexión.' })
    }
  }

  const handleToggleActive = async (index: number) => {
    const slot = slots[index]
    if (!slot.existing) return
    updateSlot(index, { loading: true })
    try {
      await fetch(`/api/admin/results/${slot.existing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !slot.existing.active }),
      })
      window.location.reload()
    } catch {
      updateSlot(index, { loading: false, error: 'Error de conexión.' })
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: BG }}>
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: AMBER, borderTopColor: 'transparent' }} />
      </div>
    )
  }

  if (!email || !ADMIN_EMAILS.includes(email)) return null

  const activeCount = slots.filter(s => s.existing?.active !== false && s.existing).length

  return (
    <div className="min-h-screen px-4 py-10" style={{ backgroundColor: BG, fontFamily: "'Space Grotesk', sans-serif" }}>
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Gestionar Resultados Reales</h1>
            <p className="text-xs mt-1" style={{ color: MUTED }}>
              Máximo 3 resultados activos a la vez · aparecen en la landing automáticamente
            </p>
          </div>
          <Link
            href="/dashboard"
            className="text-xs uppercase tracking-widest px-4 py-2 border rounded transition-colors hover:text-white"
            style={{ borderColor: '#333', color: MUTED }}
          >
            ← Dashboard
          </Link>
        </div>

        {/* Active count indicator */}
        <div
          className="mb-6 flex items-center gap-3 px-4 py-3 border rounded-lg text-sm"
          style={{
            borderColor: activeCount >= 3 ? `${AMBER}40` : '#2a2a2a',
            backgroundColor: activeCount >= 3 ? `${AMBER}08` : 'transparent',
          }}
        >
          <div className="flex gap-1">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="w-3 h-3 rounded-full border"
                style={{
                  backgroundColor: i < activeCount ? AMBER : 'transparent',
                  borderColor: i < activeCount ? AMBER : '#333',
                }}
              />
            ))}
          </div>
          <span style={{ color: activeCount >= 3 ? AMBER : MUTED }}>
            {activeCount} de 3 slots activos
            {activeCount >= 3 && ' · para agregar uno nuevo, eliminá uno existente'}
          </span>
        </div>

        {globalError && (
          <p className="mb-4 text-sm" style={{ color: RED }}>{globalError}</p>
        )}

        {/* 3 slots grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {slots.map((slot, i) => (
            <SlotCard
              key={i}
              index={i}
              slot={slot}
              onChange={patch => updateSlot(i, patch)}
              onSave={() => handleSave(i)}
              onDelete={() => handleDelete(i)}
              onToggleActive={() => handleToggleActive(i)}
            />
          ))}
        </div>

        <div className="mt-8 p-4 border rounded-lg text-xs" style={{ borderColor: '#1e1e1e', color: '#444' }}>
          <strong className="text-[#555]">Notas:</strong> Las imágenes se guardan en la base de datos (no en disco).
          Formatos: JPG, PNG, WebP. Tamaño máx: 2 MB por imagen.
          Después de subir, aparecen en la landing en menos de 1 minuto.
        </div>
      </div>
    </div>
  )
}
