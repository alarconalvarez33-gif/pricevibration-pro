import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const ADMIN_EMAIL      = 'raul@sacredlevels.com'
const PROXIMIDAD       = 0.001   // ±0.1% para considerar "toque real" del nivel
const REBOTE_MIN       = 0.003   // el precio debe alejarse ≥0.3% tras el toque
const VELAS_CONFIRMACION = 5     // velas siguientes para confirmar rebote
const DISTANCIA_MAX    = 0.05    // aviso si nivel está >5% del precio actual
const RSI_PERIODO      = 14
const RSI_SOBREVENTA   = 30
const VOL_ALTA         = 0.015
const SIMULACIONES     = 1000
const VELAS_FUTURO     = 5

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

// ── Fetch Yahoo Finance ────────────────────────────────────────────────────────
async function fetchCandles(temporalidad: string): Promise<Candle[]> {
  const cfg = INTERVAL_MAP[temporalidad]
  if (!cfg) throw new Error(`Temporalidad no soportada: ${temporalidad}`)

  const url = `https://query1.finance.yahoo.com/v8/finance/chart/GC%3DF?interval=${cfg.interval}&range=${cfg.range}`
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
    next: { revalidate: 300 },
  })
  if (!res.ok) throw new Error(`Yahoo Finance error: ${res.status}`)

  const json   = await res.json()
  const result = json?.chart?.result?.[0]
  if (!result) throw new Error('Respuesta vacía de Yahoo Finance')

  const ts      = result.timestamp as number[]
  const quotes  = result.indicators?.quote?.[0]
  const opens   = quotes?.open   as number[]
  const highs   = quotes?.high   as number[]
  const lows    = quotes?.low    as number[]
  const closes  = quotes?.close  as number[]
  const volumes = quotes?.volume as number[]

  let candles: Candle[] = ts
    .map((t, i) => ({ t, o: opens[i], h: highs[i], l: lows[i], c: closes[i], v: volumes?.[i] }))
    .filter(c => c.c != null && c.h != null && c.l != null && isFinite(c.c))

  if (temporalidad === '4h') {
    const grouped: Candle[] = []
    for (let i = 0; i + 3 < candles.length; i += 4) {
      const chunk = candles.slice(i, i + 4)
      grouped.push({
        t: chunk[0].t,
        o: chunk[0].o,
        h: Math.max(...chunk.map(c => c.h)),
        l: Math.min(...chunk.map(c => c.l)),
        c: chunk[chunk.length - 1].c,
        v: chunk.reduce((a, c) => a + (c.v ?? 0), 0),
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
    const d = closes[i] - closes[i - 1]
    if (d > 0) avgGain += d; else avgLoss += Math.abs(d)
  }
  avgGain /= periodo; avgLoss /= periodo
  rsi[periodo] = 100 - 100 / (1 + avgGain / (avgLoss || 1e-10))
  for (let i = periodo + 1; i < closes.length; i++) {
    const d    = closes[i] - closes[i - 1]
    avgGain    = (avgGain * (periodo - 1) + Math.max(d, 0)) / periodo
    avgLoss    = (avgLoss * (periodo - 1) + Math.max(-d, 0)) / periodo
    rsi[i]     = 100 - 100 / (1 + avgGain / (avgLoss || 1e-10))
  }
  return rsi
}

function calcularATR(candles: Candle[], periodo = 14): number[] {
  const tr  = candles.map((c, i) => i === 0 ? c.h - c.l
    : Math.max(c.h - c.l, Math.abs(c.h - candles[i-1].c), Math.abs(c.l - candles[i-1].c)))
  const atr = new Array(candles.length).fill(NaN)
  atr[periodo - 1] = tr.slice(0, periodo).reduce((a, b) => a + b, 0) / periodo
  for (let i = periodo; i < candles.length; i++)
    atr[i] = (atr[i-1] * (periodo - 1) + tr[i]) / periodo
  return atr
}

function calcularEMA(values: number[], span: number): number[] {
  const k   = 2 / (span + 1)
  const ema = new Array(values.length).fill(NaN)
  ema[0]    = values[0]
  for (let i = 1; i < values.length; i++)
    ema[i] = values[i] * k + ema[i-1] * (1 - k)
  return ema
}

function volumenPromedio(candles: Candle[], ventana = 20): number {
  const vols = candles.slice(-ventana).map(c => c.v ?? 0).filter(v => v > 0)
  return vols.length ? vols.reduce((a, b) => a + b, 0) / vols.length : 0
}

// ── P(A): rebote REAL — toca nivel Y se aleja ≥0.3% en siguientes 5 velas ─────
interface PAResult {
  pA: number
  toques: number
  rebotes: number
  sinDatos: boolean
}

function calcularPA(candles: Candle[], nivel: number): PAResult {
  const zona_sup = nivel * (1 + PROXIMIDAD)
  const zona_inf = nivel * (1 - PROXIMIDAD)

  // Índices donde el precio realmente tocó la zona del nivel
  const indices_toque: number[] = []
  for (let i = 0; i < candles.length - VELAS_CONFIRMACION; i++) {
    const c = candles[i]
    // Toque real: low o high entró en la zona ±0.1%
    if (c.l <= zona_sup && c.h >= zona_inf) {
      // Evitar contar el mismo cluster de toques múltiples veces
      const ultimo = indices_toque[indices_toque.length - 1]
      if (ultimo === undefined || i - ultimo > 2) {
        indices_toque.push(i)
      }
    }
  }

  if (indices_toque.length === 0) {
    return { pA: 0, toques: 0, rebotes: 0, sinDatos: true }
  }

  let rebotes = 0

  for (const idx of indices_toque) {
    const c = candles[idx]
    // Determine dirección del toque:
    // desde abajo: low tocó zona inf → esperamos rebote ALCISTA
    // desde arriba: high tocó zona sup → esperamos rebote BAJISTA
    const desdeAbajo = c.l <= zona_sup && (idx === 0 || candles[idx - 1].c < nivel)
    const desdeArriba = c.h >= zona_inf && (idx === 0 || candles[idx - 1].c > nivel)

    // Mirar las próximas VELAS_CONFIRMACION velas para confirmar rebote
    const siguientes = candles.slice(idx + 1, idx + 1 + VELAS_CONFIRMACION)

    let reboté = false
    for (const s of siguientes) {
      if (desdeAbajo && (s.c - nivel) / nivel >= REBOTE_MIN) { reboté = true; break }
      if (desdeArriba && (nivel - s.c) / nivel >= REBOTE_MIN) { reboté = true; break }
    }

    // Si el precio simplemente atravesó el nivel (breakout), NO cuenta
    const breakout = siguientes.some(s =>
      (desdeAbajo && s.c < nivel * (1 - REBOTE_MIN)) ||
      (desdeArriba && s.c > nivel * (1 + REBOTE_MIN))
    )

    if (reboté && !breakout) rebotes++
  }

  const pA = rebotes / indices_toque.length
  return { pA, toques: indices_toque.length, rebotes, sinDatos: false }
}

// ── P(B|A): condiciones en rebotes históricos (RSI + vol + volumen + tendencia) ─
function calcularPBdadoA(candles: Candle[], nivel: number): number {
  const zona_sup = nivel * (1 + PROXIMIDAD)
  const zona_inf = nivel * (1 - PROXIMIDAD)
  const closes   = candles.map(c => c.c)
  const rsiArr   = calcularRSI(closes)
  const atrArr   = calcularATR(candles)
  const ema50Arr = calcularEMA(closes, 50)
  const volProm  = volumenPromedio(candles)

  const indices: number[] = []
  for (let i = 2; i < candles.length - VELAS_CONFIRMACION; i++) {
    const c = candles[i]
    if (c.l <= zona_sup && c.h >= zona_inf) {
      const ultimo = indices[indices.length - 1]
      if (ultimo === undefined || i - ultimo > 2) indices.push(i)
    }
  }

  if (indices.length < 3) return 0.45  // prior neutral si hay pocos datos

  let condicionesCumplidas = 0
  for (const idx of indices) {
    const rsi   = rsiArr[idx]  ?? 50
    const atr   = atrArr[idx]  ?? 0
    const px    = candles[idx].c
    const vol   = candles[idx].v ?? 0
    const ema50 = ema50Arr[idx] ?? px

    let score = 0
    // RSI extremo (+1)
    if (rsi < RSI_SOBREVENTA || rsi > (100 - RSI_SOBREVENTA)) score++
    // Volatilidad alta (+1)
    if (px > 0 && (atr / px) > VOL_ALTA) score++
    // Volumen sobre promedio en la zona (+1)
    if (volProm > 0 && vol > volProm * 1.2) score++
    // Tendencia favorable al rebote (+1)
    const desdeAbajo = candles[idx].l <= zona_sup
    if ((desdeAbajo && px > ema50) || (!desdeAbajo && px < ema50)) score++

    // Al menos 2 de 4 condiciones
    if (score >= 2) condicionesCumplidas++
  }

  // Clamp a [0.30, 0.70] para evitar extremos irreales
  const raw = condicionesCumplidas / indices.length
  return Math.min(Math.max(raw, 0.30), 0.70)
}

// ── P(B): frecuencia de condiciones extremas en todo el histórico ──────────────
function calcularPB(candles: Candle[]): number {
  const closes   = candles.map(c => c.c)
  const rsiArr   = calcularRSI(closes)
  const atrArr   = calcularATR(candles)
  const ema50Arr = calcularEMA(closes, 50)
  const volProm  = volumenPromedio(candles)

  let conteo = 0, total = 0
  for (let i = RSI_PERIODO; i < candles.length; i++) {
    const rsi = rsiArr[i]; const atr = atrArr[i]
    if (isNaN(rsi) || isNaN(atr)) continue
    total++
    const px  = candles[i].c
    const vol = candles[i].v ?? 0
    let score = 0
    if (rsi < RSI_SOBREVENTA || rsi > (100 - RSI_SOBREVENTA)) score++
    if (px > 0 && (atr / px) > VOL_ALTA) score++
    if (volProm > 0 && vol > volProm * 1.2) score++
    if (px !== ema50Arr[i]) score++  // siempre hay tendencia
    if (score >= 2) conteo++
  }
  // P(B) suele ser 20-50%, clamp para evitar división por cero o extremos
  return Math.min(Math.max(total > 0 ? conteo / total : 0.30, 0.15), 0.65)
}

// ── Monte Carlo — GBM ─────────────────────────────────────────────────────────
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

  return { P0, mu, sigma, p5: pct(5), p25: pct(25), mediana: pct(50), p75: pct(75), p95: pct(95),
    varPct: ((pct(50) - P0) / P0) * 100 }
}

// ── Clasificación de señal ─────────────────────────────────────────────────────
function clasificarSenal(posterior: number): 'MUY FUERTE' | 'FUERTE' | 'MODERADA' | 'DÉBIL' {
  if (posterior > 0.70) return 'MUY FUERTE'
  if (posterior > 0.50) return 'FUERTE'
  if (posterior > 0.30) return 'MODERADA'
  return 'DÉBIL'
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
    const candles    = await fetchCandles(temporalidad)
    const closes     = candles.map(c => c.c)
    const last       = candles[candles.length - 1]
    const nivelNum   = Number(nivel)

    // Validación: nivel muy alejado del precio actual
    const distanciaPct = Math.abs(last.c - nivelNum) / nivelNum * 100
    const nivelAlejado = distanciaPct > DISTANCIA_MAX * 100

    const rsiArr    = calcularRSI(closes)
    const atrArr    = calcularATR(candles)
    const ema50Arr  = calcularEMA(closes, 50)
    const rsiActual = rsiArr[rsiArr.length - 1]
    const atrActual = atrArr[atrArr.length - 1]
    const ema50     = ema50Arr[ema50Arr.length - 1]

    // P(A) — con detección de sin datos
    const { pA, toques, rebotes, sinDatos } = calcularPA(candles, nivelNum)

    // Si no hay datos de toque, devolver sin calcular Bayes
    if (sinDatos) {
      return NextResponse.json({
        temporalidad, nivel: nivelNum, velas: candles.length,
        precio: last.c, distanciaPct,
        sinDatos: true,
        nivelAlejado,
        condiciones: {
          rsi: rsiActual,
          sobreventa:  rsiActual < RSI_SOBREVENTA,
          sobrecompra: rsiActual > (100 - RSI_SOBREVENTA),
          volAlta:     atrActual / last.c > VOL_ALTA,
          alcista:     last.c > ema50,
          atr: atrActual, ema50,
        },
        monteCarlo: monteCarlo(closes),
        mensaje: 'El precio no ha testeado este nivel en el histórico disponible.',
      })
    }

    const pBdadoA  = calcularPBdadoA(candles, nivelNum)
    const pB       = calcularPB(candles)
    const posterior = Math.min(Math.max((pBdadoA * pA) / pB, 0), 1)

    return NextResponse.json({
      temporalidad, nivel: nivelNum, velas: candles.length,
      precio: last.c, distanciaPct,
      sinDatos: false,
      nivelAlejado,
      toques, rebotes,
      condiciones: {
        rsi: rsiActual,
        sobreventa:  rsiActual < RSI_SOBREVENTA,
        sobrecompra: rsiActual > (100 - RSI_SOBREVENTA),
        volAlta:     atrActual / last.c > VOL_ALTA,
        alcista:     last.c > ema50,
        atr: atrActual, ema50,
      },
      bayes: { pA, pBdadoA, pB, posterior },
      monteCarlo: monteCarlo(closes),
      signal: clasificarSenal(posterior),
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
