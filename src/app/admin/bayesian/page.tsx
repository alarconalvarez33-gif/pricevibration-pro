'use client'

import { useSession } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const BG     = '#0A0A0B'
const CARD   = '#111112'
const BORDER = '#1e1e1f'
const CYAN   = '#00E5FF'
const GREEN  = '#00ff88'
const RED    = '#ff4466'
const GOLD   = '#C4A77D'
const MUTED  = '#555'
const MONO   = "'JetBrains Mono', monospace"
const SANS   = "'Space Grotesk', sans-serif"

const ADMIN_EMAIL = 'raul@sacredlevels.com'

interface BayesResult {
  temporalidad: string
  nivel: number
  velas: number
  precio: number
  distanciaPct: number
  sinDatos?: boolean
  nivelAlejado?: boolean
  mensaje?: string
  toques?: number
  rebotes?: number
  condiciones: {
    rsi: number
    sobreventa: boolean
    sobrecompra: boolean
    volAlta: boolean
    alcista: boolean
    atr: number
    ema50: number
  }
  bayes?: { pA: number; pBdadoA: number; pB: number; posterior: number }
  monteCarlo: {
    P0: number; mu: number; sigma: number
    p5: number; p25: number; mediana: number; p75: number; p95: number
    varPct: number
  }
  signal?: 'MUY FUERTE' | 'FUERTE' | 'MODERADA' | 'DÉBIL'
}

function Pct({ label, value, color }: { label: string; value: number; color?: string }) {
  const bar = Math.round(value * 40)
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs mb-1" style={{ fontFamily: MONO }}>
        <span style={{ color: MUTED }}>{label}</span>
        <span style={{ color: color || CYAN }}>{(value * 100).toFixed(1)}%</span>
      </div>
      <div className="h-1.5 rounded-full" style={{ backgroundColor: '#1a1a1b' }}>
        <div
          className="h-1.5 rounded-full transition-all duration-700"
          style={{ width: `${Math.min(bar * 2.5, 100)}%`, backgroundColor: color || CYAN }}
        />
      </div>
    </div>
  )
}

function PriceRow({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-center py-2 border-b" style={{ borderColor: BORDER }}>
      <span className="text-xs" style={{ color: MUTED, fontFamily: SANS }}>{label}</span>
      <span
        className="text-sm font-bold"
        style={{ color: highlight ? GOLD : '#ccc', fontFamily: MONO }}
      >
        ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </span>
    </div>
  )
}

export default function BayesianPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [temporalidad, setTemporalidad] = useState('1h')
  const [nivel, setNivel]               = useState('')
  const [loading, setLoading]           = useState(false)
  const [result, setResult]             = useState<BayesResult | null>(null)
  const [error, setError]               = useState('')

  if (status === 'loading') return null
  if (status === 'unauthenticated' || session?.user?.email !== ADMIN_EMAIL) {
    router.replace('/')
    return null
  }

  const run = async () => {
    if (!nivel || isNaN(Number(nivel))) { setError('Ingresá un nivel válido'); return }
    setError(''); setLoading(true); setResult(null)
    try {
      const res  = await fetch('/api/admin/bayesian', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ temporalidad, nivel: Number(nivel) }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Error del servidor'); return }
      setResult(data)
    } catch { setError('Error de conexión') }
    finally   { setLoading(false) }
  }

  const signalColor =
    result?.signal === 'MUY FUERTE' ? CYAN
    : result?.signal === 'FUERTE'   ? GREEN
    : result?.signal === 'MODERADA' ? GOLD
    : RED

  return (
    <main className="min-h-screen" style={{ backgroundColor: BG, fontFamily: "'Inter', sans-serif" }}>

      {/* Header */}
      <div className="border-b" style={{ backgroundColor: '#0d0d0e', borderColor: BORDER }}>
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] mb-0.5" style={{ color: CYAN, fontFamily: MONO }}>
              Admin — Solo raul@sacredlevels.com
            </p>
            <h1 className="text-base font-bold text-white" style={{ fontFamily: SANS }}>
              Motor Bayesiano XAUUSD
            </h1>
          </div>
          <button
            onClick={() => router.push('/admin')}
            className="text-xs uppercase tracking-[0.15em]"
            style={{ color: MUTED, fontFamily: SANS }}
          >
            ← Admin
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Intro */}
        <div className="mb-8 p-4 border rounded" style={{ borderColor: `${CYAN}20`, backgroundColor: `${CYAN}04` }}>
          <p className="text-xs" style={{ color: MUTED, fontFamily: MONO, lineHeight: 1.7 }}>
            <span style={{ color: CYAN }}>P(A|B) = P(B|A) × P(A) / P(B)</span>
            {'  ·  '}
            Prior = respeto histórico del nivel
            {'  ·  '}
            Likelihood = condiciones extremas en rebotes
            {'  ·  '}
            Monte Carlo: 1,000 simulaciones GBM × 5 velas
          </p>
        </div>

        {/* Inputs */}
        <div
          className="border rounded-xl p-6 mb-8"
          style={{ backgroundColor: CARD, borderColor: BORDER }}
        >
          <h2 className="text-sm font-bold text-white mb-5" style={{ fontFamily: SANS }}>
            Parámetros de análisis
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] block mb-2" style={{ color: MUTED, fontFamily: SANS }}>
                Temporalidad
              </label>
              <select
                value={temporalidad}
                onChange={e => setTemporalidad(e.target.value)}
                className="w-full px-3 py-2.5 text-sm text-white rounded border outline-none"
                style={{ backgroundColor: '#0d0d0e', borderColor: BORDER, fontFamily: MONO }}
              >
                {['1m','5m','15m','30m','1h','4h','1d'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] block mb-2" style={{ color: MUTED, fontFamily: SANS }}>
                Nivel Sagrado (USD)
              </label>
              <input
                type="number"
                value={nivel}
                onChange={e => setNivel(e.target.value)}
                placeholder="ej. 3300.00"
                className="w-full px-3 py-2.5 text-sm text-white rounded border outline-none"
                style={{ backgroundColor: '#0d0d0e', borderColor: BORDER, fontFamily: MONO }}
                onKeyDown={e => e.key === 'Enter' && run()}
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={run}
                disabled={loading}
                className="w-full py-2.5 text-sm font-bold uppercase tracking-[0.1em] text-black rounded transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: CYAN, fontFamily: SANS }}
              >
                {loading ? 'Calculando...' : 'Ejecutar Análisis'}
              </button>
            </div>
          </div>
          {error && (
            <p className="mt-3 text-xs" style={{ color: RED, fontFamily: MONO }}>{error}</p>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-20">
            <div
              className="w-8 h-8 border-2 rounded-full animate-spin mx-auto mb-4"
              style={{ borderColor: `${CYAN}30`, borderTopColor: CYAN }}
            />
            <p className="text-xs" style={{ color: MUTED, fontFamily: MONO }}>
              Descargando datos Yahoo Finance · calculando Bayes · 1,000 simulaciones MC...
            </p>
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <div className="space-y-6">

            {/* Aviso nivel alejado */}
            {result.nivelAlejado && (
              <div className="border rounded-xl p-4 flex items-center gap-3" style={{ borderColor: `${GOLD}40`, backgroundColor: `${GOLD}08` }}>
                <span style={{ color: GOLD }}>⚠️</span>
                <p className="text-xs" style={{ color: GOLD, fontFamily: MONO }}>
                  Nivel muy alejado del precio actual ({result.distanciaPct.toFixed(1)}% de distancia). El análisis puede ser menos preciso.
                </p>
              </div>
            )}

            {/* Sin datos */}
            {result.sinDatos ? (
              <div className="border rounded-xl p-8 text-center" style={{ borderColor: `${RED}30`, backgroundColor: `${RED}06` }}>
                <p className="text-2xl mb-2" style={{ color: RED, fontFamily: MONO }}>SIN DATOS</p>
                <p className="text-sm" style={{ color: MUTED, fontFamily: SANS }}>
                  El precio no ha testeado el nivel ${result.nivel.toLocaleString()} en el histórico disponible ({result.velas} velas de {result.temporalidad}).
                </p>
                <p className="text-xs mt-2" style={{ color: '#444', fontFamily: MONO }}>
                  Intentá con un nivel más cercano al precio actual (${result.precio.toLocaleString('en-US', { minimumFractionDigits: 2 })})
                </p>
              </div>
            ) : (
            <>

            {/* Signal banner */}
            <div
              className="border rounded-xl p-5 flex items-center justify-between"
              style={{
                backgroundColor: `${signalColor}08`,
                borderColor: `${signalColor}30`,
              }}
            >
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] mb-1" style={{ color: signalColor, fontFamily: SANS }}>
                  Señal bayesiana
                </p>
                <p className="text-3xl font-bold" style={{ color: signalColor, fontFamily: MONO }}>
                  {result.signal}
                </p>
                <p className="text-[10px] mt-1" style={{ color: MUTED, fontFamily: MONO }}>
                  {result.toques} toques · {result.rebotes} rebotes confirmados
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-[0.2em] mb-1" style={{ color: MUTED, fontFamily: SANS }}>
                  P(A|B) Posterior
                </p>
                <p className="text-4xl font-bold" style={{ color: signalColor, fontFamily: MONO }}>
                  {result.bayes ? (result.bayes.posterior * 100).toFixed(1) : '—'}%
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">

              {/* Bayes breakdown */}
              <div className="border rounded-xl p-5" style={{ backgroundColor: CARD, borderColor: BORDER }}>
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] mb-5" style={{ color: CYAN, fontFamily: SANS }}>
                  Probabilidades Bayesianas
                </h3>
                {result.bayes && <>
                <Pct label="P(A) — Prior: rebote histórico en nivel" value={result.bayes.pA} />
                <Pct label="P(B|A) — Likelihood: condiciones en rebotes" value={result.bayes.pBdadoA} color={GOLD} />
                <Pct label="P(B) — Evidencia: frecuencia condiciones extremas" value={result.bayes.pB} color={MUTED} />
                <div className="mt-4 pt-4 border-t" style={{ borderColor: BORDER }}>
                  <Pct label="P(A|B) — POSTERIOR" value={result.bayes.posterior} color={signalColor} />
                </div>
                </>}

                {/* Condiciones */}
                <div className="mt-4 pt-4 border-t" style={{ borderColor: BORDER }}>
                  <p className="text-[10px] uppercase tracking-[0.2em] mb-3" style={{ color: MUTED, fontFamily: SANS }}>Condiciones actuales</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'RSI', value: `${result.condiciones.rsi.toFixed(1)}${result.condiciones.sobreventa ? ' ⬇' : result.condiciones.sobrecompra ? ' ⬆' : ''}`, alert: result.condiciones.sobreventa || result.condiciones.sobrecompra },
                      { label: 'Vol. alta', value: result.condiciones.volAlta ? 'SÍ 🔥' : 'NO', alert: result.condiciones.volAlta },
                      { label: 'Tendencia', value: result.condiciones.alcista ? 'ALCISTA' : 'BAJISTA', alert: false },
                      { label: 'Distancia', value: `${result.distanciaPct.toFixed(2)}%`, alert: false },
                    ].map(item => (
                      <div key={item.label} className="p-2 rounded" style={{ backgroundColor: '#0d0d0e' }}>
                        <p className="text-[9px] uppercase tracking-[0.15em] mb-0.5" style={{ color: MUTED, fontFamily: SANS }}>{item.label}</p>
                        <p className="text-xs font-bold" style={{ color: item.alert ? GOLD : '#aaa', fontFamily: MONO }}>{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Monte Carlo */}
              <div className="border rounded-xl p-5" style={{ backgroundColor: CARD, borderColor: BORDER }}>
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] mb-1" style={{ color: CYAN, fontFamily: SANS }}>
                  Monte Carlo — 5 velas · 1,000 simulaciones
                </h3>
                <p className="text-[10px] mb-5" style={{ color: MUTED, fontFamily: MONO }}>
                  GBM: μ={result.monteCarlo.mu.toFixed(5)} · σ={result.monteCarlo.sigma.toFixed(5)}
                </p>

                <PriceRow label="Pesimista P5"   value={result.monteCarlo.p5} />
                <PriceRow label="Cuartil P25"    value={result.monteCarlo.p25} />
                <PriceRow label="Mediana P50"    value={result.monteCarlo.mediana} highlight />
                <PriceRow label="Cuartil P75"    value={result.monteCarlo.p75} />
                <PriceRow label="Optimista P95"  value={result.monteCarlo.p95} />

                <div className="mt-4 pt-4 border-t flex justify-between items-center" style={{ borderColor: BORDER }}>
                  <span className="text-xs" style={{ color: MUTED, fontFamily: SANS }}>Precio actual</span>
                  <span className="text-sm font-bold" style={{ color: '#ccc', fontFamily: MONO }}>
                    ${result.precio.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs" style={{ color: MUTED, fontFamily: SANS }}>Variación esperada (P50)</span>
                  <span
                    className="text-sm font-bold"
                    style={{ color: result.monteCarlo.varPct >= 0 ? GREEN : RED, fontFamily: MONO }}
                  >
                    {result.monteCarlo.varPct >= 0 ? '+' : ''}{result.monteCarlo.varPct.toFixed(2)}%
                  </span>
                </div>

                {/* Recomendación */}
                {result.bayes && result.bayes.posterior > 0.50 && (
                  <div className="mt-4 p-3 rounded border" style={{ borderColor: `${GREEN}25`, backgroundColor: `${GREEN}06` }}>
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] mb-1" style={{ color: GREEN, fontFamily: SANS }}>
                      Operación sugerida
                    </p>
                    <p className="text-xs" style={{ color: '#aaa', fontFamily: MONO }}>
                      Target → ${result.monteCarlo.p75.toLocaleString('en-US', { minimumFractionDigits: 2 })}<br/>
                      Stop   → ${result.monteCarlo.p5.toLocaleString('en-US', { minimumFractionDigits: 2 })}<br/>
                      R:R    → {Math.abs((result.monteCarlo.p75 - result.precio) / (result.precio - result.monteCarlo.p5)).toFixed(2)}:1
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Meta */}
            <div className="text-center">
              <p className="text-[10px]" style={{ color: '#333', fontFamily: MONO }}>
                {result.velas} velas históricas · temporalidad {result.temporalidad.toUpperCase()} · nivel ${result.nivel.toLocaleString()}
                {' · '}solo uso educativo, no es asesoramiento financiero
              </p>
            </div>

            </>
            )}  {/* end sinDatos ternary */}

          </div>
        )}
      </div>
    </main>
  )
}
