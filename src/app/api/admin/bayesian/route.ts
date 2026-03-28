import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const ADMIN_EMAIL  = 'raul@sacredlevels.com'
const RSI_PERIODO  = 14
const SIMULACIONES = 1000
const VELAS_FUTURO = 5

const INTERVAL_MAP: Record<string, { interval: string; range: string }> = {
  '1m':  { interval: '1m',  range: '7d'   },
  '5m':  { interval: '5m',  range: '60d'  },
  '15m': { interval: '15m', range: '60d'  },
  '30m': { interval: '30m', range: '60d'  },
  '1h':  { interval: '1h',  range: '730d' },
  '4h':  { interval: '1h',  range: '730d' },
  '1d':  { interval: '1d',  range: '5y'   },
}

interface Candle { t: number; o: number; h: number; l: number; c: number; v?: number }

export interface Factor {
  nombre: string
  descripcion: string
  puntos: number
  maxPuntos: number
  cumple: boolean
}

export interface ConfluenciaResult {
  score: number
  clasificacion: 'DÉBIL' | 'MODERADA' | 'FUERTE' | 'MUY FUERTE' | 'EXTREMA'
  direccion: 'BUY' | 'SELL' | 'WAIT'
  esSoporte: boolean
  factores: Factor[]
}

export interface Señal {
  nivel: number
  esSoporte: boolean
  score: number
  clasificacion: string
  direccion: 'BUY' | 'SELL' | 'WAIT'
  distanciaPct: number
  target: number
  stop: number
  rr: number
  alertaActiva: boolean
}

// ── Data fetch ─────────────────────────────────────────────────────────────────
async function fetchCandles(temporalidad: string): Promise<Candle[]> {
  const cfg = INTERVAL_MAP[temporalidad]
  if (!cfg) throw new Error(`Temporalidad no soportada: ${temporalidad}`)

  const url = `https://query1.finance.yahoo.com/v8/finance/chart/GC%3DF?interval=${cfg.interval}&range=${cfg.range}`
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, next: { revalidate: 60 } })
  if (!res.ok) throw new Error(`Yahoo Finance error: ${res.status}`)

  const json   = await res.json()
  const result = json?.chart?.result?.[0]
  if (!result) throw new Error('Respuesta vacía de Yahoo Finance')

  const ts      = result.timestamp as number[]
  const q       = result.indicators?.quote?.[0]
  let candles: Candle[] = ts.map((t, i) => ({
    t, o: q.open[i], h: q.high[i], l: q.low[i], c: q.close[i], v: q.volume?.[i],
  })).filter(c => c.c != null && isFinite(c.c) && isFinite(c.h) && isFinite(c.l))

  if (temporalidad === '4h') {
    const g: Candle[] = []
    for (let i = 0; i + 3 < candles.length; i += 4) {
      const ch = candles.slice(i, i + 4)
      g.push({ t: ch[0].t, o: ch[0].o, h: Math.max(...ch.map(c => c.h)),
               l: Math.min(...ch.map(c => c.l)), c: ch[3].c, v: ch.reduce((a, c) => a + (c.v ?? 0), 0) })
    }
    candles = g
  }
  return candles
}

// ── Indicadores ────────────────────────────────────────────────────────────────
function calcularRSI(closes: number[], periodo = RSI_PERIODO): number[] {
  const rsi = new Array(closes.length).fill(NaN)
  let g = 0, l = 0
  for (let i = 1; i <= periodo; i++) { const d = closes[i] - closes[i-1]; d > 0 ? g += d : l += -d }
  g /= periodo; l /= periodo
  rsi[periodo] = 100 - 100 / (1 + g / (l || 1e-10))
  for (let i = periodo + 1; i < closes.length; i++) {
    const d = closes[i] - closes[i-1]
    g = (g * (periodo-1) + Math.max(d, 0)) / periodo
    l = (l * (periodo-1) + Math.max(-d, 0)) / periodo
    rsi[i] = 100 - 100 / (1 + g / (l || 1e-10))
  }
  return rsi
}

function calcularATR(candles: Candle[], periodo = 14): number[] {
  const tr  = candles.map((c, i) => i === 0 ? c.h - c.l
    : Math.max(c.h - c.l, Math.abs(c.h - candles[i-1].c), Math.abs(c.l - candles[i-1].c)))
  const atr = new Array(candles.length).fill(NaN)
  atr[periodo-1] = tr.slice(0, periodo).reduce((a, b) => a + b, 0) / periodo
  for (let i = periodo; i < candles.length; i++) atr[i] = (atr[i-1] * (periodo-1) + tr[i]) / periodo
  return atr
}

function calcularEMA(values: number[], span: number): number[] {
  const k = 2 / (span + 1), ema = new Array(values.length).fill(NaN)
  ema[0] = values[0]
  for (let i = 1; i < values.length; i++) ema[i] = values[i] * k + ema[i-1] * (1 - k)
  return ema
}

// ── Detección de patrones de vela ──────────────────────────────────────────────
type Patron = 'engulfing_bull' | 'engulfing_bear' | 'pinbar_bull' | 'pinbar_bear' | 'doji' | 'ninguno'

function detectarPatron(candles: Candle[], idx: number): Patron {
  if (idx < 1) return 'ninguno'
  const c = candles[idx], p = candles[idx - 1]
  const body   = Math.abs(c.c - c.o)
  const rango  = c.h - c.l
  const shadow_low  = Math.min(c.o, c.c) - c.l
  const shadow_high = c.h - Math.max(c.o, c.c)
  const pBody  = Math.abs(p.c - p.o)

  // Doji: body < 10% del rango
  if (rango > 0 && body / rango < 0.10) return 'doji'

  // Engulfing alcista
  if (c.c > c.o && p.c < p.o && c.c > p.o && c.o < p.c && body > pBody) return 'engulfing_bull'
  // Engulfing bajista
  if (c.c < c.o && p.c > p.o && c.o > p.c && c.c < p.o && body > pBody) return 'engulfing_bear'

  // Pin bar / martillo alcista: lower shadow > 2x body, upper shadow pequeña
  if (body > 0 && shadow_low > body * 2 && shadow_high < body) return 'pinbar_bull'
  // Pin bar bajista: upper shadow > 2x body
  if (body > 0 && shadow_high > body * 2 && shadow_low < body) return 'pinbar_bear'

  return 'ninguno'
}

// ── Rebotes históricos en el nivel ─────────────────────────────────────────────
function contarRebotes(candles: Candle[], nivel: number): number {
  const PROX = 0.0015  // ±0.15%
  const MOVE = 0.003   // ≥0.3% para confirmar rebote
  const CONF = 5       // velas de confirmación
  let rebotes = 0, ultimoIdx = -5

  for (let i = 1; i < candles.length - CONF; i++) {
    const c = candles[i]
    if (i - ultimoIdx < 3) continue  // evitar clusters
    if (c.l <= nivel * (1 + PROX) && c.h >= nivel * (1 - PROX)) {
      const desdeAbajo = c.l <= nivel * (1 + PROX) && (i === 0 || candles[i-1].c < nivel)
      const siguiente  = candles.slice(i + 1, i + 1 + CONF)
      const reboté     = siguiente.some(s =>
        desdeAbajo  ? (s.c - nivel) / nivel >= MOVE
                    : (nivel - s.c) / nivel >= MOVE
      )
      if (reboté) { rebotes++; ultimoIdx = i }
    }
  }
  return rebotes
}

// ── Detección de flip (soporte/resistencia invertidos) ─────────────────────────
function detectarFlip(candles: Candle[], nivel: number, esSoporte: boolean): boolean {
  if (candles.length < 60) return false
  const historico = candles.slice(-60, -5)
  const total     = historico.length
  const bajosDelNivel = historico.filter(c => c.c < nivel * 0.998).length

  if (esSoporte) {
    // Nivel era resistencia (mayoría de cierre debajo) y ahora precio está encima
    return bajosDelNivel / total > 0.60
  } else {
    // Nivel era soporte (mayoría de cierre encima) y ahora precio está debajo
    return (total - bajosDelNivel) / total > 0.60
  }
}

// ── SISTEMA DE CONFLUENCIA (0-100 puntos) ──────────────────────────────────────
interface Indicadores {
  precio: number
  rsi: number
  ema20: number
  ema50: number
  atr: number
  volActual: number
  volPromedio: number
  patron: Patron
  candles: Candle[]
}

function calcularConfluencia(nivel: number, ind: Indicadores): ConfluenciaResult {
  const { precio, rsi, ema20, ema50, atr, volActual, volPromedio, patron, candles } = ind
  const esSoporte = precio > nivel

  const factores: Factor[] = []
  let score = 0

  // ── 1. NIVEL SAGRADO (max 20 pts) ──
  const distPct = Math.abs(precio - nivel) / nivel
  let pts1 = 0
  let desc1 = 'Precio lejos del nivel'
  if (distPct <= 0.001) { pts1 = 20; desc1 = `±${(distPct*100).toFixed(3)}% del nivel (contacto directo)` }
  else if (distPct <= 0.003) { pts1 = 10; desc1 = `±${(distPct*100).toFixed(2)}% del nivel (zona próxima)` }
  factores.push({ nombre: 'Nivel Sagrado', descripcion: desc1, puntos: pts1, maxPuntos: 20, cumple: pts1 > 0 })
  score += pts1

  // ── 2. RSI (max 15 pts) ──
  let pts2 = 0, desc2 = `RSI ${rsi.toFixed(1)} — zona neutral`
  if (esSoporte) {
    if (rsi < 30) { pts2 = 15; desc2 = `RSI ${rsi.toFixed(1)} — sobreventa en soporte` }
    else if (rsi < 40) { pts2 = 8; desc2 = `RSI ${rsi.toFixed(1)} — zona débil en soporte` }
  } else {
    if (rsi > 70) { pts2 = 15; desc2 = `RSI ${rsi.toFixed(1)} — sobrecompra en resistencia` }
    else if (rsi > 60) { pts2 = 8; desc2 = `RSI ${rsi.toFixed(1)} — zona débil en resistencia` }
  }
  factores.push({ nombre: 'RSI', descripcion: desc2, puntos: pts2, maxPuntos: 15, cumple: pts2 > 0 })
  score += pts2

  // ── 3. ESTRUCTURA DE VELAS (max 15 pts) ──
  let pts3 = 0, desc3 = 'Sin patrón relevante en el nivel'
  const idx = candles.length - 1
  if (esSoporte) {
    if (patron === 'engulfing_bull') { pts3 = 15; desc3 = 'Vela envolvente alcista en soporte' }
    else if (patron === 'pinbar_bull') { pts3 = 12; desc3 = 'Pin bar / martillo en soporte' }
    else if (patron === 'doji')         { pts3 = 8;  desc3 = 'Doji — indecisión en soporte' }
  } else {
    if (patron === 'engulfing_bear') { pts3 = 15; desc3 = 'Vela envolvente bajista en resistencia' }
    else if (patron === 'pinbar_bear') { pts3 = 12; desc3 = 'Pin bar bajista en resistencia' }
    else if (patron === 'doji')         { pts3 = 8;  desc3 = 'Doji — indecisión en resistencia' }
  }
  void idx
  factores.push({ nombre: 'Estructura de Velas', descripcion: desc3, puntos: pts3, maxPuntos: 15, cumple: pts3 > 0 })
  score += pts3

  // ── 4. VOLUMEN (max 10 pts) ──
  let pts4 = 0, desc4 = 'Volumen bajo en el nivel'
  const ratioVol = volPromedio > 0 ? volActual / volPromedio : 0
  if (ratioVol >= 1.5) { pts4 = 10; desc4 = `Volumen ${ratioVol.toFixed(1)}x — confirmación fuerte` }
  else if (ratioVol >= 1.2) { pts4 = 5; desc4 = `Volumen ${ratioVol.toFixed(1)}x — confirmación media` }
  else { desc4 = `Volumen ${ratioVol.toFixed(1)}x — sin confirmación` }
  factores.push({ nombre: 'Volumen', descripcion: desc4, puntos: pts4, maxPuntos: 10, cumple: pts4 > 0 })
  score += pts4

  // ── 5. TENDENCIA EMA (max 15 pts) ──
  let pts5 = 0, desc5 = 'Tendencia contra el rebote esperado'
  const tendAlcista = ema20 > ema50
  if (esSoporte && tendAlcista) { pts5 = 15; desc5 = `EMA20 (${ema20.toFixed(0)}) > EMA50 (${ema50.toFixed(0)}) — tendencia alcista apoya soporte` }
  else if (!esSoporte && !tendAlcista) { pts5 = 15; desc5 = `EMA20 (${ema20.toFixed(0)}) < EMA50 (${ema50.toFixed(0)}) — tendencia bajista apoya resistencia` }
  else { desc5 = `EMA20 ${tendAlcista ? '>' : '<'} EMA50 — contra tendencia (riesgo mayor)` }
  factores.push({ nombre: 'Tendencia EMA20/50', descripcion: desc5, puntos: pts5, maxPuntos: 15, cumple: pts5 > 0 })
  score += pts5

  // ── 6. REBOTES HISTÓRICOS (max 15 pts) ──
  const rebotes = contarRebotes(candles, nivel)
  let pts6 = 0, desc6 = `Sin rebotes históricos confirmados en $${nivel.toLocaleString()}`
  if (rebotes >= 3) { pts6 = 15; desc6 = `${rebotes} rebotes confirmados — nivel muy respetado` }
  else if (rebotes === 2) { pts6 = 10; desc6 = `${rebotes} rebotes confirmados — nivel respetado` }
  else if (rebotes === 1) { pts6 = 5;  desc6 = `${rebotes} rebote confirmado — nivel testeado` }
  factores.push({ nombre: 'Rebotes Históricos', descripcion: desc6, puntos: pts6, maxPuntos: 15, cumple: pts6 > 0 })
  score += pts6

  // ── 7. FLIP DETECTADO (max 10 pts) ──
  const flip = detectarFlip(candles, nivel, esSoporte)
  const pts7 = flip ? 10 : 0
  const desc7 = flip
    ? esSoporte ? 'Resistencia anterior convertida en soporte (flip alcista)' : 'Soporte anterior convertido en resistencia (flip bajista)'
    : 'Sin flip detectado en este nivel'
  factores.push({ nombre: 'Flip S/R', descripcion: desc7, puntos: pts7, maxPuntos: 10, cumple: flip })
  score += pts7

  // ── Clasificación ──
  const clasificacion: ConfluenciaResult['clasificacion'] =
    score > 85 ? 'EXTREMA' : score > 65 ? 'MUY FUERTE' : score > 45 ? 'FUERTE' : score > 25 ? 'MODERADA' : 'DÉBIL'

  const direccion: ConfluenciaResult['direccion'] =
    score <= 25 ? 'WAIT' : esSoporte ? 'BUY' : 'SELL'

  return { score, clasificacion, direccion, esSoporte, factores }
}

// ── Monte Carlo — GBM ──────────────────────────────────────────────────────────
function monteCarlo(closes: number[]) {
  const retornos: number[] = []
  for (let i = 1; i < closes.length; i++)
    if (closes[i-1] > 0) retornos.push(Math.log(closes[i] / closes[i-1]))

  const mu    = retornos.reduce((a, b) => a + b, 0) / retornos.length
  const sigma = Math.sqrt(retornos.map(r => (r - mu) ** 2).reduce((a, b) => a + b, 0) / retornos.length)
  const P0    = closes[closes.length - 1]
  const drift = mu - 0.5 * sigma ** 2

  function randn() {
    const u = Math.random(), v = Math.random()
    return Math.sqrt(-2 * Math.log(u + 1e-10)) * Math.cos(2 * Math.PI * v)
  }

  const finales: number[] = []
  for (let s = 0; s < SIMULACIONES; s++) {
    let px = P0
    for (let v = 0; v < VELAS_FUTURO; v++) px *= Math.exp(drift + sigma * randn())
    finales.push(px)
  }
  finales.sort((a, b) => a - b)
  const pct = (p: number) => finales[Math.floor(p * SIMULACIONES / 100)]

  return { P0, mu, sigma,
    p5: pct(5), p25: pct(25), mediana: pct(50), p75: pct(75), p95: pct(95),
    varPct: ((pct(50) - P0) / P0) * 100 }
}

// ── Niveles Sagrados — Square of 9 ────────────────────────────────────────────
function generarNivelesSagrados(precio: number): number[] {
  const raiz = Math.sqrt(precio)
  const incrementos = [0.25, 0.375, 0.5]
  const set = new Set<number>()

  for (let n = -12; n <= 12; n++) {
    if (n === 0) continue
    for (const inc of incrementos) {
      const nivel = Math.pow(raiz + n * inc, 2)
      if (nivel > 0 && Math.abs(nivel - precio) / precio < 0.06) {  // dentro del 6%
        set.add(Math.round(nivel * 10) / 10)
      }
    }
  }

  return Array.from(set)
    .filter(n => n !== precio)
    .sort((a, b) => Math.abs(a - precio) - Math.abs(b - precio))
    .slice(0, 16)
}

// ── Horario de mercado XAUUSD ──────────────────────────────────────────────────
function esMercadoAbierto(): boolean {
  const now  = new Date()
  const day  = now.getUTCDay()          // 0=Dom, 6=Sáb
  const h    = now.getUTCHours()
  const m    = now.getUTCMinutes()
  const time = h + m / 60

  if (day === 6) return false                            // Sábado cerrado
  if (day === 0 && time < 23) return false               // Domingo antes 23:00 UTC
  if (day === 5 && time >= 22) return false              // Viernes después 22:00 UTC
  if (time >= 22 && time < 23) return false              // Break diario 22-23 UTC
  return true
}

// ── Handler ────────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (session?.user?.email !== ADMIN_EMAIL)
    return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })

  const { temporalidad = '1h', nivel } = await req.json()
  if (!nivel || isNaN(Number(nivel)))
    return NextResponse.json({ error: 'Nivel sagrado inválido' }, { status: 400 })

  try {
    const candles     = await fetchCandles(temporalidad)
    const closes      = candles.map(c => c.c)
    const last        = candles[candles.length - 1]
    const nivelNum    = Number(nivel)
    const precio      = last.c

    // Indicadores compartidos
    const rsiArr   = calcularRSI(closes)
    const atrArr   = calcularATR(candles)
    const ema20Arr = calcularEMA(closes, 20)
    const ema50Arr = calcularEMA(closes, 50)
    const patron   = detectarPatron(candles, candles.length - 1)
    const vols     = candles.slice(-20).map(c => c.v ?? 0).filter(v => v > 0)
    const volProm  = vols.length ? vols.reduce((a, b) => a + b, 0) / vols.length : 0

    const ind: Indicadores = {
      precio,
      rsi:        rsiArr[rsiArr.length - 1]   ?? 50,
      ema20:      ema20Arr[ema20Arr.length - 1] ?? precio,
      ema50:      ema50Arr[ema50Arr.length - 1] ?? precio,
      atr:        atrArr[atrArr.length - 1]   ?? 0,
      volActual:  last.v ?? 0,
      volPromedio: volProm,
      patron,
      candles,
    }

    // ── Análisis del nivel ingresado ──
    const confluencia   = calcularConfluencia(nivelNum, ind)
    const mc            = monteCarlo(closes)
    const distanciaPct  = Math.abs(precio - nivelNum) / nivelNum * 100
    const nivelAlejado  = distanciaPct > 5

    // ── Señales activas — Sacred Levels automáticos ──
    const nivelesAuto  = generarNivelesSagrados(precio)
    const señalesActivas: Señal[] = nivelesAuto.map(nv => {
      const conf     = calcularConfluencia(nv, ind)
      const dist     = Math.abs(precio - nv) / nv * 100
      const target   = conf.esSoporte ? mc.p75 : mc.p25
      const stop     = conf.esSoporte ? mc.p5  : mc.p95
      const rr       = Math.abs(target - precio) / (Math.abs(precio - stop) || 1)

      return {
        nivel: nv,
        esSoporte: conf.esSoporte,
        score: conf.score,
        clasificacion: conf.clasificacion,
        direccion: conf.direccion,
        distanciaPct: dist,
        target,
        stop,
        rr: Math.round(rr * 10) / 10,
        alertaActiva: conf.score > 60 && dist < 0.5,
      }
    })
    .filter(s => s.score > 45)
    .sort((a, b) => b.score - a.score)

    return NextResponse.json({
      temporalidad,
      velas:    candles.length,
      precio,
      timestamp:      new Date().toISOString(),
      mercadoAbierto: esMercadoAbierto(),
      analisis: {
        nivel: nivelNum,
        distanciaPct,
        nivelAlejado,
        confluencia,
        monteCarlo: mc,
      },
      condicionesActuales: {
        rsi:        ind.rsi,
        ema20:      ind.ema20,
        ema50:      ind.ema50,
        atr:        ind.atr,
        volActual:  ind.volActual,
        volPromedio: ind.volPromedio,
        patron,
        alcista:    ind.ema20 > ind.ema50,
      },
      señalesActivas,
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
