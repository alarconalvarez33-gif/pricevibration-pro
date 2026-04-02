'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

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
  const [name, setName]                     = useState('')
  const [email, setEmail]                   = useState('')
  const [password, setPassword]             = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [countryCode, setCountryCode]       = useState('+595')
  const [phone, setPhone]                   = useState('')
  const [acceptedTerms, setAcceptedTerms]   = useState(false)
  const [error, setError]                   = useState('')
  const [isLoading, setIsLoading]           = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!acceptedTerms) { setError('Debés aceptar los Términos y Condiciones'); return }
    if (password !== confirmPassword) { setError('Las contraseñas no coinciden'); return }
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return }
    if (!phone.trim()) { setError('El número de WhatsApp es obligatorio'); return }

    setIsLoading(true)
    const whatsapp = `${countryCode}${phone.trim().replace(/\D/g, '')}`

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, whatsapp }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Error al registrar'); setIsLoading(false); return }

      // Store password temporarily so verify page can auto-login after verification
      sessionStorage.setItem('__reg_pw', password)
      window.location.href = `/verify?email=${encodeURIComponent(email)}`
    } catch {
      setError('Error inesperado. Intentá de nuevo.')
      setIsLoading(false)
    }
  }

  const inputCls = 'w-full bg-[#0a0a0a] border border-[#222] rounded-lg px-4 py-3 text-white placeholder-[#444] focus:border-[#00E5FF] focus:outline-none transition-colors'

  return (
    <main className="min-h-screen bg-[#0A0A0B]">
      <Navbar />
      <div className="pt-24 pb-20 px-4">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Crear Cuenta
            </h1>
            <p className="text-[#555] text-sm">Unite a Sacred Levels</p>
          </div>

          <div className="bg-[#111112] rounded-xl p-8 border border-[#1e1e1f]">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Nombre */}
              <div>
                <label className="block text-[#555] text-xs uppercase tracking-[0.15em] mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Nombre completo
                </label>
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  className={inputCls} placeholder="Tu nombre" required />
              </div>

              {/* Email */}
              <div>
                <label className="block text-[#555] text-xs uppercase tracking-[0.15em] mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Email
                </label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className={inputCls} placeholder="tu@email.com" required />
              </div>

              {/* WhatsApp */}
              <div>
                <label className="block text-xs uppercase tracking-[0.15em] mb-2" style={{ color: '#00E5FF', fontFamily: "'Space Grotesk', sans-serif" }}>
                  WhatsApp <span className="normal-case tracking-normal text-[#555]">(obligatorio)</span>
                </label>
                <div className="flex gap-2">
                  {/* Country selector */}
                  <div className="relative">
                    <select
                      value={countryCode}
                      onChange={e => setCountryCode(e.target.value)}
                      className="h-full bg-[#0a0a0a] border border-[#00E5FF30] rounded-lg px-3 py-3 text-white text-sm focus:border-[#00E5FF] focus:outline-none appearance-none pr-8 cursor-pointer transition-colors"
                      style={{ fontFamily: "'JetBrains Mono', monospace", minWidth: '110px' }}
                    >
                      {COUNTRIES.map(c => (
                        <option key={c.code} value={c.code}>
                          {c.flag} {c.code}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-3 h-3" fill="none" stroke="#00E5FF" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  {/* Phone number */}
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="981 123 456"
                    required
                    className="flex-1 bg-[#0a0a0a] border border-[#00E5FF30] rounded-lg px-4 py-3 text-white placeholder-[#444] focus:border-[#00E5FF] focus:outline-none transition-colors"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  />
                </div>
                <p className="text-[10px] mt-1.5" style={{ color: '#333', fontFamily: "'JetBrains Mono', monospace" }}>
                  Se guardará como: {countryCode}{phone.trim().replace(/\D/g, '') || 'XXXXXXXXX'}
                </p>
              </div>

              {/* Contraseña */}
              <div>
                <label className="block text-[#555] text-xs uppercase tracking-[0.15em] mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Contraseña
                </label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  className={inputCls} placeholder="Mínimo 6 caracteres" required minLength={6} />
              </div>

              <div>
                <label className="block text-[#555] text-xs uppercase tracking-[0.15em] mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Confirmar contraseña
                </label>
                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                  className={inputCls} placeholder="Repetir contraseña" required />
              </div>

              {/* Términos */}
              <div className="flex items-start gap-3">
                <input type="checkbox" id="terms" checked={acceptedTerms}
                  onChange={e => setAcceptedTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-[#333] bg-[#0a0a0a] cursor-pointer accent-[#00E5FF]"
                  required />
                <label htmlFor="terms" className="text-[#555] text-sm cursor-pointer">
                  Acepto los{' '}
                  <Link href="/terms" target="_blank" className="text-[#00E5FF] hover:underline">Términos y Condiciones</Link>
                  {' '}y el{' '}
                  <Link href="/disclaimer" target="_blank" className="text-[#00E5FF] hover:underline">Aviso de Riesgo</Link>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading || !acceptedTerms}
                className="w-full disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                style={{ backgroundColor: '#00E5FF', fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creando cuenta...
                  </>
                ) : 'Crear Cuenta'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-[#555] text-sm">
                ¿Ya tenés cuenta?{' '}
                <Link href="/login" className="text-[#00E5FF] hover:underline">Iniciar Sesión</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
