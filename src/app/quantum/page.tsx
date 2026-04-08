'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import LegalDisclaimer from '@/components/LegalDisclaimer'

// ── Design tokens ─────────────────────────────────────────────────────────────
const BG     = '#0A0A0B'
const CARD   = '#141415'
const BORDER = '#222222'
const CYAN   = '#00E5FF'
const GREEN  = '#00D26A'
const RED    = '#FF4757'
const MUTED  = '#555555'
const DARK   = '#0d0d0e'
const AMBER  = '#fbbf24'

// ── Constants ─────────────────────────────────────────────────────────────────
const N          = 8
const FREE_LIMIT = 3
const LOCAL_KEY  = 'sl_free_uses'

// ── Types ─────────────────────────────────────────────────────────────────────
interface QuantumLevel {
  n: number
  price: number
  probability: number
  type: 'accumulation' | 'distribution' | 'equilibrium'
  strength: 'extreme' | 'strong' | 'moderate'
}

interface AccessState {
  loading: boolean
  paid: boolean
  usesLeft: number
  usesCount: number
  isGuest: boolean
}

// ── Calculation ───────────────────────────────────────────────────────────────
function calculateQuantumLevels(max: number, min: number): QuantumLevel[] {
  const range = max - min
  return Array.from({ length: N + 1 }, (_, n) => {
    const position    = Math.pow(n / N, 2)
    const price       = min + range * position
    const probability = position * 100
    const type: QuantumLevel['type']     = n <= 3 ? 'accumulation' : n <= 5 ? 'equilibrium' : 'distribution'
    const strength: QuantumLevel['strength'] = n === 0 || n === N ? 'extreme' : n <= 2 || n >= 6 ? 'strong' : 'moderate'
    return {
      n,
      price: Math.round(price * 100) / 100,
      probability: Math.round(probability * 10) / 10,
      type,
      strength,
    }
  })
}

function levelColor(type: QuantumLevel['type']) {
  return type === 'accumulation' ? GREEN : type === 'distribution' ? RED : CYAN
}

// ── Tag component ─────────────────────────────────────────────────────────────
function Tag({ children, col }: { children: React.ReactNode; col: string }) {
  return (
    <span
      className="text-[10px] px-3 py-1 uppercase tracking-[0.1em] font-semibold border"
      style={{
        color: col,
        borderColor: `${col}30`,
        backgroundColor: `${col}08`,
        fontFamily: "'Space Grotesk', sans-serif",
      }}
    >
      {children}
    </span>
  )
}

// ── Level card component ───────────────────────────────────────────────────────
function LevelCard({ level }: { level: QuantumLevel }) {
  const col = levelColor(level.type)
  return (
    <div
      className="border-l-2 p-5"
      style={{
        borderLeftColor: col,
        backgroundColor: `${col}06`,
        borderTop: `1px solid ${BORDER}`,
        borderRight: `1px solid ${BORDER}`,
        borderBottom: `1px solid ${BORDER}`,
      }}
    >
      <div className="flex justify-between items-start">
        <div>
          <span className="text-xl sm:text-2xl font-bold text-white" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            ${level.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="ml-3 text-sm" style={{ color: MUTED, fontFamily: "'JetBrains Mono', monospace" }}>
            n={level.n}
          </span>
        </div>
        <div className="text-right">
          <div className="text-xs font-bold uppercase tracking-[0.15em]" style={{ color: col, fontFamily: "'Space Grotesk', sans-serif" }}>
            {level.strength === 'extreme' ? 'EXTREMO' : level.strength === 'strong' ? 'FUERTE' : 'MODERADO'}
          </div>
          <div className="text-[9px] mt-0.5 uppercase tracking-widest" style={{ color: '#333', fontFamily: "'JetBrains Mono', monospace" }}>
            {level.probability}% energía
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {level.type === 'accumulation' && <>
          <Tag col={GREEN}>Zona de Rebote Alcista</Tag>
          <Tag col="#4a9eff">Si rompe → actúa como Resistencia</Tag>
          {level.n === 0 && <Tag col={CYAN}>Base cuántica extrema</Tag>}
          {(level.strength === 'strong' || level.strength === 'extreme') && <Tag col="#f59e0b">Breakout Zone — pullback posible</Tag>}
        </>}
        {level.type === 'equilibrium' && <>
          <Tag col={CYAN}>Zona de Equilibrio</Tag>
          <Tag col="#a855f7">Flip Zone — Soporte / Resistencia</Tag>
          <Tag col={MUTED}>Posible continuación o reversión</Tag>
        </>}
        {level.type === 'distribution' && <>
          <Tag col={RED}>Zona de Rebote Bajista</Tag>
          <Tag col="#4a9eff">Si rompe → actúa como Soporte</Tag>
          {level.n === N && <Tag col={CYAN}>Techo cuántico extremo</Tag>}
          {(level.strength === 'strong' || level.strength === 'extreme') && <Tag col="#f59e0b">Breakout Zone — pullback posible</Tag>}
        </>}
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function QuantumPage() {
  const { status } = useSession()

  const [access, setAccess]           = useState<AccessState>({ loading: true, paid: false, usesLeft: FREE_LIMIT, usesCount: 0, isGuest: false })
  const [maxVal, setMaxVal]           = useState('')
  const [minVal, setMinVal]           = useState('')
  const [levels, setLevels]           = useState<QuantumLevel[]>([])
  const [error, setError]             = useState('')
  const [calculating, setCalculating] = useState(false)
  const [showModal, setShowModal]     = useState(false)

  // ── Load access state ──────────────────────────────────────────────────────
  useEffect(() => {
    if (status === 'loading') return

    if (status === 'unauthenticated') {
      // Guest: use localStorage immediately, no spinner
      const uses = parseInt(localStorage.getItem(LOCAL_KEY) || '0', 10)
      setAccess({
        loading: false,
        paid: false,
        usesLeft: Math.max(0, FREE_LIMIT - uses),
        usesCount: uses,
        isGuest: true,
      })
      return
    }

    // Authenticated: check server for paid plan status
    fetch('/api/quantum/check-access')
      .then(r => r.json())
      .then(data => setAccess({
        loading: false,
        paid: data.paid ?? false,
        usesLeft: data.usesLeft ?? 0,
        usesCount: data.usesCount ?? 0,
        isGuest: false,
      }))
      .catch(() => setAccess({ loading: false, paid: false, usesLeft: 0, usesCount: 0, isGuest: false }))
  }, [status])

  // ── Submit handler ─────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const max = parseFloat(maxVal)
    const min = parseFloat(minVal)
    if (isNaN(max) || isNaN(min)) { setError('Ingresá valores numéricos válidos.'); return }
    if (min >= max) { setError('El máximo debe ser mayor al mínimo.'); return }

    // Paid users: calculate directly
    if (access.paid) {
      setLevels(calculateQuantumLevels(max, min))
      return
    }

    // Guest users: localStorage counter
    if (access.isGuest) {
      const uses = parseInt(localStorage.getItem(LOCAL_KEY) || '0', 10)
      if (uses >= FREE_LIMIT) {
        setShowModal(true)
        return
      }
      const newUses = uses + 1
      localStorage.setItem(LOCAL_KEY, String(newUses))
      setAccess(p => ({ ...p, usesLeft: Math.max(0, FREE_LIMIT - newUses), usesCount: newUses }))
      setLevels(calculateQuantumLevels(max, min))
      return
    }

    // Authenticated non-paid: use server-side counter
    if (access.usesLeft <= 0) {
      window.location.href = '/billing?locked=true'
      return
    }
    setCalculating(true)
    try {
      const res  = await fetch('/api/quantum/check-access', { method: 'POST' })
      const data = await res.json()
      setAccess(p => ({ ...p, usesLeft: data.usesLeft ?? 0, usesCount: data.usesCount ?? 0 }))
      if (!data.allowed) { setError('No tenés más usos gratuitos disponibles.'); setCalculating(false); return }
    } catch { setError('Error de conexión. Intentá de nuevo.'); setCalculating(false); return }
    setCalculating(false)
    setLevels(calculateQuantumLevels(max, min))
  }

  // Blur last 4 levels for guests on their 3rd (final) calculation
  const showBlur = access.isGuest && access.usesCount >= FREE_LIMIT && levels.length > 0

  // ── Loading state (only for authenticated users while checking server) ──────
  if (access.loading && status !== 'unauthenticated') {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: BG }}>
        <div className="text-center">
          <div
            className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: CYAN, borderTopColor: 'transparent' }}
          />
          <p className="text-[10px] uppercase tracking-[0.25em]" style={{ color: MUTED, fontFamily: "'Space Grotesk', sans-serif" }}>
            Verificando acceso...
          </p>
        </div>
      </main>
    )
  }

  // ── Paywall (only authenticated non-paid users with no trial uses left) ─────
  if (!access.paid && !access.isGuest && access.usesLeft === 0 && !access.loading) {
    return (
      <main
        className="min-h-screen flex items-center justify-center px-4 sm:px-6"
        style={{ backgroundColor: BG, fontFamily: "'Inter', sans-serif" }}
      >
        <div className="max-w-md w-full">
          <div className="border" style={{ backgroundColor: CARD, borderColor: BORDER }}>
            <div className="h-px" style={{ background: `linear-gradient(90deg, transparent, ${CYAN}, transparent)` }} />
            <div className="p-6 sm:p-10 text-center">
              <div
                className="w-12 h-12 border flex items-center justify-center mx-auto mb-6"
                style={{ borderColor: `${CYAN}30` }}
              >
                <svg className="w-6 h-6" fill="none" stroke={CYAN} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Calculadora Cuadrática
              </h2>
              <p className="text-sm mb-8" style={{ color: MUTED }}>
                Usaste tus 3 cálculos gratuitos. Suscribite para acceso ilimitado.
              </p>
              <div className="text-4xl font-bold text-white mb-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                Gs. 350.000
              </div>
              <p className="text-xs mb-8 uppercase tracking-[0.2em]" style={{ color: MUTED }}>
                $50 USD · mensual · incluye todo
              </p>
              <a
                href="/billing"
                className="block w-full py-4 text-sm font-bold uppercase tracking-[0.12em] text-black text-center transition-opacity hover:opacity-90 mb-4"
                style={{ backgroundColor: CYAN, fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Suscribirse a Quantum Access
              </a>
              <a href="/dashboard" className="text-xs uppercase tracking-[0.2em] transition-colors hover:text-white" style={{ color: '#333', fontFamily: "'Space Grotesk', sans-serif" }}>
                ← Volver al Dashboard
              </a>
            </div>
          </div>
        </div>
      </main>
    )
  }

  // ── Main calculator ───────────────────────────────────────────────────────
  return (
    <main className="min-h-screen" style={{ backgroundColor: BG, fontFamily: "'Inter', sans-serif" }}>

      {/* Header */}
      <div className="border-b sticky top-0 z-10" style={{ backgroundColor: BG, borderColor: BORDER }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2">
          <div>
            <h1 className="text-base font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Quantum Tech
            </h1>
            <p className="text-[10px] mt-0.5" style={{ color: CYAN, fontFamily: "'JetBrains Mono', monospace" }}>
              Niveles cuánticos E=n² · Sacred Levels
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Status badge */}
            {access.paid && (
              <div
                className="border px-3 py-1 text-xs uppercase tracking-widest"
                style={{ borderColor: `${GREEN}25`, backgroundColor: `${GREEN}08`, color: GREEN, fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Acceso completo
              </div>
            )}
            {!access.paid && access.isGuest && (
              <div
                className="border px-3 py-1 text-xs"
                style={{ borderColor: `${CYAN}25`, backgroundColor: `${CYAN}08`, color: CYAN, fontFamily: "'JetBrains Mono', monospace" }}
              >
                {access.usesLeft > 0 ? `${access.usesLeft} usos gratis` : 'Registro para más'}
              </div>
            )}
            {!access.paid && !access.isGuest && (
              <div
                className="border px-3 py-1 text-xs"
                style={{ borderColor: `${CYAN}25`, backgroundColor: `${CYAN}08`, color: CYAN, fontFamily: "'JetBrains Mono', monospace" }}
              >
                {access.usesLeft > 0 ? `${access.usesLeft}d gratis` : 'Trial expirado'}
              </div>
            )}
            {/* Back link */}
            {access.isGuest ? (
              <Link href="/" className="text-xs uppercase tracking-[0.15em] transition-colors hover:text-white" style={{ color: MUTED, fontFamily: "'Space Grotesk', sans-serif" }}>
                ← Inicio
              </Link>
            ) : (
              <a href="/dashboard" className="text-xs uppercase tracking-[0.15em] transition-colors hover:text-white" style={{ color: MUTED, fontFamily: "'Space Grotesk', sans-serif" }}>
                ← Dashboard
              </a>
            )}
          </div>
        </div>
      </div>

      <LegalDisclaimer variant="banner" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

        {/* Guía de uso */}
        <div className="mb-8 border" style={{ borderColor: BORDER, backgroundColor: CARD }}>
          <div className="px-6 py-3 border-b flex items-center gap-2" style={{ borderColor: BORDER, backgroundColor: '#0d0d0e' }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: CYAN }} />
            <span className="text-[9px] font-bold uppercase tracking-[0.3em]" style={{ color: CYAN, fontFamily: "'Space Grotesk', sans-serif" }}>
              Cómo usar Quantum Tech
            </span>
          </div>
          <div className="p-6 grid sm:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                title: 'Ingresá el rango',
                desc: 'Tomá el High y Low de la vela diaria o semanal del activo que querés analizar (Oro, EUR/USD, BTC, etc.)',
              },
              {
                step: '02',
                title: 'Obtenés los niveles',
                desc: 'El algoritmo E=n² distribuye niveles cuánticos de soporte y resistencia con mayor densidad cerca del mínimo, como los electrones en un átomo.',
              },
              {
                step: '03',
                title: 'Operá con precisión',
                desc: 'Usá los niveles como zonas de entrada, stop-loss y take-profit. Los niveles con mayor probabilidad (%) son los más relevantes.',
              },
            ].map(item => (
              <div key={item.step} className="flex gap-4">
                <span
                  className="text-2xl font-bold shrink-0 leading-none mt-0.5"
                  style={{ color: `${CYAN}30`, fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {item.step}
                </span>
                <div>
                  <p className="text-white text-sm font-semibold mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {item.title}
                  </p>
                  <p className="text-[11px] leading-relaxed" style={{ color: MUTED }}>
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="px-6 pb-4 flex flex-wrap gap-4 border-t pt-4" style={{ borderColor: BORDER }}>
            {[
              { label: 'Mercados', value: 'Forex · Oro · Crypto · Índices' },
              { label: 'Algoritmo', value: 'E = n² (distribución cuántica)' },
              { label: 'Precisión', value: 'Hasta 20 niveles por rango' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-2">
                <span className="text-[9px] uppercase tracking-[0.2em]" style={{ color: '#333', fontFamily: "'Space Grotesk', sans-serif" }}>{item.label}:</span>
                <span className="text-[10px]" style={{ color: MUTED, fontFamily: "'JetBrains Mono', monospace" }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Guest free trial banner (pre-calculation) */}
        {access.isGuest && access.usesCount === 0 && (
          <div
            className="border mb-8 p-5"
            style={{ borderColor: `${CYAN}20`, backgroundColor: `${CYAN}05` }}
          >
            <p className="text-white font-semibold text-sm mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              3 cálculos gratuitos — <span style={{ color: CYAN }}>sin registro</span>
            </p>
            <p className="text-[11px]" style={{ color: MUTED }}>
              Calculá ahora. Para acceso ilimitado,{' '}
              <Link href="/register" style={{ color: CYAN, textDecoration: 'underline' }}>
                creá tu cuenta gratis
              </Link>.
            </p>
          </div>
        )}

        {/* Server-side trial banner (authenticated non-paid users) */}
        {!access.paid && !access.isGuest && (
          <div
            className="border mb-8 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            style={{ borderColor: `${CYAN}20`, backgroundColor: `${CYAN}05` }}
          >
            <div>
              <p className="text-white font-semibold text-sm mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Prueba gratuita —{' '}
                <span style={{ color: CYAN }}>
                  {access.usesLeft > 0 ? `${access.usesLeft} uso${access.usesLeft !== 1 ? 's' : ''} restante${access.usesLeft !== 1 ? 's' : ''}` : 'Agotada'}
                </span>
              </p>
              <p className="text-[11px]" style={{ color: MUTED }}>3 usos gratuitos. Acceso completo con suscripción Quantum Access.</p>
            </div>
            {access.usesLeft <= 0 && (
              <a
                href="/billing"
                className="shrink-0 border px-6 py-2.5 text-xs font-bold uppercase tracking-[0.1em] text-black transition-opacity hover:opacity-90"
                style={{ backgroundColor: CYAN, borderColor: CYAN, fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Suscribirse — Gs. 350.000/mes
              </a>
            )}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="border p-5 sm:p-8 mb-6" style={{ backgroundColor: CARD, borderColor: BORDER }}>
            <h2 className="text-xl font-bold text-white mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Ingresá el rango de precios
            </h2>
            <p className="text-sm mb-7" style={{ color: MUTED }}>
              Los niveles se distribuyen con la función n² — más densos cerca del mínimo.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mb-6">
              {[
                { label: 'Máximo (High)', name: 'max', placeholder: '3100', val: maxVal, set: setMaxVal },
                { label: 'Mínimo (Low)',  name: 'min', placeholder: '2800', val: minVal, set: setMinVal },
              ].map(f => (
                <div key={f.name}>
                  <label
                    className="block text-[9px] uppercase tracking-[0.25em] mb-2"
                    style={{ color: MUTED, fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {f.label}
                  </label>
                  <input
                    type="number"
                    value={f.val}
                    onChange={e => f.set(e.target.value)}
                    placeholder={f.placeholder}
                    step="0.01"
                    className="w-full border px-4 py-4 text-white text-lg sm:text-xl focus:outline-none transition-colors duration-200 min-h-[56px]"
                    style={{
                      backgroundColor: DARK,
                      borderColor: BORDER,
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                    onFocus={e => { (e.target as HTMLInputElement).style.borderColor = `${CYAN}40` }}
                    onBlur={e  => { (e.target as HTMLInputElement).style.borderColor = BORDER }}
                  />
                </div>
              ))}
            </div>

            {error && (
              <p className="text-sm mb-4" style={{ color: RED }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={calculating}
              className="w-full py-4 text-sm font-bold uppercase tracking-[0.12em] text-black transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: CYAN, fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {calculating ? 'Calculando...' : 'Generar Niveles Quantum'}
            </button>

            {access.isGuest && access.usesLeft > 0 && (
              <p className="text-center text-[9px] mt-3 uppercase tracking-[0.2em]" style={{ color: '#2a2a2a', fontFamily: "'Space Grotesk', sans-serif" }}>
                {access.usesLeft} cálculo{access.usesLeft !== 1 ? 's' : ''} gratuito{access.usesLeft !== 1 ? 's' : ''} restante{access.usesLeft !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </form>

        {/* Results */}
        {levels.length > 0 && (
          <>
            {/* Guest banner after 1st or 2nd calculation (usesLeft > 0 means not yet at limit) */}
            {access.isGuest && access.usesCount > 0 && access.usesCount < FREE_LIMIT && (
              <div
                className="border mb-6 px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                style={{ borderColor: `${AMBER}25`, backgroundColor: `${AMBER}06` }}
              >
                <p className="text-sm" style={{ color: '#aaa', fontFamily: "'Space Grotesk', sans-serif" }}>
                  Te quedan{' '}
                  <span style={{ color: AMBER, fontWeight: 700 }}>
                    {access.usesLeft} uso{access.usesLeft !== 1 ? 's' : ''} gratuito{access.usesLeft !== 1 ? 's' : ''}
                  </span>.{' '}
                  <Link href="/register" style={{ color: AMBER, textDecoration: 'underline' }}>
                    Registrate
                  </Link>{' '}
                  para acceso ilimitado.
                </p>
                <Link
                  href="/register"
                  className="flex items-center justify-center sm:shrink-0 w-full sm:w-auto px-5 min-h-[48px] text-[11px] font-bold uppercase tracking-[0.1em] text-black transition-opacity hover:opacity-90"
                  style={{ backgroundColor: AMBER, fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Crear Cuenta Gratis
                </Link>
              </div>
            )}

            {/* n² curve */}
            <div
              className="mb-6 border p-5 relative overflow-hidden"
              style={{ backgroundColor: CARD, borderColor: BORDER, height: '176px' }}
            >
              <p
                className="absolute top-4 left-5 text-[9px] uppercase tracking-[0.25em]"
                style={{ color: CYAN, fontFamily: "'Space Grotesk', sans-serif" }}
              >
                ψ(x)² — Distribución cuántica E=n²
              </p>
              <svg viewBox="0 0 100 40" className="w-full h-full" preserveAspectRatio="none">
                {[10, 20, 30].map(y => (
                  <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#1a1a1a" strokeWidth="0.5" />
                ))}
                <line x1="0" y1="38" x2="100" y2="4" stroke={CYAN} strokeWidth="0.8" strokeDasharray="2,2" opacity="0.25" />
                <text x="62" y="16" fontSize="3" fill={CYAN} opacity="0.4">Fibonacci</text>
                <path
                  d={`M 0 38 ${levels.map(lv => `L ${lv.probability} ${38 - (lv.probability / 100) * 34}`).join(' ')}`}
                  stroke="white"
                  strokeWidth="1.5"
                  fill="none"
                  opacity="0.8"
                />
                <path
                  d={`M 0 38 ${levels.map(lv => `L ${lv.probability} ${38 - (lv.probability / 100) * 34}`).join(' ')} L 100 38 Z`}
                  fill="white"
                  opacity="0.03"
                />
                <text x="28" y="22" fontSize="3" fill="white" opacity="0.3">n²</text>
                {levels.map(lv => (
                  <circle
                    key={lv.n}
                    cx={lv.probability}
                    cy={38 - (lv.probability / 100) * 34}
                    r="1.5"
                    fill={levelColor(lv.type)}
                  />
                ))}
              </svg>
            </div>

            {/* Level cards */}
            <div className="space-y-2">
              {/* First 5 levels — always visible */}
              {levels.slice(0, 5).map(level => (
                <LevelCard key={level.n} level={level} />
              ))}

              {/* Last 4 levels — blurred for guests who used all 3 free calculations */}
              <div className="relative">
                <div style={{
                  filter: showBlur ? 'blur(7px)' : 'none',
                  userSelect: showBlur ? 'none' : 'auto',
                  pointerEvents: showBlur ? 'none' : 'auto',
                  transition: 'filter 0.3s ease',
                }}>
                  <div className="space-y-2">
                    {levels.slice(5).map(level => (
                      <LevelCard key={level.n} level={level} />
                    ))}
                  </div>
                </div>

                {/* Blur overlay CTA */}
                {showBlur && (
                  <div
                    className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6"
                    style={{
                      background: `linear-gradient(to bottom, rgba(10,10,11,0.3), rgba(10,10,11,0.9))`,
                      backdropFilter: 'blur(1px)',
                    }}
                  >
                    <p className="text-white font-bold text-base text-center" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      Creá tu cuenta gratis para ver todos los niveles
                    </p>
                    <p className="text-[11px] text-center" style={{ color: MUTED }}>
                      Registro en 30 segundos. Sin tarjeta de crédito.
                    </p>
                    <Link
                      href="/register"
                      className="px-8 py-3 font-bold text-sm uppercase tracking-[0.12em] text-black transition-opacity hover:opacity-90"
                      style={{ backgroundColor: AMBER, fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      Crear Cuenta Gratis
                    </Link>
                    <Link
                      href="/billing"
                      className="text-xs uppercase tracking-[0.15em] transition-colors hover:text-white"
                      style={{ color: MUTED, fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      Ver planes desde Gs. 65.000
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Legend */}
            <div className="mt-8 grid grid-cols-3 gap-px" style={{ backgroundColor: BORDER }}>
              {[
                { col: GREEN, label: 'Acumulación', sub: 'n=0-3 · Alcista' },
                { col: CYAN,  label: 'Equilibrio',  sub: 'n=4,5 · Reversión' },
                { col: RED,   label: 'Distribución', sub: 'n=6-8 · Bajista' },
              ].map(({ col, label, sub }) => (
                <div key={label} className="p-2 sm:p-4 text-center" style={{ backgroundColor: CARD }}>
                  <div className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.05em] sm:tracking-[0.1em] mb-1" style={{ color: col, fontFamily: "'Space Grotesk', sans-serif" }}>
                    {label}
                  </div>
                  <div className="text-[9px] sm:text-[10px]" style={{ color: MUTED }}>{sub}</div>
                </div>
              ))}
            </div>

            {/* Guide */}
            <div className="mt-4 border p-6" style={{ backgroundColor: CARD, borderColor: BORDER }}>
              <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-[0.1em]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Guía Breakout vs Rebote
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { col: '#4a9eff', title: 'Breakout Zone', desc: 'Si el precio rompe con volumen, esperar pullback para entrar en continuación.' },
                  { col: GREEN,     title: 'Rejection Zone', desc: 'Alta probabilidad de rebote. Buscar señales de reversión en velas.' },
                  { col: CYAN,      title: 'Flip Zone', desc: 'El nivel cambia de rol: soporte roto se convierte en resistencia y viceversa.' },
                ].map(g => (
                  <div key={g.title} className="flex items-start gap-3">
                    <span className="w-1 h-1 mt-1.5 shrink-0" style={{ backgroundColor: g.col }} />
                    <div>
                      <span className="text-sm font-semibold block mb-1" style={{ color: g.col, fontFamily: "'Space Grotesk', sans-serif" }}>
                        {g.title}
                      </span>
                      <span className="text-xs leading-relaxed" style={{ color: MUTED }}>{g.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Fibonacci comparison */}
            <div className="border p-6 mt-4" style={{ borderColor: `${CYAN}20`, backgroundColor: `${CYAN}04` }}>
              <h4 className="text-sm font-bold text-white mb-3 uppercase tracking-[0.1em]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Por qué es diferente a Fibonacci
              </h4>
              <p className="text-sm leading-relaxed" style={{ color: MUTED }}>
                Fibonacci distribuye niveles uniformemente (23.6%, 38.2%, 50%, 61.8%).
                Los niveles cuadráticos siguen E=n² concentrando más niveles cerca del mínimo,
                igual que los electrones en un átomo tienen más niveles de energía cerca del núcleo.
                Esto genera zonas de alta densidad energética donde el precio tiende a reaccionar con mayor fuerza.
              </p>
            </div>

            {/* Upsell for guests after final calculation */}
            {access.isGuest && access.usesCount >= FREE_LIMIT && (
              <div className="mt-6 border p-8 text-center" style={{ backgroundColor: CARD, borderColor: `${AMBER}30` }}>
                <div className="h-px mb-8" style={{ background: `linear-gradient(90deg, transparent, ${AMBER}60, transparent)` }} />
                <p className="text-white font-bold text-lg mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  ¿Te fueron útiles los niveles?
                </p>
                <p className="text-sm mb-6" style={{ color: MUTED }}>
                  Usaste tus 3 cálculos gratuitos. Registrate gratis para seguir calculando.
                </p>
                <div className="flex flex-col gap-3">
                  <Link
                    href="/register"
                    className="flex items-center justify-center w-full min-h-[52px] px-8 font-bold text-sm uppercase tracking-[0.12em] text-black transition-opacity hover:opacity-90"
                    style={{ backgroundColor: AMBER, fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    Crear Cuenta Gratis
                  </Link>
                  <Link
                    href="/billing"
                    className="flex items-center justify-center w-full min-h-[52px] px-8 font-bold text-sm uppercase tracking-[0.12em] border transition-colors hover:border-[#00E5FF]/50 hover:text-[#00E5FF]"
                    style={{ borderColor: BORDER, color: MUTED, fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    Ver Planes
                  </Link>
                </div>
              </div>
            )}

            <div className="mt-8">
              <LegalDisclaimer variant="full" />
            </div>
          </>
        )}
      </div>

      {/* Modal — shown when guest tries a 4th calculation */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-6"
          style={{ backgroundColor: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(4px)' }}
          onClick={() => setShowModal(false)}
        >
          <div
            className="max-w-sm w-full border"
            style={{ backgroundColor: CARD, borderColor: BORDER }}
            onClick={e => e.stopPropagation()}
          >
            <div className="h-px" style={{ background: `linear-gradient(90deg, transparent, ${AMBER}, transparent)` }} />
            <div className="p-8 text-center">
              <div
                className="w-12 h-12 border flex items-center justify-center mx-auto mb-5"
                style={{ borderColor: `${AMBER}30` }}
              >
                <svg className="w-6 h-6" fill="none" stroke={AMBER} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Ya usaste tus 3 cálculos gratuitos
              </h3>
              <p className="text-sm mb-8" style={{ color: MUTED }}>
                Registrate en 30 segundos para seguir calculando sin límites.
              </p>
              <Link
                href="/register"
                className="flex items-center justify-center w-full min-h-[52px] font-bold text-sm uppercase tracking-[0.12em] text-black mb-3 transition-opacity hover:opacity-90"
                style={{ backgroundColor: AMBER, fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Crear Cuenta Gratis
              </Link>
              <Link
                href="/billing"
                className="flex items-center justify-center w-full min-h-[52px] text-sm border font-bold uppercase tracking-[0.12em] transition-colors hover:border-[#555] mb-4"
                style={{ borderColor: BORDER, color: MUTED, fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Ver Planes
              </Link>
              <button
                onClick={() => setShowModal(false)}
                className="flex items-center justify-center w-full min-h-[44px] text-xs transition-colors hover:text-white"
                style={{ color: '#333', fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
