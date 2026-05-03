'use client'

import { useState, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/Footer'

const CYAN = '#00D4FF'
const DARK_BG = '#0F172A'

function LoginForm() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const searchParams             = useSearchParams()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await signIn('credentials', { email, password, redirect: false })
      if (result?.error) {
        setError('Email o contraseña incorrectos')
        setLoading(false)
      } else {
        const redirect = searchParams.get('redirect') || searchParams.get('callbackUrl') || '/dashboard'
        window.location.href = redirect
      }
    } catch {
      setError('Error al iniciar sesión')
      setLoading(false)
    }
  }

  const handleGoogle = () => {
    setGoogleLoading(true)
    signIn('google', { callbackUrl: '/dashboard' })
  }

  const inputCls: React.CSSProperties = {
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

  return (
    <>
      {/* Google OAuth */}
      <button
        type="button"
        onClick={handleGoogle}
        disabled={googleLoading}
        className="w-full py-3.5 mb-5 flex items-center justify-center gap-3 rounded-lg font-semibold text-sm transition-all hover:bg-white/5 disabled:opacity-60"
        style={{ border: '1px solid #1E293B', color: '#CBD5E1', fontFamily: "'Inter', sans-serif" }}
      >
        {googleLoading ? (
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
        )}
        Continuar con Google
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 h-px" style={{ backgroundColor: '#1E293B' }} />
        <span className="text-xs" style={{ color: '#334155', fontFamily: "'Inter', sans-serif" }}>o ingresá con email</span>
        <div className="flex-1 h-px" style={{ backgroundColor: '#1E293B' }} />
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div
            className="px-4 py-3 rounded-lg text-sm"
            style={{ backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#FCA5A5', fontFamily: "'Inter', sans-serif" }}
          >
            {error}
          </div>
        )}

        <div>
          <label
            className="block text-xs font-semibold uppercase tracking-[0.15em] mb-2"
            style={{ color: '#64748B', fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="tu@email.com"
            required
            style={inputCls}
            onFocus={e => (e.target.style.borderColor = CYAN)}
            onBlur={e => (e.target.style.borderColor = '#1E293B')}
          />
        </div>

        <div>
          <label
            className="block text-xs font-semibold uppercase tracking-[0.15em] mb-2"
            style={{ color: '#64748B', fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Contraseña
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            style={inputCls}
            onFocus={e => (e.target.style.borderColor = CYAN)}
            onBlur={e => (e.target.style.borderColor = '#1E293B')}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 text-sm font-bold uppercase tracking-[0.1em] rounded-lg transition-all duration-200 disabled:opacity-60 hover:opacity-90 flex items-center justify-center gap-2"
          style={{ backgroundColor: CYAN, color: '#000', fontFamily: "'Space Grotesk', sans-serif" }}
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Ingresando...
            </>
          ) : 'INICIAR SESIÓN'}
        </button>

        <p className="text-center text-sm pt-2" style={{ color: '#475569', fontFamily: "'Inter', sans-serif" }}>
          ¿No tenés cuenta?{' '}
          <Link href="/register" className="font-semibold hover:underline" style={{ color: CYAN }}>
            Crear cuenta gratis
          </Link>
        </p>
      </form>
    </>
  )
}

export default function LoginPage() {
  return (
    <main style={{ backgroundColor: DARK_BG, minHeight: '100vh' }}>
      <Header />

      <div
        className="flex items-center justify-center px-4"
        style={{ paddingTop: '120px', paddingBottom: '64px' }}
      >
        <div className="w-full max-w-md">

          {/* Logo / heading */}
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
              Iniciar Sesión
            </h1>
            <p className="text-sm" style={{ color: '#64748B', fontFamily: "'Inter', sans-serif" }}>
              Accedé a tu cuenta
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
            <Suspense fallback={<div style={{ height: '240px' }} />}>
              <LoginForm />
            </Suspense>
          </div>

          {/* Divider + register CTA */}
          <div className="mt-6 text-center">
            <p className="text-xs" style={{ color: '#374151', fontFamily: "'Inter', sans-serif" }}>
              ¿Aún no conocés Sacred Levels?{' '}
              <Link href="/cursos" className="hover:underline" style={{ color: '#64748B' }}>
                Ver cursos disponibles
              </Link>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
