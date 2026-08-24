import { NextResponse } from 'next/server';
import { getMarkets } from '@/lib/markets/getMarkets';

// Live prices — never prerendered. Without this Next tries to evaluate the route
// at build time, where outbound `no-store` fetches throw and the whole board
// bakes in as offline.
export const dynamic = 'force-dynamic';

export async function GET() {
  const { markets, timestamp, cached } = await getMarkets();

  if (markets.every(m => m.offline)) {
    return NextResponse.json({ error: 'All market sources failed' }, { status: 502 });
  }

  return NextResponse.json(
    { markets, timestamp, cached },
    { headers: { 'Cache-Control': 's-maxage=30, stale-while-revalidate=10' } },
  );
}
