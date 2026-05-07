'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import Header from '@/components/layout/Header'
import Footer from '@/components/Footer'

const CYAN = '#00D4FF'

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
  remaining?: number
  upgradeUrl?: string
  model?: string
}

const INITIAL_MESSAGE: Message = {
  role: 'assistant',
  content: 'Hola, soy SER — Sistema de Econofísica Resonante.\n\nEstás en modo avanzado. Puedo:\n• Analizar gráficos que me envíes (imagen)\n• Calcular niveles cuánticos Sacred Levels\n• Multi-timeframe H1 + H4 + D1\n• Correlaciones inter-mercado\n\n¿Con qué activo empezamos hoy?',
}

const QUICK_SUGGESTIONS = [
  '¿Niveles XAUUSD hoy?',
  '¿EURUSD H4 + D1?',
  '¿Qué es Sacred Levels?',
  '¿Cómo gestiono el riesgo con $200?',
  '¿BTC/USD confluencias?',
  '¿DXY impacto en Oro?',
]

export default function SerPage() {
  const { data: session, status } = useSession()
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [remaining, setRemaining] = useState<number | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageBase64, setImageBase64] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (e) => {
      const b64 = e.target?.result as string
      setImageBase64(b64)
      setImagePreview(b64)
    }
    reader.readAsDataURL(file)
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = Array.from(e.clipboardData.items)
    const imageItem = items.find(i => i.type.startsWith('image/'))
    if (imageItem) {
      e.preventDefault()
      const file = imageItem.getAsFile()
      if (file) handleImageFile(file)
    }
  }

  const clearImage = () => {
    setImageBase64(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const sendMessage = useCallback(async (text?: string) => {
    const msg = (text || input).trim()
    if ((!msg && !imageBase64) || loading) return

    if (!session) {
      window.location.href = '/login?callbackUrl=' + encodeURIComponent('/ser')
      return
    }

    const userContent = imageBase64
      ? `${msg || ''}${imagePreview ? ' [Imagen adjunta]' : ''}`.trim() || '[Imagen subida para análisis]'
      : msg

    setMessages(prev => [...prev, { role: 'user', content: userContent }])
    setInput('')
    const imgToSend = imageBase64
    clearImage()
    setLoading(true)

    try {
      const res = await fetch('/api/ser/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg || undefined, imageBase64: imgToSend || undefined, conversationId }),
      })
      const data = await res.json()

      if (res.ok) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.response,
          remaining: data.remaining,
          model: data.model,
        }])
        setConversationId(data.conversationId)
        setRemaining(data.remaining)
      } else {
        setMessages(prev => [...prev, {
          role: 'system',
          content: data.error || 'Error al procesar tu mensaje',
          upgradeUrl: data.upgradeUrl,
        }])
      }
    } catch {
      setMessages(prev => [...prev, { role: 'system', content: 'No pude conectar con SER. Intentá de nuevo.' }])
    } finally {
      setLoading(false)
    }
  }, [input, loading, session, conversationId, imageBase64, imagePreview])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  const resetConversation = () => {
    setMessages([INITIAL_MESSAGE])
    setConversationId(null)
    setRemaining(null)
    clearImage()
  }

  if (status === 'loading') {
    return (
      <main style={{ backgroundColor: '#000', minHeight: '100vh' }}>
        <Header />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center text-sm font-black animate-pulse"
              style={{ background: `linear-gradient(135deg, ${CYAN}, #0EA5E9)`, color: '#000' }}>
              SER
            </div>
            <p className="text-sm" style={{ color: '#64748B' }}>Cargando...</p>
          </div>
        </div>
      </main>
    )
  }

  if (!session) {
    return (
      <main style={{ backgroundColor: '#000', minHeight: '100vh' }}>
        <Header />
        <div className="flex items-center justify-center min-h-[80vh] px-4">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center text-lg font-black"
              style={{ background: `linear-gradient(135deg, ${CYAN}, #0EA5E9)`, color: '#000' }}>
              SER
            </div>
            <h1 className="text-2xl font-black text-white mb-3" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              Acceso requerido
            </h1>
            <p className="text-sm mb-6" style={{ color: '#64748B' }}>
              Iniciá sesión para interactuar con SER — Sistema de Econofísica Resonante.
            </p>
            <Link
              href={`/login?callbackUrl=${encodeURIComponent('/ser')}`}
              className="inline-block px-6 py-3 rounded-lg font-bold text-sm uppercase tracking-[0.1em]"
              style={{ backgroundColor: CYAN, color: '#000' }}
            >
              Iniciar sesión
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main style={{ backgroundColor: '#000', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <Header />

      <div style={{ paddingTop: '64px', height: '100vh', display: 'flex', flexDirection: 'column' }}>

        {/* Top bar */}
        <div
          className="flex items-center justify-between px-4 md:px-6 py-3 shrink-0"
          style={{ backgroundColor: 'rgba(15,23,42,0.95)', borderBottom: '1px solid rgba(0,212,255,0.15)', backdropFilter: 'blur(20px)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black"
              style={{ background: `linear-gradient(135deg, ${CYAN}, #0EA5E9)`, color: '#000' }}
            >
              SER
            </div>
            <div>
              <p className="text-sm font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                SER · Sistema de Econofísica Resonante
              </p>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <p className="text-[10px]" style={{ color: '#64748B' }}>Online · Sacred Levels</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {remaining !== null && (
              <span
                className="text-[10px] px-2.5 py-1 rounded"
                style={{ color: '#64748B', backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', fontFamily: "'JetBrains Mono', monospace" }}
              >
                {remaining === 999 ? '∞' : remaining} preguntas
              </span>
            )}
            <button
              onClick={resetConversation}
              className="text-[10px] px-2.5 py-1 rounded transition-all hover:text-white"
              style={{ color: '#64748B', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              Nueva conversación
            </button>
            <Link
              href="/ser/planes"
              className="text-[10px] px-3 py-1.5 rounded font-bold uppercase tracking-[0.08em] transition-all"
              style={{ backgroundColor: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)', color: CYAN }}
            >
              SER+ Planes
            </Link>
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 flex flex-col gap-5" style={{ scrollbarWidth: 'thin', scrollbarColor: '#1E293B transparent' }}>
          <div className="max-w-4xl mx-auto w-full flex flex-col gap-5">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                {msg.role !== 'system' && (
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-[11px] font-black shrink-0"
                    style={msg.role === 'user'
                      ? { backgroundColor: 'rgba(255,255,255,0.08)', color: '#fff' }
                      : { background: `linear-gradient(135deg, ${CYAN}, #0EA5E9)`, color: '#000' }
                    }
                  >
                    {msg.role === 'user' ? '👤' : 'S'}
                  </div>
                )}
                <div style={{ maxWidth: msg.role === 'system' ? '100%' : '75%' }}>
                  <div
                    className="rounded-2xl px-4 py-3 text-sm leading-relaxed"
                    style={{
                      whiteSpace: 'pre-wrap',
                      fontFamily: "'Inter', sans-serif",
                      ...(msg.role === 'user'
                        ? { backgroundColor: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)', color: '#E2E8F0' }
                        : msg.role === 'system'
                        ? { backgroundColor: 'rgba(255,215,0,0.08)', border: '1px solid rgba(255,215,0,0.25)', color: '#FCD34D', width: '100%' }
                        : { backgroundColor: 'rgba(15,23,42,0.8)', border: '1px solid rgba(0,212,255,0.1)', color: '#E2E8F0' }
                      ),
                    }}
                  >
                    {msg.content}
                    {msg.upgradeUrl && (
                      <div className="mt-3">
                        <Link href={msg.upgradeUrl} className="font-bold underline text-xs" style={{ color: CYAN }}>
                          Ver planes →
                        </Link>
                      </div>
                    )}
                  </div>
                  {msg.model && msg.role === 'assistant' && (
                    <p className="text-[10px] mt-1 ml-1" style={{ color: '#334155' }}>{msg.model}</p>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[11px] font-black shrink-0" style={{ background: `linear-gradient(135deg, ${CYAN}, #0EA5E9)`, color: '#000' }}>S</div>
                <div className="px-4 py-3.5 rounded-2xl flex gap-2 items-center" style={{ backgroundColor: 'rgba(15,23,42,0.8)', border: '1px solid rgba(0,212,255,0.1)' }}>
                  {[0, 150, 300].map(delay => (
                    <div key={delay} className="w-2 h-2 rounded-full" style={{ backgroundColor: CYAN, animation: `bounce 1.2s ${delay}ms infinite` }} />
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Quick suggestions */}
        <div className="px-4 md:px-8 py-2 shrink-0" style={{ borderTop: '1px solid rgba(0,212,255,0.05)' }}>
          <div className="max-w-4xl mx-auto flex flex-wrap gap-2">
            {QUICK_SUGGESTIONS.map((s, i) => (
              <button
                key={i}
                onClick={() => sendMessage(s)}
                disabled={loading}
                className="text-[11px] px-3 py-1.5 rounded-full transition-all hover:text-white disabled:opacity-40"
                style={{ backgroundColor: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.15)', color: '#94A3B8' }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Image preview */}
        {imagePreview && (
          <div className="px-4 md:px-8 py-2 shrink-0">
            <div className="max-w-4xl mx-auto flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imagePreview} alt="preview" className="h-14 w-auto rounded-lg object-contain" style={{ border: '1px solid rgba(0,212,255,0.3)' }} />
              <div>
                <p className="text-xs text-white">Imagen adjunta</p>
                <p className="text-[10px]" style={{ color: '#64748B' }}>Se enviará con tu mensaje</p>
              </div>
              <button onClick={clearImage} className="ml-auto text-xs px-2 py-1 rounded" style={{ color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)' }}>✕ Quitar</button>
            </div>
          </div>
        )}

        {/* Input area */}
        <div
          className="px-4 md:px-8 py-4 shrink-0"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', borderTop: '1px solid rgba(0,212,255,0.1)', backdropFilter: 'blur(20px)' }}
        >
          <div className="max-w-4xl mx-auto flex gap-3 items-end">
            {/* Image upload button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="p-2.5 rounded-xl transition-all hover:opacity-80 disabled:opacity-40 shrink-0"
              style={{ border: '1px solid rgba(0,212,255,0.2)', color: CYAN, backgroundColor: 'rgba(0,212,255,0.05)' }}
              title="Subir imagen de gráfico"
            >
              📊
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => { if (e.target.files?.[0]) handleImageFile(e.target.files[0]) }}
            />

            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              placeholder="Preguntá a SER... o pegá un gráfico con Ctrl+V"
              disabled={loading}
              rows={1}
              className="flex-1 text-sm resize-none rounded-xl px-4 py-3 focus:outline-none"
              style={{
                backgroundColor: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(0,212,255,0.15)',
                color: '#fff',
                minHeight: '48px',
                maxHeight: '120px',
                fontFamily: "'Inter', sans-serif",
              }}
              onFocus={e => (e.target.style.borderColor = CYAN)}
              onBlur={e => (e.target.style.borderColor = 'rgba(0,212,255,0.15)')}
            />

            <button
              onClick={() => sendMessage()}
              disabled={loading || (!input.trim() && !imageBase64)}
              className="px-5 py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              style={{ background: `linear-gradient(135deg, ${CYAN}, #0EA5E9)`, color: '#000', minWidth: '52px' }}
            >
              {loading ? (
                <svg className="animate-spin h-4 w-4 mx-auto" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : '➤'}
            </button>
          </div>
          <p className="text-center text-[10px] mt-2" style={{ color: '#1E293B' }}>
            SER no constituye asesoría financiera · Sacred Levels · Quantum Access requerido
          </p>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-5px); opacity: 1; }
        }
      `}</style>
    </main>
  )
}
