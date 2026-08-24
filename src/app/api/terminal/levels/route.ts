import { NextRequest, NextResponse } from 'next/server';
import { getTerminalLevels, parseTimeframe } from '@/lib/levels/terminalLevels';
import { getTrialState } from '@/lib/services/trial-access';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const symbol = String(body.symbol || '').trim();

  if (!symbol) {
    return NextResponse.json({ error: 'symbol requerido' }, { status: 400 });
  }

  // Resolved in-process. This used to fetch `${origin}/api/markets` over HTTP
  // from inside the function, which cost a full extra round trip and made the
  // levels the last thing on screen — 2.3s against 0.2s for /api/markets.
  const trial = await getTrialState(req);
  const payload = await getTerminalLevels(symbol, parseTimeframe(body.timeframe), trial);

  return NextResponse.json(payload);
}
