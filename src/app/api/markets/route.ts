import { NextResponse } from 'next/server';

// Yahoo Finance symbols for each market
const YAHOO_SYMBOLS = [
  { symbol: 'XAU/USD', name: 'Gold',         yf: 'GC=F'     },
  { symbol: 'EUR/USD', name: 'Euro/Dollar',   yf: 'EURUSD=X' },
  { symbol: 'GBP/USD', name: 'Pound/Dollar',  yf: 'GBPUSD=X' },
  { symbol: 'USD/JPY', name: 'Dollar/Yen',    yf: 'USDJPY=X' },
  { symbol: 'SPX500',  name: 'S&P 500',       yf: '%5EGSPC'  },
  { symbol: 'NAS100',  name: 'NASDAQ 100',    yf: '%5ENDX'   },
];

const BINANCE_SYMBOLS = [
  { symbol: 'BTC/USD', name: 'Bitcoin',   bin: 'BTCUSDT' },
  { symbol: 'ETH/USD', name: 'Ethereum',  bin: 'ETHUSDT' },
];

async function fetchYahoo(yf: string) {
  const res = await fetch(
    `https://query1.finance.yahoo.com/v8/finance/chart/${yf}?interval=1d&range=1d`,
    {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      next: { revalidate: 0 },
    }
  );
  if (!res.ok) throw new Error(`Yahoo HTTP ${res.status} for ${yf}`);
  const data = await res.json();
  const meta = data?.chart?.result?.[0]?.meta;
  if (!meta?.regularMarketPrice) throw new Error(`No price data for ${yf}`);
  return meta;
}

async function fetchBinance(bin: string) {
  const res = await fetch(
    `https://api.binance.com/api/v3/ticker/24hr?symbol=${bin}`,
    { next: { revalidate: 0 } }
  );
  if (!res.ok) throw new Error(`Binance HTTP ${res.status} for ${bin}`);
  return res.json();
}

export async function GET() {
  try {
    const [yahooResults, binanceResults] = await Promise.all([
      Promise.allSettled(YAHOO_SYMBOLS.map(m => fetchYahoo(m.yf).then(meta => ({ ...m, meta })))),
      Promise.allSettled(BINANCE_SYMBOLS.map(m => fetchBinance(m.bin).then(b => ({ ...m, bin: b })))),
    ]);

    const markets: object[] = [];

    // Yahoo Finance markets
    yahooResults.forEach((result, i) => {
      const cfg = YAHOO_SYMBOLS[i];
      if (result.status === 'fulfilled') {
        const meta = result.value.meta;
        const price   = meta.regularMarketPrice as number;
        const prevClose = (meta.chartPreviousClose ?? meta.previousClose ?? price) as number;
        const high    = (meta.regularMarketDayHigh  ?? price * 1.005) as number;
        const low     = (meta.regularMarketDayLow   ?? price * 0.995) as number;
        const change  = price - prevClose;
        const changePercent = prevClose > 0 ? (change / prevClose) * 100 : 0;

        markets.push({
          symbol: cfg.symbol,
          name:   cfg.name,
          price,
          change:        Math.round(change * 10000) / 10000,
          changePercent: Math.round(changePercent * 100) / 100,
          high,
          low,
          source: 'live',
        });
      } else {
        console.error(`Yahoo failed for ${cfg.symbol}:`, result.reason?.message);
        // Skip — client will keep last known value
      }
    });

    // Binance crypto markets
    binanceResults.forEach((result, i) => {
      const cfg = BINANCE_SYMBOLS[i];
      if (result.status === 'fulfilled') {
        const b = result.value.bin;
        markets.push({
          symbol:        cfg.symbol,
          name:          cfg.name,
          price:         parseFloat(b.lastPrice),
          change:        parseFloat(b.priceChange),
          changePercent: parseFloat(b.priceChangePercent),
          high:          parseFloat(b.highPrice),
          low:           parseFloat(b.lowPrice),
          source: 'live',
        });
      } else {
        console.error(`Binance failed for ${cfg.symbol}:`, result.reason?.message);
      }
    });

    if (markets.length === 0) {
      return NextResponse.json({ error: 'All market sources failed' }, { status: 502 });
    }

    return NextResponse.json(
      { markets, timestamp: Date.now() },
      { headers: { 'Cache-Control': 's-maxage=25, stale-while-revalidate=10' } }
    );
  } catch (error) {
    console.error('Market API error:', error);
    return NextResponse.json({ error: 'Failed to fetch markets' }, { status: 500 });
  }
}
