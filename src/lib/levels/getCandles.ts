import 'server-only';

export type Timeframe = '1m' | '5m' | '15m' | '1h' | '4h' | '1d';

export interface Candle {
  time:  number; // epoch ms
  open:  number;
  high:  number;
  low:   number;
  close: number;
}

// Internal symbol → Yahoo Finance ticker
const YF: Record<string, string> = {
  'BTC/USD':    'BTC-USD',
  'ETH/USD':    'ETH-USD',
  'SOL/USD':    'SOL-USD',
  'XRP/USD':    'XRP-USD',
  'XAU/USD':    'GC=F',
  'XAG/USD':    'SI=F',
  'US30':       '^DJI',
  'NAS100':     '^NDX',
  'NVDA':       'NVDA',
  'AAPL':       'AAPL',
  'TSLA':       'TSLA',
  'RELIANCE':   'RELIANCE.NS',
  'TCS':        'TCS.NS',
  'HDFCBANK':   'HDFCBANK.NS',
  'INFY':       'INFY.NS',
  'ICICIBANK':  'ICICIBANK.NS',
  'SBIN':       'SBIN.NS',
  'BHARTIARTL': 'BHARTIARTL.NS',
  'TATAMOTORS': 'TATAMOTORS.NS',
  'EUR/USD':    'EURUSD=X',
  'GBP/JPY':    'GBPJPY=X',
};

// Yahoo Finance interval + range for each timeframe.
// 4h is not supported natively — we fetch 1h and aggregate.
const TF_PARAMS: Record<Timeframe, { interval: string; range: string }> = {
  '1m':  { interval: '1m',  range: '1d'   },
  '5m':  { interval: '5m',  range: '5d'   },
  '15m': { interval: '15m', range: '10d'  },
  '1h':  { interval: '60m', range: '30d'  },
  '4h':  { interval: '60m', range: '90d'  },
  '1d':  { interval: '1d',  range: '2y'   },
};

export async function getCandles(symbol: string, tf: Timeframe): Promise<Candle[]> {
  const yfSym = YF[symbol];
  if (!yfSym) return [];

  const { interval, range } = TF_PARAMS[tf];
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yfSym)}?interval=${interval}&range=${range}`;

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SacredLevels/1.0)' },
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];

    const json = await res.json();
    const result = json?.chart?.result?.[0];
    if (!result) return [];

    const timestamps: number[]         = result.timestamp ?? [];
    const q = result.indicators?.quote?.[0];
    if (!q || timestamps.length === 0) return [];

    const candles: Candle[] = timestamps
      .map((t: number, i: number) => ({
        time:  t * 1000,
        open:  q.open?.[i]  ?? 0,
        high:  q.high?.[i]  ?? 0,
        low:   q.low?.[i]   ?? 0,
        close: q.close?.[i] ?? 0,
      }))
      .filter((c: Candle) => c.open > 0 && c.high > 0 && c.low > 0 && c.close > 0);

    if (tf === '4h') return aggregate(candles, 4);
    return candles;
  } catch {
    return [];
  }
}

function aggregate(candles: Candle[], n: number): Candle[] {
  const out: Candle[] = [];
  for (let i = 0; i + n <= candles.length; i += n) {
    const chunk = candles.slice(i, i + n);
    out.push({
      time:  chunk[0].time,
      open:  chunk[0].open,
      high:  Math.max(...chunk.map(c => c.high)),
      low:   Math.min(...chunk.map(c => c.low)),
      close: chunk[chunk.length - 1].close,
    });
  }
  return out;
}
