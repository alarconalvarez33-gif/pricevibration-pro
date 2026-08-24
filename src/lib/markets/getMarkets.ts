/**
 * Market data snapshot — the single source of prices for the whole app.
 *
 * Callable from server components AND route handlers, which is the point: the
 * home page renders the first snapshot server-side instead of shipping a screen
 * full of "—" and waiting for the client to hydrate and fetch.
 *
 * Providers (all free, no key required):
 *   crypto  → Binance, CoinGecko as fallback
 *   metals  → gold-api.com (true spot), Yahoo futures as fallback
 *   rest    → Yahoo Finance chart endpoint
 */
import 'server-only';

export interface Market {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  source: 'live' | 'offline';
  offline: boolean;
}

export interface MarketsSnapshot {
  markets: Market[];
  timestamp: number;
  cached: boolean;
}

const CACHE_TTL = 30_000;

/**
 * Per-request ceiling for every upstream call.
 *
 * Without this a single slow provider holds the whole snapshot — and with the
 * snapshot now part of the server render, that means it holds the page. Each
 * fetch is capped instead, so a stalled provider degrades to `offline: true`
 * while the rest of the board still arrives on time.
 */
const FETCH_TIMEOUT_MS = 3_500;

/** Secondary, decorative calls get a tighter leash than the price itself. */
const SECONDARY_TIMEOUT_MS = 2_000;

function deadline(ms: number = FETCH_TIMEOUT_MS): AbortSignal {
  return AbortSignal.timeout(ms);
}

// Module-level cache. Shared by the server render and the route handler within
// the same lambda, so rendering the page warms the cache for the client's polls.
let cache: { markets: Market[]; timestamp: number } | null = null;

// A snapshot is only cached if enough of it is usable — otherwise a transient
// upstream outage would be frozen in for 30s.
const MIN_LIVE_RATIO = 0.5;

function offline(symbol: string, name: string): Market {
  return { symbol, name, price: 0, change: 0, changePercent: 0, high: 0, low: 0, source: 'offline', offline: true };
}

function round(v: number, places: number): number {
  const f = 10 ** places;
  return Math.round(v * f) / f;
}

// ── Providers ─────────────────────────────────────────────────────────────────

interface Quote { price: number; prevClose: number; high: number; low: number }

async function fetchBinance(symbol: string) {
  const res = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`, {
    cache: 'no-store',
    signal: deadline(),
  });
  if (!res.ok) throw new Error(`Binance ${symbol} ${res.status}`);
  return res.json() as Promise<{ lastPrice: string; priceChange: string; priceChangePercent: string; highPrice: string; lowPrice: string }>;
}

async function fetchCoinGecko(ids: string) {
  const res = await fetch(
    `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&sparkline=false`,
    { headers: { Accept: 'application/json' }, cache: 'no-store', signal: deadline() },
  );
  if (!res.ok) throw new Error(`CoinGecko ${res.status}`);
  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) throw new Error('CoinGecko empty');
  return data as { id: string; current_price: number; price_change_24h: number; price_change_percentage_24h: number; high_24h: number; low_24h: number }[];
}

async function fetchYahoo(yf: string, timeoutMs = FETCH_TIMEOUT_MS): Promise<Quote> {
  const res = await fetch(
    `https://query1.finance.yahoo.com/v8/finance/chart/${yf}?interval=1d&range=2d`,
    { headers: { 'User-Agent': 'Mozilla/5.0' }, cache: 'no-store', signal: deadline(timeoutMs) },
  );
  if (!res.ok) throw new Error(`Yahoo ${yf} ${res.status}`);
  const meta = (await res.json())?.chart?.result?.[0]?.meta;
  const price = meta?.regularMarketPrice ?? meta?.currentPrice ?? meta?.price;
  if (!price) throw new Error(`Yahoo ${yf} no price`);
  return {
    price,
    prevClose: meta?.chartPreviousClose ?? meta?.previousClose ?? price,
    high: meta?.regularMarketDayHigh ?? price * 1.005,
    low: meta?.regularMarketDayLow ?? price * 0.995,
  };
}

/**
 * True XAU/XAG spot. Yahoo only exposes GC=F/SI=F *futures*, which trade tens of
 * dollars above the spot price brokers and TradingView quote — the premium made
 * our centre price look ~$58 too high.
 */
async function fetchGoldApiSpot(metal: string): Promise<number> {
  const res = await fetch(`https://api.gold-api.com/price/${metal}`, {
    headers: { Accept: 'application/json', 'User-Agent': 'Mozilla/5.0' },
    cache: 'no-store',
    signal: deadline(),
  });
  if (!res.ok) throw new Error(`gold-api ${metal} ${res.status}`);
  const price = (await res.json())?.price;
  if (!price || !Number.isFinite(price) || price <= 0) throw new Error(`gold-api ${metal} no price`);
  return price as number;
}

// ── Instrument definitions ────────────────────────────────────────────────────

const CRYPTO = [
  { binance: 'BTCUSDT', gecko: 'bitcoin',  symbol: 'BTC/USD', name: 'Bitcoin'  },
  { binance: 'ETHUSDT', gecko: 'ethereum', symbol: 'ETH/USD', name: 'Ethereum' },
  { binance: 'SOLUSDT', gecko: 'solana',   symbol: 'SOL/USD', name: 'Solana'   },
  { binance: 'XRPUSDT', gecko: 'ripple',   symbol: 'XRP/USD', name: 'XRP'      },
];

const FOREX_GOLD = [
  { symbol: 'XAU/USD', name: 'Gold',          yf: 'GC%3DF'     },
  { symbol: 'XAG/USD', name: 'Silver',        yf: 'SI%3DF'     },
  { symbol: 'USOIL',   name: 'WTI Crude',     yf: 'CL%3DF'     },
  { symbol: 'EUR/USD', name: 'Euro/Dollar',   yf: 'EURUSD%3DX' },
  { symbol: 'GBP/USD', name: 'Pound/Dollar',  yf: 'GBPUSD%3DX' },
  { symbol: 'USD/JPY', name: 'Dollar/Yen',    yf: 'JPY%3DX'    },
  { symbol: 'AUD/USD', name: 'Aussie/Dollar', yf: 'AUDUSD%3DX' },
  { symbol: 'GBP/JPY', name: 'Pound/Yen',     yf: 'GBPJPY%3DX' },
];

/** Metals quote true spot; the rest keep Yahoo as primary. */
const SPOT_METAL: Record<string, string> = { 'XAU/USD': 'XAU', 'XAG/USD': 'XAG' };

/**
 * Everything else Yahoo covers. `decimals` controls the rounding of the change
 * figure — DXY moves in thousandths, equities in cents.
 *
 * DXY used to come from Twelve Data with Finnhub as fallback. Both were dead in
 * production: Twelve Data returned 429 (free quota exhausted) and Finnhub
 * answers `{"c":0}` for indices on the free plan, so the fallback could never
 * succeed. Yahoo serves DX-Y.NYB for free, which drops two API keys.
 */
const YAHOO_REST = [
  { symbol: 'SPX500',     name: 'S&P 500',           yf: '%5EGSPC',     decimals: 2 },
  { symbol: 'NAS100',     name: 'NASDAQ 100',        yf: '%5ENDX',      decimals: 2 },
  { symbol: 'US30',       name: 'Dow Jones',         yf: '%5EDJI',      decimals: 2 },
  { symbol: 'DXY',        name: 'Dollar Index',      yf: 'DX-Y.NYB',    decimals: 3 },
  { symbol: 'NVDA',       name: 'Nvidia',            yf: 'NVDA',        decimals: 2 },
  { symbol: 'AAPL',       name: 'Apple',             yf: 'AAPL',        decimals: 2 },
  { symbol: 'TSLA',       name: 'Tesla',             yf: 'TSLA',        decimals: 2 },
  { symbol: 'RELIANCE',   name: 'Reliance',          yf: 'RELIANCE.NS', decimals: 2 },
  { symbol: 'TCS',        name: 'Tata Consultancy',  yf: 'TCS.NS',      decimals: 2 },
  { symbol: 'HDFCBANK',   name: 'HDFC Bank',         yf: 'HDFCBANK.NS', decimals: 2 },
  { symbol: 'INFY',       name: 'Infosys',           yf: 'INFY.NS',     decimals: 2 },
  { symbol: 'ICICIBANK',  name: 'ICICI Bank',        yf: 'ICICIBANK.NS',decimals: 2 },
  { symbol: 'SBIN',       name: 'State Bank',        yf: 'SBIN.NS',     decimals: 2 },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel',     yf: 'BHARTIARTL.NS',decimals: 2 },
  // Tata Motors demerged in 2025 and TATAMOTORS.NS now 404s. TMPV.NS is the
  // passenger-vehicle entity that inherited the name retail traders know.
  { symbol: 'TATAMOTORS', name: 'Tata Motors',       yf: 'TMPV.NS',     decimals: 2 },
];

// ── Assembly ──────────────────────────────────────────────────────────────────

function toMarket(cfg: { symbol: string; name: string }, q: Quote, decimals: number): Market {
  const change = q.price - q.prevClose;
  return {
    symbol: cfg.symbol,
    name: cfg.name,
    price: q.price,
    change: round(change, decimals),
    changePercent: q.prevClose > 0 ? round((change / q.prevClose) * 100, 2) : 0,
    high: q.high,
    low: q.low,
    source: 'live',
    offline: false,
  };
}

async function loadCrypto(): Promise<Market[]> {
  const settled = await Promise.allSettled(CRYPTO.map(c => fetchBinance(c.binance)));

  // Only reach for CoinGecko if Binance actually let us down.
  let gecko: Awaited<ReturnType<typeof fetchCoinGecko>> = [];
  if (settled.some(r => r.status === 'rejected')) {
    try {
      gecko = await fetchCoinGecko(CRYPTO.map(c => c.gecko).join(','));
    } catch (e) {
      console.error('CoinGecko fallback failed:', (e as Error).message);
    }
  }

  return CRYPTO.map((def, i) => {
    const r = settled[i];
    if (r.status === 'fulfilled') {
      const b = r.value;
      return {
        symbol: def.symbol,
        name: def.name,
        price: parseFloat(b.lastPrice),
        change: parseFloat(b.priceChange),
        changePercent: parseFloat(b.priceChangePercent),
        high: parseFloat(b.highPrice),
        low: parseFloat(b.lowPrice),
        source: 'live' as const,
        offline: false,
      };
    }
    const g = gecko.find(d => d.id === def.gecko);
    if (g) {
      return {
        symbol: def.symbol,
        name: def.name,
        price: g.current_price,
        change: g.price_change_24h,
        changePercent: round(g.price_change_percentage_24h, 2),
        high: g.high_24h,
        low: g.low_24h,
        source: 'live' as const,
        offline: false,
      };
    }
    console.error(`${def.symbol} failed (Binance + CoinGecko)`);
    return offline(def.symbol, def.name);
  });
}

async function loadForexGold(): Promise<Market[]> {
  const settled = await Promise.allSettled(
    FOREX_GOLD.map(async (m): Promise<Quote> => {
      const metal = SPOT_METAL[m.symbol];
      if (!metal) return fetchYahoo(m.yf);

      let spot: number;
      try {
        spot = await fetchGoldApiSpot(metal);
      } catch (e) {
        console.warn(`gold-api ${m.symbol} failed, falling back to Yahoo futures:`, (e as Error).message);
        return fetchYahoo(m.yf);
      }

      // Borrow the *relative* daily move from Yahoo futures and rescale it onto
      // the spot level, so change%/high/low stay coherent with the spot price.
      // We already hold the price that matters, so this one gets a short leash.
      try {
        const y = await fetchYahoo(m.yf, SECONDARY_TIMEOUT_MS);
        if (y.price > 0) {
          return {
            price: spot,
            prevClose: y.prevClose > 0 ? spot * (y.prevClose / y.price) : spot,
            high: y.high > 0 ? spot * (y.high / y.price) : spot * 1.004,
            low: y.low > 0 ? spot * (y.low / y.price) : spot * 0.996,
          };
        }
      } catch { /* spot-only estimates below */ }
      return { price: spot, prevClose: spot, high: spot * 1.004, low: spot * 0.996 };
    }),
  );

  return settled.map((r, i) => {
    const cfg = FOREX_GOLD[i];
    if (r.status === 'fulfilled') return toMarket(cfg, r.value, 5);
    console.error(`Market ${cfg.symbol} failed:`, (r.reason as Error)?.message);
    return offline(cfg.symbol, cfg.name);
  });
}

async function loadYahooRest(): Promise<Market[]> {
  const settled = await Promise.allSettled(YAHOO_REST.map(m => fetchYahoo(m.yf)));
  return settled.map((r, i) => {
    const cfg = YAHOO_REST[i];
    if (r.status === 'fulfilled') return toMarket(cfg, r.value, cfg.decimals);
    console.error(`Yahoo ${cfg.symbol}:`, (r.reason as Error)?.message);
    return offline(cfg.symbol, cfg.name);
  });
}

/** Total number of instruments a full snapshot contains. */
export const MARKET_COUNT = CRYPTO.length + FOREX_GOLD.length + YAHOO_REST.length;

/**
 * Current prices for every instrument, from cache when fresh.
 *
 * Never throws and never rejects: an instrument whose providers all failed comes
 * back with `offline: true` so callers can render it as genuinely unavailable
 * rather than as "still loading".
 */
export async function getMarkets(): Promise<MarketsSnapshot> {
  if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
    return { markets: cache.markets, timestamp: cache.timestamp, cached: true };
  }

  const groups = await Promise.all([loadCrypto(), loadForexGold(), loadYahooRest()]);
  const markets = groups.flat();
  const timestamp = Date.now();

  const live = markets.filter(m => !m.offline).length;
  if (live >= markets.length * MIN_LIVE_RATIO) {
    cache = { markets, timestamp };
  } else {
    console.error(`Only ${live}/${markets.length} markets live — not caching this snapshot`);
    // A previous good snapshot beats a mostly-broken fresh one.
    if (cache) return { markets: cache.markets, timestamp: cache.timestamp, cached: true };
  }

  return { markets, timestamp, cached: false };
}

/** Price for one symbol, or null when unavailable. */
export async function getPrice(symbol: string): Promise<number | null> {
  const { markets } = await getMarkets();
  const row = markets.find(m => m.symbol === symbol);
  return row && !row.offline && row.price > 0 ? row.price : null;
}
