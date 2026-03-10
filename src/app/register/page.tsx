'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!acceptedTerms) {
      setError('Debés aceptar los Términos y Condiciones')
      return
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setIsLoading(true)

    try {
      // 1. Register
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Error al registrar')
        setIsLoading(false)
        return
      }

      // 2. Auto-login
      const loginResult = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (loginResult?.error) {
        window.location.href = '/login?registered=true'
        return
      }

      // 3. Full reload so session is available server-side
      window.location.href = '/dashboard'
    } catch {
      setError('Error inesperado. Intentá de nuevo.')
      setIsLoading(false)
    }
  }

  const inputCls = 'w-full bg-[#0a0a0a] border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-[#c9a227] focus:outline-none'

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <div className="pt-24 pb-20 px-4">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Crear Cuenta</h1>
            <p className="text-gray-400">Unite a Sacred Levels</p>
          </div>

          <div className="bg-[#1a1a2e] rounded-xl p-8 border border-gray-800">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-gray-400 text-sm mb-2">Nombre completo</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className={inputCls} placeholder="Tu nombre" required />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputCls} placeholder="tu@email.com" required />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Contraseña</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} className={inputCls} placeholder="Mínimo 6 caracteres" required minLength={6} />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Confirmar contraseña</label>
                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className={inputCls} placeholder="Repetir contraseña" required />
              </div>

              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="terms"
                  checked={acceptedTerms}
                  onChange={e => setAcceptedTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-gray-700 bg-[#0a0a0a] text-[#c9a227] focus:ring-[#c9a227] cursor-pointer"
                  required
                />
                <label htmlFor="terms" className="text-gray-400 text-sm cursor-pointer">
                  Acepto los{' '}
                  <Link href="/terms" target="_blank" className="text-[#c9a227] hover:underline">Términos y Condiciones</Link>
                  {' '}y el{' '}
                  <Link href="/disclaimer" target="_blank" className="text-[#c9a227] hover:underline">Aviso de Riesgo</Link>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading || !acceptedTerms}
                className="w-full bg-[#c9a227] hover:bg-[#d4af37] disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creando cuenta...
                  </>
                ) : (
                  'Crear Cuenta'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-400 text-sm">
                ¿Ya tenés cuenta?{' '}
                <Link href="/login" className="text-[#c9a227] hover:underline">Iniciar Sesión</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
