import { NextResponse } from 'next/server';

const TWELVE_DATA_API_KEY = process.env.TWELVE_DATA_API_KEY
const FINNHUB_API_KEY     = process.env.FINNHUB_API_KEY

const CACHE_TTL = 30_000;

let cache: { markets: object[]; timestamp: number } | null = null;

// ── Binance — crypto (free, no key) ──────────────────────────────────────────
async function fetchBinance(symbol: string) {
  const res = await fetch(
    `https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`,
    { next: { revalidate: 0 } }
  );
  if (!res.ok) throw new Error(`Binance ${res.status}`);
  return res.json();
}

// ── CoinGecko — crypto fallback (free, no key, global) ───────────────────────
async function fetchCoinGecko(ids: string) {
  const res = await fetch(
    `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&sparkline=false`,
    { headers: { 'Accept': 'application/json' }, next: { revalidate: 0 } }
  );
  if (!res.ok) throw new Error(`CoinGecko ${res.status}`);
  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) throw new Error('CoinGecko empty');
  return data as { id: string; current_price: number; price_change_24h: number; price_change_percentage_24h: number; high_24h: number; low_24h: number }[];
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

// ── Twelve Data — DXY ────────────────────────────────────────────────────────
async function fetchTwelveDataDXY() {
  if (!TWELVE_DATA_API_KEY) throw new Error('TWELVE_DATA_API_KEY not configured')
  const res = await fetch(
    `https://api.twelvedata.com/quote?symbol=DX-Y.NYB&apikey=${TWELVE_DATA_API_KEY}`,
    { headers: { 'Accept': 'application/json' }, next: { revalidate: 0 } }
  );
  if (!res.ok) throw new Error(`TwelveData DXY ${res.status}`);
  const data = await res.json();
  if (data.status === 'error') throw new Error(`TwelveData: ${data.message}`);
  const price = parseFloat(data.close);
  const prevClose = parseFloat(data.previous_close);
  const high = parseFloat(data.high);
  const low = parseFloat(data.low);
  const change = parseFloat(data.change);
  const changePercent = parseFloat(data.percent_change);
  if (isNaN(price)) throw new Error('TwelveData DXY no price');
  return { price, prevClose, high, low, change, changePercent };
}

// ── Finnhub — DXY fallback ────────────────────────────────────────────────────
async function fetchFinnhubDXY() {
  if (!FINNHUB_API_KEY) throw new Error('FINNHUB_API_KEY not configured')
  const res = await fetch(
    `https://finnhub.io/api/v1/quote?symbol=DX-Y.NYB&token=${FINNHUB_API_KEY}`,
    { headers: { 'Accept': 'application/json' }, next: { revalidate: 0 } }
  );
  if (!res.ok) throw new Error(`Finnhub DXY ${res.status}`);
  const data = await res.json();
  const price = data.c;
  const prevClose = data.pc;
  if (!price || isNaN(price)) throw new Error('Finnhub DXY no price');
  const change = price - prevClose;
  const changePercent = prevClose > 0 ? (change / prevClose) * 100 : 0;
  return {
    price,
    prevClose,
    high: data.h ?? price * 1.003,
    low: data.l ?? price * 0.997,
    change: Math.round(change * 1000) / 1000,
    changePercent: Math.round(changePercent * 100) / 100,
  };
}

// ── Finnhub — spot quote (XAU/USD, XAG/USD via OANDA feed) ───────────────────
async function fetchFinnhubSpot(finnhubSymbol: string) {
  if (!FINNHUB_API_KEY) throw new Error('FINNHUB_API_KEY not configured')
  const res = await fetch(
    `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(finnhubSymbol)}&token=${FINNHUB_API_KEY}`,
    { headers: { 'Accept': 'application/json' }, next: { revalidate: 0 } }
  );
  if (!res.ok) throw new Error(`Finnhub ${finnhubSymbol} ${res.status}`);
  const data = await res.json();
  const price = data.c;
  const prevClose = data.pc;
  if (!price || isNaN(price) || price === 0) throw new Error(`Finnhub ${finnhubSymbol} no price`);
  const high = data.h && data.h > 0 ? data.h : price * 1.005;
  const low  = data.l && data.l > 0 ? data.l : price * 0.995;
  return { price, prevClose: prevClose || price, high, low };
}

// ── Market definitions ────────────────────────────────────────────────────────
const FOREX_GOLD = [
  { symbol: 'XAU/USD', name: 'Gold',          yf: 'GC%3DF'      },
  { symbol: 'XAG/USD', name: 'Silver',        yf: 'SI%3DF'      },
  { symbol: 'USOIL',   name: 'WTI Crude',     yf: 'CL%3DF'      },
  { symbol: 'EUR/USD', name: 'Euro/Dollar',   yf: 'EURUSD%3DX'  },
  { symbol: 'GBP/USD', name: 'Pound/Dollar',  yf: 'GBPUSD%3DX'  },
  { symbol: 'USD/JPY', name: 'Dollar/Yen',    yf: 'JPY%3DX'     },
  { symbol: 'AUD/USD', name: 'Aussie/Dollar', yf: 'AUDUSD%3DX'  },
  { symbol: 'GBP/JPY', name: 'Pound/Yen',     yf: 'GBPJPY%3DX'  },
];

const INDICES = [
  { symbol: 'SPX500', name: 'S&P 500',    yf: '%5EGSPC' },
  { symbol: 'NAS100', name: 'NASDAQ 100', yf: '%5ENDX'  },
  { symbol: 'US30',   name: 'Dow Jones',  yf: '%5EDJI'  },
];

// US stocks — Yahoo Finance
const STOCKS_US = [
  { symbol: 'NVDA', name: 'Nvidia',    yf: 'NVDA' },
  { symbol: 'AAPL', name: 'Apple',     yf: 'AAPL' },
  { symbol: 'TSLA', name: 'Tesla',     yf: 'TSLA' },
];

// India stocks — Yahoo Finance NSE (.NS suffix)
const STOCKS_IN = [
  { symbol: 'RELIANCE',   name: 'Reliance',          yf: 'RELIANCE.NS'   },
  { symbol: 'TCS',        name: 'Tata Consultancy',  yf: 'TCS.NS'        },
  { symbol: 'HDFCBANK',   name: 'HDFC Bank',         yf: 'HDFCBANK.NS'   },
  { symbol: 'INFY',       name: 'Infosys',           yf: 'INFY.NS'       },
  { symbol: 'ICICIBANK',  name: 'ICICI Bank',        yf: 'ICICIBANK.NS'  },
  { symbol: 'SBIN',       name: 'State Bank',        yf: 'SBIN.NS'       },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel',     yf: 'BHARTIARTL.NS' },
  { symbol: 'TATAMOTORS', name: 'Tata Motors',       yf: 'TATAMOTORS.NS' },
];

// ── Main handler ──────────────────────────────────────────────────────────────
export async function GET() {
  if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
    return NextResponse.json(
      { markets: cache.markets, timestamp: cache.timestamp, cached: true },
      { headers: { 'Cache-Control': 's-maxage=30, stale-while-revalidate=10' } }
    );
  }

  const markets: object[] = [];

  // ── 1. Crypto — Binance primary, CoinGecko fallback ─────────────────────────
  const cryptoDefs = [
    { binance: 'BTCUSDT', gecko: 'bitcoin',  symbol: 'BTC/USD', name: 'Bitcoin'  },
    { binance: 'ETHUSDT', gecko: 'ethereum', symbol: 'ETH/USD', name: 'Ethereum' },
    { binance: 'SOLUSDT', gecko: 'solana',   symbol: 'SOL/USD', name: 'Solana'   },
    { binance: 'XRPUSDT', gecko: 'ripple',   symbol: 'XRP/USD', name: 'XRP'      },
  ];

  const binanceResults = await Promise.allSettled(
    cryptoDefs.map(c => fetchBinance(c.binance))
  );
  const binanceFailed = binanceResults.some(r => r.status === 'rejected');

  // Try CoinGecko if any Binance call failed
  let geckoData: Awaited<ReturnType<typeof fetchCoinGecko>> = [];
  if (binanceFailed) {
    const geckoIds = cryptoDefs.map(c => c.gecko).join(',');
    const geckoRes = await Promise.allSettled([fetchCoinGecko(geckoIds)]);
    if (geckoRes[0].status === 'fulfilled') {
      geckoData = geckoRes[0].value;
    } else {
      console.error('CoinGecko fallback failed:', geckoRes[0].reason?.message);
    }
  }

  for (let i = 0; i < cryptoDefs.length; i++) {
    const def = cryptoDefs[i];
    const binanceRes = binanceResults[i];

    if (binanceRes.status === 'fulfilled') {
      const b = binanceRes.value;
      markets.push({
        symbol: def.symbol, name: def.name,
        price: parseFloat(b.lastPrice),
        change: parseFloat(b.priceChange),
        changePercent: parseFloat(b.priceChangePercent),
        high: parseFloat(b.highPrice), low: parseFloat(b.lowPrice),
        source: 'live', offline: false,
      });
    } else {
      const g = geckoData.find(d => d.id === def.gecko);
      if (g) {
        markets.push({
          symbol: def.symbol, name: def.name,
          price: g.current_price,
          change: g.price_change_24h,
          changePercent: Math.round(g.price_change_percentage_24h * 100) / 100,
          high: g.high_24h, low: g.low_24h,
          source: 'live', offline: false,
        });
      } else {
        console.error(`${def.symbol} failed (Binance + CoinGecko)`);
        markets.push({ symbol: def.symbol, name: def.name, price: 0, change: 0, changePercent: 0, high: 0, low: 0, source: 'offline', offline: true });
      }
    }
  }

  // ── 2. Forex + Gold — Finnhub real-time spot for metals, Yahoo for FX ────────
  // Map FOREX_GOLD entries to a primary fetch strategy. Metals get real-time
  // spot prices via Finnhub (OANDA feed); FX/oil keep Yahoo as primary.
  const SPOT_OVERRIDE: Record<string, string> = {
    'XAU/USD': 'OANDA:XAU_USD',
    'XAG/USD': 'OANDA:XAG_USD',
  };

  const fxResults = await Promise.allSettled(
    FOREX_GOLD.map(async m => {
      const spot = SPOT_OVERRIDE[m.symbol];
      if (spot) {
        try { return await fetchFinnhubSpot(spot); }
        catch (e) { console.warn(`Finnhub ${m.symbol} failed, falling back to Yahoo:`, (e as Error).message); }
      }
      return fetchYahoo(m.yf);
    })
  );

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
      console.error(`Market ${cfg.symbol} failed:`, result.reason?.message);
      markets.push({ symbol: cfg.symbol, name: cfg.name, price: 0, change: 0, changePercent: 0, high: 0, low: 0, source: 'offline', offline: true });
    }
  });

  // ── 3. Indices + stocks (US + India) — Yahoo Finance ─────────────────────────
  const yahooBundle = [...INDICES, ...STOCKS_US, ...STOCKS_IN];
  const yahooResults = await Promise.allSettled(yahooBundle.map(m => fetchYahoo(m.yf)));

  yahooResults.forEach((result, i) => {
    const cfg = yahooBundle[i];
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

  // ── 4. DXY — Twelve Data primary, Finnhub fallback ───────────────────────────
  let dxyData: Awaited<ReturnType<typeof fetchTwelveDataDXY>> | null = null;
  try {
    dxyData = await fetchTwelveDataDXY();
  } catch (e) {
    console.error('TwelveData DXY failed:', (e as Error).message, '— trying Finnhub');
    try {
      dxyData = await fetchFinnhubDXY();
    } catch (e2) {
      console.error('Finnhub DXY failed:', (e2 as Error).message);
    }
  }
  if (dxyData) {
    const { price, high, low, change, changePercent } = dxyData;
    markets.push({
      symbol: 'DXY', name: 'Dollar Index',
      price, change: Math.round(change * 1000) / 1000,
      changePercent: Math.round(changePercent * 100) / 100,
      high, low, source: 'live', offline: false,
    });
  } else {
    markets.push({ symbol: 'DXY', name: 'Dollar Index', price: 0, change: 0, changePercent: 0, high: 0, low: 0, source: 'offline', offline: true });
  }

  const liveCount = (markets as { offline: boolean }[]).filter(m => !m.offline).length;
  if (liveCount === 0) {
    return NextResponse.json({ error: 'All market sources failed' }, { status: 502 });
  }

  cache = { markets, timestamp: Date.now() };

  return NextResponse.json(
    { markets, timestamp: cache.timestamp },
    { headers: { 'Cache-Control': 's-maxage=30, stale-while-revalidate=10' } }
  );
}
