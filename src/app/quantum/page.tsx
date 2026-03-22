'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'

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
  const levels: QuantumLevel[] = []

  for (let n = 0; n <= N; n++) {
    const position = Math.pow(n / N, 2)
    const price = min + range * position
    const probability = Math.pow(n / N, 2) * 100

    const type: QuantumLevel['type'] =
      n <= 3 ? 'accumulation' : n <= 5 ? 'equilibrium' : 'distribution'
    const strength: QuantumLevel['strength'] =
      n === 0 || n === N ? 'extreme' : n <= 2 || n >= 6 ? 'strong' : 'moderate'

    levels.push({
      n,
      price: Math.round(price * 100) / 100,
      probability: Math.round(probability * 10) / 10,
      type,
      strength,
    })
  }
  return levels
}

export default function QuantumPage() {
  const { status } = useSession()

  const [access, setAccess] = useState<AccessState>({
    loading: true, allowed: false, paid: false, usesLeft: 0, usesCount: 0,
  })
  const [maxVal, setMaxVal] = useState('')
  const [minVal, setMinVal] = useState('')
  const [levels, setLevels] = useState<QuantumLevel[]>([])
  const [error, setError] = useState('')
  const [calculating, setCalculating] = useState(false)

  useEffect(() => {
    if (status === 'loading') return

    fetch('/api/quantum/check-access')
      .then((r) => r.json())
      .then((data) => {
        setAccess({
          loading: false,
          allowed: data.allowed,
          paid: data.paid ?? false,
          usesLeft: data.usesLeft ?? 0,
          usesCount: data.usesCount ?? 0,
          reason: data.reason,
        })
      })
      .catch(() => setAccess(prev => ({ ...prev, loading: false })))
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
        const res = await fetch('/api/quantum/check-access', { method: 'POST' })
        const data = await res.json()
        if (!data.allowed && data.usesLeft === undefined) { return }
        const newUsesLeft = data.usesLeft ?? 0
        setAccess(prev => ({
          ...prev,
          allowed: data.allowed,
          usesLeft: newUsesLeft,
          usesCount: data.usesCount ?? 0,
        }))
        if (!data.allowed) {
          setError('No tenés más usos gratuitos disponibles.')
          setCalculating(false)
          return
        }
      } catch {
        setError('Error de conexión. Intentá de nuevo.')
        setCalculating(false)
        return
      }
      setCalculating(false)
    }

    setLevels(calculateQuantumLevels(max, min))
  }

  /* ── Loading ── */
  if (access.loading) {
    return (
      <main
        className="min-h-screen bg-white flex items-center justify-center"
        style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
      >
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[#C4A77D] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#888888] text-sm">Verificando acceso...</p>
        </div>
      </main>
    )
  }

  /* ── Paywall ── */
  if (!access.allowed && access.usesLeft === 0 && !access.paid) {
    return (
      <main
        className="min-h-screen bg-[#F7F8F9] flex items-center justify-center px-6"
        style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
      >
        <div className="max-w-md w-full text-center">
          <div className="bg-white border border-[#E8E8E8] rounded-lg p-10">
            <div className="w-14 h-14 bg-[#C4A77D]/12 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-7 h-7 text-[#C4A77D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h2
              className="text-2xl text-[#111111] mb-3"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 500 }}
            >
              Calculadora Cuadrática
            </h2>
            <p className="text-[#666666] text-sm mb-2">Usaste tus 3 cálculos gratuitos.</p>
            <p className="text-[#888888] text-sm mb-8 italic leading-relaxed">
              &ldquo;Si la inversión en educación te parece cara,
              <br />imagina el precio de la ignorancia&rdquo;
            </p>
            <div className="text-4xl font-mono font-bold text-[#111111] mb-1">
              Gs. 350.000
            </div>
            <div className="text-sm text-[#888888] mb-8">$50 USD · mensual · incluye todo</div>
            <a
              href="/billing"
              className="block w-full py-4 rounded-lg font-semibold text-white text-base mb-4 transition-colors bg-[#111111] hover:bg-[#333333]"
            >
              Suscribirse a Quantum Access
            </a>
            <a href="/dashboard" className="text-sm text-[#888888] hover:text-[#111111] transition-colors">
              ← Volver al Dashboard
            </a>
          </div>
        </div>
      </main>
    )
  }

  /* ── Main Page ── */
  return (
    <main
      className="min-h-screen bg-white text-[#111111]"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >

      {/* Header */}
      <div className="border-b border-[#E8E8E8] bg-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1
              className="text-base font-semibold text-[#111111]"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Calculadora Cuadrática
            </h1>
            <p className="text-xs text-[#C4A77D]">Distribución de energía E=n² aplicada al precio</p>
          </div>
          <div className="flex items-center gap-3">
            {!access.paid && (
              <span className="text-xs text-[#B8953C] bg-[#C4A77D]/10 border border-[#C4A77D]/30 px-3 py-1 rounded-full">
                {access.usesLeft} uso{access.usesLeft !== 1 ? 's' : ''} gratis restante{access.usesLeft !== 1 ? 's' : ''}
              </span>
            )}
            {access.paid && (
              <span className="text-xs text-green-600 bg-green-50 border border-green-200 px-3 py-1 rounded-full">
                Acceso completo
              </span>
            )}
            <a href="/dashboard" className="text-sm text-[#888888] hover:text-[#111111] transition-colors">
              ← Dashboard
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">

        {/* Free trial banner */}
        {!access.paid && (
          <div className="bg-[#C4A77D]/8 border border-[#C4A77D]/20 rounded-lg p-6 mb-10 text-center">
            <h3
              className="text-xl text-[#111111] mb-2"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 500 }}
            >
              Prueba Gratuita
            </h3>
            <p className="text-[#666666] mb-4 text-sm">
              Prueba los Niveles Cuadráticos{' '}
              <span className="text-[#B8953C] font-semibold">3 veces GRATIS</span> sin registrarte
            </p>
            {access.usesLeft > 0 && (
              <p className="text-[#B8953C] text-sm">
                Te quedan{' '}
                <span className="font-bold">{access.usesLeft}/3</span> pruebas gratis
              </p>
            )}
            {access.usesLeft <= 0 && (
              <a
                href="/billing"
                className="inline-block bg-[#111111] hover:bg-[#333333] text-white font-semibold px-6 py-3 rounded-lg transition-colors text-sm"
              >
                Suscribirse — Gs. 350.000/mes
              </a>
            )}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="bg-[#F7F8F9] border border-[#E8E8E8] rounded-lg p-8 mb-6">
            <h2
              className="text-[#111111] text-xl mb-2"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 500 }}
            >
              Ingresá el rango de precios
            </h2>
            <p className="text-[#666666] text-sm mb-7">
              Los niveles se distribuyen con la función n² (más densos cerca del mínimo)
            </p>
            <div className="grid grid-cols-2 gap-5 mb-6">
              <div>
                <label className="text-[#666666] text-sm mb-2 block font-medium">Máximo (High)</label>
                <input
                  type="number"
                  value={maxVal}
                  onChange={(e) => setMaxVal(e.target.value)}
                  placeholder="3100"
                  step="0.01"
                  className="w-full bg-white border border-[#E8E8E8] rounded-lg px-4 py-3 text-[#111111] text-xl focus:outline-none focus:border-[#C4A77D] transition-colors"
                />
              </div>
              <div>
                <label className="text-[#666666] text-sm mb-2 block font-medium">Mínimo (Low)</label>
                <input
                  type="number"
                  value={minVal}
                  onChange={(e) => setMinVal(e.target.value)}
                  placeholder="2800"
                  step="0.01"
                  className="w-full bg-white border border-[#E8E8E8] rounded-lg px-4 py-3 text-[#111111] text-xl focus:outline-none focus:border-[#C4A77D] transition-colors"
                />
              </div>
            </div>

            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

            <button
              type="submit"
              disabled={calculating}
              className="w-full font-semibold py-4 rounded-lg text-base transition-all hover:bg-[#333333] active:scale-95 disabled:opacity-70 text-white bg-[#111111]"
            >
              {calculating ? 'Calculando...' : 'Calcular Niveles Cuadráticos'}
            </button>

            {!access.paid && (
              <p className="text-center text-xs text-[#888888] mt-3">
                Cada cálculo consume 1 uso gratuito · quedan {access.usesLeft}/3
              </p>
            )}
          </div>
        </form>

        {/* Results */}
        {levels.length > 0 && (
          <>
            {/* n² curve visualization */}
            <div className="mb-6 bg-[#F7F8F9] border border-[#E8E8E8] rounded-lg p-5 h-44 relative overflow-hidden">
              <p className="text-[#C4A77D] text-xs uppercase tracking-widest absolute top-4 left-5">
                ψ(x)² — Distribución cuántica E=n²
              </p>
              <svg viewBox="0 0 100 40" className="w-full h-full" preserveAspectRatio="none">
                {[10, 20, 30].map((y) => (
                  <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#E8E8E8" strokeWidth="0.5" />
                ))}
                <line x1="0" y1="38" x2="100" y2="4" stroke="#C4A77D" strokeWidth="0.8" strokeDasharray="2,2" opacity="0.5" />
                <text x="62" y="16" fontSize="3" fill="#C4A77D" opacity="0.7">Fibonacci</text>
                <path
                  d={`M 0 38 ${levels.map((lv) => `L ${lv.probability} ${38 - (lv.probability / 100) * 34}`).join(' ')}`}
                  stroke="#111111"
                  strokeWidth="1.5"
                  fill="none"
                />
                <path
                  d={`M 0 38 ${levels.map((lv) => `L ${lv.probability} ${38 - (lv.probability / 100) * 34}`).join(' ')} L 100 38 Z`}
                  fill="#111111"
                  opacity="0.05"
                />
                <text x="30" y="20" fontSize="3" fill="#111111" opacity="0.5">n²</text>
                {levels.map((lv) => (
                  <circle
                    key={lv.n}
                    cx={lv.probability}
                    cy={38 - (lv.probability / 100) * 34}
                    r="1.6"
                    fill={
                      lv.type === 'distribution' ? '#EF4444' :
                      lv.type === 'equilibrium'  ? '#C4A77D' : '#22C55E'
                    }
                  />
                ))}
              </svg>
            </div>

            {/* Level cards */}
            <div className="space-y-3">
              {levels.map((level) => (
                <div
                  key={level.n}
                  className={`p-5 rounded-lg border ${
                    level.type === 'accumulation'
                      ? 'bg-green-50 border-green-200'
                      : level.type === 'distribution'
                      ? 'bg-red-50 border-red-200'
                      : 'bg-[#C4A77D]/5 border-[#C4A77D]/20'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-2xl font-mono font-bold text-[#111111]">
                        ${level.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <span className="ml-3 text-sm text-[#888888] font-mono">n={level.n}</span>
                    </div>
                    <div className="text-right">
                      <div className={`font-semibold text-sm ${
                        level.strength === 'extreme' ? 'text-[#C4A77D]' :
                        level.strength === 'strong'  ? 'text-[#B8953C]' : 'text-[#888888]'
                      }`}>
                        {level.strength === 'extreme' ? 'EXTREMO' :
                         level.strength === 'strong'  ? 'FUERTE'  : 'MODERADO'}
                      </div>
                      <div className="text-xs text-[#888888] mt-0.5">{level.probability}% energía</div>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {level.type === 'accumulation' && (
                      <>
                        <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full border border-green-200">
                          Zona de Rebote Alcista
                        </span>
                        <span className="bg-blue-50 text-blue-600 text-xs px-3 py-1 rounded-full border border-blue-200">
                          Si rompe actúa como Resistencia
                        </span>
                        {level.n === 0 && (
                          <span className="bg-[#C4A77D]/10 text-[#B8953C] text-xs px-3 py-1 rounded-full border border-[#C4A77D]/20">
                            Base cuántica extrema
                          </span>
                        )}
                        {(level.strength === 'strong' || level.strength === 'extreme') && (
                          <span className="bg-orange-50 text-orange-600 text-xs px-3 py-1 rounded-full border border-orange-200">
                            Breakout Zone — pullback posible
                          </span>
                        )}
                      </>
                    )}
                    {level.type === 'equilibrium' && (
                      <>
                        <span className="bg-[#C4A77D]/8 text-[#B8953C] text-xs px-3 py-1 rounded-full border border-[#C4A77D]/20">
                          Zona de Equilibrio
                        </span>
                        <span className="bg-purple-50 text-purple-600 text-xs px-3 py-1 rounded-full border border-purple-200">
                          Flip Zone — Soporte / Resistencia
                        </span>
                        <span className="bg-gray-100 text-[#666666] text-xs px-3 py-1 rounded-full border border-gray-200">
                          Posible continuación o reversión
                        </span>
                      </>
                    )}
                    {level.type === 'distribution' && (
                      <>
                        <span className="bg-red-100 text-red-600 text-xs px-3 py-1 rounded-full border border-red-200">
                          Zona de Rebote Bajista
                        </span>
                        <span className="bg-blue-50 text-blue-600 text-xs px-3 py-1 rounded-full border border-blue-200">
                          Si rompe actúa como Soporte
                        </span>
                        {level.n === N && (
                          <span className="bg-[#C4A77D]/10 text-[#B8953C] text-xs px-3 py-1 rounded-full border border-[#C4A77D]/20">
                            Techo cuántico extremo
                          </span>
                        )}
                        {(level.strength === 'strong' || level.strength === 'extreme') && (
                          <span className="bg-orange-50 text-orange-600 text-xs px-3 py-1 rounded-full border border-orange-200">
                            Breakout Zone — pullback posible
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="mt-8 grid grid-cols-3 gap-4 text-center text-xs text-[#666666]">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-green-600 font-semibold mb-2 uppercase tracking-wide">Acumulación</div>
                <div className="text-[#888888]">n=0,1,2,3<br />Alta prob. de rebote alcista</div>
              </div>
              <div className="bg-[#C4A77D]/8 border border-[#C4A77D]/20 rounded-lg p-4">
                <div className="text-[#B8953C] font-semibold mb-2 uppercase tracking-wide">Equilibrio</div>
                <div className="text-[#888888]">n=4,5<br />Reversión o continuación</div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="text-red-500 font-semibold mb-2 uppercase tracking-wide">Distribución</div>
                <div className="text-[#888888]">n=6,7,8<br />Alta prob. de rebote bajista</div>
              </div>
            </div>

            {/* Breakout vs Rejection guide */}
            <div className="mt-6 bg-[#F7F8F9] border border-[#E8E8E8] rounded-lg p-6">
              <h4 className="text-[#111111] font-semibold mb-4 text-sm">Guía Breakout vs Rebote</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-[#666666]">
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1 shrink-0" />
                  <div>
                    <span className="text-[#111111] font-semibold block mb-1">Breakout Zone</span>
                    Si el precio rompe con volumen, esperar pullback para entrar en continuación
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1 shrink-0" />
                  <div>
                    <span className="text-[#111111] font-semibold block mb-1">Rejection Zone</span>
                    Alta probabilidad de rebote. Buscar señales de reversión en velas
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#C4A77D] mt-1 shrink-0" />
                  <div>
                    <span className="text-[#111111] font-semibold block mb-1">Flip Zone</span>
                    El nivel cambia de rol: soporte roto se convierte en resistencia y viceversa
                  </div>
                </div>
              </div>
            </div>

            {/* Fibonacci comparison */}
            <div className="bg-white border border-[#E8E8E8] rounded-lg p-6 mt-5">
              <h4 className="text-[#111111] font-semibold mb-3 text-sm">Por qué es diferente a Fibonacci</h4>
              <p className="text-[#666666] text-sm leading-relaxed">
                Fibonacci distribuye niveles uniformemente (23.6%, 38.2%, 50%, 61.8%).
                Los niveles cuadráticos siguen E=n² concentrando más niveles cerca del mínimo,
                igual que los electrones en un átomo tienen más niveles de energía cerca del núcleo.
                Esto genera zonas de alta densidad energética donde el precio tiende a reaccionar con mayor fuerza.
              </p>
            </div>

            {/* Disclaimer */}
            <p className="text-[#BBBBBB] text-xs mt-8 text-center">
              Herramienta con fines educativos. No constituye asesoramiento financiero.
            </p>
          </>
        )}

      </div>
    </main>
  )
}
