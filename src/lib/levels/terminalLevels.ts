/**
 * The terminal's levels payload, in one place.
 *
 * Both the server render of the home page and POST /api/terminal/levels go
 * through here, so the levels a visitor sees in the first paint are computed by
 * exactly the same code that later refreshes them.
 */
import 'server-only';
import { calcLevels, type Timeframe } from './calcLevels';
import { computeReactionProbabilities, type LevelProb } from './reactionProbability';
import { getPrice } from '@/lib/markets/getMarkets';
import { hasFullAccess, type TrialState } from '@/lib/services/trial-access';

export const TIMEFRAMES: readonly Timeframe[] = ['1m', '5m', '15m', '1h', '4h', '1d'] as const;
export const DEFAULT_TIMEFRAME: Timeframe = '1h';
export const DEFAULT_SYMBOL = 'XAU/USD';

export function parseTimeframe(value: unknown): Timeframe {
  return TIMEFRAMES.includes(value as Timeframe) ? (value as Timeframe) : DEFAULT_TIMEFRAME;
}

export interface TerminalLevels {
  symbol: string;
  timeframe: Timeframe;
  price: number | null;
  isAuthed: boolean;
  isPremium: boolean;
  inTrial: boolean;
  trialEndsAt: number | null;
  levels: { res: number[]; sup: number[]; resPct: number[]; supPct: number[] } | null;
  bias: { score: number; label: 'bull' | 'bear' | 'neutral' } | null;
  resProb: LevelProb[] | null;
  supProb: LevelProb[] | null;
}

/**
 * Round a level to the precision that matches its price scale. Showing 1,08 for
 * EUR/USD instead of 1,08450 makes the level useless, so the number of decimals
 * follows the magnitude of the instrument.
 */
function roundToScale(value: number, reference: number): number {
  if (reference >= 1000) return +value.toFixed(1);
  if (reference >= 1) return +value.toFixed(2);
  return +value.toFixed(5);
}

/**
 * Compute the levels payload for one symbol/timeframe.
 *
 * Gated fields (`levels`, `bias`, `resProb`, `supProb`) are left null unless the
 * visitor has access — they are never sent and then hidden client-side.
 */
export async function getTerminalLevels(
  symbol: string,
  timeframe: Timeframe,
  trial: TrialState,
): Promise<TerminalLevels> {
  const price = await getPrice(symbol);

  const base: TerminalLevels = {
    symbol,
    timeframe,
    price,
    isAuthed: trial.isAuthed,
    isPremium: trial.isPremium,
    inTrial: trial.inTrial,
    trialEndsAt: trial.trialEndsAt,
    levels: null,
    bias: null,
    resProb: null,
    supProb: null,
  };

  if (price == null || !hasFullAccess(trial)) return base;

  const { res, sup, resPct, supPct, bias } = calcLevels(price, timeframe);
  const { resProb, supProb } = await computeReactionProbabilities(symbol, timeframe, res, sup);

  return {
    ...base,
    levels: {
      res: res.map(v => roundToScale(v, price)),
      sup: sup.map(v => roundToScale(v, price)),
      resPct: resPct.map(v => +v.toFixed(2)),
      supPct: supPct.map(v => +v.toFixed(2)),
    },
    bias,
    resProb,
    supProb,
  };
}
