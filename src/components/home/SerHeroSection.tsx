'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import ReactMarkdown from 'react-markdown'

const CYAN = '#00D4FF'
const GUEST_MAX = 4
const STORAGE_KEY = 'ser_guest_uses'

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
  remaining?: number
  upgradeUrl?: string
  imagePreview?: string
  isStreaming?: boolean
}

const QUICK_SUGGESTIONS = [
  '¿Niveles XAUUSD H1?',
  '¿Análisis BTC en D1?',
  '¿Análisis EURUSD H4?',
  '¿Cómo gestiono el riesgo?',
]

const INITIAL_MESSAGE: Message = {
  role: 'assistant',
  content: 'Hola, soy SER, Inteligencia Artificial para ayudarte en lo que pidas.',
}

function GuestPaywall({ usedAll }: { usedAll: boolean }) {
  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center z-10 text-center px-6"
      style={{ backgroundColor: 'rgba(13,17,23,0.96)', backdropFilter: 'blur(4px)' }}
    >
      <div className="mb-4 w-12 h-12 rounded-full flex items-center justify-center mx-auto"
        style={{ backgroundColor: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.25)' }}>
        <span style={{ color: CYAN, fontSize: '20px' }}>S</span>
      </div>
      <h3 className="text-lg font-bold text-white mb-2" style={{ fontFamily: "'Montserrat', sans-serif" }}>
        {usedAll ? 'Agotaste tus 4 preguntas gratis' : 'Continuá con SER'}
      </h3>
      <p className="text-sm mb-6" style={{ color: '#64748B', fontFamily: "'Inter', sans-serif", maxWidth: '280px' }}>
        {usedAll
          ? 'Registrate para seguir explorando, o activá Quantum Access para uso ilimitado con datos en tiempo real.'
          : 'Iniciá sesión para continuar la conversación.'}
      </p>
      <div className="flex flex-col gap-3 w-full" style={{ maxWidth: '240px' }}>
        <Link
          href="/register"
          className="py-2.5 text-sm font-semibold rounded-lg text-center transition-all hover:opacity-90"
          style={{ backgroundColor: CYAN, color: '#000', fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Registrarse gratis
        </Link>
        <Link
          href="/billing"
          className="py-2.5 text-sm font-semibold rounded-lg text-center transition-all hover:border-white/30 hover:text-white"
          style={{ border: '1px solid rgba(255,255,255,0.12)', color: '#94A3B8', fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Quantum Access · Ilimitado
        </Link>
      </div>
      <p className="text-[10px] mt-4" style={{ color: '#1E293B' }}>Sin tarjeta requerida para registrarse</p>
    </div>
  )
}

export function SerHeroSection() {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [remaining, setRemaining] = useState<number | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageBase64, setImageBase64] = useState<string | null>(null)
  const [guestUses, setGuestUses] = useState(0)
  const [showPaywall, setShowPaywall] = useState(false)

  const messagesAreaRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const lastAssistantRef = useRef<HTMLDivElement>(null)
  const streamingStartedRef = useRef(false)

  // Load guest uses from localStorage on mount
  useEffect(() => {
    if (session) return
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const { count, resetAt } = JSON.parse(stored)
        if (Date.now() < resetAt) {
          setGuestUses(count)
          if (count >= GUEST_MAX) setShowPaywall(true)
        } else {
          localStorage.removeItem(STORAGE_KEY)
        }
      }
    } catch { /* ignore */ }
  }, [session])

  // When user sends → scroll to bottom to reveal typing indicator
  useEffect(() => {
    const last = messages[messages.length - 1]
    if (!last) return
    if (last.role === 'user') {
      const area = messagesAreaRef.current
      if (area) area.scrollTo({ top: area.scrollHeight, behavior: 'smooth' })
      streamingStartedRef.current = false
    }
  }, [messages.length])

  // When streaming starts → scroll to TOP of assistant response
  useEffect(() => {
    const last = messages[messages.length - 1]
    if (!last?.isStreaming) return
    if (!streamingStartedRef.current) {
      streamingStartedRef.current = true
      lastAssistantRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [messages])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }, [input])

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const b64 = ev.target?.result as string
      setImagePreview(b64)
      setImageBase64(b64)
    }
    reader.readAsDataURL(file)
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    for (const item of Array.from(e.clipboardData.items)) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile()
        if (!file) continue
        const reader = new FileReader()
        reader.onload = (ev) => {
          const b64 = ev.target?.result as string
          setImagePreview(b64)
          setImageBase64(b64)
        }
        reader.readAsDataURL(file)
        break
      }
    }
  }

  const removeImage = () => {
    setImagePreview(null)
    setImageBase64(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const saveGuestUse = (newCount: number) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        count: newCount,
        resetAt: Date.now() + 24 * 60 * 60 * 1000,
      }))
    } catch { /* ignore */ }
  }

  const sendMessage = async (text?: string) => {
    const msg = (text || input).trim()
    if ((!msg && !imageBase64) || loading) return

    const isGuest = !session

    // Guest limit check (before sending)
    if (isGuest && guestUses >= GUEST_MAX) {
      setShowPaywall(true)
      return
    }

    const imgPreviewToShow = imagePreview
    setMessages(prev => [...prev, {
      role: 'user',
      content: msg || '[Imagen para análisis]',
      imagePreview: imgPreviewToShow || undefined,
    }])
    setInput('')
    const sentImage = imageBase64
    removeImage()
    setLoading(true)

    try {
      const endpoint = isGuest ? '/api/ser/guest' : '/api/ser/chat'
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg || undefined, imageBase64: sentImage || undefined, conversationId }),
      })
      const data = await res.json()

      if (res.ok) {
        const fullText: string = data.response
        const chunkSize = Math.max(1, Math.floor(fullText.length / 150))

        // Update guest counter
        if (isGuest) {
          const newCount = guestUses + 1
          setGuestUses(newCount)
          saveGuestUse(newCount)
          setRemaining(data.remaining ?? GUEST_MAX - newCount)
          if (data.isLast || newCount >= GUEST_MAX) {
            setTimeout(() => setShowPaywall(true), 3000)
          }
        } else {
          setRemaining(data.remaining ?? null)
        }

        setMessages(prev => [...prev, { role: 'assistant', content: '', isStreaming: true }])

        let current = ''
        for (let i = 0; i < fullText.length; i += chunkSize) {
          current += fullText.slice(i, i + chunkSize)
          const snapshot = current
          setMessages(prev => {
            const next = [...prev]
            next[next.length - 1] = { ...next[next.length - 1], content: snapshot, isStreaming: true }
            return next
          })
          await new Promise(r => setTimeout(r, 18))
        }
        setMessages(prev => {
          const next = [...prev]
          next[next.length - 1] = { ...next[next.length - 1], content: fullText, isStreaming: false }
          return next
        })
        if (!isGuest) setConversationId(data.conversationId)
      } else {
        if (data.guestLimitReached) {
          setShowPaywall(true)
        } else {
          setMessages(prev => [...prev, {
            role: 'system',
            content: data.error || 'Error al procesar tu mensaje',
            upgradeUrl: data.upgradeUrl,
          }])
        }
      }
    } catch {
      setMessages(prev => [...prev, { role: 'system', content: 'No pude conectar con SER. Intentá de nuevo.' }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  const copyText = (t: string) => navigator.clipboard.writeText(t).catch(() => {})

  const isGuest = !session
  const guestRemaining = Math.max(0, GUEST_MAX - guestUses)

  return (
    <section
      id="ser"
      style={{
        background: 'linear-gradient(180deg, #000 0%, #0B0F17 100%)',
        padding: '100px 24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ maxWidth: '1400px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
        <div className="grid lg:grid-cols-[0.9fr_1.3fr] gap-16 items-center">

          {/* LEFT — identity */}
          <div className="text-center lg:text-left">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-semibold uppercase tracking-[0.18em] mb-8"
              style={{ backgroundColor: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.18)', color: '#64748B' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              INTELIGENCIA FINANCIERA · 24/7
            </div>

            <div className="mb-6">
              <h2
                className="text-8xl font-black leading-none mb-2"
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  background: `linear-gradient(135deg, #fff 0%, ${CYAN} 55%, #0EA5E9 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-4px',
                }}
              >
                SER
              </h2>
              <p className="text-sm font-medium uppercase tracking-[0.22em]" style={{ color: 'rgba(255,255,255,0.25)', fontFamily: "'Space Grotesk', sans-serif" }}>
                La primera IA trader
              </p>
            </div>

            <p className="text-lg font-semibold mb-3 text-white" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              &ldquo;La técnica se transforma en abundancia&rdquo;
            </p>
            <p className="text-sm mb-8 leading-relaxed" style={{ color: '#64748B', maxWidth: '400px', margin: '0 auto 32px', fontFamily: "'Inter', sans-serif" }}>
              Creada en los laboratorios de <span style={{ color: '#94A3B8', fontWeight: 600 }}>THE MENTOR</span>. Calcula niveles cuánticos, interpreta el mercado y simplifica tus operaciones en tiempo real.
            </p>

            <div className="grid grid-cols-2 gap-2.5 mb-8 max-w-sm mx-auto lg:mx-0">
              {[
                { icon: '⚡', text: 'Análisis tiempo real' },
                { icon: '📊', text: 'Sube tus gráficos' },
                { icon: '🇵🇾', text: '100% en español' },
                { icon: '🎯', text: 'Niveles cuánticos' },
              ].map(f => (
                <div key={f.text} className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
                  style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', color: '#94A3B8' }}>
                  <span>{f.icon}</span>
                  <span style={{ fontFamily: "'Inter', sans-serif" }}>{f.text}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-3 justify-center lg:justify-start">
              <Link href="/billing"
                className="px-6 py-2.5 text-xs font-bold uppercase tracking-[0.1em] rounded-lg transition-all hover:opacity-90"
                style={{ backgroundColor: CYAN, color: '#000', fontFamily: "'Space Grotesk', sans-serif" }}>
                Activar Quantum
              </Link>
              <Link href="/ser/planes"
                className="px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.1em] rounded-lg transition-all hover:border-white/30 hover:text-white"
                style={{ border: '1px solid rgba(255,255,255,0.12)', color: '#64748B', fontFamily: "'Space Grotesk', sans-serif" }}>
                Ver planes →
              </Link>
            </div>
          </div>

          {/* RIGHT — chat window */}
          <div>
            <div
              className="rounded-xl overflow-hidden flex flex-col relative"
              style={{
                backgroundColor: '#111827',
                border: '1px solid #1E2632',
                boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
                height: '680px',
              }}
            >
              {/* Paywall overlay */}
              {showPaywall && <GuestPaywall usedAll={guestUses >= GUEST_MAX} />}

              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3"
                style={{ backgroundColor: '#0D1117', borderBottom: '1px solid #1E2632' }}>
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0"
                    style={{ backgroundColor: 'rgba(0,212,255,0.12)', color: CYAN, border: '1px solid rgba(0,212,255,0.2)' }}>
                    S
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>SER</p>
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    </div>
                    <p className="text-[10px]" style={{ color: '#475569' }}>Sistema de Econofísica Resonante</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isGuest && !showPaywall && (
                    <span className="text-[10px] px-2 py-1 rounded" style={{ color: guestRemaining <= 1 ? '#F59E0B' : '#475569', backgroundColor: 'rgba(255,255,255,0.03)', fontFamily: "'JetBrains Mono', monospace" }}>
                      {guestRemaining} preguntas gratis
                    </span>
                  )}
                  {!isGuest && remaining !== null && (
                    <span className="text-[10px] px-2 py-1 rounded" style={{ color: '#475569', backgroundColor: 'rgba(255,255,255,0.03)', fontFamily: "'JetBrains Mono', monospace" }}>
                      {remaining === 999 ? '∞' : remaining} msgs
                    </span>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div ref={messagesAreaRef} className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#1E293B transparent' }}>
                {messages.map((msg, idx) => {
                  const isLastAssistant = msg.role === 'assistant' && idx === messages.length - 1
                  return (
                    <div
                      key={idx}
                      ref={isLastAssistant ? lastAssistantRef : undefined}
                      style={{
                        padding: '18px 20px',
                        borderBottom: '1px solid rgba(255,255,255,0.03)',
                        backgroundColor: msg.role === 'assistant' ? 'rgba(255,255,255,0.015)' : 'transparent',
                      }}
                    >
                      <div className="flex gap-3">
                        {msg.role !== 'system' && (
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5"
                            style={msg.role === 'user'
                              ? { backgroundColor: '#1E293B', color: '#94A3B8' }
                              : { backgroundColor: 'rgba(0,212,255,0.1)', color: CYAN, border: '1px solid rgba(0,212,255,0.2)' }}
                          >
                            {msg.role === 'user' ? 'T' : 'S'}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          {msg.role !== 'system' && (
                            <p className="text-[10px] font-semibold uppercase tracking-wider mb-1.5"
                              style={{ color: '#334155', fontFamily: "'Space Grotesk', sans-serif" }}>
                              {msg.role === 'user' ? 'Tú' : 'SER'}
                            </p>
                          )}

                          {msg.imagePreview && (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={msg.imagePreview} alt="Adjunto" className="mb-3 rounded-lg max-h-40 object-contain"
                              style={{ border: '1px solid #1E2632' }} />
                          )}

                          {msg.role === 'system' ? (
                            <div className="rounded-lg px-4 py-3 text-xs" style={{ backgroundColor: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.15)', color: '#D4A017' }}>
                              {msg.content}
                              {msg.upgradeUrl && (
                                <div className="mt-3">
                                  <Link href={msg.upgradeUrl} className="font-semibold underline" style={{ color: CYAN }}>Activar plan →</Link>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-sm leading-relaxed ser-markdown" style={{ color: '#CBD5E1' }}>
                              <ReactMarkdown>{msg.content}</ReactMarkdown>
                              {msg.isStreaming && (
                                <span style={{
                                  display: 'inline-block', width: '2px', height: '13px',
                                  background: '#475569', marginLeft: '2px', verticalAlign: 'middle',
                                  animation: 'ser-blink 0.7s infinite',
                                }} />
                              )}
                            </div>
                          )}

                          {msg.role === 'assistant' && !msg.isStreaming && msg.content && (
                            <div className="mt-2 flex gap-2 ser-actions">
                              <button
                                onClick={() => copyText(msg.content)}
                                className="text-[10px] px-2 py-0.5 rounded transition-all hover:text-white"
                                style={{ color: '#334155', fontFamily: "'Inter', sans-serif" }}
                              >
                                Copiar
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}

                {loading && messages[messages.length - 1]?.role === 'user' && (
                  <div style={{ padding: '18px 20px', backgroundColor: 'rgba(255,255,255,0.015)' }}>
                    <div className="flex gap-3">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0"
                        style={{ backgroundColor: 'rgba(0,212,255,0.1)', color: CYAN, border: '1px solid rgba(0,212,255,0.2)' }}>S</div>
                      <div className="flex-1">
                        <p className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#334155', fontFamily: "'Space Grotesk', sans-serif" }}>SER</p>
                        <div className="flex items-center gap-1.5">
                          {[0, 150, 300].map(d => (
                            <span key={d} className="w-1.5 h-1.5 rounded-full inline-block"
                              style={{ backgroundColor: '#334155', animation: `ser-bounce 1.4s ${d}ms infinite` }} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Suggestions */}
              <div className="flex flex-wrap gap-1.5 px-4 py-2" style={{ borderTop: '1px solid #1E2632', backgroundColor: '#0D1117' }}>
                {QUICK_SUGGESTIONS.map((s, i) => (
                  <button key={i} onClick={() => sendMessage(s)} disabled={loading || showPaywall}
                    className="text-[10px] px-2.5 py-1 rounded-md transition-all hover:text-white disabled:opacity-40"
                    style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid #1E2632', color: '#475569' }}>
                    {s}
                  </button>
                ))}
              </div>

              {/* Image preview */}
              {imagePreview && (
                <div className="px-4 py-2 flex items-center gap-3" style={{ borderTop: '1px solid #1E2632' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imagePreview} alt="preview" className="h-10 w-auto rounded object-contain"
                    style={{ border: '1px solid #1E2632' }} />
                  <p className="text-xs flex-1" style={{ color: '#94A3B8' }}>Imagen adjunta</p>
                  <button onClick={removeImage} className="text-[10px] px-2 py-1 rounded transition-all hover:text-red-400"
                    style={{ color: '#475569', border: '1px solid #1E2632' }}>✕</button>
                </div>
              )}

              {/* Input */}
              <div className="px-4 py-3" style={{ backgroundColor: '#0D1117', borderTop: '1px solid #1E2632' }}>
                <div className="flex gap-2 items-end">
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading || showPaywall}
                    className="flex items-center justify-center rounded-lg text-lg transition-all hover:text-white disabled:opacity-40 shrink-0"
                    style={{ width: '40px', height: '40px', minWidth: '40px', backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid #1E2632', color: '#475569' }}
                    title="Subir gráfico"
                  >
                    +
                  </button>

                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onPaste={handlePaste}
                    placeholder={showPaywall ? 'Registrate para continuar...' : 'Escribe a SER... (Ctrl+V para pegar imágenes)'}
                    disabled={loading || showPaywall}
                    rows={1}
                    className="flex-1 resize-none rounded-lg px-4 py-2.5 text-sm focus:outline-none"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.04)',
                      border: '1px solid #1E2632',
                      color: '#E2E8F0',
                      fontFamily: "'Inter', sans-serif",
                      minHeight: '40px',
                      maxHeight: '200px',
                      lineHeight: '1.5',
                    }}
                    onFocus={e => (e.target.style.borderColor = '#334155')}
                    onBlur={e => (e.target.style.borderColor = '#1E2632')}
                  />

                  <button
                    onClick={() => sendMessage()}
                    disabled={loading || (!input.trim() && !imageBase64) || showPaywall}
                    className="flex items-center justify-center rounded-lg font-medium text-sm transition-all hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
                    style={{ width: '40px', height: '40px', minWidth: '40px', backgroundColor: '#E2E8F0', color: '#0D1117' }}
                  >
                    {loading ? (
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    ) : '↑'}
                  </button>
                </div>
                {isGuest && !showPaywall && (
                  <p className="text-center text-[10px] mt-2" style={{ color: guestRemaining <= 1 ? '#78350F' : '#1E293B' }}>
                    {guestRemaining > 0
                      ? `${guestRemaining} pregunta${guestRemaining !== 1 ? 's' : ''} gratis restante${guestRemaining !== 1 ? 's' : ''} · Sin tarjeta requerida`
                      : 'Registrate para continuar usando SER'}
                  </p>
                )}
                {!isGuest && (
                  <p className="text-center text-[10px] mt-2" style={{ color: '#1E293B' }}>
                    SER puede cometer errores · No constituye asesoría financiera
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes ser-blink { 0%,50%{opacity:1} 51%,100%{opacity:0} }
        @keyframes ser-bounce { 0%,80%,100%{transform:scale(0.8);opacity:0.4} 40%{transform:scale(1);opacity:1} }
        .ser-markdown p { margin:0 0 10px 0; }
        .ser-markdown p:last-child { margin-bottom:0; }
        .ser-markdown strong { color:#E2E8F0; font-weight:600; }
        .ser-markdown ul,.ser-markdown ol { margin:8px 0 10px 0; padding-left:20px; }
        .ser-markdown li { margin-bottom:4px; }
        .ser-markdown code { background:rgba(255,255,255,0.06); padding:2px 6px; border-radius:4px; font-size:12px; color:#94A3B8; }
        .ser-markdown h1,.ser-markdown h2,.ser-markdown h3 { color:#E2E8F0; margin:14px 0 8px 0; font-weight:600; }
        .ser-markdown blockquote { border-left:2px solid #334155; padding-left:12px; margin:10px 0; color:#64748B; }
        .ser-markdown hr { border:none; border-top:1px solid rgba(255,255,255,0.06); margin:12px 0; }
        .ser-actions { display:flex; opacity:0; transition:opacity 0.15s; }
        div:hover .ser-actions { opacity:1; }
      `}</style>
    </section>
  )
}
