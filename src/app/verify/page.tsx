'use client'

import { useState, useEffect, useRef } from 'react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

const MAX_RESENDS = 3
const CYAN = '#00E5FF'
const MUTED = '#555'

export default function VerifyPage() {
  const [email, setEmail]               = useState('')
  const [code, setCode]                 = useState(['', '', '', '', '', ''])
  const [error, setError]               = useState('')
  const [loading, setLoading]           = useState(false)
  const [autoVerifying, setAutoVerifying] = useState(false)
  const [resendCount, setResendCount]   = useState(0)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendMsg, setResendMsg]       = useState('')
  const [countdown, setCountdown]       = useState(0)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const autoVerifiedRef = useRef(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const e = params.get('email')
    const c = params.get('code')
    if (e) setEmail(decodeURIComponent(e))
    if (c && c.length === 6) {
      const digits = c.split('')
      setCode(digits)
      // Auto-verify when both email and code come from the link
      if (e && !autoVerifiedRef.current) {
        autoVerifiedRef.current = true
        setAutoVerifying(true)
        autoVerify(decodeURIComponent(e), c)
      }
    }
  }, [])

  useEffect(() => {
    if (countdown <= 0) return
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  async function autoVerify(emailVal: string, codeVal: string) {
    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailVal, code: codeVal }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Enlace inválido o expirado')
        setAutoVerifying(false)
        return
      }
      await finishLogin(emailVal)
    } catch {
      setError('Error al verificar. Intentá de nuevo.')
      setAutoVerifying(false)
    }
  }

  async function finishLogin(emailVal: string) {
    const pw = sessionStorage.getItem('__reg_pw')
    if (pw) {
      const result = await signIn('credentials', { email: emailVal, password: pw, redirect: false })
      sessionStorage.removeItem('__reg_pw')
      if (!result?.error) { window.location.href = '/dashboard'; return }
    }
    window.location.href = '/login?verified=true'
  }

  const handleDigitChange = (i: number, val: string) => {
    const digit = val.replace(/\D/g, '').slice(-1)
    const next = [...code]
    next[i] = digit
    setCode(next)
    if (digit && i < 5) inputRefs.current[i + 1]?.focus()
  }

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[i] && i > 0) inputRefs.current[i - 1]?.focus()
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (paste.length === 6) {
      setCode(paste.split(''))
      inputRefs.current[5]?.focus()
    }
  }

  const handleVerify = async () => {
    const fullCode = code.join('')
    if (fullCode.length < 6) { setError('Ingresá los 6 dígitos'); return }
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: fullCode }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Código incorrecto'); setLoading(false); return }
      await finishLogin(email)
    } catch {
      setError('Error al verificar. Intentá de nuevo.')
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (resendCount >= MAX_RESENDS) return
    setResendLoading(true)
    setResendMsg('')
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (res.ok) {
        setResendCount(c => c + 1)
        setResendMsg('Código reenviado. Revisá tu bandeja de entrada.')
        setCountdown(60)
      } else {
        setResendMsg(data.error || 'Error al reenviar')
      }
    } catch {
      setResendMsg('Error al reenviar. Intentá de nuevo.')
    }
    setResendLoading(false)
  }

  // Auto-verifying screen
  if (autoVerifying) {
    return (
      <main className="min-h-screen bg-[#0A0A0B] flex items-center justify-center">
        <div className="text-center">
          <div
            className="w-16 h-16 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-6"
            style={{ borderColor: `${CYAN}40`, borderTopColor: CYAN }}
          />
          <p className="text-white font-semibold mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Verificando tu cuenta...
          </p>
          <p className="text-sm" style={{ color: MUTED }}>Un momento</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#0A0A0B]">
      <Navbar />
      <div className="pt-24 pb-20 px-4">
        <div className="max-w-md mx-auto">

          <div className="text-center mb-8">
            <div
              className="w-16 h-16 border flex items-center justify-center mx-auto mb-5"
              style={{ borderColor: `${CYAN}30`, backgroundColor: `${CYAN}08` }}
            >
              <svg className="w-7 h-7" fill="none" stroke={CYAN} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Verificá tu email
            </h1>
            <p className="text-sm" style={{ color: MUTED }}>
              Enviamos un código a
            </p>
            {email && (
              <p className="text-sm font-medium mt-1" style={{ color: CYAN }}>
                {email}
              </p>
            )}
          </div>

          <div className="bg-[#111112] rounded-xl p-8 border border-[#1e1e1f]">

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm mb-6">
                {error}
              </div>
            )}

            <p className="text-xs mb-5 text-center" style={{ color: MUTED }}>
              Ingresá el código de 6 dígitos del email, o hacé click en el botón del email directamente.
            </p>

            {/* 6-digit inputs */}
            <div className="flex gap-3 justify-center mb-8" onPaste={handlePaste}>
              {code.map((digit, i) => (
                <input
                  key={i}
                  ref={el => { inputRefs.current[i] = el }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleDigitChange(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  className="w-12 h-14 text-center text-xl font-bold text-white bg-[#0a0a0a] border rounded-lg focus:outline-none transition-colors"
                  style={{
                    borderColor: digit ? CYAN : '#222',
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                />
              ))}
            </div>

            <button
              onClick={handleVerify}
              disabled={loading || code.join('').length < 6}
              className="w-full py-4 text-base font-bold uppercase tracking-[0.1em] text-black transition-opacity hover:opacity-90 disabled:opacity-40 rounded-lg mb-4"
              style={{ backgroundColor: CYAN, fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Verificando...
                </span>
              ) : 'Verificar'}
            </button>

            {/* Resend */}
            <div className="text-center border-t border-[#1e1e1f] pt-5">
              {resendMsg && (
                <p className="text-xs mb-3" style={{ color: resendMsg.startsWith('Código') ? CYAN : '#f87171' }}>
                  {resendMsg}
                </p>
              )}
              {resendCount < MAX_RESENDS ? (
                <button
                  onClick={handleResend}
                  disabled={resendLoading || countdown > 0}
                  className="text-xs uppercase tracking-[0.15em] transition-colors disabled:opacity-40"
                  style={{ color: MUTED, fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {resendLoading ? 'Enviando...' :
                   countdown > 0 ? `Reenviar en ${countdown}s` :
                   `Reenviar código (${MAX_RESENDS - resendCount} restantes)`}
                </button>
              ) : (
                <p className="text-xs" style={{ color: MUTED }}>
                  Límite de reenvíos alcanzado.{' '}
                  <Link href="/register" className="underline hover:text-white">Registrate nuevamente</Link>
                </p>
              )}
            </div>
          </div>

          <p className="text-center text-xs mt-6" style={{ color: '#333' }}>
            ¿Equivocaste el email?{' '}
            <Link href="/register" className="text-[#00E5FF] hover:underline">Volvé al registro</Link>
          </p>
        </div>
      </div>
    </main>
  )
}
