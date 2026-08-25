'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import Header from '@/components/layout/Header'
import Footer from '@/components/Footer'

// ── Design tokens — PowerShell / DOS terminal ─────────────────────────────────
const FONT   = "'Courier New', Consolas, 'Lucida Console', monospace"
const PS_BG  = '#012456'   // PowerShell header blue
const CHAT_BG = '#ffffff'  // white chat area
const AI_COLOR = '#006400' // dark green for AI output (classic terminal)
const USR_COLOR = '#00008B' // dark blue for user input line
const SYS_COLOR = '#8B0000' // dark red for system/error messages
const TEXT_DIM = '#555'

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
  remaining?: number
  upgradeUrl?: string
  model?: string
}

const INITIAL_MESSAGE: Message = {
  role: 'assistant',
  content: 'Bienvenido al sistema SER — Trading.com.py\nVersión 2.0  Copyright (C) The Mentor Trading. Todos los derechos reservados.\n\nCapacidades disponibles:\n  [1] Análisis de gráficos (imagen)\n  [2] Niveles algorítmicos\n  [3] Multi-timeframe H1 + H4 + D1\n  [4] Correlaciones inter-mercado\n\nEscriba su consulta o presione ENTER para continuar_',
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
  const [blink, setBlink] = useState(true)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    const t = setInterval(() => setBlink(b => !b), 530)
    return () => clearInterval(t)
  }, [])

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
      ? `${msg || ''}${imagePreview ? ' [IMAGEN ADJUNTA]' : ''}`.trim() || '[IMAGEN CARGADA PARA ANÁLISIS]'
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
          content: data.error || 'ERROR: No se pudo procesar la solicitud.',
          upgradeUrl: data.upgradeUrl,
        }])
      }
    } catch {
      setMessages(prev => [...prev, { role: 'system', content: 'ERROR: No se pudo conectar con SER. Verifique la conexión.' }])
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
          <p style={{ fontFamily: FONT, color: '#0f0', fontSize: 14 }}>Cargando SER.EXE...</p>
        </div>
      </main>
    )
  }

  if (!session) {
    return (
      <main style={{ backgroundColor: '#000', minHeight: '100vh' }}>
        <Header />
        <div className="flex items-center justify-center min-h-[80vh] px-4">
          <div style={{ fontFamily: FONT, color: '#fff', textAlign: 'center', maxWidth: 440 }}>
            <p style={{ color: '#0f0', marginBottom: 8 }}>SER.EXE — v2.0</p>
            <p style={{ color: '#aaa', marginBottom: 24, fontSize: 13 }}>Acceso requerido. Inicie sesión para continuar.</p>
            <Link
              href={`/login?callbackUrl=${encodeURIComponent('/ser')}`}
              style={{ display: 'inline-block', padding: '10px 24px', backgroundColor: PS_BG, color: '#fff', fontFamily: FONT, fontSize: 13, textDecoration: 'none', border: '1px solid #fff' }}
            >
              &gt; INICIAR SESIÓN
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main style={{ backgroundColor: '#1a1a1a', minHeight: '100vh', fontFamily: FONT }}>
      <Header />

      <div style={{ paddingTop: '64px', height: '100vh', display: 'flex', flexDirection: 'column' }}>

        {/* PowerShell-style title bar */}
        <div style={{ backgroundColor: PS_BG, padding: '8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Window control dots */}
            <div style={{ display: 'flex', gap: 6 }}>
              <span style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#ff5f57', display: 'inline-block' }} />
              <span style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#febc2e', display: 'inline-block' }} />
              <span style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#28c840', display: 'inline-block' }} />
            </div>
            <span style={{ color: '#fff', fontSize: 13, letterSpacing: 1 }}>
              SER.EXE — Sistema de Econofísica Resonante · Sacred Levels
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {remaining !== null && (
              <span style={{ color: '#a8d8ff', fontSize: 11, fontFamily: FONT }}>
                [{remaining === 999 ? '∞' : remaining} queries restantes]
              </span>
            )}
            <button
              onClick={resetConversation}
              style={{ color: '#a8d8ff', fontSize: 11, background: 'none', border: '1px solid rgba(168,216,255,0.3)', padding: '3px 10px', cursor: 'pointer', fontFamily: FONT }}
            >
              cls
            </button>
            <Link
              href="/ser/planes"
              style={{ color: '#febc2e', fontSize: 11, textDecoration: 'none', border: '1px solid rgba(254,188,46,0.4)', padding: '3px 10px', fontFamily: FONT }}
            >
              PLANES →
            </Link>
          </div>
        </div>

        {/* Chat area — white background, DOS output */}
        <div
          style={{ flex: 1, overflowY: 'auto', backgroundColor: CHAT_BG, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 0 }}
        >
          <div style={{ maxWidth: 860, margin: '0 auto', width: '100%' }}>

            {/* Session header line */}
            <p style={{ color: TEXT_DIM, fontSize: 11, marginBottom: 16, borderBottom: '1px solid #e0e0e0', paddingBottom: 8 }}>
              Microsoft Windows [SER Terminal 2.0.0]
              <br />(c) Sacred Levels Corporation. All rights reserved.
            </p>

            {messages.map((msg, idx) => (
              <div key={idx} style={{ marginBottom: 14, fontFamily: FONT }}>
                {msg.role === 'user' && (
                  <>
                    <span style={{ color: USR_COLOR, fontSize: 13, fontWeight: 'bold' }}>
                      C:\TRADING\SER&gt;&nbsp;
                    </span>
                    <span style={{ color: '#111', fontSize: 13 }}>{msg.content}</span>
                  </>
                )}
                {msg.role === 'assistant' && (
                  <div>
                    <div style={{ color: AI_COLOR, fontSize: 12, marginBottom: 2 }}>
                      [MENTOR] —————————————————————————————————————
                    </div>
                    <pre style={{ color: '#111', fontSize: 13, whiteSpace: 'pre-wrap', margin: 0, fontFamily: FONT, lineHeight: 1.7 }}>
                      {msg.content}
                    </pre>
                    {msg.model && (
                      <p style={{ color: TEXT_DIM, fontSize: 10, marginTop: 4 }}>
                        &lt;{msg.model}&gt;
                      </p>
                    )}
                  </div>
                )}
                {msg.role === 'system' && (
                  <div>
                    <span style={{ color: SYS_COLOR, fontSize: 13 }}>
                      [ERROR] {msg.content}
                    </span>
                    {msg.upgradeUrl && (
                      <span style={{ marginLeft: 8 }}>
                        <Link href={msg.upgradeUrl} style={{ color: USR_COLOR, fontSize: 12 }}>
                          → Ver planes
                        </Link>
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Loading indicator */}
            {loading && (
              <div style={{ marginBottom: 14 }}>
                <span style={{ color: AI_COLOR, fontSize: 12 }}>[MENTOR] procesando</span>
                <span style={{ color: AI_COLOR, fontSize: 13, marginLeft: 4 }}>
                  {blink ? '█' : ' '}
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Quick suggestions */}
        <div style={{ backgroundColor: '#f5f5f5', borderTop: '1px solid #ddd', padding: '6px 20px', flexShrink: 0 }}>
          <div style={{ maxWidth: 860, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {QUICK_SUGGESTIONS.map((s, i) => (
              <button
                key={i}
                onClick={() => sendMessage(s)}
                disabled={loading}
                style={{
                  fontFamily: FONT, fontSize: 11, color: USR_COLOR,
                  background: 'none', border: '1px solid #bbb',
                  padding: '3px 10px', cursor: 'pointer',
                  opacity: loading ? 0.4 : 1,
                }}
              >
                &gt; {s}
              </button>
            ))}
          </div>
        </div>

        {/* Image preview */}
        {imagePreview && (
          <div style={{ backgroundColor: '#f5f5f5', borderTop: '1px solid #ddd', padding: '8px 20px', flexShrink: 0 }}>
            <div style={{ maxWidth: 860, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 12 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imagePreview} alt="preview" style={{ height: 48, width: 'auto', objectFit: 'contain', border: '1px solid #ccc' }} />
              <span style={{ fontFamily: FONT, fontSize: 12, color: '#333' }}>CHART.PNG cargado</span>
              <button onClick={clearImage} style={{ marginLeft: 'auto', fontFamily: FONT, fontSize: 11, color: SYS_COLOR, background: 'none', border: '1px solid rgba(139,0,0,0.3)', padding: '2px 8px', cursor: 'pointer' }}>
                DEL
              </button>
            </div>
          </div>
        )}

        {/* Input — command prompt style */}
        <div style={{ backgroundColor: CHAT_BG, borderTop: '2px solid #ddd', padding: '10px 20px', flexShrink: 0 }}>
          <div style={{ maxWidth: 860, margin: '0 auto', display: 'flex', alignItems: 'flex-end', gap: 8 }}>

            {/* Upload */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              title="Subir imagen"
              style={{ fontFamily: FONT, fontSize: 11, color: USR_COLOR, background: '#eef', border: '1px solid #99b', padding: '8px 10px', cursor: 'pointer', flexShrink: 0, opacity: loading ? 0.4 : 1 }}
            >
              [IMG]
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { if (e.target.files?.[0]) handleImageFile(e.target.files[0]) }} />

            {/* Prompt prefix */}
            <span style={{ color: USR_COLOR, fontSize: 14, fontWeight: 'bold', whiteSpace: 'nowrap', paddingBottom: 10 }}>
              C:\TRADING\SER&gt;
            </span>

            {/* Input */}
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              placeholder="escriba su consulta aquí..."
              disabled={loading}
              rows={1}
              style={{
                flex: 1, fontFamily: FONT, fontSize: 14, color: '#111',
                backgroundColor: CHAT_BG, border: 'none', outline: 'none',
                resize: 'none', minHeight: 36, maxHeight: 120,
                paddingTop: 8, paddingBottom: 8,
              }}
            />

            {/* Blinking cursor when idle */}
            {!loading && !input && (
              <span style={{ color: '#111', fontSize: 14, paddingBottom: 10, opacity: blink ? 1 : 0 }}>█</span>
            )}

            {/* Send */}
            <button
              onClick={() => sendMessage()}
              disabled={loading || (!input.trim() && !imageBase64)}
              style={{
                fontFamily: FONT, fontSize: 12, fontWeight: 'bold',
                backgroundColor: PS_BG, color: '#fff',
                border: 'none', padding: '8px 16px', cursor: 'pointer',
                opacity: (loading || (!input.trim() && !imageBase64)) ? 0.4 : 1,
                flexShrink: 0,
              }}
            >
              ENTER
            </button>
          </div>
          <p style={{ fontFamily: FONT, fontSize: 10, color: '#bbb', marginTop: 4, paddingLeft: 0 }}>
            SER no constituye asesoría financiera · Sacred Levels · Shift+Enter para nueva línea
          </p>
        </div>

      </div>
    </main>
  )
}
