import { NextResponse } from 'next/server';

const TD_KEY = process.env.TWELVE_DATA_KEY || '0bb783745d264d9e8967a477e213ba1e';

// Twelve Data symbols → our display symbols
const TD_SYMBOLS = [
  { td: 'XAU/USD', symbol: 'XAU/USD', name: 'Gold'         },
  { td: 'EUR/USD', symbol: 'EUR/USD', name: 'Euro/Dollar'   },
  { td: 'GBP/USD', symbol: 'GBP/USD', name: 'Pound/Dollar'  },
  { td: 'USD/JPY', symbol: 'USD/JPY', name: 'Dollar/Yen'    },
  { td: 'BTC/USD', symbol: 'BTC/USD', name: 'Bitcoin'       },
  { td: 'ETH/USD', symbol: 'ETH/USD', name: 'Ethereum'      },
  { td: 'SPX',     symbol: 'SPX500',  name: 'S&P 500'       },
  { td: 'IXIC',    symbol: 'NAS100',  name: 'NASDAQ 100'    },
];

export async function GET() {
  try {
    const tdSymbols = TD_SYMBOLS.map(s => s.td).join(',');
    const url = `https://api.twelvedata.com/quote?symbol=${encodeURIComponent(tdSymbols)}&apikey=${TD_KEY}`;

    const res = await fetch(url, {
      headers: { 'User-Agent': 'SacredLevels/1.0' },
      next: { revalidate: 0 },
    });

    if (!res.ok) throw new Error(`Twelve Data HTTP ${res.status}`);

    const raw = await res.json();

    // raw is { "XAU/USD": {...}, "EUR/USD": {...}, ... }
    // If only one symbol, TD returns the object directly (not wrapped)
    const markets: object[] = [];

    for (const cfg of TD_SYMBOLS) {
      const q = raw[cfg.td] ?? (TD_SYMBOLS.length === 1 ? raw : null);

      if (!q || q.status === 'error' || !q.close) {
        console.warn(`Twelve Data: no data for ${cfg.td}`, q?.message ?? '');
        continue;
      }

      const price         = parseFloat(q.close);
      const prevClose     = parseFloat(q.previous_close ?? q.open ?? q.close);
      const high          = parseFloat(q.high);
      const low           = parseFloat(q.low);
      const change        = parseFloat(q.change ?? (price - prevClose).toFixed(6));
      const changePercent = parseFloat(q.percent_change ?? ((change / prevClose) * 100).toFixed(4));

      markets.push({
        symbol:        cfg.symbol,
        name:          cfg.name,
        price,
        change:        Math.round(change   * 100000) / 100000,
        changePercent: Math.round(changePercent * 100) / 100,
        high,
        low,
        source: 'live',
      });
    }

    if (markets.length === 0) {
      return NextResponse.json({ error: 'All Twelve Data symbols failed' }, { status: 502 });
    }

    return NextResponse.json(
      { markets, timestamp: Date.now(), source: 'Twelve Data' },
      { headers: { 'Cache-Control': 's-maxage=55, stale-while-revalidate=10' } }
    );
  } catch (error) {
    console.error('Markets API error:', error);
    return NextResponse.json({ error: 'Failed to fetch market data' }, { status: 500 });
  }
}
