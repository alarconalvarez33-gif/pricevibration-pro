'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
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
  timestamp?: string
}

const QUICK_SUGGESTIONS = [
  { label: '¿Niveles XAUUSD H1?', short: 'XAUUSD H1' },
  { label: '¿Análisis BTC en D1?', short: 'BTC D1' },
  { label: '¿Análisis EURUSD H4?', short: 'EURUSD H4' },
  { label: '¿Cómo gestiono el riesgo?', short: 'Gestión de riesgo' },
  { label: '📎 Subir gráfico', short: '__upload__' },
]

const INITIAL_MESSAGE: Message = {
  role: 'assistant',
  content: 'Bienvenido. Puedo analizar gráficos en cualquier temporalidad (M15 · H1 · H4 · D1), identificar niveles clave y razonar sobre confluencias inter-mercado.\n\n**¿Qué activo querés analizar?**',
}

const generateSessionId = () => {
  const chars = '0123456789ABCDEF'
  let id = ''
  for (let i = 0; i < 4; i++) id += chars[Math.floor(Math.random() * chars.length)]
  id += '-X'
  for (let i = 0; i < 2; i++) id += Math.floor(Math.random() * 10)
  return id
}

function GuestPaywall({ usedAll }: { usedAll: boolean }) {
  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center z-10 text-center px-6"
      style={{ backgroundColor: 'rgba(0,0,0,0.93)', backdropFilter: 'blur(8px)' }}
    >
      <div
        className="mb-4 w-14 h-14 rounded-full flex items-center justify-center mx-auto"
        style={{ backgroundColor: 'rgba(0,212,255,0.1)', border: '2px solid rgba(0,212,255,0.3)' }}
      >
        <span style={{ color: CYAN, fontSize: '18px', fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>SER</span>
      </div>
      <h3 className="text-lg font-bold text-white mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
        {usedAll ? 'Agotaste tus 4 preguntas gratis' : 'Continuá con SER'}
      </h3>
      <p className="text-sm mb-6" style={{ color: '#64748B', fontFamily: "'Inter', sans-serif", maxWidth: '280px' }}>
        {usedAll
          ? 'Registrate para seguir explorando, o activá Quantum Access para uso ilimitado.'
          : 'Iniciá sesión para continuar la conversación.'}
      </p>
      <div className="flex flex-col gap-3 w-full" style={{ maxWidth: '240px' }}>
        <Link
          href="/register"
          className="py-3 text-sm font-bold rounded-lg text-center transition-all hover:opacity-90 uppercase tracking-wider"
          style={{ backgroundColor: CYAN, color: '#000', fontFamily: "'Inter', sans-serif" }}
        >
          Registrarse gratis
        </Link>
        <Link
          href="/billing"
          className="py-3 text-sm font-semibold rounded-lg text-center"
          style={{ border: '1px solid rgba(0,212,255,0.2)', color: '#64748B', fontFamily: "'Inter', sans-serif" }}
        >
          Quantum Access · Ilimitado
        </Link>
      </div>
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
  const [userCount, setUserCount] = useState(47)
  const [sessionId, setSessionId] = useState('')
  const [systemTime, setSystemTime] = useState('--:--:--')
  const [mounted, setMounted] = useState(false)

  const messagesAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const lastAssistantRef = useRef<HTMLDivElement>(null)
  const streamingStartedRef = useRef(false)

  const isGuest = !session
  const guestRemaining = Math.max(0, GUEST_MAX - guestUses)
  const userName = session?.user?.name?.split(' ')[0]?.toUpperCase() || 'TRADER'

  const getCurrentTime = () => {
    const now = new Date()
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
  }

  // All client-only values — set after hydration to avoid mismatch
  useEffect(() => {
    setSystemTime(getCurrentTime())
    setSessionId(generateSessionId())
    setMounted(true)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Load guest uses from localStorage
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

  // Online counter — changes every 2 minutes exactly
  useEffect(() => {
    const pool = [3, 8, 11, 14, 17, 23, 28, 34, 41, 47, 52, 58, 67, 73, 81, 89, 94, 102, 118, 127, 134, 142, 156, 173, 189]
    const interval = setInterval(() => {
      setUserCount(pool[Math.floor(Math.random() * pool.length)])
    }, 120000)
    return () => clearInterval(interval)
  }, [])

  // Scroll when user sends
  useEffect(() => {
    const last = messages[messages.length - 1]
    if (!last) return
    if (last.role === 'user') {
      messagesAreaRef.current?.scrollTo({ top: messagesAreaRef.current.scrollHeight, behavior: 'smooth' })
      streamingStartedRef.current = false
    }
  }, [messages.length])

  // Scroll to top of assistant response when streaming starts
  useEffect(() => {
    const last = messages[messages.length - 1]
    if (!last?.isStreaming) return
    if (!streamingStartedRef.current) {
      streamingStartedRef.current = true
      lastAssistantRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [messages])

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

  const copyText = (t: string) => navigator.clipboard.writeText(t).catch(() => {})

  const sendMessage = async (text?: string) => {
    const msg = (text || input).trim()
    if ((!msg && !imageBase64) || loading) return

    if (isGuest && guestUses >= GUEST_MAX) {
      setShowPaywall(true)
      return
    }

    const imgPreviewToShow = imagePreview
    setMessages(prev => [...prev, {
      role: 'user',
      content: msg || '[Imagen para análisis]',
      imagePreview: imgPreviewToShow || undefined,
      timestamp: getCurrentTime(),
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

        setMessages(prev => [...prev, { role: 'assistant', content: '', isStreaming: true, timestamp: getCurrentTime() }])

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
            timestamp: getCurrentTime(),
          }])
        }
      }
    } catch {
      setMessages(prev => [...prev, {
        role: 'system',
        content: 'No pude conectar con SER. Intentá de nuevo.',
        timestamp: getCurrentTime(),
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  const handleSuggestion = (short: string) => {
    if (short === '__upload__') {
      fileInputRef.current?.click()
    } else {
      sendMessage(QUICK_SUGGESTIONS.find(s => s.short === short)?.label || short)
    }
  }

  const getQuotaLabel = () => {
    if (isGuest) return `${guestRemaining} preguntas gratis`
    if (remaining === null) return 'Activo'
    if (remaining === 999) return 'Ilimitado'
    return `${remaining} consultas hoy`
  }

  return (
    <section
      id="ser"
      style={{
        background: 'linear-gradient(180deg, #000 0%, #0F172A 100%)',
        padding: '80px 24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Grid background */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(0,212,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,0.03) 1px,transparent 1px)',
        backgroundSize: '50px 50px',
      }} />

      <div style={{ maxWidth: 1400, margin: '0 auto', position: 'relative', zIndex: 2 }}>
        <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-16 items-center">

          {/* ── LEFT: Identity ── */}
          <div className="text-center lg:text-left">

            {/* Badge */}
            <div
              className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-[0.18em] mb-8"
              style={{ backgroundColor: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)', color: '#00D4FF', fontFamily: "'JetBrains Mono',monospace" }}
            >
              <span className="ser-pulse-dot" />
              INTELIGENCIA FINANCIERA · 24/7
            </div>

            {/* Logo */}
            <div className="mb-6 flex justify-center lg:justify-start">
              <Image
                src="/logoser.png"
                alt="SER"
                width={420}
                height={180}
                style={{ maxWidth: '100%', height: 'auto', filter: 'drop-shadow(0 0 50px rgba(0,212,255,0.35))' }}
                priority
              />
            </div>

            <h2
              className="text-2xl font-bold mb-2 text-white"
              style={{ fontFamily: "'Inter',sans-serif", letterSpacing: '-0.02em', lineHeight: 1.25 }}
            >
              Tu experiencia se potencia.<br />Tu trading se transforma.
            </h2>

            {/* Features */}
            <div className="grid grid-cols-2 gap-3 mb-8 max-w-sm mx-auto lg:mx-0">
              {[
                { icon: '⚡', text: 'Análisis tiempo real' },
                { icon: '📊', text: 'Sube tus gráficos' },
                { icon: '🇵🇾', text: '100% en español' },
                { icon: '🎯', text: 'Niveles cuánticos' },
              ].map(f => (
                <div key={f.text}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs"
                  style={{ backgroundColor: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.15)', color: '#CBD5E1', fontFamily: "'JetBrains Mono',monospace" }}
                >
                  <span>{f.icon}</span>
                  <span>{f.text}</span>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex gap-3 justify-center lg:justify-start">
              <Link
                href="/billing"
                className="px-6 py-3 text-xs font-bold uppercase tracking-[0.1em] rounded-lg transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg,#00D4FF,#0EA5E9)', color: '#000', fontFamily: "'Inter',sans-serif" }}
              >
                Activar Quantum
              </Link>
              <Link
                href="/ser/planes"
                className="px-6 py-3 text-xs font-semibold uppercase tracking-[0.1em] rounded-lg transition-all"
                style={{ border: '1px solid rgba(255,255,255,0.15)', color: '#94A3B8', fontFamily: "'Inter',sans-serif" }}
              >
                Ver SER+ →
              </Link>
            </div>
          </div>

          {/* ── RIGHT: Chat Window ── */}
          <div>
            <div
              className="overflow-hidden flex flex-col relative"
              style={{
                background: '#fff',
                borderRadius: 14,
                height: 720,
                boxShadow: '0 30px 80px rgba(0,0,0,0.5),0 0 80px rgba(0,212,255,0.18),0 0 0 1px rgba(0,212,255,0.15)',
              }}
            >
              {/* Paywall overlay */}
              {showPaywall && <GuestPaywall usedAll={guestUses >= GUEST_MAX} />}

              {/* ── TITLE BAR ── */}
              <div
                className="flex items-center justify-between px-5 py-3.5 shrink-0"
                style={{
                  background: 'linear-gradient(180deg,#0a0e1a 0%,#0d1420 100%)',
                  borderBottom: '1px solid rgba(0,212,255,0.2)',
                  position: 'relative',
                }}
              >
                <div style={{
                  position: 'absolute', bottom: -1, left: 0, right: 0, height: 1,
                  background: 'linear-gradient(90deg,transparent 0%,rgba(0,212,255,0.6) 50%,transparent 100%)',
                }} />

                <div className="flex items-center gap-4">
                  <Image
                    src="/logoser.png"
                    alt="SER"
                    width={110}
                    height={36}
                    style={{ height: 36, width: 'auto', objectFit: 'contain' }}
                    priority
                  />
                  <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.1)' }} />
                  <div className="flex flex-col gap-1">
                    <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, fontWeight: 600, color: '#fff', letterSpacing: '0.05em' }}>
                      Terminal <span style={{ color: '#475569', margin: '0 6px' }}>·</span>
                      <span style={{ color: '#00D4FF', fontWeight: 700, letterSpacing: '0.08em' }}>THE MENTOR PY</span>
                    </div>
                    <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: '#475569', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                      v2.0 · Trading Intelligence
                    </div>
                  </div>
                </div>

                {/* Online counter */}
                <div
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg"
                  style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)' }}
                >
                  <span className="ser-live-dot" />
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: '#10b981', letterSpacing: '0.15em', fontWeight: 700 }}>LIVE</span>
                  <div style={{ width: 1, height: 14, background: 'rgba(16,185,129,0.3)' }} />
                  <span suppressHydrationWarning style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 800, fontSize: 14, color: '#fff', minWidth: 24, textAlign: 'right' }}>
                    {userCount}
                  </span>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: '#34d399', letterSpacing: '0.12em', fontWeight: 600 }}>
                    Online
                  </span>
                </div>
              </div>

              {/* ── MESSAGES AREA ── */}
              <div
                ref={messagesAreaRef}
                className="flex-1 overflow-y-auto"
                style={{ background: '#fdfdfd', padding: '20px 24px', scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 transparent' }}
              >
                {/* Session header */}
                <div style={{
                  color: '#94a3b8', fontSize: 11, marginBottom: 18,
                  borderBottom: '1px dashed #e2e8f0', paddingBottom: 12,
                  display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
                  fontFamily: "'JetBrains Mono',monospace",
                }}>
                  <span suppressHydrationWarning>{systemTime}</span>
                  <span style={{ color: '#cbd5e1' }}>·</span>
                  <span>Conexión segura establecida</span>
                  <span suppressHydrationWarning style={{
                    background: '#f0f9ff', border: '1px solid #bae6fd',
                    color: '#0284c7', padding: '2px 8px', borderRadius: 4,
                    fontWeight: 700, fontSize: 10,
                  }}>
                    {sessionId ? `SESSION ${sessionId}` : 'SESSION ---'}
                  </span>
                </div>

                {messages.map((msg, idx) => {
                  const isLastAssistant = msg.role === 'assistant' && idx === messages.length - 1
                  return (
                    <div key={idx}>
                      <div ref={isLastAssistant ? lastAssistantRef : undefined}>

                        {msg.role === 'system' && (
                          <div style={{
                            background: 'linear-gradient(135deg,#fef3c7,#fefce8)',
                            border: '1px solid #fde047', borderLeft: '4px solid #eab308',
                            padding: '12px 16px', borderRadius: '0 8px 8px 0',
                            color: '#713f12', fontSize: 13, fontFamily: "'Inter',sans-serif",
                          }}>
                            ⚠️ {msg.content}
                            {msg.upgradeUrl && (
                              <span style={{ marginLeft: 8 }}>
                                <Link href={msg.upgradeUrl} style={{ color: '#0284c7', fontWeight: 700, textDecoration: 'underline' }}>
                                  → Ver planes
                                </Link>
                              </span>
                            )}
                          </div>
                        )}

                        {msg.role === 'assistant' && (
                          <div style={{
                            background: 'linear-gradient(135deg,#f0f9ff 0%,#fafbfc 100%)',
                            border: '1px solid #e0f2fe', borderLeft: '4px solid #0EA5E9',
                            padding: '16px 20px', borderRadius: '0 10px 10px 0',
                            boxShadow: '0 2px 8px rgba(14,165,233,0.06)',
                          }}>
                            <div style={{
                              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                              marginBottom: 10, paddingBottom: 8,
                              borderBottom: '1px solid rgba(14,165,233,0.15)',
                            }}>
                              <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: 8,
                                fontFamily: "'JetBrains Mono',monospace", fontSize: 10,
                                fontWeight: 700, color: '#0284c7', letterSpacing: '0.18em',
                              }}>
                                <span className="ser-msg-dot" />
                                SER · {msg.isStreaming ? 'ANALIZANDO' : 'ONLINE'}
                              </span>
                              {msg.timestamp && (
                                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: '#94a3b8' }}>
                                  {msg.timestamp}
                                </span>
                              )}
                            </div>
                            <div className="ser-markdown" style={{ color: '#1e293b', fontSize: 14, lineHeight: 1.75, fontFamily: "'Inter',sans-serif" }}>
                              <ReactMarkdown>{msg.content}</ReactMarkdown>
                              {msg.isStreaming && <span className="ser-cursor" />}
                            </div>
                            {!msg.isStreaming && msg.content && (
                              <div className="ser-copy-btn mt-2">
                                <button
                                  onClick={() => copyText(msg.content)}
                                  style={{ color: '#94a3b8', fontSize: 10, background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'JetBrains Mono',monospace", padding: 0 }}
                                >
                                  [copiar]
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        {msg.role === 'user' && (
                          <div style={{
                            background: 'linear-gradient(135deg,#f8fafc 0%,#fafbfc 100%)',
                            border: '1px solid #e2e8f0', borderLeft: '4px solid #475569',
                            padding: '16px 20px', borderRadius: '0 10px 10px 0',
                            boxShadow: '0 2px 8px rgba(71,85,105,0.06)',
                          }}>
                            <div style={{
                              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                              marginBottom: 10, paddingBottom: 8, borderBottom: '1px solid #e2e8f0',
                            }}>
                              <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: 8,
                                fontFamily: "'JetBrains Mono',monospace", fontSize: 10,
                                fontWeight: 700, color: '#475569', letterSpacing: '0.18em',
                              }}>
                                <span style={{ width: 6, height: 6, background: '#475569', borderRadius: '50%', display: 'inline-block' }} />
                                {userName}
                              </span>
                              {msg.timestamp && (
                                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: '#94a3b8' }}>
                                  {msg.timestamp}
                                </span>
                              )}
                            </div>
                            {msg.imagePreview && (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img src={msg.imagePreview} alt="Adjunto" style={{ maxHeight: 120, maxWidth: 240, marginBottom: 8, borderRadius: 6, border: '1px solid #e2e8f0', objectFit: 'contain' }} />
                            )}
                            <span style={{ color: '#1e293b', fontSize: 14, fontFamily: "'Inter',sans-serif" }}>{msg.content}</span>
                          </div>
                        )}
                      </div>

                      {/* Divider between messages */}
                      {idx < messages.length - 1 && (
                        <div style={{ height: 1, background: '#e2e8f0', margin: '20px 0', position: 'relative' }}>
                          <span style={{
                            position: 'absolute', left: '50%', top: '50%',
                            transform: 'translate(-50%,-50%)',
                            fontSize: 9, color: '#0EA5E9',
                            background: '#fdfdfd', padding: '0 6px',
                          }}>◆</span>
                        </div>
                      )}
                    </div>
                  )
                })}

                {/* Thinking indicator */}
                {loading && messages[messages.length - 1]?.role === 'user' && (
                  <div>
                    <div style={{ height: 1, background: '#e2e8f0', margin: '20px 0', position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', fontSize: 9, color: '#0EA5E9', background: '#fdfdfd', padding: '0 6px' }}>◆</span>
                    </div>
                    <div style={{
                      background: 'linear-gradient(135deg,#f0f9ff 0%,#fafbfc 100%)',
                      border: '1px solid #e0f2fe', borderLeft: '4px solid #0EA5E9',
                      padding: '16px 20px', borderRadius: '0 10px 10px 0',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#64748b', fontSize: 13, fontStyle: 'italic', fontFamily: "'Inter',sans-serif" }}>
                        <span>SER está analizando</span>
                        <span className="ser-thinking-dots">
                          <span className="ser-dot" /><span className="ser-dot" /><span className="ser-dot" />
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ── SUGGESTIONS ── */}
              <div
                className="flex flex-wrap gap-2 px-5 py-2.5 shrink-0 items-center"
                style={{ borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}
              >
                <span style={{ fontSize: 9, color: '#94a3b8', fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginRight: 4 }}>
                  Consultas rápidas
                </span>
                {QUICK_SUGGESTIONS.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestion(s.short)}
                    disabled={loading || showPaywall}
                    className="ser-chip"
                  >
                    <span style={{ color: '#0EA5E9', marginRight: 5, fontWeight: 700 }}>›</span>
                    {s.label}
                  </button>
                ))}
              </div>

              {/* Image preview */}
              {imagePreview && (
                <div className="px-5 py-2 shrink-0" style={{ background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imagePreview} alt="Preview" style={{ maxHeight: 72, maxWidth: 140, borderRadius: 6, border: '1px solid #cbd5e1', objectFit: 'contain' }} />
                    <button
                      onClick={removeImage}
                      style={{
                        position: 'absolute', top: -8, right: -8,
                        background: '#ef4444', color: '#fff',
                        border: '2px solid #fff', width: 20, height: 20,
                        borderRadius: '50%', cursor: 'pointer',
                        fontSize: 11, fontWeight: 700,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}

              {/* ── INPUT BAR ── */}
              <div
                className="px-5 py-3.5 shrink-0 flex gap-2.5 items-center"
                style={{ background: '#fff', borderTop: '1px solid #e2e8f0' }}
              >
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />

                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading || showPaywall}
                  title="Subir gráfico"
                  style={{
                    background: 'linear-gradient(135deg,#0EA5E9,#0284c7)',
                    color: '#fff', border: 'none',
                    width: 42, height: 42, minWidth: 42,
                    borderRadius: 10, cursor: 'pointer',
                    fontSize: 22, fontWeight: 300,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 10px rgba(14,165,233,0.3)',
                    opacity: loading || showPaywall ? 0.5 : 1,
                    transition: 'all 0.2s',
                  }}
                >
                  +
                </button>

                <div
                  className="ser-input-wrapper flex-1"
                  style={{
                    display: 'flex', alignItems: 'center',
                    background: '#f8fafc', border: '1.5px solid #e2e8f0',
                    borderRadius: 10, padding: '0 4px 0 12px',
                  }}
                >
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, color: '#0EA5E9', marginRight: 8, fontSize: 16, userSelect: 'none' }}>›</span>
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onPaste={handlePaste}
                    placeholder={showPaywall ? 'Registrate para continuar...' : 'Escriba su consulta o pegue un gráfico (Ctrl+V)'}
                    disabled={loading || showPaywall}
                    style={{
                      flex: 1, border: 'none', outline: 'none',
                      padding: '11px 0', background: 'transparent',
                      fontFamily: "'Inter',sans-serif", fontSize: 14, color: '#1a1a1a',
                    }}
                  />
                  <button
                    onClick={() => sendMessage()}
                    disabled={loading || (!input.trim() && !imageBase64) || showPaywall}
                    style={{
                      background: 'linear-gradient(135deg,#0EA5E9,#0284c7)',
                      color: '#fff', border: 'none',
                      padding: '9px 16px', borderRadius: 8,
                      cursor: 'pointer', fontWeight: 700,
                      fontSize: 11, letterSpacing: '0.15em',
                      fontFamily: "'JetBrains Mono',monospace",
                      textTransform: 'uppercase',
                      opacity: (loading || (!input.trim() && !imageBase64) || showPaywall) ? 0.4 : 1,
                      transition: 'all 0.2s',
                    }}
                  >
                    {loading ? '...' : 'Enviar'}
                  </button>
                </div>
              </div>

              {/* ── STATUS BAR ── */}
              <div
                className="px-5 py-2.5 shrink-0 flex justify-between items-center flex-wrap gap-3"
                style={{
                  background: 'linear-gradient(180deg,#0a0e1a 0%,#0d1420 100%)',
                  borderTop: '1px solid rgba(0,212,255,0.2)',
                  position: 'relative',
                }}
              >
                <div style={{
                  position: 'absolute', top: -1, left: 0, right: 0, height: 1,
                  background: 'linear-gradient(90deg,transparent 0%,rgba(0,212,255,0.4) 50%,transparent 100%)',
                }} />

                <div className="flex items-center gap-3 flex-wrap">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: '#94a3b8' }}>
                    <span>Powered by</span>
                    <span style={{ color: '#00D4FF', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', textShadow: '0 0 8px rgba(0,212,255,0.4)' }}>
                      The Mentor Trading
                    </span>
                  </div>
                  <div style={{ width: 1, height: 14, background: 'rgba(255,255,255,0.1)' }} />
                  <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: '#94a3b8', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ color: '#00D4FF', fontStyle: 'normal', fontSize: 10 }}>◆</span>
                    <span>SER es una IA · Verificá información clave</span>
                  </div>
                </div>

                <div style={{
                  background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.25)',
                  padding: '4px 12px', borderRadius: 14,
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 700,
                  color: '#00D4FF', letterSpacing: '0.05em',
                }}>
                  <span>◆</span>
                  <span suppressHydrationWarning>{mounted ? getQuotaLabel() : '—'}</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      <style suppressHydrationWarning>{`
        .ser-pulse-dot {
          width: 8px; height: 8px;
          background: #10B981; border-radius: 50%;
          display: inline-block;
          animation: ser-pulse 2s ease-in-out infinite;
        }
        .ser-live-dot {
          width: 7px; height: 7px;
          background: #10b981; border-radius: 50%;
          box-shadow: 0 0 10px #10b981;
          display: inline-block;
          animation: ser-pulse 2.5s ease-in-out infinite;
        }
        .ser-msg-dot {
          width: 6px; height: 6px;
          background: #0EA5E9; border-radius: 50%;
          box-shadow: 0 0 6px #0EA5E9;
          display: inline-block;
          animation: ser-pulse 2s ease-in-out infinite;
        }
        @keyframes ser-pulse {
          0%,100%{opacity:1;transform:scale(1)}
          50%{opacity:0.5;transform:scale(1.15)}
        }
        .ser-cursor {
          display: inline-block; width: 8px; height: 14px;
          background: #0EA5E9; margin-left: 4px;
          vertical-align: middle;
          animation: ser-blink 1s steps(1) infinite;
        }
        @keyframes ser-blink { 0%,50%{opacity:1} 51%,100%{opacity:0} }
        .ser-thinking-dots { display: inline-flex; gap: 4px; }
        .ser-dot {
          width: 6px; height: 6px;
          background: #0EA5E9; border-radius: 50%;
          animation: ser-bounce 1.4s infinite;
        }
        .ser-dot:nth-child(2){animation-delay:0.2s}
        .ser-dot:nth-child(3){animation-delay:0.4s}
        @keyframes ser-bounce {
          0%,80%,100%{transform:scale(0.8);opacity:0.4}
          40%{transform:scale(1);opacity:1}
        }
        .ser-chip {
          background: #fff; border: 1px solid #cbd5e1;
          padding: 7px 13px; border-radius: 20px;
          font-size: 12px; color: #475569; cursor: pointer;
          transition: all 0.2s; font-family: 'JetBrains Mono',monospace;
          font-weight: 500;
        }
        .ser-chip:hover:not(:disabled) {
          background: #0EA5E9; color: #fff; border-color: #0EA5E9;
          transform: translateY(-1px); box-shadow: 0 4px 12px rgba(14,165,233,0.3);
        }
        .ser-chip:disabled { opacity: 0.4; cursor: not-allowed; }
        .ser-input-wrapper:focus-within {
          border-color: #0EA5E9 !important;
          background: #fff !important;
          box-shadow: 0 0 0 3px rgba(14,165,233,0.1);
        }
        .ser-markdown p { margin: 0 0 10px 0; }
        .ser-markdown p:last-child { margin-bottom: 0; }
        .ser-markdown strong { color: #0284c7; font-weight: 700; }
        .ser-markdown ul, .ser-markdown ol { margin: 6px 0 10px 0; padding-left: 20px; }
        .ser-markdown li { margin-bottom: 4px; }
        .ser-markdown code { background: #f0f9ff; padding: 1px 6px; font-size: 12px; color: #0284c7; border: 1px solid #bae6fd; border-radius: 3px; font-family:'JetBrains Mono',monospace; }
        .ser-markdown h1, .ser-markdown h2, .ser-markdown h3 { color: #0f172a; margin: 14px 0 6px 0; font-weight: 700; font-family:'Inter',sans-serif; }
        .ser-markdown blockquote { border-left: 3px solid #0EA5E9; padding-left: 12px; margin: 8px 0; color: #475569; font-style: italic; }
        .ser-markdown hr { border: none; border-top: 1px solid #e2e8f0; margin: 12px 0; }
        .ser-copy-btn { display: flex; opacity: 0; transition: opacity 0.15s; }
        div:hover .ser-copy-btn { opacity: 1; }
      `}</style>
    </section>
  )
}
