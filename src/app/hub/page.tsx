'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

// ── Types ────────────────────────────────────────────────────────────────────

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
  source?: 'live' | 'simulated';
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

// ── Quantum helpers ──────────────────────────────────────────────────────────

function calculateQuantumLevels(high: number, low: number): QuantumLevel[] {
  const range = high - low;
  return Array.from({ length: 9 }, (_, n) => {
    const price = low + range * Math.pow(n / 8, 2);
    return {
      level: `Q${n}`,
      price: Math.round(price * 10000) / 10000,
      type: n <= 3 ? 'buy' : n >= 6 ? 'sell' : 'neutral',
      strength: n === 0 || n === 8 ? 100 : n === 4 ? 80 : 60,
    } as QuantumLevel;
  });
}

function deriveSignal(price: number, levels: QuantumLevel[]): 'BUY' | 'SELL' | 'WAIT' {
  const nearest = levels.reduce((p, c) =>
    Math.abs(c.price - price) < Math.abs(p.price - price) ? c : p
  );
  return nearest.type === 'buy' ? 'BUY' : nearest.type === 'sell' ? 'SELL' : 'WAIT';
}

function generateAIAnalysis(symbol: string, price: number, levels: QuantumLevel[]): string {
  const nearest = levels.reduce((p, c) =>
    Math.abs(c.price - price) < Math.abs(p.price - price) ? c : p
  );
  const pct = ((price - nearest.price) / price * 100).toFixed(2);
  const zone = nearest.type === 'buy' ? 'accumulation' : nearest.type === 'sell' ? 'distribution' : 'equilibrium';
  const dir = parseFloat(pct) > 0 ? 'above' : 'below';
  const bias = nearest.type === 'buy' ? 'bullish accumulation' : nearest.type === 'sell' ? 'bearish distribution' : 'consolidation';
  const opts = [
    `Price is ${Math.abs(parseFloat(pct))}% ${dir} ${nearest.level} (${nearest.price}), a key ${zone} zone. Watch for reversal confirmation before entry.`,
    `${nearest.level} at ${nearest.price} is the nearest quantum reference. The ${zone} zone suggests ${bias} may be underway. Confidence: ${nearest.strength}%.`,
    `Quantum structure places ${symbol} within the ${zone} zone near ${nearest.level}. ${bias.charAt(0).toUpperCase() + bias.slice(1)} patterns are prevalent at this level.`,
  ];
  return opts[Math.floor(Math.random() * opts.length)];
}

function buildMarket(raw: Omit<MarketData, 'levels' | 'signal' | 'aiAnalysis'>): MarketData {
  const levels = calculateQuantumLevels(raw.high, raw.low);
  return { ...raw, levels, signal: deriveSignal(raw.price, levels), aiAnalysis: generateAIAnalysis(raw.symbol, raw.price, levels) };
}

// ── Static signals (demo) ────────────────────────────────────────────────────

const DEMO_SIGNALS: Signal[] = [
  { id: '1', symbol: 'XAU/USD', type: 'BUY',  price: 2632.50, level: 'Q3', time: '02:14',  confidence: 87 },
  { id: '2', symbol: 'BTC/USD', type: 'BUY',  price: 66800,   level: 'Q2', time: '14:52',  confidence: 92 },
  { id: '3', symbol: 'EUR/USD', type: 'SELL', price: 1.0920,  level: 'Q6', time: '32:07',  confidence: 78 },
  { id: '4', symbol: 'SPX500',  type: 'BUY',  price: 5198,    level: 'Q4', time: '01:14h', confidence: 85 },
  { id: '5', symbol: 'ETH/USD', type: 'SELL', price: 3580,    level: 'Q7', time: '02:03h', confidence: 73 },
];

// ── Formatters ───────────────────────────────────────────────────────────────

function fmt(market: Pick<MarketData, 'symbol'>, price: number): string {
  if (market.symbol === 'USD/JPY') return price.toFixed(2);
  if (market.symbol === 'BTC/USD' || market.symbol === 'SPX500' || market.symbol === 'NAS100') return price.toFixed(0);
  return price.toFixed(price < 10 ? 4 : 2);
}

// ── SVG icons ────────────────────────────────────────────────────────────────

function IconRefresh({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );
}

function IconChevron({ up }: { up: boolean }) {
  return (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={up ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'} />
    </svg>
  );
}

// ── Paywalls ─────────────────────────────────────────────────────────────────

function SignalPaywall({ viewed, limit }: { viewed: number; limit: number }) {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center">
      <div className="absolute inset-0 backdrop-blur-sm bg-[#0d1421]/80" />
      <div className="relative z-10 w-full max-w-[280px] mx-auto">
        <div className="bg-[#131c2e] border border-[#1e2a3a] rounded-lg p-6">
          <div className="mb-4">
            <p className="text-[#8a9bb3] text-xs uppercase tracking-widest mb-1">Access Restricted</p>
            <h3 className="text-white text-base font-semibold">
              {limit} free signals used
            </h3>
          </div>
          <div className="border-t border-[#1e2a3a] pt-4 mb-4">
            <p className="text-[#8a9bb3] text-xs leading-relaxed mb-3">
              Upgrade to Signal Hub Pro for unlimited real-time access to all markets and quantum analysis.
            </p>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-[#c9a227] font-mono text-lg font-semibold">Gs. 750.000</span>
              <span className="text-[#8a9bb3] text-xs">/ month</span>
            </div>
            <p className="text-[#8a9bb3] text-xs">$120 USD equivalent</p>
          </div>
          <Link
            href="/billing"
            className="block w-full bg-[#c9a227] hover:bg-[#d4af37] text-black text-sm font-semibold py-2.5 px-4 rounded text-center transition-colors"
          >
            Upgrade to Pro
          </Link>
          <p className="text-[#8a9bb3] text-xs text-center mt-3">{viewed} / {limit} free signals used</p>
        </div>
      </div>
    </div>
  );
}

function LoginGate() {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center">
      <div className="absolute inset-0 backdrop-blur-sm bg-[#0d1421]/80" />
      <div className="relative z-10 w-full max-w-[280px] mx-auto">
        <div className="bg-[#131c2e] border border-[#1e2a3a] rounded-lg p-6">
          <p className="text-[#8a9bb3] text-xs uppercase tracking-widest mb-1">Authentication Required</p>
          <h3 className="text-white text-base font-semibold mb-3">Sign in to view signals</h3>
          <p className="text-[#8a9bb3] text-xs leading-relaxed mb-4">
            Free accounts get 3 lifetime signals. No credit card required.
          </p>
          <Link
            href="/login?redirect=/hub"
            className="block w-full bg-[#c9a227] hover:bg-[#d4af37] text-black text-sm font-semibold py-2.5 px-4 rounded text-center transition-colors mb-2"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="block w-full border border-[#1e2a3a] hover:border-[#8a9bb3] text-[#8a9bb3] hover:text-white text-sm font-medium py-2.5 px-4 rounded text-center transition-colors"
          >
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────

export default function QuantumSignalHub() {
  const { data: session, status: authStatus } = useSession();
  const [markets, setMarkets] = useState<MarketData[]>([]);
  const [selected, setSelected] = useState<MarketData | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'FX' | 'CRYPTO' | 'INDEX'>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [secondsAgo, setSecondsAgo] = useState(0);
  const [fetchError, setFetchError] = useState(false);
  const [signalAccess, setSignalAccess] = useState<SignalAccess | null>(null);
  const incrementedRef = useRef(false);

  // ── Market fetch ───────────────────────────────────────────────────────────
  const fetchMarkets = useCallback(async () => {
    try {
      const res = await fetch('/api/markets');
      const data = await res.json();
      if (!data.markets) throw new Error('empty');

      setMarkets(prev => {
        const bySymbol = new Map((data.markets as Omit<MarketData, 'levels' | 'signal' | 'aiAnalysis'>[]).map(m => [m.symbol, m]));
        const fresh = data.markets.map((r: Omit<MarketData, 'levels' | 'signal' | 'aiAnalysis'>) => buildMarket(r));
        // Preserve any locally-known markets not returned by API
        const extras = prev.filter(p => !bySymbol.has(p.symbol));
        return [...fresh, ...extras];
      });

      setLastUpdated(Date.now());
      setSecondsAgo(0);
      setFetchError(false);
    } catch {
      setFetchError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMarkets();
    const id = setInterval(fetchMarkets, 30_000);
    return () => clearInterval(id);
  }, [fetchMarkets]);

  useEffect(() => {
    if (!lastUpdated) return;
    const id = setInterval(() => setSecondsAgo(Math.floor((Date.now() - lastUpdated) / 1000)), 1000);
    return () => clearInterval(id);
  }, [lastUpdated]);

  // Sync selected with latest market data
  useEffect(() => {
    if (markets.length === 0) return;
    if (!selected) { setSelected(markets[0]); return; }
    const updated = markets.find(m => m.symbol === selected.symbol);
    if (updated) setSelected(updated);
  }, [markets]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auth / signal access ───────────────────────────────────────────────────
  useEffect(() => {
    if (authStatus === 'loading') return;
    if (!session) {
      setSignalAccess({ canView: false, isPro: false, viewed: 0, limit: 3, reason: 'unauthenticated' });
      return;
    }
    fetch('/api/signals/check-limit')
      .then(r => r.json())
      .then((d: SignalAccess) => setSignalAccess(d))
      .catch(() => setSignalAccess({ canView: false, isPro: false, viewed: 0, limit: 3 }));
  }, [authStatus, session]);

  useEffect(() => {
    if (!signalAccess?.canView || signalAccess.isPro || incrementedRef.current) return;
    incrementedRef.current = true;
    fetch('/api/signals/increment-view', { method: 'POST' })
      .then(r => r.json())
      .then(d => setSignalAccess(p => p ? { ...p, viewed: d.viewed } : p))
      .catch(() => {});
  }, [signalAccess]);

  // ── Derived ────────────────────────────────────────────────────────────────
  const filtered = markets.filter(m => {
    if (filter === 'FX')     return ['EUR/USD', 'GBP/USD', 'USD/JPY'].includes(m.symbol);
    if (filter === 'CRYPTO') return ['BTC/USD', 'ETH/USD'].includes(m.symbol);
    if (filter === 'INDEX')  return ['SPX500', 'NAS100'].includes(m.symbol);
    return true;
  });

  const showGate       = signalAccess !== null && !signalAccess.canView;
  const isUnauthed     = signalAccess?.reason === 'unauthenticated';
  const isLimitReached = signalAccess?.reason === 'limit_reached';

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoading || authStatus === 'loading') {
    return (
      <div className="min-h-screen bg-[#0d1421] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#c9a227] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-[#8a9bb3] text-sm tracking-wide">LOADING MARKET DATA</p>
        </div>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0d1421] text-white font-['Inter',system-ui,sans-serif]">

      {/* ── Header ── */}
      <header className="bg-[#0d1421] border-b border-[#1e2a3a] sticky top-0 z-50">
        <div className="max-w-[1800px] mx-auto px-4 h-12 flex items-center justify-between">

          <Link href="/" className="flex items-center gap-3">
            <div className="w-7 h-7 border border-[#c9a227] flex items-center justify-center">
              <span className="text-[#c9a227] text-xs font-bold tracking-widest">Q</span>
            </div>
            <span className="text-white text-xs font-semibold tracking-[0.2em] uppercase">
              Quantum Signal Hub
            </span>
            <span className="hidden sm:block text-[#1e2a3a] text-xs">|</span>
            <span className="hidden sm:block text-[#8a9bb3] text-xs tracking-wide">Sacred Levels</span>
          </Link>

          <div className="flex items-center gap-5">
            {/* Live dot */}
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-[#00d26a] rounded-full animate-pulse" />
              <span className="text-[#00d26a] text-xs font-medium tracking-wide">
                {lastUpdated
                  ? secondsAgo < 5 ? 'LIVE' : `${secondsAgo}s`
                  : 'LIVE'}
              </span>
            </div>

            {/* Refresh */}
            <button onClick={fetchMarkets} title="Refresh" className="text-[#8a9bb3] hover:text-white transition-colors">
              <IconRefresh className="w-3.5 h-3.5" />
            </button>

            {/* Signal counter */}
            {signalAccess && !signalAccess.isPro && session && (
              <span className="hidden md:block text-[#8a9bb3] text-xs">
                SIGNALS{' '}
                <span className={`font-mono font-semibold ${signalAccess.viewed >= signalAccess.limit ? 'text-[#ff4757]' : 'text-[#c9a227]'}`}>
                  {signalAccess.limit - signalAccess.viewed}
                </span>
                /{signalAccess.limit}
              </span>
            )}

            {signalAccess?.isPro && (
              <span className="hidden md:block text-[#c9a227] text-xs font-semibold tracking-wider">PRO</span>
            )}

            <Link href="/quantum" className="text-[#8a9bb3] hover:text-white text-xs transition-colors tracking-wide">
              CALCULATOR
            </Link>

            <Link
              href="/billing"
              className="bg-[#c9a227] hover:bg-[#d4af37] text-black text-xs font-semibold px-3 py-1.5 tracking-wide transition-colors"
            >
              UPGRADE
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-[1800px] mx-auto px-4 py-4">

        {/* ── Error bar ── */}
        {fetchError && (
          <div className="mb-3 px-3 py-2 bg-[#131c2e] border-l-2 border-[#ff4757] text-[#ff4757] text-xs flex items-center gap-3">
            <span>MARKET DATA UNAVAILABLE — showing last known prices</span>
            <button onClick={fetchMarkets} className="ml-auto text-[#8a9bb3] hover:text-white underline transition-colors">
              RETRY
            </button>
          </div>
        )}

        {/* ── Stats row ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#1e2a3a] mb-4">
          {[
            { label: 'ACTIVE SIGNALS', value: '24', sub: '+5 TODAY',     subColor: '#00d26a', accent: '#c9a227' },
            { label: 'WIN RATE',       value: '78.5%', sub: 'LAST 30D',  subColor: '#8a9bb3', accent: '#00d26a' },
            { label: 'MARKETS',        value: String(markets.length), sub: `${markets.filter(m => m.source === 'live').length} LIVE`, subColor: '#4a9eff', accent: '#4a9eff' },
            { label: 'AVG CONFIDENCE', value: '85%',  sub: 'AI MODEL',   subColor: '#8a9bb3', accent: '#c9a227' },
          ].map(s => (
            <div key={s.label} className="bg-[#131c2e] p-4" style={{ borderLeft: `2px solid ${s.accent}` }}>
              <p className="text-[#8a9bb3] text-[10px] uppercase tracking-widest mb-1">{s.label}</p>
              <p className="text-white font-mono text-2xl font-semibold">{s.value}</p>
              <p className="text-[10px] mt-0.5 tracking-wide" style={{ color: s.subColor }}>{s.sub}</p>
            </div>
          ))}
        </div>

        {/* ── Main grid ── */}
        <div className="grid lg:grid-cols-[320px_1fr_300px] gap-px bg-[#1e2a3a]">

          {/* ── Left: Market table ── */}
          <div className="bg-[#0d1421]">

            {/* Filter tabs */}
            <div className="flex border-b border-[#1e2a3a]">
              {(['ALL', 'FX', 'CRYPTO', 'INDEX'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`flex-1 py-2 text-[10px] font-semibold tracking-widest transition-colors ${
                    filter === f
                      ? 'text-[#c9a227] border-b border-[#c9a227] -mb-px'
                      : 'text-[#8a9bb3] hover:text-white'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Column headers */}
            <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2 px-3 py-1.5 border-b border-[#1e2a3a]">
              <span className="text-[#8a9bb3] text-[9px] uppercase tracking-widest">Symbol</span>
              <span className="text-[#8a9bb3] text-[9px] uppercase tracking-widest text-right">Price</span>
              <span className="text-[#8a9bb3] text-[9px] uppercase tracking-widest text-right">Chg%</span>
              <span className="text-[#8a9bb3] text-[9px] uppercase tracking-widest text-right">Signal</span>
            </div>

            {/* Rows */}
            <div>
              {filtered.map(m => {
                const isSelected = selected?.symbol === m.symbol;
                const up = m.changePercent >= 0;
                return (
                  <div
                    key={m.symbol}
                    onClick={() => setSelected(m)}
                    className={`grid grid-cols-[1fr_auto_auto_auto] gap-2 items-center px-3 py-2.5 cursor-pointer border-b border-[#1e2a3a] transition-colors ${
                      isSelected ? 'bg-[#131c2e]' : 'hover:bg-[#131c2e]/60'
                    }`}
                    style={isSelected ? { borderLeft: '2px solid #c9a227' } : { borderLeft: '2px solid transparent' }}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-white text-xs font-semibold">{m.symbol}</span>
                        {m.source === 'live' && <span className="w-1 h-1 bg-[#00d26a] rounded-full" />}
                      </div>
                      <span className="text-[#8a9bb3] text-[10px]">{m.name}</span>
                    </div>
                    <span className="font-mono text-xs text-white text-right">{fmt(m, m.price)}</span>
                    <span className={`font-mono text-xs text-right flex items-center gap-0.5 justify-end ${up ? 'text-[#00d26a]' : 'text-[#ff4757]'}`}>
                      <IconChevron up={up} />
                      {Math.abs(m.changePercent).toFixed(2)}%
                    </span>
                    <span className={`text-[10px] font-semibold tracking-wide text-right ${
                      m.signal === 'BUY' ? 'text-[#00d26a]' : m.signal === 'SELL' ? 'text-[#ff4757]' : 'text-[#8a9bb3]'
                    }`}>
                      {m.signal}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Last updated */}
            {lastUpdated && (
              <div className="px-3 py-2 border-t border-[#1e2a3a]">
                <p className="text-[#8a9bb3] text-[9px] tracking-widest uppercase">
                  Updated {secondsAgo}s ago · auto-refresh 30s
                </p>
              </div>
            )}
          </div>

          {/* ── Center: Detail + Levels ── */}
          <div className="bg-[#0d1421]">
            {selected ? (
              <>
                {/* Market header */}
                <div className="border-b border-[#1e2a3a] p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <h2 className="text-white text-xl font-semibold tracking-tight">{selected.symbol}</h2>
                        <span className={`text-[9px] font-semibold tracking-widest px-1.5 py-0.5 ${
                          selected.source === 'live'
                            ? 'bg-[#00d26a]/10 text-[#00d26a]'
                            : 'bg-[#c9a227]/10 text-[#c9a227]'
                        }`}>
                          {selected.source === 'live' ? 'LIVE' : 'SIM'}
                        </span>
                      </div>
                      <p className="text-[#8a9bb3] text-xs">{selected.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-mono text-2xl font-semibold">{fmt(selected, selected.price)}</p>
                      <p className={`flex items-center justify-end gap-1 text-sm font-mono ${selected.changePercent >= 0 ? 'text-[#00d26a]' : 'text-[#ff4757]'}`}>
                        <IconChevron up={selected.changePercent >= 0} />
                        {Math.abs(selected.changePercent).toFixed(2)}%
                        <span className="text-[#8a9bb3] text-xs ml-1">({selected.changePercent >= 0 ? '+' : ''}{fmt(selected, selected.change)})</span>
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-xs mt-3">
                    <div>
                      <p className="text-[#8a9bb3] text-[9px] uppercase tracking-widest mb-0.5">24H HIGH</p>
                      <p className="font-mono text-white">{fmt(selected, selected.high)}</p>
                    </div>
                    <div>
                      <p className="text-[#8a9bb3] text-[9px] uppercase tracking-widest mb-0.5">24H LOW</p>
                      <p className="font-mono text-white">{fmt(selected, selected.low)}</p>
                    </div>
                    <div>
                      <p className="text-[#8a9bb3] text-[9px] uppercase tracking-widest mb-0.5">RANGE</p>
                      <p className="font-mono text-white">{fmt(selected, selected.high - selected.low)}</p>
                    </div>
                  </div>
                </div>

                {/* AI Analysis */}
                <div className="border-b border-[#1e2a3a] p-4" style={{ borderLeft: '2px solid #c9a227' }}>
                  <p className="text-[#8a9bb3] text-[9px] uppercase tracking-widest mb-2">Quantum AI Analysis</p>
                  <p className="text-[#8a9bb3] text-xs leading-relaxed">{selected.aiAnalysis}</p>
                </div>

                {/* Quantum Levels table */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[#8a9bb3] text-[9px] uppercase tracking-widest">Quantum Levels</p>
                    <span className={`text-xs font-semibold tracking-wide ${
                      selected.signal === 'BUY' ? 'text-[#00d26a]' : selected.signal === 'SELL' ? 'text-[#ff4757]' : 'text-[#8a9bb3]'
                    }`}>
                      {selected.signal}
                    </span>
                  </div>

                  {/* Table header */}
                  <div className="grid grid-cols-[40px_1fr_60px_50px] gap-2 mb-1 px-1">
                    <span className="text-[#8a9bb3] text-[9px] uppercase tracking-widest">Lvl</span>
                    <span className="text-[#8a9bb3] text-[9px] uppercase tracking-widest">Strength</span>
                    <span className="text-[#8a9bb3] text-[9px] uppercase tracking-widest text-right">Price</span>
                    <span className="text-[#8a9bb3] text-[9px] uppercase tracking-widest text-right">Zone</span>
                  </div>

                  <div>
                    {[...selected.levels].reverse().map(lv => {
                      const near = Math.abs(lv.price - selected.price) / selected.price < 0.01;
                      const col = lv.type === 'buy' ? '#00d26a' : lv.type === 'sell' ? '#ff4757' : '#c9a227';
                      return (
                        <div
                          key={lv.level}
                          className={`grid grid-cols-[40px_1fr_60px_50px] gap-2 items-center px-1 py-1.5 border-b border-[#1e2a3a]/50 ${near ? 'bg-[#c9a227]/5' : ''}`}
                        >
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs font-semibold" style={{ color: col }}>{lv.level}</span>
                            {near && <span className="w-1 h-1 bg-[#c9a227] rounded-full animate-pulse" />}
                          </div>
                          <div className="h-0.5 bg-[#1e2a3a] rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all" style={{ width: `${lv.strength}%`, backgroundColor: col }} />
                          </div>
                          <span className="font-mono text-[11px] text-white text-right">{fmt(selected, lv.price)}</span>
                          <span className="text-[9px] text-right uppercase tracking-wide" style={{ color: col }}>
                            {lv.type === 'buy' ? 'ACCUM' : lv.type === 'sell' ? 'DIST' : 'EQ'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full p-8">
                <p className="text-[#8a9bb3] text-xs tracking-wide">SELECT A MARKET</p>
              </div>
            )}
          </div>

          {/* ── Right: Signals feed ── */}
          <div className="bg-[#0d1421]">

            {/* Signals section */}
            <div className="relative overflow-hidden" style={{ minHeight: 380 }}>
              <div className="border-b border-[#1e2a3a] px-4 py-2.5 flex items-center justify-between">
                <p className="text-[#8a9bb3] text-[9px] uppercase tracking-widest">Live Signals</p>
                {signalAccess && !signalAccess.isPro && session && !showGate && (
                  <span className="text-[#8a9bb3] text-[9px]">
                    <span className={`font-mono ${signalAccess.viewed >= signalAccess.limit ? 'text-[#ff4757]' : 'text-[#c9a227]'}`}>
                      {signalAccess.limit - signalAccess.viewed}
                    </span>/{signalAccess.limit} FREE
                  </span>
                )}
              </div>

              <div>
                {DEMO_SIGNALS.map((sig, i) => (
                  <div key={sig.id} className={`px-4 py-3 ${i < DEMO_SIGNALS.length - 1 ? 'border-b border-[#1e2a3a]' : ''}`}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-bold tracking-widest px-1.5 py-0.5 ${
                          sig.type === 'BUY'
                            ? 'bg-[#00d26a]/10 text-[#00d26a]'
                            : 'bg-[#ff4757]/10 text-[#ff4757]'
                        }`}>
                          {sig.type}
                        </span>
                        <span className="text-white text-xs font-semibold">{sig.symbol}</span>
                      </div>
                      <span className="text-[#8a9bb3] text-[10px] font-mono">{sig.time}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#8a9bb3] text-[10px] font-mono">
                        @ {sig.price} <span className="text-[#4a9eff]">{sig.level}</span>
                      </span>
                      <div className="flex items-center gap-1.5">
                        <div className="w-12 h-0.5 bg-[#1e2a3a] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${sig.confidence}%`,
                              backgroundColor: sig.confidence >= 80 ? '#00d26a' : sig.confidence >= 60 ? '#c9a227' : '#ff4757',
                            }}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-white">{sig.confidence}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {showGate && isUnauthed   && <LoginGate />}
              {showGate && isLimitReached && <SignalPaywall viewed={signalAccess!.viewed} limit={signalAccess!.limit} />}
            </div>

            {/* Actions */}
            <div className="border-t border-[#1e2a3a] p-4 space-y-2">
              <p className="text-[#8a9bb3] text-[9px] uppercase tracking-widest mb-3">Actions</p>

              <Link
                href="/quantum"
                className="flex items-center justify-between w-full px-3 py-2.5 bg-[#131c2e] border border-[#1e2a3a] hover:border-[#c9a227] text-white text-xs font-medium transition-colors"
              >
                <span>Open Calculator</span>
                <span className="text-[#8a9bb3] text-[10px]">→</span>
              </Link>

              {!signalAccess?.isPro && (
                <Link
                  href="/billing"
                  className="flex items-center justify-between w-full px-3 py-2.5 bg-[#c9a227] hover:bg-[#d4af37] text-black text-xs font-semibold transition-colors"
                >
                  <span>Unlock Signal Hub Pro</span>
                  <span className="text-[9px] font-mono">Gs. 750.000</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-[#1e2a3a] mt-4 py-3">
        <div className="max-w-[1800px] mx-auto px-4 flex items-center justify-between">
          <p className="text-[#8a9bb3] text-[10px] tracking-wide">
            QUANTUM SIGNAL HUB · SACRED LEVELS © 2026
          </p>
          <p className="text-[#8a9bb3] text-[10px] tracking-wide">
            CRYPTO: BINANCE · FX/GOLD/INDICES: YAHOO FINANCE
          </p>
        </div>
      </footer>
    </div>
  );
}
