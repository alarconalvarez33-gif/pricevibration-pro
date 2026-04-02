'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
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
  allowed: boolean
  paid: boolean
  usesLeft: number
  usesCount: number
  reason?: string
}

const N = 8

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

// ── Level color helper ────────────────────────────────────────────────────────
function levelColor(type: QuantumLevel['type']) {
  return type === 'accumulation' ? GREEN : type === 'distribution' ? RED : CYAN
}

export default function QuantumPage() {
  const { status } = useSession()

  const [access, setAccess]       = useState<AccessState>({ loading: true, allowed: false, paid: false, usesLeft: 0, usesCount: 0 })
  const [maxVal, setMaxVal]       = useState('')
  const [minVal, setMinVal]       = useState('')
  const [levels, setLevels]       = useState<QuantumLevel[]>([])
  const [error, setError]         = useState('')
  const [calculating, setCalculating] = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    fetch('/api/quantum/check-access')
      .then(r => r.json())
      .then(data => setAccess({
        loading: false, allowed: data.allowed, paid: data.paid ?? false,
        usesLeft: data.usesLeft ?? 0, usesCount: data.usesCount ?? 0, reason: data.reason,
      }))
      .catch(() => setAccess(p => ({ ...p, loading: false })))
  }, [status])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const max = parseFloat(maxVal)
    const min = parseFloat(minVal)
    if (isNaN(max) || isNaN(min)) { setError('Ingresá valores numéricos válidos.'); return }
    if (min >= max) { setError('El máximo debe ser mayor al mínimo.'); return }

    if (!access.paid) {
      setCalculating(true)
      try {
        const res  = await fetch('/api/quantum/check-access', { method: 'POST' })
        const data = await res.json()
        if (!data.allowed && data.usesLeft === undefined) return
        setAccess(p => ({ ...p, allowed: data.allowed, usesLeft: data.usesLeft ?? 0, usesCount: data.usesCount ?? 0 }))
        if (!data.allowed) { setError('No tenés más usos gratuitos disponibles.'); setCalculating(false); return }
      } catch { setError('Error de conexión. Intentá de nuevo.'); setCalculating(false); return }
      setCalculating(false)
    }
    setLevels(calculateQuantumLevels(max, min))
  }

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (access.loading) {
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

  // ── Paywall ──────────────────────────────────────────────────────────────────
  if (!access.allowed && access.usesLeft === 0 && !access.paid) {
    return (
      <main
        className="min-h-screen flex items-center justify-center px-6"
        style={{ backgroundColor: BG, fontFamily: "'Inter', sans-serif" }}
      >
        <div className="max-w-md w-full">
          <div className="border" style={{ backgroundColor: CARD, borderColor: BORDER }}>
            <div className="h-px" style={{ background: `linear-gradient(90deg, transparent, ${CYAN}, transparent)` }} />
            <div className="p-10 text-center">
              <div
                className="w-12 h-12 border flex items-center justify-center mx-auto mb-6"
                style={{ borderColor: `${CYAN}30` }}
              >
                <svg className="w-6 h-6" fill="none" stroke={CYAN} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h2
                className="text-2xl font-bold text-white mb-3"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Calculadora Cuadrática
              </h2>
              <p className="text-sm mb-2" style={{ color: MUTED }}>
                Usaste tus 3 cálculos gratuitos.
              </p>
              <p className="text-sm mb-8 italic leading-relaxed" style={{ color: '#333' }}>
                &ldquo;Si la inversión en educación te parece cara,
                <br />imagina el precio de la ignorancia&rdquo;
              </p>
              <div
                className="text-4xl font-bold text-white mb-1"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
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

  // ── Main ─────────────────────────────────────────────────────────────────────
  return (
    <main
      className="min-h-screen"
      style={{ backgroundColor: BG, fontFamily: "'Inter', sans-serif" }}
    >
      {/* Header */}
      <div className="border-b sticky top-0 z-10" style={{ backgroundColor: BG, borderColor: BORDER }}>
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1
              className="text-base font-bold text-white"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Quantum Tech
            </h1>
            <p className="text-[10px] mt-0.5" style={{ color: CYAN, fontFamily: "'JetBrains Mono', monospace" }}>
              Niveles cuánticos E=n² · Sacred Levels
            </p>
          </div>
          <div className="flex items-center gap-3">
            {!access.paid && (
              <div
                className="border px-3 py-1 text-xs"
                style={{ borderColor: `${CYAN}25`, backgroundColor: `${CYAN}08`, color: CYAN, fontFamily: "'JetBrains Mono', monospace" }}
              >
                {access.usesLeft > 0 ? `${access.usesLeft}d gratis` : 'Trial expirado'}
              </div>
            )}
            {access.paid && (
              <div
                className="border px-3 py-1 text-xs uppercase tracking-widest"
                style={{ borderColor: `${GREEN}25`, backgroundColor: `${GREEN}08`, color: GREEN, fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Acceso completo
              </div>
            )}
            <a
              href="/dashboard"
              className="text-xs uppercase tracking-[0.15em] transition-colors hover:text-white"
              style={{ color: MUTED, fontFamily: "'Space Grotesk', sans-serif" }}
            >
              ← Dashboard
            </a>
          </div>
        </div>
      </div>

      <LegalDisclaimer variant="banner" />

      <div className="max-w-4xl mx-auto px-6 py-12">

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

        {/* Free trial banner */}
        {!access.paid && (
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
          <div className="border p-8 mb-6" style={{ backgroundColor: CARD, borderColor: BORDER }}>
            <h2
              className="text-xl font-bold text-white mb-2"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Ingresá el rango de precios
            </h2>
            <p className="text-sm mb-7" style={{ color: MUTED }}>
              Los niveles se distribuyen con la función n² — más densos cerca del mínimo.
            </p>

            <div className="grid grid-cols-2 gap-5 mb-6">
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
                    className="w-full border px-4 py-3.5 text-white text-xl focus:outline-none transition-colors duration-200"
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

            {!access.paid && access.usesLeft > 0 && (
              <p className="text-center text-[9px] mt-3 uppercase tracking-[0.2em]" style={{ color: '#2a2a2a', fontFamily: "'Space Grotesk', sans-serif" }}>
                Trial gratuito · {access.usesLeft} día{access.usesLeft !== 1 ? 's' : ''} restante{access.usesLeft !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </form>

        {/* Results */}
        {levels.length > 0 && (
          <>
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
              {levels.map(level => {
                const col = levelColor(level.type)
                return (
                  <div
                    key={level.n}
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
                        <span
                          className="text-2xl font-bold text-white"
                          style={{ fontFamily: "'JetBrains Mono', monospace" }}
                        >
                          ${level.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span
                          className="ml-3 text-sm"
                          style={{ color: MUTED, fontFamily: "'JetBrains Mono', monospace" }}
                        >
                          n={level.n}
                        </span>
                      </div>
                      <div className="text-right">
                        <div
                          className="text-xs font-bold uppercase tracking-[0.15em]"
                          style={{ color: col, fontFamily: "'Space Grotesk', sans-serif" }}
                        >
                          {level.strength === 'extreme' ? 'EXTREMO' : level.strength === 'strong' ? 'FUERTE' : 'MODERADO'}
                        </div>
                        <div
                          className="text-[9px] mt-0.5 uppercase tracking-widest"
                          style={{ color: '#333', fontFamily: "'JetBrains Mono', monospace" }}
                        >
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
              })}
            </div>

            {/* Legend */}
            <div className="mt-8 grid grid-cols-3 gap-px" style={{ backgroundColor: BORDER }}>
              {[
                { col: GREEN, label: 'Acumulación', sub: 'n=0,1,2,3 · Rebote alcista' },
                { col: CYAN,  label: 'Equilibrio',  sub: 'n=4,5 · Reversión o continuación' },
                { col: RED,   label: 'Distribución', sub: 'n=6,7,8 · Rebote bajista' },
              ].map(({ col, label, sub }) => (
                <div key={label} className="p-4 text-center" style={{ backgroundColor: CARD }}>
                  <div
                    className="text-xs font-bold uppercase tracking-[0.1em] mb-1"
                    style={{ color: col, fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {label}
                  </div>
                  <div className="text-[10px]" style={{ color: MUTED }}>{sub}</div>
                </div>
              ))}
            </div>

            {/* Guide */}
            <div className="mt-4 border p-6" style={{ backgroundColor: CARD, borderColor: BORDER }}>
              <h4
                className="text-sm font-bold text-white mb-4 uppercase tracking-[0.1em]"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
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
              <h4
                className="text-sm font-bold text-white mb-3 uppercase tracking-[0.1em]"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Por qué es diferente a Fibonacci
              </h4>
              <p className="text-sm leading-relaxed" style={{ color: MUTED }}>
                Fibonacci distribuye niveles uniformemente (23.6%, 38.2%, 50%, 61.8%).
                Los niveles cuadráticos siguen E=n² concentrando más niveles cerca del mínimo,
                igual que los electrones en un átomo tienen más niveles de energía cerca del núcleo.
                Esto genera zonas de alta densidad energética donde el precio tiende a reaccionar con mayor fuerza.
              </p>
            </div>

            <div className="mt-8">
              <LegalDisclaimer variant="full" />
            </div>
          </>
        )}
      </div>
    </main>
  )
}

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
