import { NextResponse } from 'next/server';

const CACHE_TTL = 62_000;

let cache: { markets: object[]; timestamp: number } | null = null;

// ── Binance — crypto (free, no key, no rate limit) ────────────────────────────
async function fetchBinance(symbol: string) {
  const res = await fetch(
    `https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`,
    { next: { revalidate: 0 } }
  );
  if (!res.ok) throw new Error(`Binance ${res.status}`);
  return res.json();
}

// ── Yahoo Finance — forex, gold, indices (free, no key) ───────────────────────
async function fetchYahoo(yf: string) {
  const res = await fetch(
    `https://query1.finance.yahoo.com/v8/finance/chart/${yf}?interval=1d&range=2d`,
    { headers: { 'User-Agent': 'Mozilla/5.0' }, next: { revalidate: 0 } }
  );
  if (!res.ok) throw new Error(`Yahoo ${res.status}`);
  const data = await res.json();
  const result = data?.chart?.result?.[0];
  if (!result) throw new Error(`Yahoo empty result for ${yf}`);
  const meta = result.meta;
  // regularMarketPrice is the most reliable field
  const price =
    meta?.regularMarketPrice ??
    meta?.currentPrice ??
    meta?.price;
  if (!price) throw new Error(`Yahoo no price for ${yf}`);
  const prevClose = meta?.chartPreviousClose ?? meta?.previousClose ?? price;
  const high = meta?.regularMarketDayHigh ?? price * 1.005;
  const low  = meta?.regularMarketDayLow  ?? price * 0.995;
  return { price, prevClose, high, low };
}

// ── Market definitions ────────────────────────────────────────────────────────
const FOREX_GOLD = [
  { symbol: 'XAU/USD', name: 'Gold',          yf: 'GC%3DF'      },
  { symbol: 'EUR/USD', name: 'Euro/Dollar',   yf: 'EURUSD%3DX'  },
  { symbol: 'GBP/USD', name: 'Pound/Dollar',  yf: 'GBPUSD%3DX'  },
  { symbol: 'USD/JPY', name: 'Dollar/Yen',    yf: 'JPY%3DX'     },
];

const INDICES = [
  { symbol: 'SPX500', name: 'S&P 500',    yf: '%5EGSPC' },
  { symbol: 'NAS100', name: 'NASDAQ 100', yf: '%5ENDX'  },
];

// ── Main handler ──────────────────────────────────────────────────────────────
export async function GET() {
  if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
    return NextResponse.json(
      { markets: cache.markets, timestamp: cache.timestamp, cached: true },
      { headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=10' } }
    );
  }

  const markets: object[] = [];

  // ── 1. Crypto — Binance ──────────────────────────────────────────────────────
  const [btcRes, ethRes] = await Promise.allSettled([
    fetchBinance('BTCUSDT'),
    fetchBinance('ETHUSDT'),
  ]);

  if (btcRes.status === 'fulfilled') {
    const b = btcRes.value;
    markets.push({
      symbol: 'BTC/USD', name: 'Bitcoin',
      price: parseFloat(b.lastPrice),
      change: parseFloat(b.priceChange),
      changePercent: parseFloat(b.priceChangePercent),
      high: parseFloat(b.highPrice), low: parseFloat(b.lowPrice),
      source: 'live', offline: false,
    });
  } else {
    console.error('Binance BTC:', btcRes.reason?.message);
    markets.push({ symbol: 'BTC/USD', name: 'Bitcoin', price: 0, change: 0, changePercent: 0, high: 0, low: 0, source: 'offline', offline: true });
  }

  if (ethRes.status === 'fulfilled') {
    const b = ethRes.value;
    markets.push({
      symbol: 'ETH/USD', name: 'Ethereum',
      price: parseFloat(b.lastPrice),
      change: parseFloat(b.priceChange),
      changePercent: parseFloat(b.priceChangePercent),
      high: parseFloat(b.highPrice), low: parseFloat(b.lowPrice),
      source: 'live', offline: false,
    });
  } else {
    console.error('Binance ETH:', ethRes.reason?.message);
    markets.push({ symbol: 'ETH/USD', name: 'Ethereum', price: 0, change: 0, changePercent: 0, high: 0, low: 0, source: 'offline', offline: true });
  }

  // ── 2. Forex + Gold — Yahoo Finance (primary) ────────────────────────────────
  const fxResults = await Promise.allSettled(FOREX_GOLD.map(m => fetchYahoo(m.yf)));

  fxResults.forEach((result, i) => {
    const cfg = FOREX_GOLD[i];
    if (result.status === 'fulfilled') {
      const { price, prevClose, high, low } = result.value;
      const change = price - prevClose;
      const changePercent = prevClose > 0 ? (change / prevClose) * 100 : 0;
      markets.push({
        symbol: cfg.symbol, name: cfg.name, price,
        change: Math.round(change * 100000) / 100000,
        changePercent: Math.round(changePercent * 100) / 100,
        high, low, source: 'live', offline: false,
      });
    } else {
      console.error(`Yahoo ${cfg.symbol}:`, result.reason?.message);
      markets.push({ symbol: cfg.symbol, name: cfg.name, price: 0, change: 0, changePercent: 0, high: 0, low: 0, source: 'offline', offline: true });
    }
  });

  // ── 3. Indices — Yahoo Finance ────────────────────────────────────────────────
  const idxResults = await Promise.allSettled(INDICES.map(m => fetchYahoo(m.yf)));

  idxResults.forEach((result, i) => {
    const cfg = INDICES[i];
    if (result.status === 'fulfilled') {
      const { price, prevClose, high, low } = result.value;
      const change = price - prevClose;
      const changePercent = prevClose > 0 ? (change / prevClose) * 100 : 0;
      markets.push({
        symbol: cfg.symbol, name: cfg.name, price,
        change: Math.round(change * 100) / 100,
        changePercent: Math.round(changePercent * 100) / 100,
        high, low, source: 'live', offline: false,
      });
    } else {
      console.error(`Yahoo ${cfg.symbol}:`, result.reason?.message);
      markets.push({ symbol: cfg.symbol, name: cfg.name, price: 0, change: 0, changePercent: 0, high: 0, low: 0, source: 'offline', offline: true });
    }
  });

  const liveCount = (markets as { offline: boolean }[]).filter(m => !m.offline).length;
  if (liveCount === 0) {
    return NextResponse.json({ error: 'All market sources failed' }, { status: 502 });
  }

  cache = { markets, timestamp: Date.now() };

  return NextResponse.json(
    { markets, timestamp: cache.timestamp },
    { headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=10' } }
  );
}
