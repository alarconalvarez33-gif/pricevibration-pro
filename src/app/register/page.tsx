'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/Footer'

const CYAN    = '#00D4FF'
const DARK_BG = '#0F172A'

const COUNTRIES = [
  { code: '+595', flag: '🇵🇾', name: 'Paraguay' },
  { code: '+54',  flag: '🇦🇷', name: 'Argentina' },
  { code: '+52',  flag: '🇲🇽', name: 'México' },
  { code: '+1',   flag: '🇺🇸', name: 'USA / Canadá' },
  { code: '+55',  flag: '🇧🇷', name: 'Brasil' },
  { code: '+57',  flag: '🇨🇴', name: 'Colombia' },
  { code: '+56',  flag: '🇨🇱', name: 'Chile' },
  { code: '+34',  flag: '🇪🇸', name: 'España' },
  { code: '+598', flag: '🇺🇾', name: 'Uruguay' },
  { code: '+51',  flag: '🇵🇪', name: 'Perú' },
  { code: '+58',  flag: '🇻🇪', name: 'Venezuela' },
  { code: '+593', flag: '🇪🇨', name: 'Ecuador' },
  { code: '+591', flag: '🇧🇴', name: 'Bolivia' },
]

export default function RegisterPage() {
  const [name, setName]                       = useState('')
  const [email, setEmail]                     = useState('')
  const [password, setPassword]               = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [countryCode, setCountryCode]         = useState('+595')
  const [phone, setPhone]                     = useState('')
  const [acceptedTerms, setAcceptedTerms]     = useState(false)
  const [error, setError]                     = useState('')
  const [loading, setLoading]                 = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!acceptedTerms)              { setError('Debés aceptar los Términos y Condiciones'); return }
    if (password !== confirmPassword) { setError('Las contraseñas no coinciden'); return }
    if (password.length < 6)          { setError('La contraseña debe tener al menos 6 caracteres'); return }
    if (!phone.trim())                { setError('El número de WhatsApp es obligatorio'); return }

    setLoading(true)
    const whatsapp = `${countryCode}${phone.trim().replace(/\D/g, '')}`
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, whatsapp }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Error al registrar'); setLoading(false); return }

      const loginResult = await signIn('credentials', { email, password, redirect: false })
      if (loginResult?.error) { window.location.href = '/login?registered=true'; return }
      window.location.href = '/dashboard'
    } catch {
      setError('Error inesperado. Intentá de nuevo.')
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.04)',
    border: '1px solid #1E293B',
    borderRadius: '8px',
    padding: '14px 16px',
    color: '#FFFFFF',
    fontSize: '14px',
    fontFamily: "'Inter', sans-serif",
    outline: 'none',
    transition: 'border-color 0.2s',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.15em',
    color: '#64748B',
    marginBottom: '8px',
    fontFamily: "'Space Grotesk', sans-serif",
  }

  return (
    <main style={{ backgroundColor: DARK_BG, minHeight: '100vh' }}>
      <Header />

      <div
        className="flex items-start justify-center px-4"
        style={{ paddingTop: '120px', paddingBottom: '64px' }}
      >
        <div className="w-full max-w-md">

          {/* Heading */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-1.5 mb-6">
              <span
                className="text-2xl font-black italic text-white"
                style={{ fontFamily: "'Montserrat', sans-serif", letterSpacing: '-0.5px' }}
              >
                SACRED
              </span>
              <span
                className="text-xs font-bold tracking-[0.25em]"
                style={{ fontFamily: "'Montserrat', sans-serif", color: 'rgba(255,255,255,0.4)' }}
              >
                LEVELS
              </span>
            </div>
            <h1
              className="text-3xl font-black text-white mb-2"
              style={{ fontFamily: "'Montserrat', sans-serif", letterSpacing: '-0.5px' }}
            >
              Crear Cuenta
            </h1>
            <p className="text-sm" style={{ color: '#64748B', fontFamily: "'Inter', sans-serif" }}>
              Unite a Sacred Levels — Es gratis
            </p>
          </div>

          {/* Card */}
          <div
            className="rounded-2xl p-8"
            style={{
              backgroundColor: 'rgba(255,255,255,0.03)',
              border: '1px solid #1E293B',
              boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
            }}
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div
                  className="px-4 py-3 rounded-lg text-sm"
                  style={{
                    backgroundColor: 'rgba(239,68,68,0.08)',
                    border: '1px solid rgba(239,68,68,0.25)',
                    color: '#FCA5A5',
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  {error}
                </div>
              )}

              {/* Nombre */}
              <div>
                <label style={labelStyle}>Nombre completo</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Tu nombre"
                  required
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = CYAN)}
                  onBlur={e => (e.target.style.borderColor = '#1E293B')}
                />
              </div>

              {/* Email */}
              <div>
                <label style={labelStyle}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = CYAN)}
                  onBlur={e => (e.target.style.borderColor = '#1E293B')}
                />
              </div>

              {/* WhatsApp */}
              <div>
                <label style={{ ...labelStyle, color: CYAN }}>
                  WhatsApp <span style={{ color: '#475569', textTransform: 'none', letterSpacing: 'normal', fontWeight: 400 }}>(obligatorio)</span>
                </label>
                <div className="flex gap-2">
                  <div className="relative">
                    <select
                      value={countryCode}
                      onChange={e => setCountryCode(e.target.value)}
                      style={{
                        ...inputStyle,
                        width: 'auto',
                        minWidth: '110px',
                        paddingRight: '28px',
                        cursor: 'pointer',
                        appearance: 'none',
                        fontFamily: "'JetBrains Mono', monospace",
                        borderColor: `rgba(0,212,255,0.2)`,
                      }}
                    >
                      {COUNTRIES.map(c => (
                        <option key={c.code} value={c.code} style={{ backgroundColor: '#0F172A' }}>
                          {c.flag} {c.code}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-3 h-3" fill="none" stroke={CYAN} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="981 123 456"
                    required
                    style={{ ...inputStyle, flex: 1, fontFamily: "'JetBrains Mono', monospace", borderColor: `rgba(0,212,255,0.2)` }}
                    onFocus={e => (e.target.style.borderColor = CYAN)}
                    onBlur={e => (e.target.style.borderColor = `rgba(0,212,255,0.2)`)}
                  />
                </div>
                <p className="text-[10px] mt-1.5" style={{ color: '#374151', fontFamily: "'JetBrains Mono', monospace" }}>
                  Se guardará como: {countryCode}{phone.trim().replace(/\D/g, '') || 'XXXXXXXXX'}
                </p>
              </div>

              {/* Contraseña */}
              <div>
                <label style={labelStyle}>Contraseña</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                  minLength={6}
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = CYAN)}
                  onBlur={e => (e.target.style.borderColor = '#1E293B')}
                />
              </div>

              {/* Confirmar */}
              <div>
                <label style={labelStyle}>Confirmar contraseña</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Repetir contraseña"
                  required
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = CYAN)}
                  onBlur={e => (e.target.style.borderColor = '#1E293B')}
                />
              </div>

              {/* Términos */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="terms"
                  checked={acceptedTerms}
                  onChange={e => setAcceptedTerms(e.target.checked)}
                  required
                  className="mt-1 w-4 h-4 cursor-pointer rounded"
                  style={{ accentColor: CYAN }}
                />
                <label htmlFor="terms" className="text-sm cursor-pointer" style={{ color: '#64748B', fontFamily: "'Inter', sans-serif" }}>
                  Acepto los{' '}
                  <Link href="/terms" target="_blank" className="hover:underline" style={{ color: CYAN }}>Términos y Condiciones</Link>
                  {' '}y el{' '}
                  <Link href="/disclaimer" target="_blank" className="hover:underline" style={{ color: CYAN }}>Aviso de Riesgo</Link>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading || !acceptedTerms}
                className="w-full py-4 text-sm font-bold uppercase tracking-[0.1em] rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ backgroundColor: CYAN, color: '#000', fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creando cuenta...
                  </>
                ) : 'CREAR CUENTA'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm" style={{ color: '#475569', fontFamily: "'Inter', sans-serif" }}>
                ¿Ya tenés cuenta?{' '}
                <Link href="/login" className="font-semibold hover:underline" style={{ color: CYAN }}>
                  Iniciar Sesión
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
