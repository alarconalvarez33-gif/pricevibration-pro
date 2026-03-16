import { NextResponse } from 'next/server';

const FINNHUB_KEY = process.env.FINNHUB_API_KEY || '';

// Fallback prices in case any individual fetch fails
const FALLBACKS: Record<string, { price: number; high: number; low: number }> = {
  'BTC/USD': { price: 67000, high: 68000, low: 66000 },
  'ETH/USD': { price: 3500, high: 3600, low: 3400 },
  'EUR/USD': { price: 1.0850, high: 1.0900, low: 1.0800 },
  'GBP/USD': { price: 1.2700, high: 1.2750, low: 1.2650 },
  'XAU/USD': { price: 2640, high: 2660, low: 2620 },
};

async function safeFetch(url: string) {
  const res = await fetch(url, { next: { revalidate: 0 } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function GET() {
  try {
    // Binance (free, no key needed)
    const binancePromise = Promise.all([
      safeFetch('https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT'),
      safeFetch('https://api.binance.com/api/v3/ticker/24hr?symbol=ETHUSDT'),
    ]);

    // Finnhub forex + gold (free tier)
    const finnhubPairs = [
      { symbol: 'EUR/USD', fhSymbol: 'OANDA:EUR_USD' },
      { symbol: 'GBP/USD', fhSymbol: 'OANDA:GBP_USD' },
      { symbol: 'XAU/USD', fhSymbol: 'OANDA:XAU_USD' },
    ];

    const finnhubPromise = Promise.all(
      finnhubPairs.map(({ fhSymbol }) =>
        safeFetch(`https://finnhub.io/api/v1/quote?symbol=${fhSymbol}&token=${FINNHUB_KEY}`)
      )
    );

    const [binanceResults, finnhubResults] = await Promise.allSettled([
      binancePromise,
      finnhubPromise,
    ]);

    const markets = [];

    // --- BTC / ETH from Binance ---
    if (binanceResults.status === 'fulfilled') {
      const [btc, eth] = binanceResults.value;

      markets.push({
        symbol: 'BTC/USD',
        name: 'Bitcoin',
        price: parseFloat(btc.lastPrice),
        change: parseFloat(btc.priceChange),
        changePercent: parseFloat(btc.priceChangePercent),
        high: parseFloat(btc.highPrice),
        low: parseFloat(btc.lowPrice),
        source: 'live',
      });

      markets.push({
        symbol: 'ETH/USD',
        name: 'Ethereum',
        price: parseFloat(eth.lastPrice),
        change: parseFloat(eth.priceChange),
        changePercent: parseFloat(eth.priceChangePercent),
        high: parseFloat(eth.highPrice),
        low: parseFloat(eth.lowPrice),
        source: 'live',
      });
    } else {
      // Binance failed — use fallbacks
      console.error('Binance fetch failed:', binanceResults.reason);
      for (const sym of ['BTC/USD', 'ETH/USD']) {
        const fb = FALLBACKS[sym];
        markets.push({
          symbol: sym,
          name: sym === 'BTC/USD' ? 'Bitcoin' : 'Ethereum',
          price: fb.price,
          change: 0,
          changePercent: 0,
          high: fb.high,
          low: fb.low,
          source: 'fallback',
        });
      }
    }

    // --- EUR/USD, GBP/USD, XAU/USD from Finnhub ---
    if (finnhubResults.status === 'fulfilled') {
      const names: Record<string, string> = {
        'EUR/USD': 'Euro/Dollar',
        'GBP/USD': 'Pound/Dollar',
        'XAU/USD': 'Gold',
      };

      finnhubPairs.forEach(({ symbol }, i) => {
        const q = finnhubResults.value[i];
        // Finnhub returns c=current, d=change, dp=changePercent, h=high, l=low
        if (q && q.c > 0) {
          markets.push({
            symbol,
            name: names[symbol],
            price: q.c,
            change: q.d ?? 0,
            changePercent: q.dp ?? 0,
            high: q.h ?? q.c * 1.005,
            low: q.l ?? q.c * 0.995,
            source: 'live',
          });
        } else {
          // Finnhub returned 0 values (market closed or rate-limited)
          const fb = FALLBACKS[symbol];
          markets.push({
            symbol,
            name: names[symbol],
            price: fb.price,
            change: 0,
            changePercent: 0,
            high: fb.high,
            low: fb.low,
            source: 'fallback',
          });
        }
      });
    } else {
      console.error('Finnhub fetch failed:', finnhubResults.reason);
      const names: Record<string, string> = {
        'EUR/USD': 'Euro/Dollar',
        'GBP/USD': 'Pound/Dollar',
        'XAU/USD': 'Gold',
      };
      for (const sym of ['EUR/USD', 'GBP/USD', 'XAU/USD']) {
        const fb = FALLBACKS[sym];
        markets.push({
          symbol: sym,
          name: names[sym],
          price: fb.price,
          change: 0,
          changePercent: 0,
          high: fb.high,
          low: fb.low,
          source: 'fallback',
        });
      }
    }

    return NextResponse.json(
      { markets, timestamp: Date.now() },
      {
        headers: {
          // Cache 25 seconds on CDN — slightly less than the 30s client poll
          'Cache-Control': 's-maxage=25, stale-while-revalidate=10',
        },
      }
    );
  } catch (error) {
    console.error('Market API error:', error);
    return NextResponse.json({ error: 'Failed to fetch markets' }, { status: 500 });
  }
}
