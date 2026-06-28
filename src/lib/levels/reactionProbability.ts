import 'server-only';
import { getCandles, type Candle } from './getCandles';
import type { Timeframe } from './calcLevels';

// ── All parameters are server-only and never shipped to the client ─────────────
const TOUCH_TOL       = 0.0015; // 0.15% — within this % of the level = "touch"
const REACTION_PCT    = 0.003;  // 0.30% — minimum close move to count as reaction
const REACTION_CANDLES = 5;     // how many candles forward to look for the reaction
const MIN_TOUCHES     = 8;      // fewer touches → fall back to baseline

// Extra alpha per N-level index (0 = N1, 1 = N2, …).  N1/N2 get a higher prior
// because they are the closest levels and empirically react more reliably.
const ALPHA_ADJ = [2, 1, 0, 0, 0, 0];
const ALPHA_BASE = 2;
const BETA_BASE  = 2;

export interface LevelProb {
  reactionProb: number;             // 0..100
  sampleSize:   number;
  mode:         'historical' | 'baseline';
}

function baseline(idx: number): LevelProb {
  return {
    reactionProb: Math.max(35, Math.min(75, 75 - 8 * idx)),
    sampleSize:   0,
    mode:         'baseline',
  };
}

function computeProb(
  candles: Candle[],
  levels:  number[],
  side:    'res' | 'sup',
): LevelProb[] {
  return levels.map((lv, idx) => {
    const a = ALPHA_BASE + ALPHA_ADJ[idx];
    const b = BETA_BASE;
    let n = 0;
    let k = 0;

    for (let c = 0; c < candles.length - REACTION_CANDLES; c++) {
      const cd = candles[c];
      let touched: boolean;

      if (side === 'res') {
        // Candle approached resistance from below — high reached the zone but close stayed under
        touched =
          cd.high >= lv * (1 - TOUCH_TOL) &&
          cd.low  <  lv &&
          cd.close < lv * (1 + TOUCH_TOL);
      } else {
        // Candle approached support from above — low reached the zone but close stayed above
        touched =
          cd.low  <= lv * (1 + TOUCH_TOL) &&
          cd.high >  lv &&
          cd.close > lv * (1 - TOUCH_TOL);
      }

      if (!touched) continue;
      n++;

      const future = candles.slice(c + 1, c + 1 + REACTION_CANDLES);
      if (side === 'res') {
        if (future.some(fc => fc.close < lv * (1 - REACTION_PCT))) k++;
      } else {
        if (future.some(fc => fc.close > lv * (1 + REACTION_PCT))) k++;
      }
    }

    if (n < MIN_TOUCHES) return baseline(idx);

    const prob = Math.round(((a + k) / (a + b + n)) * 100);
    return {
      reactionProb: Math.max(1, Math.min(99, prob)),
      sampleSize:   n,
      mode:         'historical',
    };
  });
}

export async function computeReactionProbabilities(
  symbol:    string,
  tf:        Timeframe,
  resLevels: number[],
  supLevels: number[],
): Promise<{ resProb: LevelProb[]; supProb: LevelProb[] }> {
  const candles = await getCandles(symbol, tf).catch((): Candle[] => []);

  if (candles.length < 10) {
    return {
      resProb: resLevels.map((_, i) => baseline(i)),
      supProb: supLevels.map((_, i) => baseline(i)),
    };
  }

  return {
    resProb: computeProb(candles, resLevels, 'res'),
    supProb: computeProb(candles, supLevels, 'sup'),
  };
}
