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
const ADMIN_EMAIL = 'raul@sacredlevels.com'
const REFRESH_MS  = 5 * 60 * 1000

// ── Types ─────────────────────────────────────────────────────────────────────
interface ScoreFactor { nombre: string; valor: string; cumple: boolean; peso: number }
interface VolumeLevel { price: number; volume: number }
interface InstitutionalLevel { price: number; volume: number; type: 'soporte' | 'resistencia'; distPct: number }
interface ZPoint { t: number; z: number; price: number }

interface QuantData {
  timestamp: string
  currentPrice: number
  changePct: number
  rsi: number
  atr: number
  zScore: number
  roc: number
  ema21: number
  ema55: number
  volatility: number
  trendStrength: number
  zSignal: string
  score: number
  signal: 'BUY' | 'SELL' | 'WAIT'
  factors: ScoreFactor[]
  volumeProfile: VolumeLevel[]
  institutionalLevels: InstitutionalLevel[]
  zHistory: ZPoint[]
  candleCount: number
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmt(n: number, d = 2) { return isNaN(n) ? '—' : n.toFixed(d) }
function fmtPrice(n: number)   { return isNaN(n) ? '—' : '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }

function rsiColor(v: number) {
  if (v < 30) return GREEN
  if (v > 70) return RED
  return '#aaa'
}
function zColor(v: number) {
  if (v > 2 || v < -2) return RED
  if (Math.abs(v) > 1)  return GOLD
  return GREEN
}
function changePctColor(v: number) { return v >= 0 ? GREEN : RED }
function trendColor(v: number)     { return v > 0 ? GREEN : v < 0 ? RED : '#aaa' }
function rocColor(v: number)       { return v > 0 ? GREEN : RED }
function signalColor(s: string)    { return s === 'BUY' ? GREEN : s === 'SELL' ? RED : GOLD }

// ── Z-Score Canvas Chart ──────────────────────────────────────────────────────
function ZScoreChart({ data }: { data: ZPoint[] }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas || data.length === 0) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = canvas.width  = canvas.offsetWidth  * window.devicePixelRatio
    const H = canvas.height = canvas.offsetHeight * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    const w = canvas.offsetWidth
    const h = canvas.offsetHeight

    ctx.fillStyle = CARD
    ctx.fillRect(0, 0, w, h)

    const zValues = data.map(d => d.z)
    const minZ = Math.min(-2.5, ...zValues)
    const maxZ = Math.max(2.5, ...zValues)
    const range = maxZ - minZ

    const toX = (i: number) => (i / (data.length - 1)) * (w - 40) + 20
    const toY = (z: number) => h - 20 - ((z - minZ) / range) * (h - 40)

    // Grid lines at -2, -1, 0, 1, 2
    for (const zLine of [-2, -1, 0, 1, 2]) {
      const y = toY(zLine)
      ctx.beginPath()
      ctx.strokeStyle = zLine === 0 ? '#333' : zLine === 2 || zLine === -2 ? RED + '55' : '#222'
      ctx.lineWidth = zLine === 0 ? 1 : 0.5
      ctx.setLineDash(zLine === 0 ? [] : [4, 4])
      ctx.moveTo(20, y)
      ctx.lineTo(w - 20, y)
      ctx.stroke()
      ctx.setLineDash([])

      ctx.fillStyle = MUTED
      ctx.font = `10px JetBrains Mono, monospace`
      ctx.fillText(String(zLine), 2, y + 4)
    }

    // Shade extreme zones
    const y2pos = toY(2), y2neg = toY(-2)
    ctx.fillStyle = RED + '18'
    ctx.fillRect(20, 20, w - 40, y2pos - 20)         // above +2
    ctx.fillRect(20, y2neg, w - 40, h - 20 - y2neg)  // below -2

    // Line
    ctx.beginPath()
    ctx.strokeStyle = CYAN
    ctx.lineWidth = 1.5
    for (let i = 0; i < data.length; i++) {
      const x = toX(i), y = toY(data[i].z)
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    }
    ctx.stroke()

    // Dots where Z crossed ±2
    for (let i = 0; i < data.length; i++) {
      if (Math.abs(data[i].z) >= 2) {
        ctx.beginPath()
        ctx.arc(toX(i), toY(data[i].z), 3, 0, Math.PI * 2)
        ctx.fillStyle = RED
        ctx.fill()
      }
    }
  }, [data])

  return (
    <canvas
      ref={ref}
      style={{ width: '100%', height: '180px', display: 'block', borderRadius: '6px' }}
    />
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function QuantAnalysisPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [data, setData]       = useState<QuantData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/quant')
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Error de servidor')
      setData(json)
      setLastUpdate(new Date().toLocaleTimeString('es-PY'))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.email === ADMIN_EMAIL) {
      fetchData()
      timerRef.current = setInterval(fetchData, REFRESH_MS)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [status, session, fetchData])

  // Show blank while session loads
  if (status === 'loading') return <div style={{ background: BG, minHeight: '100vh' }} />

  // Redirect non-admins only once session is confirmed
  if (status === 'unauthenticated' || session?.user?.email !== ADMIN_EMAIL) {
    router.replace('/')
    return null
  }

  const maxVolume = data ? Math.max(...data.volumeProfile.map(v => v.volume)) : 1
  const closestVP = data
    ? data.volumeProfile.reduce((best, v) =>
        Math.abs(v.price - data.currentPrice) < Math.abs(best.price - data.currentPrice) ? v : best
      , data.volumeProfile[0])
    : null

  return (
    <div style={{ background: BG, minHeight: '100vh', color: '#ccc', fontFamily: SANS }}>
      {/* Header */}
      <div style={{ borderBottom: `1px solid ${BORDER}`, padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: 10, letterSpacing: '0.3em', color: CYAN, textTransform: 'uppercase', marginBottom: 4 }}>Admin · Sacred Levels</p>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#fff', margin: 0 }}>Análisis Cuantitativo</h1>
          <p style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>XAUUSD · 1H · 60D · {data?.candleCount ?? '—'} velas</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
          <button
            onClick={fetchData}
            disabled={loading}
            style={{
              background: 'transparent', border: `1px solid ${CYAN}`, color: CYAN,
              padding: '8px 20px', fontSize: 11, fontWeight: 700,
              letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer',
              opacity: loading ? 0.5 : 1, fontFamily: SANS,
            }}
          >
            {loading ? 'Cargando...' : 'Actualizar Datos'}
          </button>
          {lastUpdate && (
            <p style={{ fontSize: 10, color: MUTED }}>
              Última actualización: {lastUpdate} · Auto-refresh 5 min
            </p>
          )}
        </div>
      </div>

      {error && (
        <div style={{ margin: '16px 24px', padding: '12px 16px', background: RED + '15', border: `1px solid ${RED}`, borderRadius: 6, color: RED, fontSize: 12 }}>
          {error}
        </div>
      )}

      {loading && !data && (
        <div style={{ textAlign: 'center', padding: '80px 0', color: MUTED, fontSize: 13 }}>
          Obteniendo datos de Yahoo Finance...
        </div>
      )}

      {data && (
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 24px 60px' }}>

          {/* ── Panel 1: Estado Actual ──────────────────────────── */}
          <section style={{ marginBottom: 24 }}>
            <Label>Estado Actual</Label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 1, background: BORDER }}>
              {[
                { label: 'Precio',         value: fmtPrice(data.currentPrice),        color: '#fff' },
                { label: 'Cambio',         value: (data.changePct >= 0 ? '+' : '') + fmt(data.changePct) + '%', color: changePctColor(data.changePct) },
                { label: 'RSI (14)',        value: fmt(data.rsi, 1),                   color: rsiColor(data.rsi) },
                { label: 'ATR (14)',        value: fmtPrice(data.atr),                 color: '#aaa' },
                { label: 'Z-Score (50)',    value: fmt(data.zScore),                   color: zColor(data.zScore) },
                { label: 'Momentum ROC',   value: fmt(data.roc) + '%',                color: rocColor(data.roc) },
                { label: 'EMA 21',         value: fmtPrice(data.ema21),               color: '#aaa' },
                { label: 'EMA 55',         value: fmtPrice(data.ema55),               color: '#aaa' },
                { label: 'Fuerza Tendencia', value: (data.trendStrength >= 0 ? '+' : '') + fmt(data.trendStrength) + '%', color: trendColor(data.trendStrength) },
                { label: 'Volatilidad',    value: fmt(data.volatility) + '%',         color: data.volatility < 0.8 ? GREEN : data.volatility < 1.2 ? GOLD : RED },
              ].map(item => (
                <div key={item.label} style={{ background: CARD, padding: '16px 18px' }}>
                  <p style={{ fontSize: 9, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 6 }}>{item.label}</p>
                  <p style={{ fontSize: 18, fontWeight: 700, fontFamily: MONO, color: item.color }}>{item.value}</p>
                </div>
              ))}
            </div>
            <div style={{ background: CARD, borderTop: `1px solid ${BORDER}`, padding: '12px 18px', fontSize: 12, color: zColor(data.zScore) }}>
              Z-Signal: <strong>{data.zSignal}</strong>
            </div>
          </section>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>

            {/* ── Panel 2: Volume Profile ─────────────────────── */}
            <section>
              <Label>Volume Profile · Top 10</Label>
              <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 4, padding: '16px' }}>
                {data.volumeProfile.map((vp, i) => {
                  const isClosest = closestVP?.price === vp.price
                  const isAbove   = vp.price > data.currentPrice
                  const barW      = (vp.volume / maxVolume) * 100
                  return (
                    <div key={vp.price} style={{ marginBottom: i < data.volumeProfile.length - 1 ? 10 : 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                        <span style={{
                          fontFamily: MONO, fontSize: 11,
                          color: isClosest ? GOLD : isAbove ? RED + 'cc' : GREEN + 'cc',
                          fontWeight: isClosest ? 700 : 400,
                        }}>
                          ${vp.price.toLocaleString()}
                          {isClosest && ' ◄ PRECIO'}
                        </span>
                        <span style={{ fontSize: 9, color: isAbove ? RED + '99' : GREEN + '99' }}>
                          {isAbove ? '▲ ARRIBA' : '▼ ABAJO'}
                        </span>
                      </div>
                      <div style={{ background: BORDER, height: 6, borderRadius: 3 }}>
                        <div style={{
                          width: barW + '%', height: '100%', borderRadius: 3,
                          background: isClosest ? GOLD : isAbove ? RED + '88' : GREEN + '88',
                          transition: 'width 0.4s ease',
                        }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>

            {/* ── Panel 3: Niveles Institucionales ───────────── */}
            <section>
              <Label>Niveles Institucionales · Volumen 2× promedio</Label>
              <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 0, borderBottom: `1px solid ${BORDER}` }}>
                  {['Precio', 'Tipo', 'Distancia'].map(h => (
                    <div key={h} style={{ padding: '8px 14px', fontSize: 9, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.2em', borderRight: `1px solid ${BORDER}` }}>{h}</div>
                  ))}
                </div>
                {data.institutionalLevels.length === 0 && (
                  <p style={{ padding: 16, fontSize: 12, color: MUTED }}>No se detectaron niveles institucionales</p>
                )}
                {data.institutionalLevels.map((lvl, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'grid', gridTemplateColumns: '1fr auto auto',
                      borderBottom: i < data.institutionalLevels.length - 1 ? `1px solid ${BORDER}` : 'none',
                    }}
                  >
                    <div style={{ padding: '10px 14px', fontFamily: MONO, fontSize: 12, color: '#ccc', borderRight: `1px solid ${BORDER}` }}>
                      ${lvl.price.toLocaleString()}
                    </div>
                    <div style={{ padding: '10px 14px', fontSize: 10, fontWeight: 700, color: lvl.type === 'soporte' ? GREEN : RED, textTransform: 'uppercase', borderRight: `1px solid ${BORDER}`, whiteSpace: 'nowrap' }}>
                      {lvl.type === 'soporte' ? '↑ Soporte probable' : '↓ Resistencia probable'}
                    </div>
                    <div style={{ padding: '10px 14px', fontFamily: MONO, fontSize: 11, color: MUTED, whiteSpace: 'nowrap' }}>
                      {Math.abs(lvl.distPct).toFixed(2)}%
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* ── Panel 4: Señal General ─────────────────────────── */}
          <section style={{ marginBottom: 24 }}>
            <Label>Señal General</Label>
            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 4 }}>
              {/* Big banner */}
              <div style={{
                padding: '28px 24px',
                borderBottom: `1px solid ${BORDER}`,
                display: 'flex', alignItems: 'center', gap: 32,
              }}>
                <div style={{ textAlign: 'center', minWidth: 120 }}>
                  <p style={{
                    fontSize: 48, fontWeight: 900, fontFamily: MONO,
                    color: signalColor(data.signal), lineHeight: 1,
                  }}>{data.signal}</p>
                  <p style={{ fontSize: 10, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.2em', marginTop: 6 }}>Señal dominante</p>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <p style={{ fontSize: 13, color: MUTED }}>Score cuantitativo</p>
                    <p style={{
                      fontSize: 32, fontWeight: 800, fontFamily: MONO,
                      color: data.score >= 60 ? GREEN : data.score <= 25 ? RED : GOLD,
                    }}>{data.score}<span style={{ fontSize: 14, color: MUTED }}>/100</span></p>
                  </div>
                  {/* Score bar */}
                  <div style={{ background: BORDER, height: 8, borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{
                      width: data.score + '%', height: '100%',
                      background: data.score >= 60 ? GREEN : data.score <= 25 ? RED : GOLD,
                      borderRadius: 4, transition: 'width 0.6s ease',
                    }} />
                  </div>
                </div>
              </div>

              {/* Factor breakdown */}
              <div style={{ padding: '16px 24px' }}>
                <p style={{ fontSize: 9, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 12 }}>Desglose de factores</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {data.factors.map((f, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '10px 12px', background: BG, borderRadius: 4,
                        border: `1px solid ${f.cumple ? GREEN + '30' : RED + '30'}`,
                      }}
                    >
                      <span style={{ fontSize: 16, color: f.cumple ? GREEN : RED, lineHeight: 1 }}>
                        {f.cumple ? '✓' : '✗'}
                      </span>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 11, color: '#ccc', marginBottom: 2 }}>{f.nombre}</p>
                        <p style={{ fontFamily: MONO, fontSize: 10, color: f.cumple ? GREEN : MUTED }}>{f.valor}</p>
                      </div>
                      <span style={{ fontSize: 9, color: MUTED }}>+{f.peso}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ── Panel 5: Histórico Z-Score ─────────────────────── */}
          <section>
            <Label>Histórico Z-Score · Últimos 30 días · Líneas rojas = extremo ±2</Label>
            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 4, padding: 16 }}>
              <ZScoreChart data={data.zHistory} />
              <div style={{ display: 'flex', gap: 24, marginTop: 12 }}>
                {[
                  { color: CYAN,  label: 'Z-Score' },
                  { color: RED,   label: 'Zona extrema (±2)' },
                  { color: RED,   label: '● Punto extremo', dot: true },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {item.dot
                      ? <span style={{ width: 8, height: 8, borderRadius: '50%', background: item.color, display: 'inline-block' }} />
                      : <span style={{ width: 16, height: 2, background: item.color, display: 'inline-block' }} />
                    }
                    <span style={{ fontSize: 10, color: MUTED }}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <p style={{ textAlign: 'center', marginTop: 32, fontSize: 10, color: '#333' }}>
            Datos: Yahoo Finance · XAUUSD · Solo para uso interno administrativo
          </p>
        </div>
      )}
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontSize: 9, color: CYAN, textTransform: 'uppercase', letterSpacing: '0.3em',
      fontFamily: SANS, marginBottom: 8, fontWeight: 600,
    }}>
      {children}
    </p>
  )
}
