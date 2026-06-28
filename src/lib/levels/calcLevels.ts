// SERVER-ONLY. This module contains the level-calculation formula and MUST NOT
// be imported by any client component. Next.js will refuse to bundle modules
// marked with `server-only` for the client, which guarantees the formula stays
// on the server.
import 'server-only';

export type Timeframe = '1m' | '5m' | '15m' | '1h' | '4h' | '1d';

export interface LevelsResult {
  res: number[];   // [N1..N6] resistances, ordered by step size (N1 closest)
  sup: number[];   // [N1..N6] supports
  resPct: number[]; // % distance from price (positive)
  supPct: number[]; // % distance from price (positive, magnitude)
  bias: { score: number; label: 'bull' | 'bear' | 'neutral' };
}

const STEPS = [0.125, 0.25, 0.3125, 0.375, 0.4375, 0.5];

const TF_MULT: Record<Timeframe, number> = {
  '1m':  0.35,
  '5m':  0.7,
  '15m': 1,
  '1h':  1.6,
  '4h':  2.3,
  '1d':  3.2,
};

/** Compute N1..N6 resistances and supports + bias for a given price/timeframe. */
export function calcLevels(price: number, tf: Timeframe): LevelsResult {
  // Auto-scale price into a base range so the square-root math is well-conditioned
  let s = 1;
  let p = price;
  while (p < 100)  { p *= 10;  s *= 10;  }
  while (p >= 1000) { p /= 10;  s /= 10;  }

  const root = Math.sqrt(price * s);
  const mult = TF_MULT[tf] ?? 1.6;

  const res = STEPS.map(st => Math.pow(root + st * mult, 2) / s);
  const sup = STEPS.map(st => Math.pow(Math.max(root - st * mult, 0), 2) / s);

  const resPct = res.map(v => ((v - price) / price) * 100);
  const supPct = sup.map(v => ((price - v) / price) * 100);

  // Bias: comparing distance to nearest support vs nearest resistance.
  // Closer to support → bull (price has fallen towards support and is likely to bounce).
  // Closer to resistance → bear (price has risen towards resistance and is likely to reject).
  const nearRes = res[0]; // N1 resistance (smallest step)
  const nearSup = sup[0]; // N1 support
  const distRes = Math.abs(nearRes - price) / price;
  const distSup = Math.abs(price - nearSup) / price;
  const total   = distRes + distSup || 1e-9;
  // score 0..100: higher = more bullish
  const score = Math.round((distRes / total) * 100);
  const label: 'bull' | 'bear' | 'neutral' =
    score >= 60 ? 'bull' : score <= 40 ? 'bear' : 'neutral';

  return { res, sup, resPct, supPct, bias: { score, label } };
}
