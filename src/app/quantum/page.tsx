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

    // n=0,1,2,3 → acumulación | n=4,5 → equilibrio | n=6,7,8 → distribución
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
      <main className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-purple-400 text-sm">Verificando acceso...</p>
        </div>
      </main>
    )
  }

  /* ── Paywall ── */
  if (!access.allowed && access.usesLeft === 0 && !access.paid) {
    return (
      <main className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-gradient-to-br from-[#1a0a2e] to-[#0d0d0d] border border-purple-500/30 rounded-2xl p-8">
            <span className="text-5xl mb-4 block">🔬</span>
            <h2 className="text-2xl font-bold text-white mb-2">Niveles Cuánticos</h2>
            <p className="text-gray-400 mb-2">Usaste tus 3 cálculos gratuitos.</p>
            <p className="text-gray-500 text-sm mb-6 italic">
              &ldquo;Si la inversión en educación te parece cara,<br />imagina el precio de la ignorancia&rdquo;
            </p>
            <div className="text-3xl font-bold text-purple-400 mb-1">
              350.000 <span className="text-base text-gray-400">GS</span>
            </div>
            <div className="text-sm text-gray-500 mb-6">🌎 $50 USD · mensual · incluye todo</div>
            <a
              href="/billing"
              className="block w-full py-4 rounded-xl font-bold text-white text-lg mb-4 transition-all hover:scale-[1.02]"
              style={{ background: 'linear-gradient(135deg, #7e22ce, #9333ea)' }}
            >
              ⚡ Suscribirse a Quantum Access
            </a>
            <a href="/dashboard" className="text-sm text-gray-500 hover:text-white transition-colors">
              ← Volver al Dashboard
            </a>
          </div>
        </div>
      </main>
    )
  }

  /* ── Main Page ── */
  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white">

      {/* Header */}
      <div className="border-b border-purple-500/20 bg-[#0a0a0f]/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔬</span>
            <div>
              <h1 className="text-base font-bold text-white">Niveles Cuánticos de Probabilidad</h1>
              <p className="text-xs text-purple-400">Distribución de energía E=n² aplicada al precio</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {!access.paid && (
              <span className="text-xs text-purple-300 bg-purple-900/40 border border-purple-500/30 px-3 py-1 rounded-full">
                {access.usesLeft} uso{access.usesLeft !== 1 ? 's' : ''} gratis restante{access.usesLeft !== 1 ? 's' : ''}
              </span>
            )}
            {access.paid && (
              <span className="text-xs text-green-400 bg-green-900/30 border border-green-500/30 px-3 py-1 rounded-full">
                ✓ Acceso completo
              </span>
            )}
            <a href="/dashboard" className="text-sm text-gray-400 hover:text-white transition-colors">
              ← Dashboard
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">

        {/* Banner prueba gratis */}
        {!access.paid && (
          <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-xl p-6 mb-8 text-center">
            <h3 className="text-xl font-bold text-white mb-2">🔬 Prueba Gratis</h3>
            <p className="text-gray-300 mb-4">
              Probá los Niveles Cuánticos{' '}
              <span className="text-purple-400 font-bold">3 veces GRATIS</span> sin registrarte
            </p>
            {access.usesLeft > 0 && (
              <p className="text-purple-400">
                Te quedan{' '}
                <span className="font-bold">{access.usesLeft}/3</span> pruebas gratis
              </p>
            )}
            {access.usesLeft <= 0 && (
              <a
                href="/billing"
                className="bg-[#c9a227] hover:bg-[#d4af37] text-black font-bold px-6 py-3 rounded-lg inline-block transition-colors"
              >
                Suscribirse — Gs. 350.000/mes
              </a>
            )}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="bg-gradient-to-br from-[#1a1a2e] to-[#0d0d0d] border border-purple-500/30 rounded-xl p-6 mb-6">
            <h2 className="text-white font-bold text-lg mb-1">Ingresá el rango de precios</h2>
            <p className="text-gray-500 text-sm mb-5">Los niveles se distribuyen con la función n² (más densos cerca del mínimo)</p>
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div>
                <label className="text-gray-400 text-sm mb-2 block">Máximo (High)</label>
                <input
                  type="number"
                  value={maxVal}
                  onChange={(e) => setMaxVal(e.target.value)}
                  placeholder="3100"
                  step="0.01"
                  className="w-full bg-[#0d0d0d] border border-gray-700 rounded-lg px-4 py-3 text-white text-xl focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-2 block">Mínimo (Low)</label>
                <input
                  type="number"
                  value={minVal}
                  onChange={(e) => setMinVal(e.target.value)}
                  placeholder="2800"
                  step="0.01"
                  className="w-full bg-[#0d0d0d] border border-gray-700 rounded-lg px-4 py-3 text-white text-xl focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            </div>

            {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

            <button
              type="submit"
              disabled={calculating}
              className="w-full font-bold py-4 rounded-lg text-lg transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-70 text-white"
              style={{ background: 'linear-gradient(135deg, #7e22ce, #9333ea)' }}
            >
              {calculating ? '⏳ Calculando...' : '🔬 Calcular Niveles Cuánticos'}
            </button>

            {!access.paid && (
              <p className="text-center text-xs text-gray-600 mt-3">
                Cada cálculo consume 1 uso gratuito · quedan {access.usesLeft}/3
              </p>
            )}
          </div>
        </form>

        {/* Results */}
        {levels.length > 0 && (
          <>
            {/* n² curve visualization */}
            <div className="mb-6 bg-[#0d0d0d] border border-purple-500/20 rounded-xl p-4 h-44 relative overflow-hidden">
              <p className="text-purple-400 text-xs uppercase tracking-widest absolute top-3 left-4">
                ψ(x)² — Distribución cuántica de probabilidad E=n²
              </p>
              <svg viewBox="0 0 100 40" className="w-full h-full" preserveAspectRatio="none">
                {[10, 20, 30].map((y) => (
                  <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#ffffff08" strokeWidth="0.5" />
                ))}
                {/* Fibonacci reference (straight line) */}
                <line x1="0" y1="38" x2="100" y2="4" stroke="#c9a227" strokeWidth="0.8" strokeDasharray="2,2" opacity="0.35" />
                <text x="62" y="16" fontSize="3" fill="#c9a227" opacity="0.5">Fibonacci</text>
                {/* n² curve (parabola) */}
                <path
                  d={`M 0 38 ${levels.map((lv) => `L ${lv.probability} ${38 - (lv.probability / 100) * 34}`).join(' ')}`}
                  stroke="#9333ea"
                  strokeWidth="1.5"
                  fill="none"
                />
                {/* Shaded area */}
                <path
                  d={`M 0 38 ${levels.map((lv) => `L ${lv.probability} ${38 - (lv.probability / 100) * 34}`).join(' ')} L 100 38 Z`}
                  fill="#9333ea"
                  opacity="0.1"
                />
                <text x="30" y="20" fontSize="3" fill="#9333ea" opacity="0.7">n²</text>
                {/* Level markers */}
                {levels.map((lv) => (
                  <circle
                    key={lv.n}
                    cx={lv.probability}
                    cy={38 - (lv.probability / 100) * 34}
                    r="1.6"
                    fill={
                      lv.type === 'distribution' ? '#ef4444' :
                      lv.type === 'equilibrium'  ? '#eab308' : '#22c55e'
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
                  className={`p-4 rounded-lg border ${
                    level.type === 'accumulation'
                      ? 'bg-green-900/20 border-green-500/30'
                      : level.type === 'distribution'
                      ? 'bg-red-900/20 border-red-500/30'
                      : 'bg-yellow-900/20 border-yellow-500/30'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-2xl font-mono font-bold text-white">
                        ${level.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <span className="ml-3 text-sm text-gray-400 font-mono">n={level.n}</span>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold text-sm ${
                        level.strength === 'extreme' ? 'text-purple-400' :
                        level.strength === 'strong'  ? 'text-[#c9a227]'  : 'text-gray-400'
                      }`}>
                        {level.strength === 'extreme' ? '⚡ EXTREMO' :
                         level.strength === 'strong'  ? '🔥 FUERTE'  : '📊 MODERADO'}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">{level.probability}% energía</div>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {level.type === 'accumulation' && (
                      <>
                        <span className="bg-green-600/30 text-green-400 text-xs px-2 py-1 rounded-full">
                          🛡️ Zona de Rebote Alcista
                        </span>
                        <span className="bg-blue-600/30 text-blue-400 text-xs px-2 py-1 rounded-full">
                          🔄 Si rompe → actúa como Resistencia
                        </span>
                        {level.n === 0 && (
                          <span className="bg-purple-600/30 text-purple-400 text-xs px-2 py-1 rounded-full">
                            ⚡ Base cuántica extrema
                          </span>
                        )}
                        {(level.strength === 'strong' || level.strength === 'extreme') && (
                          <span className="bg-orange-600/30 text-orange-400 text-xs px-2 py-1 rounded-full">
                            🔄 Breakout Zone — pullback posible
                          </span>
                        )}
                      </>
                    )}
                    {level.type === 'equilibrium' && (
                      <>
                        <span className="bg-yellow-600/30 text-yellow-400 text-xs px-2 py-1 rounded-full">
                          ⚖️ Zona de Equilibrio
                        </span>
                        <span className="bg-purple-600/30 text-purple-400 text-xs px-2 py-1 rounded-full">
                          ⚡ Flip Zone — Soporte ↔ Resistencia
                        </span>
                        <span className="bg-gray-600/30 text-gray-400 text-xs px-2 py-1 rounded-full">
                          📊 Posible continuación o reversión
                        </span>
                      </>
                    )}
                    {level.type === 'distribution' && (
                      <>
                        <span className="bg-red-600/30 text-red-400 text-xs px-2 py-1 rounded-full">
                          🛡️ Zona de Rebote Bajista
                        </span>
                        <span className="bg-blue-600/30 text-blue-400 text-xs px-2 py-1 rounded-full">
                          🔄 Si rompe → actúa como Soporte
                        </span>
                        {level.n === N && (
                          <span className="bg-purple-600/30 text-purple-400 text-xs px-2 py-1 rounded-full">
                            ⚡ Techo cuántico extremo
                          </span>
                        )}
                        {(level.strength === 'strong' || level.strength === 'extreme') && (
                          <span className="bg-orange-600/30 text-orange-400 text-xs px-2 py-1 rounded-full">
                            🔄 Breakout Zone — pullback posible
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="mt-6 grid grid-cols-3 gap-3 text-center text-xs text-gray-400">
              <div className="bg-green-900/20 border border-green-500/20 rounded-xl p-3">
                <div className="text-green-400 font-bold mb-1">🟢 Acumulación</div>
                <div>n=0,1,2,3<br />Alta prob. de rebote alcista</div>
              </div>
              <div className="bg-yellow-900/20 border border-yellow-500/20 rounded-xl p-3">
                <div className="text-yellow-400 font-bold mb-1">⚖️ Equilibrio</div>
                <div>n=4,5<br />Reversión o continuación</div>
              </div>
              <div className="bg-red-900/20 border border-red-500/20 rounded-xl p-3">
                <div className="text-red-400 font-bold mb-1">🔴 Distribución</div>
                <div>n=6,7,8<br />Alta prob. de rebote bajista</div>
              </div>
            </div>

            {/* Breakout vs Rejection guide */}
            <div className="mt-4 bg-[#0d0d1a] border border-blue-500/20 rounded-xl p-4">
              <h4 className="text-blue-400 font-bold mb-3 text-sm">📖 Guía Breakout vs Rebote</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-gray-400">
                <div className="flex items-start gap-2">
                  <span className="text-blue-400 text-base flex-shrink-0">🔄</span>
                  <div><span className="text-blue-400 font-semibold">Breakout Zone</span><br />Si el precio rompe con volumen, esperar pullback para entrar en continuación</div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-400 text-base flex-shrink-0">🛡️</span>
                  <div><span className="text-green-400 font-semibold">Rejection Zone</span><br />Alta probabilidad de rebote. Buscar señales de reversión en velas</div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-purple-400 text-base flex-shrink-0">⚡</span>
                  <div><span className="text-purple-400 font-semibold">Flip Zone</span><br />El nivel cambia de rol: soporte roto se convierte en resistencia y viceversa</div>
                </div>
              </div>
            </div>

            {/* Fibonacci comparison */}
            <div className="bg-[#1a1a2e] border border-[#c9a227]/20 rounded-xl p-5 mt-4">
              <h4 className="text-[#c9a227] font-bold mb-2">📐 ¿Por qué es diferente a Fibonacci?</h4>
              <p className="text-gray-400 text-sm leading-relaxed">
                Fibonacci distribuye niveles uniformemente (23.6%, 38.2%, 50%, 61.8%).<br />
                Los niveles cuánticos siguen E=n² concentrando más niveles cerca del mínimo,
                igual que los electrones en un átomo tienen más niveles de energía cerca del núcleo.
                Esto genera zonas de alta densidad energética donde el precio tiende a reaccionar con mayor fuerza.
              </p>
            </div>

            {/* Disclaimer */}
            <p className="text-gray-600 text-xs mt-6 text-center">
              🔬 Herramienta experimental con fines educativos. No es asesoramiento financiero. No inviertas más de lo que estás dispuesto a perder.
            </p>
          </>
        )}

      </div>
    </main>
  )
}
