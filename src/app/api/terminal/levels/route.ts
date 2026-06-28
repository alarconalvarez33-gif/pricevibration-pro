import { NextRequest, NextResponse } from 'next/server';
import { calcLevels, type Timeframe } from '@/lib/levels/calcLevels';
import { computeReactionProbabilities } from '@/lib/levels/reactionProbability';
import { getTrialState, hasFullAccess } from '@/lib/services/trial-access';

interface MarketRow { symbol: string; price: number; offline?: boolean; }

const VALID_TIMEFRAMES = new Set<Timeframe>(['1m', '5m', '15m', '1h', '4h', '1d']);

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const symbol: string   = String(body.symbol || '').trim();
  const timeframe: Timeframe = (VALID_TIMEFRAMES.has(body.timeframe) ? body.timeframe : '1h') as Timeframe;

  if (!symbol) {
    return NextResponse.json({ error: 'symbol requerido' }, { status: 400 });
  }

  // Resolve current price from /api/markets — look up by symbol, NEVER by index
  const origin = req.nextUrl.origin;
  const mres = await fetch(`${origin}/api/markets`, { cache: 'no-store' }).catch(() => null);
  const mdata = mres ? await mres.json().catch(() => null) : null;
  const markets: MarketRow[] = Array.isArray(mdata?.markets) ? mdata.markets : [];

  const row = markets.find(m => m.symbol === symbol);
  const price = row && !row.offline && row.price > 0 ? row.price : null;

  const trial = await getTrialState(req);
  const allowed = hasFullAccess(trial);

  const publicPayload = {
    symbol,
    timeframe,
    price,
    isAuthed:    trial.isAuthed,
    isPremium:   trial.isPremium,
    inTrial:     trial.inTrial,
    trialEndsAt: trial.trialEndsAt,
  };

  // No price OR no access → send nothing gated
  if (!allowed || price == null) {
    return NextResponse.json({ ...publicPayload, levels: null, bias: null, resProb: null, supProb: null });
  }

  const { res, sup, resPct, supPct, bias } = calcLevels(price, timeframe);

  const roundedRes = res.map(v => round(v, price));
  const roundedSup = sup.map(v => round(v, price));

  // Probability engine — runs server-side, results never reach non-premium clients
  const { resProb, supProb } = await computeReactionProbabilities(symbol, timeframe, res, sup);

  return NextResponse.json({
    ...publicPayload,
    levels: {
      res:    roundedRes,
      sup:    roundedSup,
      resPct: resPct.map(v => +v.toFixed(2)),
      supPct: supPct.map(v => +v.toFixed(2)),
    },
    bias,
    resProb,
    supProb,
  });
}

function round(v: number, ref: number): number {
  if (ref >= 1000) return +v.toFixed(1);
  if (ref >= 1)    return +v.toFixed(2);
  return +v.toFixed(5);
}
