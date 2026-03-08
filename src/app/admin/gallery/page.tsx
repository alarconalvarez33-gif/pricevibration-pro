'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { isAdmin } from '@/lib/constants'

const TOOLS = [
  { value: 'hexagono',  label: 'Hexágono de Gann' },
  { value: 'serie144',  label: 'Serie 144' },
  { value: 'cuadrado9', label: 'Cuadrado de 9' },
  { value: 'quantum',   label: 'Niveles Cuánticos' },
  { value: 'gann',      label: 'Calculadora Gann' },
  { value: 'fibonacci', label: 'Fibonacci' },
]

const ASSETS = ['XAU/USD', 'XAG/USD', 'BTC/USD', 'ETH/USD', 'EUR/USD', 'GBP/USD', 'USD/JPY', 'US30', 'NAS100', 'Otro']

type GalleryResult = {
  id: string
  title: string
  description: string | null
  imageUrl: string
  tool: string
  asset: string
  date: string
  accuracy: string | null
  isActive: boolean
}

const emptyForm = {
  title: '',
  description: '',
  tool: 'quantum',
  asset: 'XAU/USD',
  date: new Date().toISOString().split('T')[0],
  accuracy: '',
  imageFile: null as File | null,
}

export default function AdminGalleryPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const user = session?.user as any
  const adminAccess = isAdmin(user?.email)

  const [results, setResults] = useState<GalleryResult[]>([])
  const [form, setForm] = useState(emptyForm)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
    if (status === 'authenticated' && !adminAccess) router.push('/')
  }, [status, adminAccess, router])

  const fetchResults = useCallback(async () => {
    try {
      const res = await fetch('/api/gallery')
      if (res.ok) setResults(await res.json())
    } catch {}
  }, [])

  useEffect(() => {
    if (adminAccess) fetchResults()
  }, [adminAccess, fetchResults])

  function flash(text: string, ok = true) {
    setMsg({ text, ok })
    setTimeout(() => setMsg(null), 3500)
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setForm(f => ({ ...f, imageFile: file }))
    const reader = new FileReader()
    reader.onloadend = () => setPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  function clearImage() {
    setPreview(null)
    setForm(f => ({ ...f, imageFile: null }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.imageFile) return flash('Seleccioná una imagen', false)
    if (!form.title) return flash('El título es requerido', false)

    setUploading(true)
    try {
      // 1. Upload image
      const fd = new FormData()
      fd.append('file', form.imageFile)
      const uploadRes = await fetch('/api/upload', { method: 'POST', body: fd })
      const uploadData = await uploadRes.json()
      if (!uploadData.success) throw new Error(uploadData.error || 'Error al subir imagen')

      // 2. Save to gallery
      const res = await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          description: form.description || null,
          tool: form.tool,
          asset: form.asset,
          date: form.date,
          accuracy: form.accuracy || null,
          imageUrl: uploadData.imageUrl,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Error al guardar')
      }

      flash('Resultado agregado ✓')
      setForm(emptyForm)
      setPreview(null)
      fetchResults()
    } catch (err: any) {
      flash(err.message || 'Error desconocido', false)
    }
    setUploading(false)
  }

  async function toggleActive(id: string, current: boolean) {
    await fetch(`/api/gallery/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !current }),
    })
    fetchResults()
  }

  async function deleteResult(id: string) {
    if (!confirm('¿Eliminar este resultado?')) return
    await fetch(`/api/gallery/${id}`, { method: 'DELETE' })
    setResults(prev => prev.filter(r => r.id !== id))
    flash('Resultado eliminado')
  }

  if (status === 'loading' || !adminAccess) return null

  const inputCls = 'bg-[#0d0d0d] border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#c9a227] w-full text-sm'

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <div className="border-b border-[#c9a227]/20 bg-[#0a0a0f]/95 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📊</span>
            <div>
              <h1 className="text-lg font-bold text-white">Admin — Galería de Resultados</h1>
              <p className="text-xs text-[#c9a227]">Subir capturas de herramientas</p>
            </div>
          </div>
          <a href="/admin/levels" className="text-sm text-gray-400 hover:text-white transition-colors">← Admin</a>
        </div>
      </div>

      {msg && (
        <div className={`fixed top-20 right-4 z-50 px-5 py-3 rounded-xl shadow-lg font-medium text-sm ${msg.ok ? 'bg-green-600' : 'bg-red-600'} text-white`}>
          {msg.text}
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 py-10">

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-gradient-to-br from-[#1a1a2e] to-[#0d0d0d] border border-[#c9a227]/30 rounded-xl p-6 mb-10">
          <h2 className="text-xl font-bold text-[#c9a227] mb-6">➕ Agregar Resultado</h2>

          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-gray-400 text-xs block mb-1">Título *</label>
              <input
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Ej: Rebote exacto en nivel Q3"
                className={inputCls}
              />
            </div>
            <div>
              <label className="text-gray-400 text-xs block mb-1">Precisión</label>
              <input
                value={form.accuracy}
                onChange={e => setForm(f => ({ ...f, accuracy: e.target.value }))}
                placeholder="Ej: +85 pips, Rebote exacto"
                className={inputCls}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-gray-400 text-xs block mb-1">Descripción</label>
              <input
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Descripción breve del resultado"
                className={inputCls}
              />
            </div>
            <div>
              <label className="text-gray-400 text-xs block mb-1">Herramienta</label>
              <select value={form.tool} onChange={e => setForm(f => ({ ...f, tool: e.target.value }))} className={inputCls}>
                {TOOLS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-gray-400 text-xs block mb-1">Activo</label>
              <select value={form.asset} onChange={e => setForm(f => ({ ...f, asset: e.target.value }))} className={inputCls}>
                {ASSETS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label className="text-gray-400 text-xs block mb-1">Fecha</label>
              <input
                type="date"
                value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className={inputCls}
              />
            </div>
          </div>

          {/* Image upload */}
          <div className="mb-6">
            <label className="text-gray-400 text-xs block mb-2">Imagen / Captura *</label>
            <div className="border-2 border-dashed border-gray-700 rounded-xl overflow-hidden hover:border-[#c9a227]/50 transition-colors">
              {preview ? (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={preview} alt="Preview" className="w-full max-h-72 object-contain bg-black" />
                  <button
                    type="button"
                    onClick={clearImage}
                    className="absolute top-2 right-2 bg-red-600 hover:bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold transition-colors"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer flex flex-col items-center justify-center py-10 gap-2">
                  <span className="text-4xl">📁</span>
                  <span className="text-gray-400 text-sm">Click para seleccionar imagen</span>
                  <span className="text-gray-600 text-xs">PNG, JPG, WEBP — máx. 5MB</span>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="w-full bg-[#c9a227] hover:bg-[#d4af37] disabled:opacity-60 text-black font-bold py-4 rounded-lg transition-colors"
          >
            {uploading ? '⏳ Subiendo...' : '📤 Subir y Agregar'}
          </button>
        </form>

        {/* Results list */}
        <h2 className="text-lg font-bold text-white mb-4">Resultados ({results.length})</h2>
        {results.length === 0 ? (
          <p className="text-gray-600 text-center py-12">No hay resultados aún.</p>
        ) : (
          <div className="space-y-3">
            {results.map(r => (
              <div
                key={r.id}
                className={`bg-[#111120] border rounded-xl p-4 flex gap-4 items-start ${r.isActive ? 'border-gray-800' : 'border-gray-900 opacity-50'}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={r.imageUrl} alt={r.title} className="w-24 h-16 object-cover rounded-lg flex-shrink-0 bg-black" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-white font-bold text-sm">{r.title}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-400">
                      {TOOLS.find(t => t.value === r.tool)?.label || r.tool}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#c9a227]/20 text-[#c9a227]">{r.asset}</span>
                    {!r.isActive && <span className="text-xs text-red-400">Inactivo</span>}
                  </div>
                  {r.accuracy && <p className="text-green-400 text-xs mt-1">✅ {r.accuracy}</p>}
                  <p className="text-gray-600 text-xs mt-0.5">
                    {new Date(r.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => toggleActive(r.id, r.isActive)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors ${r.isActive ? 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700' : 'bg-green-900/40 text-green-300 border-green-700/50'}`}
                  >
                    {r.isActive ? '⏸ Ocultar' : '▶ Mostrar'}
                  </button>
                  <button
                    onClick={() => deleteResult(r.id)}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg border bg-red-900/30 text-red-300 border-red-700/50 hover:bg-red-800/50 transition-colors"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
