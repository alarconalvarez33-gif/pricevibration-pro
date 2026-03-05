'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { isAdmin } from '@/lib/constants'

const CATEGORIES = [
  { value: 'downloads',     label: '📥 Descargas' },
  { value: 'free_material', label: '🎁 Material Gratuito' },
  { value: 'brokers',       label: '💼 Brokers' },
  { value: 'education',     label: '📚 Educación' },
]

type Resource = {
  id: string; title: string; description: string | null; category: string
  imageUrl: string | null; downloadUrl: string | null; externalUrl: string | null
  content: string | null; order: number; isActive: boolean; createdAt: string
}

const inputCls = 'bg-[#0d0d0d] border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#c9a227] w-full text-sm'

const emptyForm = {
  title: '', description: '', category: 'downloads', imageUrl: '',
  downloadUrl: '', externalUrl: '', content: '', order: '0',
}

export default function AdminRecursosPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const user = session?.user as any
  const adminAccess = isAdmin(user?.email)

  const [resources, setResources] = useState<Resource[]>([])
  const [filter, setFilter] = useState('all')
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
    if (status === 'authenticated' && !adminAccess) router.push('/')
  }, [status, adminAccess, router])

  const fetchResources = useCallback(async () => {
    try {
      const url = filter === 'all' ? '/api/resources?all=1' : `/api/resources?category=${filter}`
      // Use admin endpoint that shows all (including inactive)
      const res = await fetch(`/api/resources${filter !== 'all' ? `?category=${filter}` : ''}`)
      if (res.ok) setResources(await res.json())
    } catch {}
  }, [filter])

  useEffect(() => { if (adminAccess) fetchResources() }, [adminAccess, fetchResources])

  function flash(text: string, ok = true) {
    setMsg({ text, ok })
    setTimeout(() => setMsg(null), 3500)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title || !form.category) return flash('Título y categoría son requeridos', false)
    setSubmitting(true)
    try {
      const res = await fetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        flash('Recurso agregado ✓')
        setForm(emptyForm)
        fetchResources()
      } else {
        const err = await res.json()
        flash(err.error || 'Error', false)
      }
    } catch { flash('Error de conexión', false) }
    setSubmitting(false)
  }

  async function toggleActive(id: string, current: boolean) {
    await fetch(`/api/resources/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !current }),
    })
    fetchResources()
  }

  async function deleteResource(id: string) {
    if (!confirm('¿Eliminar este recurso?')) return
    await fetch(`/api/resources/${id}`, { method: 'DELETE' })
    setResources(prev => prev.filter(r => r.id !== id))
    flash('Recurso eliminado')
  }

  if (status === 'loading' || !adminAccess) return null

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <div className="border-b border-[#c9a227]/20 bg-[#0a0a0f]/95 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📦</span>
            <div>
              <h1 className="text-lg font-bold text-white">Admin — Recursos</h1>
              <p className="text-xs text-[#c9a227]">Gestionar descargas, material gratuito y brokers</p>
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

      <div className="max-w-6xl mx-auto px-4 py-10">

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-gradient-to-br from-[#1a1a2e] to-[#0d0d0d] border border-[#c9a227]/30 rounded-xl p-6 mb-10">
          <h2 className="text-xl font-bold text-[#c9a227] mb-5">➕ Agregar Recurso</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            <div className="md:col-span-2">
              <label className="text-gray-400 text-xs block mb-1">Título *</label>
              <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Nombre del recurso" className={inputCls} />
            </div>
            <div>
              <label className="text-gray-400 text-xs block mb-1">Categoría *</label>
              <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className={inputCls}>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2 md:col-span-3">
              <label className="text-gray-400 text-xs block mb-1">Descripción</label>
              <input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Descripción breve" className={inputCls} />
            </div>
            <div>
              <label className="text-gray-400 text-xs block mb-1">URL de imagen</label>
              <input value={form.imageUrl} onChange={e => setForm(p => ({ ...p, imageUrl: e.target.value }))} placeholder="https://..." className={inputCls} />
            </div>
            <div>
              <label className="text-gray-400 text-xs block mb-1">URL de descarga</label>
              <input value={form.downloadUrl} onChange={e => setForm(p => ({ ...p, downloadUrl: e.target.value }))} placeholder="https://..." className={inputCls} />
            </div>
            <div>
              <label className="text-gray-400 text-xs block mb-1">URL externa</label>
              <input value={form.externalUrl} onChange={e => setForm(p => ({ ...p, externalUrl: e.target.value }))} placeholder="https://..." className={inputCls} />
            </div>
            <div>
              <label className="text-gray-400 text-xs block mb-1">Orden</label>
              <input type="number" value={form.order} onChange={e => setForm(p => ({ ...p, order: e.target.value }))} className={inputCls} />
            </div>
          </div>
          <button type="submit" disabled={submitting} className="bg-[#c9a227] hover:bg-[#d4af37] disabled:opacity-60 text-black font-bold px-6 py-3 rounded-lg transition-colors">
            {submitting ? '⏳ Guardando...' : '➕ Agregar'}
          </button>
        </form>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'all' ? 'bg-[#c9a227] text-black' : 'bg-[#111120] text-gray-400 border border-gray-800 hover:border-[#c9a227]/40'}`}>
            Todos ({resources.length})
          </button>
          {CATEGORIES.map(c => (
            <button key={c.value} onClick={() => setFilter(c.value)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === c.value ? 'bg-[#c9a227] text-black' : 'bg-[#111120] text-gray-400 border border-gray-800 hover:border-[#c9a227]/40'}`}>
              {c.label}
            </button>
          ))}
        </div>

        {/* Resources list */}
        {resources.length === 0 ? (
          <p className="text-gray-600 text-center py-12">No hay recursos. Agrega el primero.</p>
        ) : (
          <div className="space-y-3">
            {resources.map(r => (
              <div key={r.id} className={`bg-[#111120] border rounded-xl p-4 flex flex-wrap gap-4 items-start ${r.isActive ? 'border-gray-800' : 'border-gray-900 opacity-50'}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-white font-bold">{r.title}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-400">
                      {CATEGORIES.find(c => c.value === r.category)?.label || r.category}
                    </span>
                    {!r.isActive && <span className="text-xs text-red-400">Inactivo</span>}
                  </div>
                  {r.description && <p className="text-gray-500 text-sm mt-1">{r.description}</p>}
                  <div className="flex gap-4 mt-2 text-xs text-gray-600">
                    {r.downloadUrl && <span>📥 {r.downloadUrl.slice(0, 40)}...</span>}
                    {r.externalUrl && <span>🔗 {r.externalUrl.slice(0, 40)}...</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => toggleActive(r.id, r.isActive)} className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors ${r.isActive ? 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700' : 'bg-green-900/40 text-green-300 border-green-700/50 hover:bg-green-800/60'}`}>
                    {r.isActive ? '⏸ Desactivar' : '▶ Activar'}
                  </button>
                  <button onClick={() => deleteResource(r.id)} className="text-xs font-bold px-3 py-1.5 rounded-lg border bg-red-900/30 text-red-300 border-red-700/50 hover:bg-red-800/50 transition-colors">
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
