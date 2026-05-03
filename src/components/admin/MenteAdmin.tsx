'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { MENTE_TOPICS } from '@/lib/mente/topics'
import { generateSlug, calcReadingTime, renderMarkdown } from '@/lib/mente/utils'

const BG     = '#0A0A0B'
const CARD   = '#141415'
const BORDER = '#222222'
const MUTED  = '#555555'
const CYAN   = '#00D4FF'
const GREEN  = '#00D26A'
const RED    = '#FF4757'
const AMBER  = '#fbbf24'

interface Article {
  id: string; slug: string; title: string; topic: string; description: string
  content: string; imageUrl: string | null; imageData: string | null
  isPublished: boolean; isFeatured: boolean; tags: string[]
  readingTime: number | null; viewCount: number; publishedAt: string | null
  metaTitle: string | null; metaDescription: string | null
  _count: { comments: number }
}

interface FormData {
  title: string; slug: string; topic: string; description: string
  content: string; imageUrl: string; tags: string
  isPublished: boolean; isFeatured: boolean
  metaTitle: string; metaDescription: string
}

const EMPTY_FORM: FormData = {
  title: '', slug: '', topic: MENTE_TOPICS[0].id, description: '',
  content: '', imageUrl: '', tags: '', isPublished: false, isFeatured: false,
  metaTitle: '', metaDescription: '',
}

export default function MenteAdmin() {
  const [articles, setArticles]   = useState<Article[]>([])
  const [loading, setLoading]     = useState(true)
  const [filterTopic, setFilter]  = useState('all')
  const [searchQ, setSearchQ]     = useState('')
  const [view, setView]           = useState<'list' | 'create' | 'edit'>('list')
  const [editSlug, setEditSlug]   = useState<string | null>(null)
  const [form, setForm]           = useState<FormData>(EMPTY_FORM)
  const [saving, setSaving]       = useState(false)
  const [saveMsg, setSaveMsg]     = useState('')
  const [saveErr, setSaveErr]     = useState('')
  const [previewMode, setPreview] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const loadArticles = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/mente/articles?admin=1&page=1')
      const data = await res.json()
      setArticles(data.articles || [])
    } catch { /* noop */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { loadArticles() }, [loadArticles])

  const filtered = articles.filter(a => {
    if (filterTopic !== 'all' && a.topic !== filterTopic) return false
    if (searchQ && !a.title.toLowerCase().includes(searchQ.toLowerCase())) return false
    return true
  })

  const openCreate = () => {
    setForm(EMPTY_FORM); setImageFile(null); setImagePreview(null)
    setSaveMsg(''); setSaveErr(''); setEditSlug(null); setView('create')
  }

  const openEdit = (a: Article) => {
    setForm({
      title: a.title, slug: a.slug, topic: a.topic, description: a.description,
      content: a.content, imageUrl: a.imageUrl || '', tags: a.tags.join(', '),
      isPublished: a.isPublished, isFeatured: a.isFeatured,
      metaTitle: a.metaTitle || '', metaDescription: a.metaDescription || '',
    })
    setImageFile(null)
    setImagePreview(a.imageData ? `/api/mente/image/${a.id}` : a.imageUrl || null)
    setSaveMsg(''); setSaveErr(''); setEditSlug(a.slug); setView('edit')
  }

  const patchF = (k: keyof FormData, v: string | boolean) => {
    setForm(f => {
      const next = { ...f, [k]: v }
      if (k === 'title' && !f.slug) next.slug = generateSlug(v as string)
      return next
    })
    setSaveMsg(''); setSaveErr('')
  }

  const handleImage = (file: File) => {
    if (!file.type.startsWith('image/')) { setSaveErr('Solo imágenes'); return }
    if (file.size > 5 * 1024 * 1024) { setSaveErr('Máx 5 MB'); return }
    setImageFile(file); setImagePreview(URL.createObjectURL(file)); setSaveErr('')
  }

  const handleSave = async (publish?: boolean) => {
    if (!form.title.trim() || !form.description.trim() || !form.content.trim()) {
      setSaveErr('Título, descripción y contenido son requeridos'); return
    }
    setSaving(true); setSaveMsg(''); setSaveErr('')

    try {
      let imageData: string | null = null
      let imageMime: string | null = null

      if (imageFile) {
        const b64 = await new Promise<string>((res, rej) => {
          const reader = new FileReader()
          reader.onload = () => res(reader.result as string)
          reader.onerror = rej
          reader.readAsDataURL(imageFile)
        })
        imageData = b64
        imageMime = imageFile.type
      }

      const isPublished = publish !== undefined ? publish : form.isPublished
      const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean)
      const readingTime = calcReadingTime(form.content)

      const payload = {
        title: form.title.trim(),
        slug: form.slug.trim() || generateSlug(form.title),
        topic: form.topic,
        description: form.description.trim(),
        content: form.content,
        imageUrl: form.imageUrl.trim() || null,
        imageData, imageMime,
        tags, isPublished, isFeatured: form.isFeatured,
        metaTitle: form.metaTitle.trim() || null,
        metaDescription: form.metaDescription.trim() || null,
        readingTime,
      }

      let res: Response
      if (view === 'edit' && editSlug) {
        res = await fetch(`/api/mente/articles/${editSlug}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        res = await fetch('/api/mente/articles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      const data = await res.json()
      if (!res.ok) { setSaveErr(data.error || 'Error al guardar'); return }

      setSaveMsg(isPublished ? '✅ Publicado correctamente' : '✅ Guardado como borrador')
      await loadArticles()
      setView('list')
    } catch { setSaveErr('Error de conexión') }
    finally { setSaving(false) }
  }

  const handleDelete = async (slug: string) => {
    if (!confirm('¿Eliminar este artículo definitivamente?')) return
    setDeletingSlug(slug)
    try {
      await fetch(`/api/mente/articles/${slug}`, { method: 'DELETE' })
      setArticles(prev => prev.filter(a => a.slug !== slug))
    } finally { setDeletingSlug(null) }
  }

  const handleTogglePublish = async (a: Article) => {
    try {
      await fetch(`/api/mente/articles/${a.slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !a.isPublished }),
      })
      await loadArticles()
    } catch { /* noop */ }
  }

  const inputCls = "w-full border rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none transition-colors"
  const inputStyle = { backgroundColor: BG, borderColor: BORDER }
  const focusStyle = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = `${CYAN}60`
  }
  const blurStyle = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = BORDER
  }

  // ── FORM VIEW ──────────────────────────────────────────────────────────────
  if (view === 'create' || view === 'edit') {
    return (
      <div>
        {/* Form header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-white">
              {view === 'edit' ? `✏️ Editar: ${form.title}` : '📝 Nuevo artículo'}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: MUTED }}>
              Reading time calculado automáticamente · {calcReadingTime(form.content || 'x')} min estimado
            </p>
          </div>
          <button
            onClick={() => setView('list')}
            className="text-xs uppercase tracking-widest px-4 py-2 border rounded transition-colors hover:text-white"
            style={{ borderColor: '#333', color: MUTED }}
          >
            ← Volver
          </button>
        </div>

        {saveErr && <p className="text-xs mb-4 px-3 py-2 rounded border" style={{ color: RED, borderColor: `${RED}30`, backgroundColor: `${RED}08` }}>{saveErr}</p>}
        {saveMsg && <p className="text-xs mb-4 px-3 py-2 rounded border" style={{ color: GREEN, borderColor: `${GREEN}30`, backgroundColor: `${GREEN}08` }}>{saveMsg}</p>}

        <div className="grid lg:grid-cols-3 gap-5">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-4">

            {/* Title */}
            <div>
              <label className="block text-[10px] uppercase tracking-widest mb-1.5" style={{ color: MUTED }}>Título *</label>
              <input type="text" value={form.title} onChange={e => patchF('title', e.target.value)}
                placeholder="Ej: Las 5 emociones que destruyen tu cuenta de trading"
                className={inputCls} style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-[10px] uppercase tracking-widest mb-1.5" style={{ color: MUTED }}>
                Slug (URL) — auto-generado, editable
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs shrink-0" style={{ color: '#444' }}>/la-mente-del-trader/</span>
                <input type="text" value={form.slug} onChange={e => patchF('slug', e.target.value)}
                  placeholder="5-emociones-destruyen-cuenta-trading"
                  className={inputCls} style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-[10px] uppercase tracking-widest mb-1.5" style={{ color: MUTED }}>
                Descripción corta * <span style={{ color: form.description.length > 300 ? RED : '#333' }}>({form.description.length}/300)</span>
              </label>
              <textarea value={form.description} onChange={e => patchF('description', e.target.value)}
                placeholder="Resumen del artículo en 1-2 oraciones"
                rows={3} maxLength={310}
                className={inputCls + ' resize-none'} style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
            </div>

            {/* Content with preview toggle */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[10px] uppercase tracking-widest" style={{ color: MUTED }}>Contenido (Markdown) *</label>
                <button onClick={() => setPreview(v => !v)}
                  className="text-[10px] uppercase tracking-widest px-2.5 py-1 border rounded transition-colors hover:text-white"
                  style={{ borderColor: '#333', color: MUTED }}>
                  {previewMode ? '✏️ Editar' : '👁️ Preview'}
                </button>
              </div>
              {previewMode ? (
                <div
                  className="rounded-lg p-4 min-h-[300px] text-sm overflow-auto"
                  style={{ backgroundColor: '#fff', color: '#334155', border: `1px solid ${BORDER}` }}
                >
                  <div dangerouslySetInnerHTML={{ __html: renderMarkdown(form.content) }} />
                </div>
              ) : (
                <textarea value={form.content} onChange={e => patchF('content', e.target.value)}
                  placeholder={`# Título del artículo\n\nEscribí el contenido en Markdown...\n\n## Subtítulo\n\n**Negrita** · *Itálica* · \`código\`\n\n- Lista 1\n- Lista 2\n\n> Cita`}
                  rows={18}
                  className={inputCls + ' resize-y font-mono text-xs'} style={{ ...inputStyle, lineHeight: '1.6' }}
                  onFocus={focusStyle} onBlur={blurStyle} />
              )}
              <p className="text-[10px] mt-1" style={{ color: '#333' }}>
                Soporta: # títulos, **negrita**, *itálica*, `código`, - listas, &gt; citas, [link](url), ![img](url)
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">

            {/* Topic */}
            <div>
              <label className="block text-[10px] uppercase tracking-widest mb-1.5" style={{ color: MUTED }}>Tópico *</label>
              <select value={form.topic} onChange={e => patchF('topic', e.target.value)}
                className={inputCls} style={inputStyle} onFocus={focusStyle} onBlur={blurStyle}>
                {MENTE_TOPICS.map(t => (
                  <option key={t.id} value={t.id}>{t.icon} {t.label}</option>
                ))}
              </select>
            </div>

            {/* Image */}
            <div>
              <label className="block text-[10px] uppercase tracking-widest mb-1.5" style={{ color: MUTED }}>Imagen principal</label>
              {imagePreview && (
                <div className="relative rounded-lg overflow-hidden mb-2" style={{ aspectRatio: '16/9', backgroundColor: '#000' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <button onClick={() => { setImageFile(null); setImagePreview(null); patchF('imageUrl', '') }}
                    className="absolute top-2 right-2 text-[10px] px-2 py-1 rounded font-bold"
                    style={{ backgroundColor: RED, color: '#fff' }}>✕</button>
                </div>
              )}
              <button onClick={() => fileRef.current?.click()}
                className="w-full text-xs py-2.5 border border-dashed rounded-lg transition-colors hover:border-cyan-500"
                style={{ borderColor: '#333', color: MUTED }}>
                📷 {imagePreview ? 'Cambiar imagen' : 'Subir imagen'} (JPG/PNG/WebP · max 5MB)
              </button>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                onChange={e => { if (e.target.files?.[0]) handleImage(e.target.files[0]); e.target.value = '' }} />
              <p className="text-[10px] mt-1.5" style={{ color: '#333' }}>O pegar URL externa:</p>
              <input type="text" value={form.imageUrl} onChange={e => { patchF('imageUrl', e.target.value); if (e.target.value) setImagePreview(e.target.value) }}
                placeholder="https://..."
                className={inputCls + ' mt-1'} style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-[10px] uppercase tracking-widest mb-1.5" style={{ color: MUTED }}>Tags (separados por coma)</label>
              <input type="text" value={form.tags} onChange={e => patchF('tags', e.target.value)}
                placeholder="psicología, forex, principiantes"
                className={inputCls} style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
            </div>

            {/* Toggles */}
            <div className="space-y-2.5">
              {([
                { key: 'isFeatured' as const, label: '⭐ Destacado (aparece primero)' },
              ]).map(({ key, label }) => (
                <label key={key} className="flex items-center gap-3 cursor-pointer">
                  <div
                    onClick={() => patchF(key, !form[key])}
                    className="relative w-10 h-5 rounded-full transition-colors cursor-pointer shrink-0"
                    style={{ backgroundColor: form[key] ? CYAN : '#333' }}
                  >
                    <div className="absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform shadow"
                      style={{ transform: form[key] ? 'translateX(22px)' : 'translateX(2px)' }} />
                  </div>
                  <span className="text-xs" style={{ color: '#94A3B8' }}>{label}</span>
                </label>
              ))}
            </div>

            {/* SEO */}
            <div
              className="space-y-3 p-3 rounded-lg border"
              style={{ borderColor: '#1a1a1a', backgroundColor: '#0d0d0e' }}
            >
              <p className="text-[10px] uppercase tracking-widest font-bold" style={{ color: '#444' }}>SEO (opcional)</p>
              <div>
                <label className="block text-[10px] mb-1" style={{ color: MUTED }}>Meta título <span style={{ color: form.metaTitle.length > 60 ? RED : '#333' }}>({form.metaTitle.length}/60)</span></label>
                <input type="text" value={form.metaTitle} onChange={e => patchF('metaTitle', e.target.value)}
                  maxLength={65} className={inputCls} style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
              </div>
              <div>
                <label className="block text-[10px] mb-1" style={{ color: MUTED }}>Meta descripción <span style={{ color: form.metaDescription.length > 160 ? RED : '#333' }}>({form.metaDescription.length}/160)</span></label>
                <textarea value={form.metaDescription} onChange={e => patchF('metaDescription', e.target.value)}
                  rows={2} maxLength={170} className={inputCls + ' resize-none'} style={inputStyle}
                  onFocus={focusStyle} onBlur={blurStyle} />
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-2 pt-2">
              <button onClick={() => handleSave(false)}
                disabled={saving}
                className="w-full min-h-[44px] text-xs font-bold uppercase tracking-wider rounded-lg border transition-colors hover:text-white disabled:opacity-40"
                style={{ borderColor: '#333', color: MUTED }}>
                {saving ? 'Guardando...' : '💾 Guardar borrador'}
              </button>
              <button onClick={() => handleSave(true)}
                disabled={saving}
                className="w-full min-h-[44px] text-xs font-bold uppercase tracking-wider rounded-lg transition-opacity hover:opacity-90 disabled:opacity-40"
                style={{ backgroundColor: CYAN, color: '#000' }}>
                {saving ? 'Publicando...' : '🚀 Publicar ahora'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── LIST VIEW ──────────────────────────────────────────────────────────────
  return (
    <div>
      {/* List header */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <button
          onClick={openCreate}
          className="px-4 py-2 text-sm font-bold uppercase tracking-wider rounded-lg transition-opacity hover:opacity-90"
          style={{ backgroundColor: CYAN, color: '#000' }}
        >
          + Nuevo artículo
        </button>

        {/* Filter */}
        <select
          value={filterTopic}
          onChange={e => setFilter(e.target.value)}
          className="border rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
          style={{ backgroundColor: CARD, borderColor: BORDER, color: '#94A3B8' }}
        >
          <option value="all">Todos los tópicos</option>
          {MENTE_TOPICS.map(t => <option key={t.id} value={t.id}>{t.icon} {t.label}</option>)}
        </select>

        {/* Search */}
        <input
          type="text"
          value={searchQ}
          onChange={e => setSearchQ(e.target.value)}
          placeholder="🔍 Buscar por título..."
          className="border rounded-lg px-3 py-2 text-xs text-white focus:outline-none flex-1 min-w-[180px]"
          style={{ backgroundColor: CARD, borderColor: BORDER }}
        />

        <span className="ml-auto text-xs" style={{ color: MUTED }}>
          {filtered.length} artículo{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {saveMsg && (
        <div className="mb-4 px-3 py-2 rounded border text-xs" style={{ color: GREEN, borderColor: `${GREEN}30`, backgroundColor: `${GREEN}08` }}>
          {saveMsg}
        </div>
      )}

      {/* Articles list */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: AMBER, borderTopColor: 'transparent' }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 border rounded-xl" style={{ borderColor: BORDER }}>
          <p className="text-3xl mb-2">📝</p>
          <p className="text-sm" style={{ color: MUTED }}>
            {articles.length === 0 ? 'Sin artículos. Creá el primero.' : 'Sin resultados para este filtro.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(a => (
            <div
              key={a.slug}
              className="flex flex-col sm:flex-row sm:items-center gap-3 border rounded-xl px-4 py-3"
              style={{ backgroundColor: CARD, borderColor: BORDER }}
            >
              {/* Status dot + title */}
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div
                  className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0"
                  style={{ backgroundColor: a.isPublished ? GREEN : AMBER }}
                  title={a.isPublished ? 'Publicado' : 'Borrador'}
                />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{a.title}</p>
                  <div className="flex items-center flex-wrap gap-2 mt-0.5 text-[10px]" style={{ color: MUTED }}>
                    <span>{a.topic}</span>
                    <span>·</span>
                    <span>{a.isPublished ? '🟢 Publicado' : '🟡 Borrador'}</span>
                    <span>·</span>
                    <span>👁️ {a.viewCount}</span>
                    <span>·</span>
                    <span>💬 {a._count.comments}</span>
                    {a.isFeatured && <><span>·</span><span style={{ color: AMBER }}>⭐ Destacado</span></>}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                {a.isPublished && (
                  <a
                    href={`/la-mente-del-trader/${a.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] px-2.5 py-1 border rounded font-bold transition-colors hover:text-white"
                    style={{ borderColor: '#333', color: MUTED }}
                  >
                    👁️ Ver
                  </a>
                )}
                <button
                  onClick={() => openEdit(a)}
                  className="text-[10px] px-2.5 py-1 border rounded font-bold transition-colors hover:text-white"
                  style={{ borderColor: '#333', color: MUTED }}
                >
                  ✏️ Editar
                </button>
                <button
                  onClick={() => handleTogglePublish(a)}
                  className="text-[10px] px-2.5 py-1 border rounded font-bold transition-colors"
                  style={{
                    borderColor: a.isPublished ? `${AMBER}40` : `${GREEN}40`,
                    color: a.isPublished ? AMBER : GREEN,
                  }}
                >
                  {a.isPublished ? '⏸ Despublicar' : '🚀 Publicar'}
                </button>
                <button
                  onClick={() => handleDelete(a.slug)}
                  disabled={deletingSlug === a.slug}
                  className="text-[10px] px-2.5 py-1 border rounded font-bold transition-colors hover:bg-red-900/20 disabled:opacity-40"
                  style={{ borderColor: `${RED}40`, color: RED }}
                >
                  {deletingSlug === a.slug ? '...' : '🗑️'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
