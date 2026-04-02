import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const ADMIN_EMAIL = 'raul@sacredlevels.com'

interface Candle { t: number; o: number; h: number; l: number; c: number; v: number }

// ── Math helpers ──────────────────────────────────────────────────────────────

function ema(values: number[], period: number): number[] {
  const k = 2 / (period + 1)
  const result: number[] = []
  let prev = values.slice(0, period).reduce((a, b) => a + b, 0) / period
  for (let i = 0; i < values.length; i++) {
    if (i < period - 1) { result.push(NaN); continue }
    if (i === period - 1) { result.push(prev); continue }
    prev = values[i] * k + prev * (1 - k)
    result.push(prev)
  }
  return result
}

function calcRSI(closes: number[], period = 14): number[] {
  const result: number[] = new Array(closes.length).fill(NaN)
  if (closes.length < period + 1) return result

  let gains = 0, losses = 0
  for (let i = 1; i <= period; i++) {
    const d = closes[i] - closes[i - 1]
    if (d > 0) gains += d; else losses -= d
  }
  let avgGain = gains / period
  let avgLoss = losses / period
  result[period] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss)

  for (let i = period + 1; i < closes.length; i++) {
    const d = closes[i] - closes[i - 1]
    avgGain = (avgGain * (period - 1) + Math.max(d, 0)) / period
    avgLoss = (avgLoss * (period - 1) + Math.max(-d, 0)) / period
    result[i] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss)
  }
  return result
}

function calcATR(candles: Candle[], period = 14): number[] {
  const trs: number[] = [candles[0].h - candles[0].l]
  for (let i = 1; i < candles.length; i++) {
    const prev = candles[i - 1].c
    trs.push(Math.max(
      candles[i].h - candles[i].l,
      Math.abs(candles[i].h - prev),
      Math.abs(candles[i].l - prev),
    ))
  }
  const result: number[] = new Array(candles.length).fill(NaN)
  if (trs.length < period) return result
  let atr = trs.slice(0, period).reduce((a, b) => a + b, 0) / period
  result[period - 1] = atr
  for (let i = period; i < trs.length; i++) {
    atr = (atr * (period - 1) + trs[i]) / period
    result[i] = atr
  }
  return result
}

function calcZScore(closes: number[], period = 50): number[] {
  const result: number[] = new Array(closes.length).fill(NaN)
  for (let i = period - 1; i < closes.length; i++) {
    const slice = closes.slice(i - period + 1, i + 1)
    const mean = slice.reduce((a, b) => a + b, 0) / period
    const std = Math.sqrt(slice.reduce((a, b) => a + (b - mean) ** 2, 0) / period)
    result[i] = std === 0 ? 0 : (closes[i] - mean) / std
  }
  return result
}

function calcROC(closes: number[], period = 10): number[] {
  const result: number[] = new Array(closes.length).fill(NaN)
  for (let i = period; i < closes.length; i++) {
    result[i] = ((closes[i] - closes[i - period]) / closes[i - period]) * 100
  }
  return result
}

function calcVolatility(closes: number[], period = 20): number {
  if (closes.length < period + 1) return NaN
  const returns: number[] = []
  const start = closes.length - period - 1
  for (let i = start + 1; i < closes.length; i++) {
    returns.push((closes[i] - closes[i - 1]) / closes[i - 1])
  }
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length
  return Math.sqrt(returns.reduce((a, b) => a + (b - mean) ** 2, 0) / returns.length) * 100
}

function calcVolumeProfile(candles: Candle[], bucketSize = 5): { price: number; volume: number }[] {
  const map = new Map<number, number>()
  for (const c of candles) {
    const key = Math.round(c.c / bucketSize) * bucketSize
    map.set(key, (map.get(key) ?? 0) + c.v)
  }
  return Array.from(map.entries())
    .map(([price, volume]) => ({ price, volume }))
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 10)
}

function calcInstitutionalLevels(candles: Candle[], currentPrice: number): { price: number; volume: number; type: 'soporte' | 'resistencia'; distPct: number }[] {
  const avgVol = candles.reduce((a, c) => a + c.v, 0) / candles.length
  const threshold = avgVol * 2
  return candles
    .filter(c => c.v >= threshold)
    .map(c => ({
      price: Math.round(c.c),
      volume: c.v,
      type: (c.c < currentPrice ? 'soporte' : 'resistencia') as 'soporte' | 'resistencia',
      distPct: ((currentPrice - c.c) / currentPrice) * 100,
    }))
    .sort((a, b) => Math.abs(a.distPct) - Math.abs(b.distPct))
    .slice(0, 12)
}

// ── Score engine ──────────────────────────────────────────────────────────────

interface ScoreFactor { nombre: string; valor: string; cumple: boolean; peso: number }

function buildScore(
  rsi: number, zScore: number, roc: number, trendStrength: number, volatility: number,
): { score: number; signal: 'BUY' | 'SELL' | 'WAIT'; factors: ScoreFactor[] } {
  const factors: ScoreFactor[] = [
    {
      nombre: 'RSI en zona de compra (<40)',
      valor: rsi.toFixed(1),
      cumple: rsi < 40,
      peso: 20,
    },
    {
      nombre: 'RSI no sobrecomprado (<70)',
      valor: rsi.toFixed(1),
      cumple: rsi < 70,
      peso: 10,
    },
    {
      nombre: 'Z-Score no sobreextendido (< 1.5)',
      valor: zScore.toFixed(2),
      cumple: Math.abs(zScore) < 1.5,
      peso: 25,
    },
    {
      nombre: 'Momentum positivo (ROC > 0)',
      valor: roc.toFixed(2) + '%',
      cumple: roc > 0,
      peso: 20,
    },
    {
      nombre: 'Tendencia alcista (EMA21 > EMA55)',
      valor: trendStrength.toFixed(2) + '%',
      cumple: trendStrength > 0,
      peso: 15,
    },
    {
      nombre: 'Volatilidad manejable (< 0.8%)',
      valor: volatility.toFixed(2) + '%',
      cumple: volatility < 0.8,
      peso: 10,
    },
  ]

  const score = factors.reduce((acc, f) => acc + (f.cumple ? f.peso : 0), 0)
  const bullFactors = factors.filter(f => f.cumple).length
  const signal: 'BUY' | 'SELL' | 'WAIT' =
    score >= 60 ? 'BUY' : score <= 25 ? 'SELL' : 'WAIT'

  return { score, signal, factors }
}

function zSignal(z: number): string {
  if (z > 2)        return 'SOBREEXTENDIDO ARRIBA - Alta probabilidad de corrección'
  if (z < -2)       return 'SOBREEXTENDIDO ABAJO - Alta probabilidad de rebote'
  if (z >= 1)       return 'PRECAUCIÓN - Acercándose a extremo alcista'
  if (z <= -1)      return 'PRECAUCIÓN - Acercándose a extremo bajista'
  return 'RANGO NORMAL - Sin señal clara'
}

// ── Route ─────────────────────────────────────────────────────────────────────

export async function GET() {
  const session = await getServerSession(authOptions)
  if (session?.user?.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  try {
    const url = 'https://query1.finance.yahoo.com/v8/finance/chart/GC=F?interval=1h&range=60d'
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      next: { revalidate: 0 },
    })

    if (!res.ok) throw new Error(`Yahoo Finance responded ${res.status}`)
    const raw = await res.json()

    const chart = raw?.chart?.result?.[0]
    if (!chart) throw new Error('No chart data from Yahoo Finance')

    const timestamps: number[] = chart.timestamp ?? []
    const q = chart.indicators?.quote?.[0]
    const opens: number[]  = q?.open   ?? []
    const highs: number[]  = q?.high   ?? []
    const lows: number[]   = q?.low    ?? []
    const closes: number[] = q?.close  ?? []
    const volumes: number[] = q?.volume ?? []

    // Filter nulls
    const candles: Candle[] = []
    for (let i = 0; i < timestamps.length; i++) {
      if (
        closes[i] != null && highs[i] != null &&
        lows[i] != null && opens[i] != null
      ) {
        candles.push({
          t: timestamps[i],
          o: opens[i], h: highs[i], l: lows[i], c: closes[i],
          v: volumes[i] ?? 0,
        })
      }
    }

    if (candles.length < 60) throw new Error(`Insufficient data: ${candles.length} candles`)

    const cls = candles.map(c => c.c)
    const n   = candles.length
    const currentPrice = cls[n - 1]
    const prevPrice    = cls[n - 2]
    const changePct    = ((currentPrice - prevPrice) / prevPrice) * 100

    // Indicators
    const rsiArr   = calcRSI(cls)
    const atrArr   = calcATR(candles)
    const zArr     = calcZScore(cls, 50)
    const rocArr   = calcROC(cls, 10)
    const ema21Arr = ema(cls, 21)
    const ema55Arr = ema(cls, 55)

    const rsi          = rsiArr[n - 1]
    const atr          = atrArr[n - 1]
    const zScore       = zArr[n - 1]
    const roc          = rocArr[n - 1]
    const ema21        = ema21Arr[n - 1]
    const ema55        = ema55Arr[n - 1]
    const volatility   = calcVolatility(cls, 20)
    const trendStrength = ema55 > 0 ? ((ema21 - ema55) / ema55) * 100 : 0

    // Volume profile & institutional levels
    const volumeProfile      = calcVolumeProfile(candles, 5)
    const institutionalLevels = calcInstitutionalLevels(candles, currentPrice)

    // Score & signal
    const { score, signal, factors } = buildScore(rsi, zScore, roc, trendStrength, volatility)

    // Z-Score history (last 30 days = ~720 1h candles, but we only have 60d so take last 720)
    const zHistory = candles.slice(-720).map((c, i, arr) => {
      const globalIdx = n - 720 + i
      return {
        t: c.t * 1000,
        z: isNaN(zArr[globalIdx]) ? null : +zArr[globalIdx].toFixed(3),
        price: c.c,
      }
    }).filter(x => x.z !== null)

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      currentPrice,
      changePct,
      rsi,
      atr,
      zScore,
      roc,
      ema21,
      ema55,
      volatility,
      trendStrength,
      zSignal: zSignal(zScore),
      score,
      signal,
      factors,
      volumeProfile,
      institutionalLevels,
      zHistory,
      candleCount: n,
    })
  } catch (err) {
    console.error('Quant API error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error desconocido' },
      { status: 500 },
    )
  }
}
