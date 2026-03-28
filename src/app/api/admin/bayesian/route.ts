import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const ADMIN_EMAIL    = 'raul@sacredlevels.com'
const PROXIMIDAD     = 0.002   // ±0.2% zona del nivel sagrado
const RSI_PERIODO    = 14
const RSI_SOBREVENTA = 30
const VOL_ALTA       = 0.015   // ATR/precio > 1.5%
const SIMULACIONES   = 1000
const VELAS_FUTURO   = 5

// Mapeo temporalidad → parámetros Yahoo Finance
const INTERVAL_MAP: Record<string, { interval: string; range: string }> = {
  '1m':  { interval: '1m',  range: '7d'  },
  '5m':  { interval: '5m',  range: '60d' },
  '15m': { interval: '15m', range: '60d' },
  '30m': { interval: '30m', range: '60d' },
  '1h':  { interval: '1h',  range: '730d'},
  '4h':  { interval: '1h',  range: '730d'},
  '1d':  { interval: '1d',  range: '5y'  },
}

interface Candle { t: number; o: number; h: number; l: number; c: number }

// ── Fetch Yahoo Finance ────────────────────────────────────────────────────────
async function fetchCandles(temporalidad: string): Promise<Candle[]> {
  const cfg = INTERVAL_MAP[temporalidad]
  if (!cfg) throw new Error(`Temporalidad no soportada: ${temporalidad}`)

  const url = `https://query1.finance.yahoo.com/v8/finance/chart/GC%3DF?interval=${cfg.interval}&range=${cfg.range}`
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
    next: { revalidate: 300 }, // cache 5 min
  })
  if (!res.ok) throw new Error(`Yahoo Finance error: ${res.status}`)

  const json = await res.json()
  const result = json?.chart?.result?.[0]
  if (!result) throw new Error('Respuesta vacía de Yahoo Finance')

  const ts     = result.timestamp as number[]
  const quotes = result.indicators?.quote?.[0]
  const opens  = quotes?.open  as number[]
  const highs  = quotes?.high  as number[]
  const lows   = quotes?.low   as number[]
  const closes = quotes?.close as number[]

  let candles: Candle[] = ts.map((t, i) => ({
    t, o: opens[i], h: highs[i], l: lows[i], c: closes[i],
  })).filter(c => c.c != null && c.h != null && c.l != null)

  // Resample a 4h si se pidió (agrupa 4 velas de 1h)
  if (temporalidad === '4h') {
    const grouped: Candle[] = []
    for (let i = 0; i < candles.length - 3; i += 4) {
      const chunk = candles.slice(i, i + 4)
      grouped.push({
        t: chunk[0].t,
        o: chunk[0].o,
        h: Math.max(...chunk.map(c => c.h)),
        l: Math.min(...chunk.map(c => c.l)),
        c: chunk[chunk.length - 1].c,
      })
    }
    candles = grouped
  }

  return candles
}

// ── Indicadores ───────────────────────────────────────────────────────────────
function calcularRSI(closes: number[], periodo = RSI_PERIODO): number[] {
  const rsi: number[] = new Array(closes.length).fill(NaN)
  let avgGain = 0, avgLoss = 0

  for (let i = 1; i <= periodo; i++) {
    const diff = closes[i] - closes[i - 1]
    if (diff > 0) avgGain += diff; else avgLoss += Math.abs(diff)
  }
  avgGain /= periodo
  avgLoss /= periodo
  rsi[periodo] = 100 - 100 / (1 + avgGain / (avgLoss || 1e-10))

  for (let i = periodo + 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1]
    const gain = diff > 0 ? diff : 0
    const loss = diff < 0 ? Math.abs(diff) : 0
    avgGain = (avgGain * (periodo - 1) + gain) / periodo
    avgLoss = (avgLoss * (periodo - 1) + loss) / periodo
    rsi[i]  = 100 - 100 / (1 + avgGain / (avgLoss || 1e-10))
  }
  return rsi
}

function calcularATR(candles: Candle[], periodo = 14): number[] {
  const tr: number[] = candles.map((c, i) => {
    if (i === 0) return c.h - c.l
    const prev = candles[i - 1].c
    return Math.max(c.h - c.l, Math.abs(c.h - prev), Math.abs(c.l - prev))
  })
  const atr: number[] = new Array(candles.length).fill(NaN)
  let sum = tr.slice(0, periodo).reduce((a, b) => a + b, 0)
  atr[periodo - 1] = sum / periodo
  for (let i = periodo; i < candles.length; i++) {
    atr[i] = (atr[i - 1] * (periodo - 1) + tr[i]) / periodo
  }
  return atr
}

// ── P(A): Prior — rebote histórico en el nivel ─────────────────────────────────
function calcularPA(candles: Candle[], nivel: number): number {
  const sup = nivel * (1 + PROXIMIDAD)
  const inf = nivel * (1 - PROXIMIDAD)
  const tocaron = candles.filter(c => c.l <= sup && c.h >= inf)
  if (tocaron.length < 5) return 0.55

  const rebotes = tocaron.filter(c =>
    (c.l <= sup && c.c > nivel) || (c.h >= inf && c.c < nivel)
  ).length

  return rebotes / tocaron.length
}

// ── P(B|A): Likelihood — condiciones extremas en rebotes históricos ────────────
function calcularPBdadoA(candles: Candle[], nivel: number): number {
  const sup     = nivel * (1 + PROXIMIDAD)
  const inf     = nivel * (1 - PROXIMIDAD)
  const closes  = candles.map(c => c.c)
  const rsiArr  = calcularRSI(closes)
  const atrArr  = calcularATR(candles)
  const tocaron = candles.filter(c => c.l <= sup && c.h >= inf)
  if (tocaron.length < 5) return 0.60

  let conteo = 0
  for (const c of tocaron) {
    const idx  = candles.indexOf(c)
    const rsi  = rsiArr[idx] ?? 50
    const atr  = atrArr[idx] ?? 0
    const condRsi = rsi < RSI_SOBREVENTA || rsi > (100 - RSI_SOBREVENTA)
    const condVol = c.c > 0 && (atr / c.c) > VOL_ALTA
    if (condRsi || condVol) conteo++
  }
  return Math.max(conteo / tocaron.length, 0.01)
}

// ── P(B): Evidencia marginal — frecuencia de condiciones extremas ──────────────
function calcularPB(candles: Candle[]): number {
  const closes = candles.map(c => c.c)
  const rsiArr = calcularRSI(closes)
  const atrArr = calcularATR(candles)

  let conteo = 0, total = 0
  for (let i = RSI_PERIODO; i < candles.length; i++) {
    const rsi = rsiArr[i]
    const atr = atrArr[i]
    if (isNaN(rsi) || isNaN(atr)) continue
    total++
    const condRsi = rsi < RSI_SOBREVENTA || rsi > (100 - RSI_SOBREVENTA)
    const condVol = candles[i].c > 0 && (atr / candles[i].c) > VOL_ALTA
    if (condRsi || condVol) conteo++
  }
  return Math.max(total > 0 ? conteo / total : 0.2, 0.01)
}

// ── Monte Carlo — GBM ─────────────────────────────────────────────────────────
function monteCarlo(closes: number[]): {
  P0: number; mu: number; sigma: number
  p5: number; p25: number; mediana: number; p75: number; p95: number
  varPct: number
} {
  // Retornos logarítmicos: r_t = ln(P_t / P_{t-1})
  const retornos: number[] = []
  for (let i = 1; i < closes.length; i++) {
    if (closes[i - 1] > 0) retornos.push(Math.log(closes[i] / closes[i - 1]))
  }

  const mu    = retornos.reduce((a, b) => a + b, 0) / retornos.length
  const sigma = Math.sqrt(retornos.map(r => (r - mu) ** 2).reduce((a, b) => a + b, 0) / retornos.length)
  const P0    = closes[closes.length - 1]

  // GBM: P_{t+1} = P_t × exp( drift + σ·ε )
  // drift = μ - σ²/2  (corrección de Itô para GBM neutro al riesgo)
  const drift     = mu - 0.5 * sigma ** 2
  const finales: number[] = []

  // Box-Muller para generar N(0,1) en JS
  function randn(): number {
    const u = Math.random(), v = Math.random()
    return Math.sqrt(-2 * Math.log(u + 1e-10)) * Math.cos(2 * Math.PI * v)
  }

  for (let s = 0; s < SIMULACIONES; s++) {
    let px = P0
    for (let v = 0; v < VELAS_FUTURO; v++) {
      px *= Math.exp(drift + sigma * randn())
    }
    finales.push(px)
  }

  finales.sort((a, b) => a - b)
  const pct = (p: number) => finales[Math.floor(p * SIMULACIONES / 100)]

  return {
    P0, mu, sigma,
    p5: pct(5), p25: pct(25), mediana: pct(50), p75: pct(75), p95: pct(95),
    varPct: ((pct(50) - P0) / P0) * 100,
  }
}

// ── Handler ────────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (session?.user?.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
  }

  const { temporalidad = '1h', nivel } = await req.json()
  if (!nivel || isNaN(Number(nivel))) {
    return NextResponse.json({ error: 'Nivel sagrado inválido' }, { status: 400 })
  }

  try {
    const candles = await fetchCandles(temporalidad)
    const closes  = candles.map(c => c.c)

    // Condiciones actuales
    const rsiArr     = calcularRSI(closes)
    const atrArr     = calcularATR(candles)
    const last       = candles[candles.length - 1]
    const rsiActual  = rsiArr[rsiArr.length - 1]
    const atrActual  = atrArr[atrArr.length - 1]
    const ema50      = closes.slice(-50).reduce((a, b) => a + b, 0) / Math.min(50, closes.length)

    // Bayes
    const pA       = calcularPA(candles, Number(nivel))
    const pBdadoA  = calcularPBdadoA(candles, Number(nivel))
    const pB       = calcularPB(candles)
    const posterior = Math.min(Math.max((pBdadoA * pA) / pB, 0), 1)

    // Monte Carlo
    const mc = monteCarlo(closes)

    return NextResponse.json({
      temporalidad,
      nivel: Number(nivel),
      velas: candles.length,
      precio: last.c,
      distanciaPct: Math.abs(last.c - Number(nivel)) / Number(nivel) * 100,
      condiciones: {
        rsi: rsiActual,
        sobreventa:   rsiActual < RSI_SOBREVENTA,
        sobrecompra:  rsiActual > (100 - RSI_SOBREVENTA),
        volAlta:      atrActual / last.c > VOL_ALTA,
        alcista:      last.c > ema50,
        atr:          atrActual,
        ema50,
      },
      bayes: { pA, pBdadoA, pB, posterior },
      monteCarlo: mc,
      signal: posterior > 0.65 ? 'FUERTE' : posterior > 0.50 ? 'DÉBIL' : 'NEGATIVA',
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
