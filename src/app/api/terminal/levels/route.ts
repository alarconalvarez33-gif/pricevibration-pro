import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { calcLevels, type Timeframe } from '@/lib/levels/calcLevels';

const ADMIN_EMAIL = 'raul@sacredlevels.com';
const PAID_PLANS = new Set(['pro', 'quantum', 'signal_hub', 'whale', 'ser', 'ser-plus']);

interface MarketRow { symbol: string; price: number; offline?: boolean; }

const VALID_TIMEFRAMES = new Set<Timeframe>(['15m', '1h', '4h', '1d']);

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const symbol: string = String(body.symbol || '').trim();
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

  // Subscription gate
  const session = await getServerSession(authOptions);
  let isPremium = false;
  let isAuthed = false;

  if (session?.user?.email) {
    isAuthed = true;
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        email: true, role: true, plan: true, isPremium: true,
        premiumUntil: true, subscriptionStatus: true,
      },
    });
    if (user) {
      const adminBypass = user.email === ADMIN_EMAIL || user.role === 'admin';
      const hasPlan    = PAID_PLANS.has(user.plan ?? '');
      const stillValid = user.premiumUntil ? user.premiumUntil > new Date() : false;
      const active     = user.subscriptionStatus === 'active';
      isPremium = adminBypass || (hasPlan && user.isPremium === true && stillValid && active);
    }
  }

  const publicPayload = { symbol, timeframe, price, isAuthed, isPremium };

  // No price OR not premium → never expose levels or bias
  if (!isPremium || price == null) {
    return NextResponse.json({ ...publicPayload, levels: null, bias: null });
  }

  const { res, sup, resPct, supPct, bias } = calcLevels(price, timeframe);
  return NextResponse.json({
    ...publicPayload,
    levels: {
      res:    res.map(v    => round(v, price)),
      sup:    sup.map(v    => round(v, price)),
      resPct: resPct.map(v => +v.toFixed(2)),
      supPct: supPct.map(v => +v.toFixed(2)),
    },
    bias,
  });
}

function round(v: number, ref: number): number {
  if (ref >= 1000) return +v.toFixed(1);
  if (ref >= 1)    return +v.toFixed(2);
  return +v.toFixed(5);
}
