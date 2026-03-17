import { NextResponse } from 'next/server';

const TD_KEY = process.env.TWELVE_DATA_KEY || '0bb783745d264d9e8967a477e213ba1e';
const CACHE_TTL = 62_000; // 62 seconds — slightly more than 1 minute to respect TD rate limits

// ── Server-side in-memory cache ───────────────────────────────────────────────
// Prevents multiple server instances / overlapping requests from burning TD credits
let cache: { markets: object[]; timestamp: number } | null = null;

// ── Fetch helpers ─────────────────────────────────────────────────────────────

async function fetchBinance(symbol: string) {
  const res = await fetch(
    `https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`,
    { next: { revalidate: 0 } }
  );
  if (!res.ok) throw new Error(`Binance ${res.status}`);
  return res.json();
}

async function fetchTwelveData(symbols: string[]) {
  // symbols.length must be <= 7 on free plan (leaves 1 credit buffer)
  const joined = symbols.join(',');
  const res = await fetch(
    `https://api.twelvedata.com/quote?symbol=${encodeURIComponent(joined)}&apikey=${TD_KEY}`,
    { next: { revalidate: 0 } }
  );
  if (!res.ok) throw new Error(`TwelveData ${res.status}`);
  const data = await res.json();
  if (data.status === 'error') throw new Error(`TwelveData: ${data.message}`);
  // Single symbol returns object directly; multiple returns keyed object
  return symbols.length === 1 ? { [symbols[0]]: data } : data as Record<string, Record<string, string>>;
}

async function fetchYahoo(yf: string) {
  const res = await fetch(
    `https://query1.finance.yahoo.com/v8/finance/chart/${yf}?interval=1d&range=1d`,
    { headers: { 'User-Agent': 'Mozilla/5.0' }, next: { revalidate: 0 } }
  );
  if (!res.ok) throw new Error(`Yahoo ${res.status}`);
  const data = await res.json();
  const meta = data?.chart?.result?.[0]?.meta;
  if (!meta?.regularMarketPrice) throw new Error(`Yahoo no price for ${yf}`);
  return meta;
}

// ── Main handler ──────────────────────────────────────────────────────────────

export async function GET() {
  // Serve from cache if fresh
  if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
    return NextResponse.json(
      { markets: cache.markets, timestamp: cache.timestamp, cached: true },
      { headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=10' } }
    );
  }

  const markets: object[] = [];

  // ── 1. Crypto — Binance (free, no rate limit) ─────────────────────────────
  const [btcResult, ethResult] = await Promise.allSettled([
    fetchBinance('BTCUSDT'),
    fetchBinance('ETHUSDT'),
  ]);

  if (btcResult.status === 'fulfilled') {
    const b = btcResult.value;
    markets.push({ symbol: 'BTC/USD', name: 'Bitcoin', price: parseFloat(b.lastPrice), change: parseFloat(b.priceChange), changePercent: parseFloat(b.priceChangePercent), high: parseFloat(b.highPrice), low: parseFloat(b.lowPrice), source: 'live' });
  }
  if (ethResult.status === 'fulfilled') {
    const b = ethResult.value;
    markets.push({ symbol: 'ETH/USD', name: 'Ethereum', price: parseFloat(b.lastPrice), change: parseFloat(b.priceChange), changePercent: parseFloat(b.priceChangePercent), high: parseFloat(b.highPrice), low: parseFloat(b.lowPrice), source: 'live' });
  }

  // ── 2. Forex + Gold — Twelve Data (4 symbols = 4 credits, under 8/min limit) ──
  const tdSymbols = ['XAU/USD', 'EUR/USD', 'GBP/USD', 'USD/JPY'];
  const tdNames: Record<string, string> = { 'XAU/USD': 'Gold', 'EUR/USD': 'Euro/Dollar', 'GBP/USD': 'Pound/Dollar', 'USD/JPY': 'Dollar/Yen' };

  const tdResult = await Promise.allSettled([fetchTwelveData(tdSymbols)]);

  if (tdResult[0].status === 'fulfilled') {
    const data = tdResult[0].value;
    for (const sym of tdSymbols) {
      const q = data[sym];
      if (!q || !q.close) { console.warn('TD missing', sym); continue; }
      const price         = parseFloat(q.close);
      const prevClose     = parseFloat(q.previous_close ?? q.open ?? q.close);
      const change        = parseFloat(q.change ?? String(price - prevClose));
      const changePercent = parseFloat(q.percent_change ?? String((change / prevClose) * 100));
      markets.push({ symbol: sym, name: tdNames[sym], price, change: Math.round(change * 100000) / 100000, changePercent: Math.round(changePercent * 100) / 100, high: parseFloat(q.high), low: parseFloat(q.low), source: 'live' });
    }
  } else {
    console.error('Twelve Data failed:', tdResult[0].reason?.message);
  }

  // ── 3. Indices — Yahoo Finance (free, no key needed) ─────────────────────
  const indexMap = [
    { yf: '%5EGSPC', symbol: 'SPX500', name: 'S&P 500'    },
    { yf: '%5ENDX',  symbol: 'NAS100', name: 'NASDAQ 100' },
  ];

  const yahooResults = await Promise.allSettled(indexMap.map(m => fetchYahoo(m.yf)));

  yahooResults.forEach((result, i) => {
    const cfg = indexMap[i];
    if (result.status === 'fulfilled') {
      const meta     = result.value;
      const price    = meta.regularMarketPrice as number;
      const prev     = (meta.chartPreviousClose ?? meta.previousClose ?? price) as number;
      const high     = (meta.regularMarketDayHigh  ?? price * 1.005) as number;
      const low      = (meta.regularMarketDayLow   ?? price * 0.995) as number;
      const change   = price - prev;
      const changePct = prev > 0 ? (change / prev) * 100 : 0;
      markets.push({ symbol: cfg.symbol, name: cfg.name, price, change: Math.round(change * 100) / 100, changePercent: Math.round(changePct * 100) / 100, high, low, source: 'live' });
    } else {
      console.warn('Yahoo failed for', cfg.symbol, result.reason?.message);
    }
  });

  if (markets.length === 0) {
    return NextResponse.json({ error: 'All market sources failed' }, { status: 502 });
  }

  // Update in-memory cache
  cache = { markets, timestamp: Date.now() };

  return NextResponse.json(
    { markets, timestamp: cache.timestamp },
    { headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=10' } }
  );
}
