'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

// Types
interface QuantumLevel {
  level: string;
  price: number;
  type: 'buy' | 'sell' | 'neutral';
  strength: number;
}

interface MarketData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  levels: QuantumLevel[];
  signal: 'BUY' | 'SELL' | 'WAIT';
  aiAnalysis: string;
  source?: 'live' | 'fallback' | 'simulated';
}

interface Signal {
  id: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  price: number;
  level: string;
  time: string;
  confidence: number;
}

interface SignalAccess {
  canView: boolean;
  isPro: boolean;
  viewed: number;
  limit: number;
  reason?: string;
}

// ── Quantum helpers ─────────────────────────────────────────────────────────

function calculateQuantumLevels(high: number, low: number): QuantumLevel[] {
  const range = high - low;
  const levels: QuantumLevel[] = [];

  for (let n = 0; n <= 8; n++) {
    const position = Math.pow(n / 8, 2);
    const price = low + range * position;
    levels.push({
      level: `Q${n}`,
      price: Math.round(price * 10000) / 10000,
      type: n <= 3 ? 'buy' : n >= 6 ? 'sell' : 'neutral',
      strength: n === 0 || n === 8 ? 100 : n === 4 ? 80 : 60,
    });
  }

  return levels;
}

function deriveSignal(price: number, levels: QuantumLevel[]): 'BUY' | 'SELL' | 'WAIT' {
  const nearest = levels.reduce((prev, curr) =>
    Math.abs(curr.price - price) < Math.abs(prev.price - price) ? curr : prev
  );
  if (nearest.type === 'buy') return 'BUY';
  if (nearest.type === 'sell') return 'SELL';
  return 'WAIT';
}

function generateAIAnalysis(symbol: string, price: number, levels: QuantumLevel[]): string {
  const nearest = levels.reduce((prev, curr) =>
    Math.abs(curr.price - price) < Math.abs(prev.price - price) ? curr : prev
  );
  const distance = ((price - nearest.price) / price * 100).toFixed(2);
  const zone = nearest.type === 'buy' ? 'accumulation' : nearest.type === 'sell' ? 'distribution' : 'equilibrium';

  const analyses = [
    `${symbol} is currently trading near ${nearest.level} (${nearest.price}), a key ${zone} zone. Price is ${Math.abs(parseFloat(distance))}% ${parseFloat(distance) > 0 ? 'above' : 'below'} this level. Watch for potential reversal signals.`,
    `Quantum analysis shows ${symbol} approaching critical ${nearest.level} level. The ${zone} zone suggests ${nearest.type === 'buy' ? 'bullish accumulation' : nearest.type === 'sell' ? 'bearish distribution' : 'consolidation'} in progress.`,
    `${symbol} at ${price.toFixed(nearest.price < 10 ? 4 : 2)} is testing the ${nearest.level} quantum level. Historical data suggests high probability reversals at this ${zone} zone. Confidence: ${nearest.strength}%.`,
  ];

  return analyses[Math.floor(Math.random() * analyses.length)];
}

// ── Static mock for markets not covered by free APIs ────────────────────────

const SIMULATED_EXTRA: Omit<MarketData, 'levels' | 'signal' | 'aiAnalysis'>[] = [
  { symbol: 'SPX500', name: 'S&P 500', price: 5234.50, change: 28.75, changePercent: 0.55, high: 5400, low: 4800, source: 'simulated' },
  { symbol: 'NAS100', name: 'NASDAQ 100', price: 18456, change: -124, changePercent: -0.67, high: 19500, low: 17000, source: 'simulated' },
  { symbol: 'USD/JPY', name: 'Dollar/Yen', price: 154.25, change: -0.85, changePercent: -0.55, high: 160, low: 145, source: 'simulated' },
];

function buildMarket(raw: Omit<MarketData, 'levels' | 'signal' | 'aiAnalysis'>): MarketData {
  const levels = calculateQuantumLevels(raw.high, raw.low);
  const signal = deriveSignal(raw.price, levels);
  const aiAnalysis = generateAIAnalysis(raw.symbol, raw.price, levels);
  return { ...raw, levels, signal, aiAnalysis };
}

// ── Recent Signals (static demo) ────────────────────────────────────────────

const recentSignals: Signal[] = [
  { id: '1', symbol: 'XAU/USD', type: 'BUY', price: 2632.50, level: 'Q3', time: '2 min ago', confidence: 87 },
  { id: '2', symbol: 'BTC/USD', type: 'BUY', price: 66800, level: 'Q2', time: '15 min ago', confidence: 92 },
  { id: '3', symbol: 'EUR/USD', type: 'SELL', price: 1.0920, level: 'Q6', time: '32 min ago', confidence: 78 },
  { id: '4', symbol: 'SPX500', type: 'BUY', price: 5198, level: 'Q4', time: '1 hr ago', confidence: 85 },
  { id: '5', symbol: 'ETH/USD', type: 'SELL', price: 3580, level: 'Q7', time: '2 hr ago', confidence: 73 },
];

// ── Price formatter ──────────────────────────────────────────────────────────

function formatPrice(market: MarketData, price: number): string {
  if (market.symbol.includes('JPY')) return price.toFixed(2);
  if (market.symbol.includes('BTC') || market.symbol.includes('SPX') || market.symbol.includes('NAS')) return price.toFixed(0);
  return price.toFixed(price < 10 ? 4 : 2);
}

// ── Paywall overlay ──────────────────────────────────────────────────────────

function SignalPaywall({ viewed, limit }: { viewed: number; limit: number }) {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center rounded-xl">
      <div className="absolute inset-0 backdrop-blur-md bg-[#0a0a0a]/70 rounded-xl" />
      <div className="relative z-10 text-center px-6 py-8 max-w-xs mx-auto">
        <div className="text-5xl mb-4">🔒</div>
        <h3 className="text-white text-xl font-bold mb-2">
          You&apos;ve used all {limit} free signals
        </h3>
        <p className="text-gray-400 text-sm mb-6 leading-relaxed">
          Upgrade to Signal Hub Pro for unlimited access to all markets and AI analysis.
        </p>
        <div className="bg-white/5 border border-emerald-500/30 rounded-xl p-4 mb-6">
          <p className="text-emerald-400 font-bold text-lg">Signal Hub Pro</p>
          <p className="text-white font-extrabold text-2xl mt-1">Gs. 750.000</p>
          <p className="text-gray-400 text-xs mt-1">$120 USD / month</p>
        </div>
        <Link
          href="/billing"
          className="block w-full bg-gradient-to-r from-emerald-400 to-cyan-500 text-black font-bold py-3 rounded-xl hover:from-emerald-300 hover:to-cyan-400 transition-all"
        >
          Unlock Now
        </Link>
        <p className="text-gray-600 text-xs mt-4">{viewed}/{limit} free signals used</p>
      </div>
    </div>
  );
}

function LoginGate() {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center rounded-xl">
      <div className="absolute inset-0 backdrop-blur-md bg-[#0a0a0a]/70 rounded-xl" />
      <div className="relative z-10 text-center px-6 py-8 max-w-xs mx-auto">
        <div className="text-5xl mb-4">🔐</div>
        <h3 className="text-white text-xl font-bold mb-2">Login to view signals</h3>
        <p className="text-gray-400 text-sm mb-6 leading-relaxed">
          Create a free account to get 3 free signals. No credit card required.
        </p>
        <Link
          href="/login?redirect=/hub"
          className="block w-full bg-[#c9a227] hover:bg-[#d4af37] text-black font-bold py-3 rounded-xl transition-all mb-3"
        >
          Login
        </Link>
        <Link
          href="/register"
          className="block w-full border border-gray-700 hover:border-gray-500 text-white font-bold py-3 rounded-xl transition-all"
        >
          Create Free Account
        </Link>
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export default function QuantumSignalHub() {
  const { data: session, status: authStatus } = useSession();
  const [markets, setMarkets] = useState<MarketData[]>(() =>
    SIMULATED_EXTRA.map(buildMarket)
  );
  const [selectedMarket, setSelectedMarket] = useState<MarketData | null>(null);
  const [filter, setFilter] = useState<'all' | 'forex' | 'crypto' | 'indices'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [secondsAgo, setSecondsAgo] = useState(0);
  const [fetchError, setFetchError] = useState(false);
  const [signalAccess, setSignalAccess] = useState<SignalAccess | null>(null);
  const incrementedRef = useRef(false);

  // ── Fetch real market data ─────────────────────────────────────────────────
  const fetchMarkets = useCallback(async () => {
    try {
      const res = await fetch('/api/markets');
      const data = await res.json();

      if (!data.markets) throw new Error('No markets in response');

      setMarkets(prev => {
        const apiBySymbol = new Map(
          (data.markets as Omit<MarketData, 'levels' | 'signal' | 'aiAnalysis'>[]).map(m => [m.symbol, m])
        );

        // Build the ordered list: API markets first, then simulated extras
        const apiMarkets = data.markets.map((raw: Omit<MarketData, 'levels' | 'signal' | 'aiAnalysis'>) =>
          buildMarket(raw)
        );

        const simulated = SIMULATED_EXTRA
          .filter(m => !apiBySymbol.has(m.symbol))
          .map(raw => {
            // Try to preserve existing price if we already had it
            const existing = prev.find(p => p.symbol === raw.symbol);
            return buildMarket(existing ? { ...raw, price: existing.price, change: existing.change, changePercent: existing.changePercent } : raw);
          });

        return [...apiMarkets, ...simulated];
      });

      setLastUpdated(Date.now());
      setSecondsAgo(0);
      setFetchError(false);
    } catch (err) {
      console.error('Failed to fetch markets:', err);
      setFetchError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch + 30s polling
  useEffect(() => {
    fetchMarkets();
    const interval = setInterval(fetchMarkets, 30_000);
    return () => clearInterval(interval);
  }, [fetchMarkets]);

  // "X seconds ago" counter
  useEffect(() => {
    if (!lastUpdated) return;
    const tick = setInterval(() => {
      setSecondsAgo(Math.floor((Date.now() - lastUpdated) / 1000));
    }, 1000);
    return () => clearInterval(tick);
  }, [lastUpdated]);

  // Keep selectedMarket in sync after market updates
  useEffect(() => {
    if (!selectedMarket) {
      if (markets.length > 0) setSelectedMarket(markets[0]);
      return;
    }
    const updated = markets.find(m => m.symbol === selectedMarket.symbol);
    if (updated) setSelectedMarket(updated);
  }, [markets]); // eslint-disable-line react-hooks/exhaustive-deps

  // Check signal access once auth is resolved
  useEffect(() => {
    if (authStatus === 'loading') return;
    if (!session) {
      setSignalAccess({ canView: false, isPro: false, viewed: 0, limit: 3, reason: 'unauthenticated' });
      return;
    }
    fetch('/api/signals/check-limit')
      .then(r => r.json())
      .then((data: SignalAccess) => setSignalAccess(data))
      .catch(() => setSignalAccess({ canView: false, isPro: false, viewed: 0, limit: 3 }));
  }, [authStatus, session]);

  // Increment view once per page load when user can view signals
  useEffect(() => {
    if (!signalAccess?.canView || signalAccess.isPro || incrementedRef.current) return;
    incrementedRef.current = true;
    fetch('/api/signals/increment-view', { method: 'POST' })
      .then(r => r.json())
      .then(data => setSignalAccess(prev => prev ? { ...prev, viewed: data.viewed } : prev))
      .catch(() => {});
  }, [signalAccess]);

  const filteredMarkets = markets.filter(market => {
    if (filter === 'forex') return ['EUR/USD', 'GBP/USD', 'USD/JPY'].includes(market.symbol);
    if (filter === 'crypto') return ['BTC/USD', 'ETH/USD'].includes(market.symbol);
    if (filter === 'indices') return ['SPX500', 'NAS100'].includes(market.symbol);
    return true;
  });

  const showGate = signalAccess !== null && !signalAccess.canView;
  const isUnauthenticated = signalAccess?.reason === 'unauthenticated';
  const isLimitReached = signalAccess?.reason === 'limit_reached';

  if (isLoading || authStatus === 'loading') {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#c9a227] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading Quantum Signal Hub...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="bg-[#0a0a0a]/95 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-[1800px] mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#c9a227] to-[#a8861f] rounded-xl flex items-center justify-center text-black font-bold text-lg">
                Q
              </div>
              <div>
                <span className="text-xl font-bold text-white">Quantum Signal Hub</span>
                <span className="hidden sm:inline text-xs text-gray-500 ml-2">by Sacred Levels</span>
              </div>
            </Link>

            <div className="flex items-center gap-4">
              {/* Live indicator / last updated */}
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-green-500/20 border border-green-500/30 rounded-full">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-green-400 text-sm font-medium">
                  {lastUpdated
                    ? secondsAgo < 5
                      ? 'Just updated'
                      : `${secondsAgo}s ago`
                    : 'Live'}
                </span>
              </div>

              {/* Refresh button */}
              <button
                onClick={fetchMarkets}
                title="Refresh prices"
                className="hidden md:flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>

              {/* Free signals badge */}
              {signalAccess && !signalAccess.isPro && session && (
                <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-[#1a1a2e] border border-gray-700 rounded-full">
                  <span className="text-gray-400 text-xs">
                    Free signals:{' '}
                    <span className={`font-bold ${signalAccess.viewed >= signalAccess.limit ? 'text-red-400' : 'text-[#c9a227]'}`}>
                      {signalAccess.limit - signalAccess.viewed}
                    </span>{' '}
                    left
                  </span>
                </div>
              )}
              {signalAccess?.isPro && (
                <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
                  <span className="text-emerald-400 text-xs font-bold">✦ Signal Hub Pro</span>
                </div>
              )}

              <Link href="/quantum" className="text-gray-400 hover:text-white text-sm">
                Calculator
              </Link>
              <Link
                href="/billing"
                className="bg-gradient-to-r from-[#c9a227] to-[#a8861f] text-black px-4 py-2 rounded-lg text-sm font-bold hover:from-[#d4af37] hover:to-[#c9a227] transition-all"
              >
                Upgrade Pro
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1800px] mx-auto p-4">
        {/* Error banner */}
        {fetchError && (
          <div className="mb-4 px-4 py-3 bg-red-900/30 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2">
            <span>⚠️</span>
            <span>Could not reach market data APIs. Showing last known prices.</span>
            <button onClick={fetchMarkets} className="ml-auto underline hover:no-underline">Retry</button>
          </div>
        )}

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-[#1a1a2e] rounded-xl p-4 border border-gray-800">
            <p className="text-gray-400 text-sm">Active Signals</p>
            <p className="text-2xl font-bold text-white">24</p>
            <p className="text-green-400 text-xs">+5 today</p>
          </div>
          <div className="bg-[#1a1a2e] rounded-xl p-4 border border-gray-800">
            <p className="text-gray-400 text-sm">Win Rate</p>
            <p className="text-2xl font-bold text-green-400">78.5%</p>
            <p className="text-gray-500 text-xs">Last 30 days</p>
          </div>
          <div className="bg-[#1a1a2e] rounded-xl p-4 border border-gray-800">
            <p className="text-gray-400 text-sm">Markets Tracked</p>
            <p className="text-2xl font-bold text-white">{markets.length}</p>
            <p className="text-gray-500 text-xs">
              {markets.filter(m => m.source === 'live').length} live · {markets.filter(m => m.source !== 'live').length} simulated
            </p>
          </div>
          <div className="bg-[#1a1a2e] rounded-xl p-4 border border-gray-800">
            <p className="text-gray-400 text-sm">AI Confidence</p>
            <p className="text-2xl font-bold text-[#c9a227]">85%</p>
            <p className="text-gray-500 text-xs">Average</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Markets List */}
          <div className="lg:col-span-1">
            {/* Filter Tabs */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              {(['all', 'forex', 'crypto', 'indices'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    filter === f
                      ? 'bg-[#c9a227] text-black'
                      : 'bg-[#1a1a2e] text-gray-400 hover:text-white border border-gray-800'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            {/* Markets List */}
            <div className="space-y-2">
              {filteredMarkets.map(market => (
                <div
                  key={market.symbol}
                  onClick={() => setSelectedMarket(market)}
                  className={`p-4 rounded-xl cursor-pointer transition-all ${
                    selectedMarket?.symbol === market.symbol
                      ? 'bg-[#1a1a2e] border-2 border-[#c9a227]'
                      : 'bg-[#1a1a2e]/50 border border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{market.symbol}</span>
                      <span className="text-gray-500 text-sm">{market.name}</span>
                      {market.source === 'live' && (
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full" title="Live price" />
                      )}
                      {market.source === 'simulated' && (
                        <span className="w-1.5 h-1.5 bg-yellow-500/60 rounded-full" title="Simulated price" />
                      )}
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold ${
                        market.signal === 'BUY'
                          ? 'bg-green-500/20 text-green-400'
                          : market.signal === 'SELL'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}
                    >
                      {market.signal}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-mono text-white">{formatPrice(market, market.price)}</span>
                    <span className={`text-sm font-medium ${market.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {market.changePercent >= 0 ? '+' : ''}{market.changePercent.toFixed(2)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Last updated footer */}
            {lastUpdated && (
              <p className="text-center text-gray-600 text-xs mt-3">
                Last updated: {secondsAgo}s ago · refreshes every 30s
              </p>
            )}
          </div>

          {/* Center Column - Selected Market & Levels */}
          <div className="lg:col-span-1">
            {selectedMarket && (
              <>
                <div className="bg-[#1a1a2e] rounded-xl p-6 border border-gray-800 mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-2xl font-bold text-white">{selectedMarket.symbol}</h2>
                        {selectedMarket.source === 'live' ? (
                          <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full font-medium">Live</span>
                        ) : (
                          <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-500 text-xs rounded-full font-medium">Simulated</span>
                        )}
                      </div>
                      <p className="text-gray-400">{selectedMarket.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-mono font-bold text-white">
                        {formatPrice(selectedMarket, selectedMarket.price)}
                      </p>
                      <p className={`text-lg ${selectedMarket.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {selectedMarket.changePercent >= 0 ? '▲' : '▼'} {Math.abs(selectedMarket.changePercent).toFixed(2)}%
                      </p>
                    </div>
                  </div>

                  {/* AI Analysis Box */}
                  <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-xl p-4 border border-purple-500/30">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-purple-400">🤖</span>
                      <span className="text-purple-400 font-medium text-sm">AI Analysis</span>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed">{selectedMarket.aiAnalysis}</p>
                  </div>
                </div>

                {/* Quantum Levels */}
                <div className="bg-[#1a1a2e] rounded-xl p-6 border border-gray-800">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <span className="text-[#c9a227]">⚡</span>
                    Quantum Levels
                    <span className="text-gray-600 text-xs font-normal ml-1">H: {formatPrice(selectedMarket, selectedMarket.high)} / L: {formatPrice(selectedMarket, selectedMarket.low)}</span>
                  </h3>
                  <div className="space-y-2">
                    {[...selectedMarket.levels].reverse().map(level => {
                      const isNearPrice = Math.abs(level.price - selectedMarket.price) / selectedMarket.price < 0.01;
                      return (
                        <div
                          key={level.level}
                          className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                            isNearPrice
                              ? 'ring-2 ring-[#c9a227] bg-[#c9a227]/10'
                              : level.type === 'buy'
                              ? 'bg-green-900/20 border-l-4 border-green-500'
                              : level.type === 'sell'
                              ? 'bg-red-900/20 border-l-4 border-red-500'
                              : 'bg-yellow-900/20 border-l-4 border-yellow-500'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`font-bold ${level.type === 'buy' ? 'text-green-400' : level.type === 'sell' ? 'text-red-400' : 'text-yellow-400'}`}>
                              {level.level}
                            </span>
                            {isNearPrice && (
                              <span className="px-2 py-0.5 bg-[#c9a227] text-black text-xs rounded-full font-bold animate-pulse">
                                NEAR
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="w-20 bg-gray-800 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${level.type === 'buy' ? 'bg-green-500' : level.type === 'sell' ? 'bg-red-500' : 'bg-yellow-500'}`}
                                style={{ width: `${level.strength}%` }}
                              />
                            </div>
                            <span className="font-mono text-white w-24 text-right">
                              {formatPrice(selectedMarket, level.price)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right Column - Signals Feed (gated) */}
          <div className="lg:col-span-1">
            <div className="relative bg-[#1a1a2e] rounded-xl p-6 border border-gray-800 mb-4 overflow-hidden">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span>📡</span>
                Live Signals
                {signalAccess && !signalAccess.isPro && session && !showGate && (
                  <span className="ml-auto text-xs text-gray-500 font-normal">
                    {signalAccess.limit - signalAccess.viewed} free left
                  </span>
                )}
              </h3>
              <div className="space-y-3">
                {recentSignals.map(signal => (
                  <div key={signal.id} className="p-4 bg-[#0a0a0a] rounded-xl border border-gray-800">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${signal.type === 'BUY' ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className="font-bold text-white">{signal.symbol}</span>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${signal.type === 'BUY' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {signal.type}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">@ {signal.price} ({signal.level})</span>
                      <span className="text-gray-500">{signal.time}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs text-gray-500">Confidence:</span>
                      <div className="flex-1 bg-gray-800 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${signal.confidence >= 80 ? 'bg-green-500' : signal.confidence >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${signal.confidence}%` }}
                        />
                      </div>
                      <span className="text-xs text-white font-medium">{signal.confidence}%</span>
                    </div>
                  </div>
                ))}
              </div>

              {showGate && isUnauthenticated && <LoginGate />}
              {showGate && isLimitReached && (
                <SignalPaywall viewed={signalAccess!.viewed} limit={signalAccess!.limit} />
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-[#1a1a2e] to-[#12121f] rounded-xl p-6 border border-[#c9a227]/30">
              <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  href="/quantum"
                  className="block w-full bg-[#c9a227] hover:bg-[#d4af37] text-black py-3 rounded-xl font-bold text-center transition-all"
                >
                  Open Calculator
                </Link>
                {!signalAccess?.isPro && (
                  <Link
                    href="/billing"
                    className="block w-full bg-gradient-to-r from-emerald-400 to-cyan-500 hover:from-emerald-300 hover:to-cyan-400 text-black py-3 rounded-xl font-bold text-center transition-all"
                  >
                    🚀 Unlock Signal Hub Pro
                  </Link>
                )}
                <button className="w-full border border-gray-700 hover:border-gray-600 text-white py-3 rounded-xl font-bold transition-all">
                  🔔 Set Alert
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-800 mt-12 py-6">
        <div className="max-w-[1800px] mx-auto px-4 text-center text-gray-500 text-sm">
          <p>Quantum Signal Hub by Sacred Levels © 2026 | Crypto: Binance · Forex/Gold: Finnhub · Indices: Simulated</p>
        </div>
      </footer>
    </div>
  );
}
