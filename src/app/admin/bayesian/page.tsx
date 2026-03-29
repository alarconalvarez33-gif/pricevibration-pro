'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect, useRef, useCallback } from 'react'
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
const ADMIN_EMAIL  = 'raul@sacredlevels.com'
const VELAS_FUTURO = 5

// ── Types ──────────────────────────────────────────────────────────────────────
interface Factor {
  nombre: string; descripcion: string; puntos: number; maxPuntos: number; cumple: boolean
}
interface Confluencia {
  score: number; clasificacion: string; direccion: 'BUY' | 'SELL' | 'WAIT'; esSoporte: boolean; factores: Factor[]
}
interface MC {
  P0: number; mu: number; sigma: number
  p5: number; p25: number; mediana: number; p75: number; p95: number; varPct: number
}
interface Señal {
  nivel: number; esSoporte: boolean; score: number; clasificacion: string
  direccion: 'BUY' | 'SELL' | 'WAIT'; distanciaPct: number
  target: number; stop: number; rr: number; alertaActiva: boolean
}
interface APIResult {
  temporalidad: string; velas: number; precio: number
  timestamp: string; mercadoAbierto: boolean
  analisis: { nivel: number; distanciaPct: number; nivelAlejado: boolean; confluencia: Confluencia; monteCarlo: MC }
  condicionesActuales: { rsi: number; ema20: number; ema50: number; atr: number; volActual: number; volPromedio: number; patron: string; alcista: boolean }
  señalesActivas: Señal[]
}

// ── Color helpers ──────────────────────────────────────────────────────────────
function scoreColor(score: number) {
  if (score > 85) return GOLD
  if (score > 65) return CYAN
  if (score > 45) return GREEN
  if (score > 25) return '#C4A77D'
  return RED
}
function claseColor(c: string) {
  if (c === 'EXTREMA') return GOLD
  if (c === 'MUY FUERTE') return CYAN
  if (c === 'FUERTE') return GREEN
  if (c === 'MODERADA') return '#C4A77D'
  return RED
}
function dirColor(d: string) { return d === 'BUY' ? GREEN : d === 'SELL' ? RED : MUTED }

// ── Web Audio beep ─────────────────────────────────────────────────────────────
function playBeep(freq = 880, dur = 0.3) {
  try {
    const ctx  = new (window.AudioContext || (window as any).webkitAudioContext)()
    const osc  = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain); gain.connect(ctx.destination)
    osc.frequency.value = freq
    gain.gain.setValueAtTime(0.08, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur)
    osc.start(); osc.stop(ctx.currentTime + dur)
  } catch { /* AudioContext no disponible */ }
}

// ── Circular gauge ────────────────────────────────────────────────────────────
function CircularGauge({ score }: { score: number }) {
  const R   = 58
  const C   = 2 * Math.PI * R
  const pct = Math.min(score, 100) / 100
  const col = scoreColor(score)

  return (
    <svg width="150" height="150" viewBox="0 0 150 150" style={{ display: 'block' }}>
      <circle cx="75" cy="75" r={R} fill="none" stroke="#1e1e1f" strokeWidth="10" />
      <circle
        cx="75" cy="75" r={R} fill="none"
        stroke={col} strokeWidth="10" strokeLinecap="round"
        strokeDasharray={`${pct * C} ${C}`}
        transform="rotate(-90 75 75)"
        style={{ transition: 'stroke-dasharray 0.8s ease' }}
      />
      <text x="75" y="70" textAnchor="middle" fill={col}
        fontSize="32" fontWeight="bold" fontFamily="JetBrains Mono, monospace">{score}</text>
      <text x="75" y="88" textAnchor="middle" fill="#555"
        fontSize="11" fontFamily="Space Grotesk, sans-serif">/100</text>
    </svg>
  )
}

// ── Factor row ─────────────────────────────────────────────────────────────────
function FactorRow({ f }: { f: Factor }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b" style={{ borderColor: BORDER }}>
      <span className="text-base mt-0.5 shrink-0">{f.cumple ? '✅' : '❌'}</span>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold" style={{ color: f.cumple ? '#ccc' : MUTED, fontFamily: SANS }}>{f.nombre}</span>
          <span className="text-xs font-bold ml-2 shrink-0"
            style={{ color: f.cumple ? scoreColor(f.puntos / f.maxPuntos * 100) : MUTED, fontFamily: MONO }}>
            +{f.puntos}/{f.maxPuntos}
          </span>
        </div>
        <p className="text-[10px] mt-0.5 leading-relaxed" style={{ color: MUTED, fontFamily: MONO }}>{f.descripcion}</p>
      </div>
    </div>
  )
}

// ── Price cell ─────────────────────────────────────────────────────────────────
function PriceFmt({ v }: { v: number }) {
  return <>${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</>
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function BayesianPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [temporalidad, setTemporalidad] = useState('1h')
  const [nivel, setNivel]               = useState('')
  const [loading, setLoading]           = useState(false)
  const [result, setResult]             = useState<APIResult | null>(null)
  const [error, setError]               = useState('')
  const [sonido, setSonido]             = useState(false)
  const [autoRefresh, setAutoRefresh]   = useState(false)
  const lastNivelRef = useRef(nivel)
  const lastTempRef  = useRef(temporalidad)

  useEffect(() => { lastNivelRef.current = nivel }, [nivel])
  useEffect(() => { lastTempRef.current = temporalidad }, [temporalidad])

  const run = useCallback(async (nv?: string, temp?: string) => {
    const nivelActual = nv ?? lastNivelRef.current
    const tempActual  = temp ?? lastTempRef.current
    if (!nivelActual || isNaN(Number(nivelActual))) { setError('Ingresá un nivel válido'); return }
    setError(''); setLoading(true)
    try {
      const res  = await fetch('/api/admin/bayesian', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ temporalidad: tempActual, nivel: Number(nivelActual) }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Error del servidor'); return }
      setResult(data)
      if (sonido && data.señalesActivas?.some((s: Señal) => s.alertaActiva)) {
        playBeep(880, 0.3)
        setTimeout(() => playBeep(1100, 0.2), 400)
      }
    } catch { setError('Error de conexión') }
    finally   { setLoading(false) }
  }, [sonido])

  // Auto-refresh cada 60 segundos
  useEffect(() => {
    if (!autoRefresh || !result) return
    const id = setInterval(() => run(), 60_000)
    return () => clearInterval(id)
  }, [autoRefresh, result, run])

  if (status === 'loading') return null
  if (status === 'unauthenticated' || session?.user?.email !== ADMIN_EMAIL) {
    router.replace('/'); return null
  }

  const cf   = result?.analisis?.confluencia
  const mc   = result?.analisis?.monteCarlo
  const cond = result?.condicionesActuales
  const col  = cf ? scoreColor(cf.score) : CYAN

  // Alertas activas
  const alertas = result?.señalesActivas?.filter(s => s.alertaActiva) ?? []

  return (
    <main className="min-h-screen" style={{ backgroundColor: BG, fontFamily: "'Inter', sans-serif" }}>

      {/* Header */}
      <div className="border-b sticky top-0 z-40" style={{ backgroundColor: '#0d0d0e', borderColor: BORDER }}>
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div>
            <p className="text-[9px] uppercase tracking-[0.3em]" style={{ color: CYAN, fontFamily: MONO }}>
              Admin — {ADMIN_EMAIL}
            </p>
            <h1 className="text-sm font-bold text-white" style={{ fontFamily: SANS }}>
              Sacred Levels · Sistema de Confluencia XAUUSD
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {result && (
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: result.mercadoAbierto ? GREEN : RED,
                  boxShadow: `0 0 6px ${result.mercadoAbierto ? GREEN : RED}` }} />
                <span className="text-[10px]" style={{ color: result.mercadoAbierto ? GREEN : RED, fontFamily: MONO }}>
                  {result.mercadoAbierto ? 'ABIERTO' : 'CERRADO'}
                </span>
              </div>
            )}
            <button onClick={() => router.push('/admin')} className="text-xs" style={{ color: MUTED, fontFamily: SANS }}>
              ← Admin
            </button>
          </div>
        </div>
      </div>

      {/* Alert banner */}
      {alertas.length > 0 && (
        <div className="border-b py-2 px-6" style={{ backgroundColor: `${GOLD}15`, borderColor: `${GOLD}40` }}>
          <div className="max-w-6xl mx-auto flex items-center gap-3">
            <span className="text-sm">⚡</span>
            <p className="text-xs font-bold" style={{ color: GOLD, fontFamily: MONO }}>
              ALERTA: Precio se acerca a {alertas.length} nivel{alertas.length > 1 ? 'es' : ''} de alta confluencia —{' '}
              {alertas.map(a => `$${a.nivel.toLocaleString()} (${a.score}pts ${a.direccion})`).join(' · ')}
            </p>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Controls */}
        <div className="border rounded-xl p-5 mb-6" style={{ backgroundColor: CARD, borderColor: BORDER }}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] block mb-1.5" style={{ color: MUTED, fontFamily: SANS }}>Temporalidad</label>
              <select value={temporalidad} onChange={e => setTemporalidad(e.target.value)}
                className="w-full px-3 py-2 text-sm text-white rounded border outline-none"
                style={{ backgroundColor: '#0d0d0e', borderColor: BORDER, fontFamily: MONO }}>
                {['1m','5m','15m','30m','1h','4h','1d'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] block mb-1.5" style={{ color: MUTED, fontFamily: SANS }}>Nivel Sagrado (USD)</label>
              <input type="number" value={nivel} onChange={e => setNivel(e.target.value)} placeholder="ej. 3300.00"
                className="w-full px-3 py-2 text-sm text-white rounded border outline-none"
                style={{ backgroundColor: '#0d0d0e', borderColor: BORDER, fontFamily: MONO }}
                onKeyDown={e => e.key === 'Enter' && run()} />
            </div>
            <button onClick={() => run()} disabled={loading}
              className="py-2 text-sm font-bold uppercase tracking-[0.1em] text-black rounded transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: CYAN, fontFamily: SANS }}>
              {loading ? 'Calculando...' : 'Analizar'}
            </button>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={sonido} onChange={e => setSonido(e.target.checked)} className="accent-cyan-400" />
                <span className="text-xs" style={{ color: MUTED, fontFamily: SANS }}>Sonido de alerta</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={autoRefresh} onChange={e => setAutoRefresh(e.target.checked)} className="accent-cyan-400" />
                <span className="text-xs" style={{ color: MUTED, fontFamily: SANS }}>Auto-refresh 60s</span>
              </label>
            </div>
          </div>
          {error && <p className="mt-2 text-xs" style={{ color: RED, fontFamily: MONO }}>{error}</p>}
          {result && (
            <p className="mt-2 text-[10px]" style={{ color: '#333', fontFamily: MONO }}>
              Última actualización: {new Date(result.timestamp).toLocaleTimeString()} · {result.velas} velas · ${result.precio.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
              {autoRefresh && <span style={{ color: CYAN }}> · Auto-refresh activo</span>}
            </p>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-20">
            <div className="w-8 h-8 border-2 rounded-full animate-spin mx-auto mb-4"
              style={{ borderColor: `${CYAN}30`, borderTopColor: CYAN }} />
            <p className="text-xs" style={{ color: MUTED, fontFamily: MONO }}>
              Descargando XAUUSD · calculando 7 factores · {(1000).toLocaleString()} simulaciones MC...
            </p>
          </div>
        )}

        {result && !loading && (
          <div className="space-y-6">

            {/* Nivel alejado aviso */}
            {result.analisis.nivelAlejado && (
              <div className="border rounded-xl p-3 flex items-center gap-3"
                style={{ borderColor: `${GOLD}40`, backgroundColor: `${GOLD}08` }}>
                <span>⚠️</span>
                <p className="text-xs" style={{ color: GOLD, fontFamily: MONO }}>
                  Nivel ${result.analisis.nivel.toLocaleString()} está {result.analisis.distanciaPct.toFixed(1)}% alejado del precio actual (${result.precio.toLocaleString('en-US', { minimumFractionDigits: 2 })}). Considera usar un nivel más cercano.
                </p>
              </div>
            )}

            {/* SCORE PRINCIPAL + FACTORES + MONTE CARLO */}
            <div className="grid md:grid-cols-2 gap-6">

              {/* Score + Factores */}
              <div className="border rounded-xl p-5" style={{ backgroundColor: CARD, borderColor: BORDER }}>
                {/* Gauge + dirección */}
                <div className="flex items-center gap-6 mb-5">
                  <CircularGauge score={cf!.score} />
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] mb-1" style={{ color: MUTED, fontFamily: SANS }}>Confluencia</p>
                    <p className="text-2xl font-bold mb-1" style={{ color: claseColor(cf!.clasificacion), fontFamily: MONO }}>
                      {cf!.clasificacion}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold" style={{ color: dirColor(cf!.direccion), fontFamily: MONO }}>
                        {cf!.direccion === 'BUY' ? '↑ BUY' : cf!.direccion === 'SELL' ? '↓ SELL' : '→ WAIT'}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded" style={{ backgroundColor: cf!.esSoporte ? `${GREEN}15` : `${RED}15`, color: cf!.esSoporte ? GREEN : RED, fontFamily: SANS }}>
                        {cf!.esSoporte ? 'SOPORTE' : 'RESISTENCIA'}
                      </span>
                    </div>
                    {cf!.score <= 25 && (
                      <p className="text-[10px] mt-2 font-bold" style={{ color: RED, fontFamily: MONO }}>NO OPERAR — Confluencia insuficiente</p>
                    )}
                  </div>
                </div>

                {/* Factores */}
                <div>
                  {cf!.factores.map(f => <FactorRow key={f.nombre} f={f} />)}
                </div>
              </div>

              {/* Condiciones + Monte Carlo */}
              <div className="space-y-4">

                {/* Condiciones actuales */}
                <div className="border rounded-xl p-4" style={{ backgroundColor: CARD, borderColor: BORDER }}>
                  <h3 className="text-[10px] uppercase tracking-[0.2em] mb-3" style={{ color: CYAN, fontFamily: SANS }}>Condiciones actuales</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { l: 'RSI', v: `${cond!.rsi.toFixed(1)}`, alert: cond!.rsi < 30 || cond!.rsi > 70 },
                      { l: 'EMA20', v: `$${cond!.ema20.toFixed(0)}`, alert: false },
                      { l: 'EMA50', v: `$${cond!.ema50.toFixed(0)}`, alert: false },
                      { l: 'Vol ratio', v: cond!.volPromedio > 0 ? `${(cond!.volActual / cond!.volPromedio).toFixed(2)}x` : '—', alert: cond!.volActual > cond!.volPromedio * 1.5 },
                      { l: 'Tendencia', v: cond!.alcista ? '↑ ALCISTA' : '↓ BAJISTA', alert: false },
                      { l: 'Patrón', v: cond!.patron.replace(/_/g, ' ').toUpperCase(), alert: cond!.patron !== 'ninguno' },
                    ].map(item => (
                      <div key={item.l} className="p-2 rounded" style={{ backgroundColor: '#0d0d0e' }}>
                        <p className="text-[9px] uppercase tracking-[0.1em] mb-0.5" style={{ color: MUTED, fontFamily: SANS }}>{item.l}</p>
                        <p className="text-[11px] font-bold" style={{ color: item.alert ? GOLD : '#aaa', fontFamily: MONO }}>{item.v}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Monte Carlo */}
                <div className="border rounded-xl p-4" style={{ backgroundColor: CARD, borderColor: BORDER }}>
                  <h3 className="text-[10px] uppercase tracking-[0.2em] mb-3" style={{ color: CYAN, fontFamily: SANS }}>
                    Monte Carlo — {VELAS_FUTURO} velas · 1,000 sims
                  </h3>
                  {[
                    { l: 'Pesimista P5',  v: mc!.p5 },
                    { l: 'P25',           v: mc!.p25 },
                    { l: 'Mediana P50 ←', v: mc!.mediana, hl: true },
                    { l: 'P75',           v: mc!.p75 },
                    { l: 'Optimista P95', v: mc!.p95 },
                  ].map(r => (
                    <div key={r.l} className="flex justify-between items-center py-1.5 border-b" style={{ borderColor: BORDER }}>
                      <span className="text-[10px]" style={{ color: MUTED, fontFamily: SANS }}>{r.l}</span>
                      <span className="text-xs font-bold" style={{ color: r.hl ? GOLD : '#ccc', fontFamily: MONO }}>
                        <PriceFmt v={r.v} />
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between mt-2">
                    <span className="text-[10px]" style={{ color: MUTED, fontFamily: SANS }}>Variación esperada</span>
                    <span className="text-xs font-bold" style={{ color: mc!.varPct >= 0 ? GREEN : RED, fontFamily: MONO }}>
                      {mc!.varPct >= 0 ? '+' : ''}{mc!.varPct.toFixed(2)}%
                    </span>
                  </div>

                  {/* Operación sugerida */}
                  {cf!.score > 45 && (
                    <div className="mt-3 p-3 rounded border" style={{ borderColor: `${col}25`, backgroundColor: `${col}06` }}>
                      <p className="text-[9px] uppercase tracking-[0.15em] mb-1.5 font-bold" style={{ color: col, fontFamily: SANS }}>Operación sugerida</p>
                      <div className="space-y-0.5" style={{ fontFamily: MONO, fontSize: 11 }}>
                        <p style={{ color: '#aaa' }}>Entrada → <PriceFmt v={result.precio} /></p>
                        <p style={{ color: GREEN }}>Target → <PriceFmt v={cf!.esSoporte ? mc!.p75 : mc!.p25} /></p>
                        <p style={{ color: RED }}>Stop → <PriceFmt v={cf!.esSoporte ? mc!.p5 : mc!.p95} /></p>
                        <p style={{ color: '#aaa' }}>R:R → {(
                          Math.abs((cf!.esSoporte ? mc!.p75 : mc!.p25) - result.precio) /
                          (Math.abs(result.precio - (cf!.esSoporte ? mc!.p5 : mc!.p95)) || 1)
                        ).toFixed(2)}:1</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* SEÑALES ACTIVAS */}
            {result.señalesActivas.length > 0 && (
              <div className="border rounded-xl overflow-hidden" style={{ borderColor: BORDER }}>
                <div className="px-5 py-3 border-b flex items-center justify-between" style={{ backgroundColor: '#0d0d0e', borderColor: BORDER }}>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white" style={{ fontFamily: SANS }}>
                      Señales Activas — Square of 9 automático
                    </h3>
                    <p className="text-[10px] mt-0.5" style={{ color: MUTED, fontFamily: MONO }}>
                      {result.señalesActivas.length} niveles con score &gt; 45 · ordenados por confluencia
                    </p>
                  </div>
                  <div className="text-[10px]" style={{ color: '#333', fontFamily: MONO }}>
                    Score &gt;65 resaltado en dorado
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs" style={{ fontFamily: MONO }}>
                    <thead>
                      <tr className="border-b" style={{ borderColor: BORDER, backgroundColor: '#0d0d0e' }}>
                        {['Nivel', 'Tipo', 'Score', 'Clase', 'Dir', 'Dist%', 'Target', 'Stop', 'R:R'].map(h => (
                          <th key={h} className="px-4 py-2 text-left font-normal" style={{ color: MUTED }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {result.señalesActivas.map((s, i) => {
                        const isGold = s.score > 65
                        const rowBg  = s.alertaActiva ? `${GOLD}08` : i % 2 === 0 ? CARD : '#0d0d0e'
                        return (
                          <tr key={s.nivel} className="border-b transition-colors" style={{ borderColor: BORDER, backgroundColor: rowBg }}>
                            <td className="px-4 py-2.5 font-bold" style={{ color: isGold ? GOLD : '#ccc' }}>
                              ${s.nivel.toLocaleString('en-US', { minimumFractionDigits: 1 })}
                              {s.alertaActiva && <span className="ml-1 text-[9px]" style={{ color: GOLD }}>⚡</span>}
                            </td>
                            <td className="px-4 py-2.5">
                              <span className="px-1.5 py-0.5 rounded text-[9px]"
                                style={{ backgroundColor: s.esSoporte ? `${GREEN}15` : `${RED}15`, color: s.esSoporte ? GREEN : RED }}>
                                {s.esSoporte ? 'SOPORTE' : 'RESIST.'}
                              </span>
                            </td>
                            <td className="px-4 py-2.5">
                              <span className="font-bold" style={{ color: scoreColor(s.score) }}>{s.score}</span>
                            </td>
                            <td className="px-4 py-2.5" style={{ color: claseColor(s.clasificacion), fontSize: 10 }}>
                              {s.clasificacion}
                            </td>
                            <td className="px-4 py-2.5 font-bold" style={{ color: dirColor(s.direccion) }}>
                              {s.direccion === 'BUY' ? '↑ BUY' : s.direccion === 'SELL' ? '↓ SELL' : '→ WAIT'}
                            </td>
                            <td className="px-4 py-2.5" style={{ color: MUTED }}>{s.distanciaPct.toFixed(2)}%</td>
                            <td className="px-4 py-2.5" style={{ color: GREEN }}><PriceFmt v={s.target} /></td>
                            <td className="px-4 py-2.5" style={{ color: RED }}><PriceFmt v={s.stop} /></td>
                            <td className="px-4 py-2.5" style={{ color: isGold ? GOLD : '#aaa' }}>{s.rr}:1</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {result.señalesActivas.length === 0 && (
              <div className="border rounded-xl p-8 text-center" style={{ borderColor: BORDER, backgroundColor: CARD }}>
                <p className="text-sm" style={{ color: MUTED, fontFamily: SANS }}>
                  No hay señales activas con score &gt; 45 en los niveles Sacred Levels actuales
                </p>
              </div>
            )}

            {/* Footer */}
            <p className="text-center text-[10px]" style={{ color: '#2a2a2b', fontFamily: MONO }}>
              Solo uso educativo — no constituye asesoramiento financiero · Sacred Levels {new Date().getFullYear()}
            </p>

          </div>
        )}
      </div>
    </main>
  )
}
