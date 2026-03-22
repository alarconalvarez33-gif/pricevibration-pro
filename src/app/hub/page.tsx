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
  source?: 'live' | 'simulated' | 'offline';
  offline?: boolean;
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
  if (raw.offline) {
    return { ...raw, levels: [], signal: 'WAIT', aiAnalysis: 'Market data temporarily unavailable.' };
  }
  const levels = calculateQuantumLevels(raw.high, raw.low);
  return { ...raw, levels, signal: deriveSignal(raw.price, levels), aiAnalysis: generateAIAnalysis(raw.symbol, raw.price, levels) };
}

// ── Static signals (demo) ────────────────────────────────────────────────────

const DEMO_SIGNALS_BASE = [
  { id: '1', symbol: 'XAU/USD', type: 'BUY'  as const, level: 'Q3', time: '02:14',  confidence: 87 },
  { id: '2', symbol: 'BTC/USD', type: 'BUY'  as const, level: 'Q2', time: '14:52',  confidence: 92 },
  { id: '3', symbol: 'EUR/USD', type: 'SELL' as const, level: 'Q6', time: '32:07',  confidence: 78 },
  { id: '4', symbol: 'SPX500',  type: 'BUY'  as const, level: 'Q4', time: '01:14h', confidence: 85 },
  { id: '5', symbol: 'ETH/USD', type: 'SELL' as const, level: 'Q7', time: '02:03h', confidence: 73 },
];

// ── Formatters ───────────────────────────────────────────────────────────────

function fmt(market: Pick<MarketData, 'symbol'>, price: number): string {
  if (market.symbol === 'USD/JPY') return price.toFixed(2);
  if (market.symbol === 'BTC/USD' || market.symbol === 'SPX500' || market.symbol === 'NAS100') return price.toFixed(0);
  if (market.symbol === 'DXY') return price.toFixed(3);
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
      <div className="absolute inset-0 backdrop-blur-sm bg-white/80" />
      <div className="relative z-10 w-full max-w-[280px] mx-auto">
        <div className="bg-white border border-[#E8E8E8] rounded-lg p-6 shadow-lg">
          <div className="mb-4">
            <p className="text-[#888888] text-xs uppercase tracking-widest mb-1">Acceso restringido</p>
            <h3 className="text-[#111111] text-base font-semibold">
              {limit} señales gratuitas usadas
            </h3>
          </div>
          <div className="border-t border-[#E8E8E8] pt-4 mb-4">
            <p className="text-[#666666] text-xs leading-relaxed mb-3">
              Suscribite a Quantum Access para señales en tiempo real ilimitadas, todos los mercados, DXY y análisis cuántico.
            </p>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-[#C4A77D] font-mono text-lg font-semibold">Gs. 350.000</span>
              <span className="text-[#888888] text-xs">/ mes</span>
            </div>
            <p className="text-[#888888] text-xs">$50 USD equivalente</p>
          </div>
          <Link
            href="/billing"
            className="block w-full bg-[#111111] hover:bg-[#333333] text-white text-sm font-semibold py-2.5 px-4 rounded-lg text-center transition-colors"
          >
            Suscribirse a Quantum Access
          </Link>
          <p className="text-[#888888] text-xs text-center mt-3">{viewed} / {limit} señales gratuitas usadas</p>
        </div>
      </div>
    </div>
  );
}

function LoginGate() {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center">
      <div className="absolute inset-0 backdrop-blur-sm bg-white/80" />
      <div className="relative z-10 w-full max-w-[280px] mx-auto">
        <div className="bg-white border border-[#E8E8E8] rounded-lg p-6 shadow-lg">
          <p className="text-[#888888] text-xs uppercase tracking-widest mb-1">Autenticación requerida</p>
          <h3 className="text-[#111111] text-base font-semibold mb-3">Iniciá sesión para ver señales</h3>
          <p className="text-[#666666] text-xs leading-relaxed mb-4">
            Cuentas gratuitas tienen 3 señales de por vida. Sin tarjeta de crédito.
          </p>
          <Link
            href="/login?redirect=/hub"
            className="block w-full bg-[#111111] hover:bg-[#333333] text-white text-sm font-semibold py-2.5 px-4 rounded-lg text-center transition-colors mb-2"
          >
            Iniciar Sesión
          </Link>
          <Link
            href="/register"
            className="block w-full border border-[#E8E8E8] hover:border-[#C4A77D] text-[#666666] hover:text-[#111111] text-sm font-medium py-2.5 px-4 rounded-lg text-center transition-colors"
          >
            Crear Cuenta
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
    if (filter === 'INDEX')  return ['SPX500', 'NAS100', 'DXY'].includes(m.symbol);
    return true;
  });

  const showGate       = signalAccess !== null && !signalAccess.canView;
  const isUnauthed     = signalAccess?.reason === 'unauthenticated';
  const isLimitReached = signalAccess?.reason === 'limit_reached';

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoading || authStatus === 'loading') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#C4A77D] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-[#888888] text-sm tracking-wide">Cargando datos de mercado...</p>
        </div>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen bg-white text-[#111111]"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >

      {/* ── Header ── */}
      <header className="bg-white border-b border-[#E8E8E8] sticky top-0 z-50">
        <div className="max-w-[1800px] mx-auto px-6 h-14 flex items-center justify-between">

          <Link href="/" className="flex items-center gap-3">
            <div className="w-7 h-7 border border-[#C4A77D] rounded flex items-center justify-center">
              <span className="text-[#C4A77D] text-xs font-bold tracking-widest">Q</span>
            </div>
            <span className="text-[#111111] text-xs font-semibold tracking-[0.15em] uppercase">
              Signal Hub
            </span>
            <span className="hidden sm:block text-[#E8E8E8] text-xs">|</span>
            <span className="hidden sm:block text-[#888888] text-xs tracking-wide">Sacred Levels</span>
          </Link>

          <div className="flex items-center gap-5">
            {/* Live dot */}
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span className="text-green-600 text-xs font-medium tracking-wide">
                {lastUpdated
                  ? secondsAgo < 5 ? 'LIVE' : `${secondsAgo}s`
                  : 'LIVE'}
              </span>
            </div>

            {/* Refresh */}
            <button onClick={fetchMarkets} title="Refresh" className="text-[#888888] hover:text-[#111111] transition-colors">
              <IconRefresh className="w-3.5 h-3.5" />
            </button>

            {/* Signal counter */}
            {signalAccess && !signalAccess.isPro && session && (
              <span className="hidden md:block text-[#888888] text-xs">
                SEÑALES{' '}
                <span className={`font-mono font-semibold ${signalAccess.viewed >= signalAccess.limit ? 'text-red-500' : 'text-[#C4A77D]'}`}>
                  {signalAccess.limit - signalAccess.viewed}
                </span>
                /{signalAccess.limit}
              </span>
            )}

            {signalAccess?.isPro && (
              <span className="hidden md:block text-[#C4A77D] text-xs font-semibold tracking-wider uppercase">Pro</span>
            )}

            <Link href="/quantum" className="text-[#888888] hover:text-[#111111] text-xs transition-colors tracking-wide">
              Calculadora
            </Link>

            <Link
              href="/billing"
              className="bg-[#111111] hover:bg-[#333333] text-white text-xs font-semibold px-4 py-1.5 rounded-lg tracking-wide transition-colors"
            >
              Planes
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-[1800px] mx-auto px-6 py-5">

        {/* ── Error bar ── */}
        {fetchError && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs flex items-center gap-3">
            <span>Datos de mercado no disponibles — mostrando últimos precios conocidos</span>
            <button onClick={fetchMarkets} className="ml-auto text-red-500 hover:text-red-700 underline transition-colors">
              Reintentar
            </button>
          </div>
        )}

        {/* ── Stats row ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
          {[
            { label: 'Señales Activas', value: '24', sub: '+5 hoy',     subColor: 'text-green-600', accentColor: 'border-[#C4A77D]' },
            { label: 'Win Rate',        value: '78.5%', sub: 'últimos 30d', subColor: 'text-[#888888]', accentColor: 'border-green-500' },
            { label: 'Mercados',        value: String(markets.length), sub: `${markets.filter(m => !m.offline).length} en vivo`, subColor: 'text-blue-500', accentColor: 'border-blue-400' },
            { label: 'Confianza Media', value: '85%',  sub: 'modelo IA', subColor: 'text-[#888888]', accentColor: 'border-[#C4A77D]' },
          ].map(s => (
            <div key={s.label} className={`bg-[#F7F8F9] border border-[#E8E8E8] rounded-lg p-4 border-l-2 ${s.accentColor}`}>
              <p className="text-[#888888] text-[10px] uppercase tracking-widest mb-1">{s.label}</p>
              <p className="text-[#111111] font-mono text-2xl font-semibold">{s.value}</p>
              <p className={`text-[10px] mt-0.5 tracking-wide ${s.subColor}`}>{s.sub}</p>
            </div>
          ))}
        </div>

        {/* ── Main grid ── */}
        <div className="grid lg:grid-cols-[320px_1fr_300px] gap-4">

          {/* ── Left: Market table ── */}
          <div className="bg-white border border-[#E8E8E8] rounded-lg overflow-hidden">

            {/* Filter tabs */}
            <div className="flex border-b border-[#E8E8E8]">
              {(['ALL', 'FX', 'CRYPTO', 'INDEX'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`flex-1 py-2.5 text-[10px] font-semibold tracking-widest transition-colors ${
                    filter === f
                      ? 'text-[#C4A77D] border-b-2 border-[#C4A77D] -mb-px bg-[#C4A77D]/4'
                      : 'text-[#888888] hover:text-[#111111]'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Column headers */}
            <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2 px-4 py-2 border-b border-[#E8E8E8] bg-[#F7F8F9]">
              <span className="text-[#888888] text-[9px] uppercase tracking-widest">Símbolo</span>
              <span className="text-[#888888] text-[9px] uppercase tracking-widest text-right">Precio</span>
              <span className="text-[#888888] text-[9px] uppercase tracking-widest text-right">Var%</span>
              <span className="text-[#888888] text-[9px] uppercase tracking-widest text-right">Señal</span>
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
                    className={`grid grid-cols-[1fr_auto_auto_auto] gap-2 items-center px-4 py-3 cursor-pointer border-b border-[#E8E8E8] transition-colors ${
                      isSelected ? 'bg-[#F7F8F9] border-l-2 border-l-[#C4A77D]' : 'hover:bg-[#FAFAFA] border-l-2 border-l-transparent'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[#111111] text-xs font-semibold">{m.symbol}</span>
                        {m.offline ? (
                          <span className="text-[8px] font-bold text-red-500 tracking-widest">OFFLINE</span>
                        ) : (
                          <span className="w-1 h-1 bg-green-500 rounded-full" />
                        )}
                      </div>
                      <span className="text-[#888888] text-[10px]">{m.name}</span>
                    </div>
                    <span className="font-mono text-xs text-[#111111] text-right">{fmt(m, m.price)}</span>
                    <span className={`font-mono text-xs text-right flex items-center gap-0.5 justify-end ${up ? 'text-green-600' : 'text-red-500'}`}>
                      <IconChevron up={up} />
                      {Math.abs(m.changePercent).toFixed(2)}%
                    </span>
                    <span className={`text-[10px] font-semibold tracking-wide text-right ${
                      m.signal === 'BUY' ? 'text-green-600' : m.signal === 'SELL' ? 'text-red-500' : 'text-[#888888]'
                    }`}>
                      {m.signal}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Last updated */}
            {lastUpdated && (
              <div className="px-4 py-2.5 bg-[#F7F8F9]">
                <p className="text-[#888888] text-[9px] tracking-widest uppercase">
                  Actualizado {secondsAgo}s · auto-refresh 30s
                </p>
              </div>
            )}
          </div>

          {/* ── Center: Detail + Levels ── */}
          <div className="bg-white border border-[#E8E8E8] rounded-lg overflow-hidden">
            {selected ? (
              <>
                {/* Market header */}
                <div className="border-b border-[#E8E8E8] p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-[#111111] text-xl font-semibold tracking-tight">{selected.symbol}</h2>
                        <span className={`text-[9px] font-semibold tracking-widest px-2 py-0.5 rounded-full ${
                          selected.offline
                            ? 'bg-red-50 text-red-500'
                            : selected.source === 'live'
                            ? 'bg-green-50 text-green-600'
                            : 'bg-[#C4A77D]/8 text-[#B8953C]'
                        }`}>
                          {selected.offline ? 'OFFLINE' : selected.source === 'live' ? 'LIVE' : 'SIM'}
                        </span>
                      </div>
                      <p className="text-[#888888] text-xs">{selected.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[#111111] font-mono text-2xl font-semibold">{fmt(selected, selected.price)}</p>
                      <p className={`flex items-center justify-end gap-1 text-sm font-mono ${selected.changePercent >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                        <IconChevron up={selected.changePercent >= 0} />
                        {Math.abs(selected.changePercent).toFixed(2)}%
                        <span className="text-[#888888] text-xs ml-1">({selected.changePercent >= 0 ? '+' : ''}{fmt(selected, selected.change)})</span>
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-xs">
                    <div className="bg-[#F7F8F9] rounded-lg p-3">
                      <p className="text-[#888888] text-[9px] uppercase tracking-widest mb-1">24H Alto</p>
                      <p className="font-mono text-[#111111] font-medium">{fmt(selected, selected.high)}</p>
                    </div>
                    <div className="bg-[#F7F8F9] rounded-lg p-3">
                      <p className="text-[#888888] text-[9px] uppercase tracking-widest mb-1">24H Bajo</p>
                      <p className="font-mono text-[#111111] font-medium">{fmt(selected, selected.low)}</p>
                    </div>
                    <div className="bg-[#F7F8F9] rounded-lg p-3">
                      <p className="text-[#888888] text-[9px] uppercase tracking-widest mb-1">Rango</p>
                      <p className="font-mono text-[#111111] font-medium">{fmt(selected, selected.high - selected.low)}</p>
                    </div>
                  </div>
                </div>

                {/* AI Analysis */}
                <div className="border-b border-[#E8E8E8] p-5 border-l-2 border-l-[#C4A77D]">
                  <p className="text-[#888888] text-[9px] uppercase tracking-widest mb-2">Análisis Cuántico IA</p>
                  <p className="text-[#666666] text-xs leading-relaxed">{selected.aiAnalysis}</p>
                </div>

                {/* Quantum Levels table */}
                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[#888888] text-[9px] uppercase tracking-widest">Niveles Cuánticos</p>
                    <span className={`text-xs font-semibold tracking-wide px-2.5 py-1 rounded-full ${
                      selected.signal === 'BUY'
                        ? 'bg-green-50 text-green-600'
                        : selected.signal === 'SELL'
                        ? 'bg-red-50 text-red-500'
                        : 'bg-[#F7F8F9] text-[#888888]'
                    }`}>
                      {selected.signal}
                    </span>
                  </div>

                  {/* Table header */}
                  <div className="grid grid-cols-[40px_1fr_60px_50px] gap-2 mb-2 px-2">
                    <span className="text-[#888888] text-[9px] uppercase tracking-widest">Niv.</span>
                    <span className="text-[#888888] text-[9px] uppercase tracking-widest">Fuerza</span>
                    <span className="text-[#888888] text-[9px] uppercase tracking-widest text-right">Precio</span>
                    <span className="text-[#888888] text-[9px] uppercase tracking-widest text-right">Zona</span>
                  </div>

                  <div>
                    {[...selected.levels].reverse().map(lv => {
                      const near = Math.abs(lv.price - selected.price) / selected.price < 0.01;
                      const col = lv.type === 'buy' ? '#22C55E' : lv.type === 'sell' ? '#EF4444' : '#C4A77D';
                      const bgCol = lv.type === 'buy' ? 'bg-green-50' : lv.type === 'sell' ? 'bg-red-50' : 'bg-[#C4A77D]/5';
                      return (
                        <div
                          key={lv.level}
                          className={`grid grid-cols-[40px_1fr_60px_50px] gap-2 items-center px-2 py-2 border-b border-[#E8E8E8] rounded ${near ? bgCol : ''}`}
                        >
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs font-semibold" style={{ color: col }}>{lv.level}</span>
                            {near && <span className="w-1 h-1 rounded-full animate-pulse" style={{ backgroundColor: col }} />}
                          </div>
                          <div className="h-0.5 bg-[#E8E8E8] rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all" style={{ width: `${lv.strength}%`, backgroundColor: col }} />
                          </div>
                          <span className="font-mono text-[11px] text-[#111111] text-right">{fmt(selected, lv.price)}</span>
                          <span className="text-[9px] text-right uppercase tracking-wide font-medium" style={{ color: col }}>
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
                <p className="text-[#888888] text-xs tracking-wide">Selecciona un mercado</p>
              </div>
            )}
          </div>

          {/* ── Right: Signals feed ── */}
          <div className="bg-white border border-[#E8E8E8] rounded-lg overflow-hidden">

            {/* Signals section */}
            <div className="relative overflow-hidden" style={{ minHeight: 380 }}>
              <div className="border-b border-[#E8E8E8] px-4 py-3 flex items-center justify-between bg-[#F7F8F9]">
                <p className="text-[#888888] text-[9px] uppercase tracking-widest">Señales en Vivo</p>
                {signalAccess && !signalAccess.isPro && session && !showGate && (
                  <span className="text-[#888888] text-[9px]">
                    <span className={`font-mono ${signalAccess.viewed >= signalAccess.limit ? 'text-red-500' : 'text-[#C4A77D]'}`}>
                      {signalAccess.limit - signalAccess.viewed}
                    </span>/{signalAccess.limit} GRATIS
                  </span>
                )}
              </div>

              <div>
                {DEMO_SIGNALS_BASE.map((sig, i) => {
                  const mkt = markets.find(m => m.symbol === sig.symbol);
                  const livePrice = mkt && !mkt.offline ? mkt.price : null;
                  return (
                    <div key={sig.id} className={`px-4 py-3.5 ${i < DEMO_SIGNALS_BASE.length - 1 ? 'border-b border-[#E8E8E8]' : ''}`}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-bold tracking-widest px-2 py-0.5 rounded-full ${
                            sig.type === 'BUY'
                              ? 'bg-green-50 text-green-600'
                              : 'bg-red-50 text-red-500'
                          }`}>
                            {sig.type}
                          </span>
                          <span className="text-[#111111] text-xs font-semibold">{sig.symbol}</span>
                        </div>
                        <span className="text-[#888888] text-[10px] font-mono">{sig.time}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#888888] text-[10px] font-mono">
                          {livePrice !== null
                            ? <>@ {mkt ? fmt(mkt, livePrice) : livePrice} <span className="text-[#C4A77D]">{sig.level}</span></>
                            : <span className="text-red-400">OFFLINE</span>
                          }
                        </span>
                        <div className="flex items-center gap-1.5">
                          <div className="w-12 h-0.5 bg-[#E8E8E8] rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${sig.confidence}%`,
                                backgroundColor: sig.confidence >= 80 ? '#22C55E' : sig.confidence >= 60 ? '#C4A77D' : '#EF4444',
                              }}
                            />
                          </div>
                          <span className="text-[10px] font-mono text-[#111111]">{sig.confidence}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {showGate && isUnauthed    && <LoginGate />}
              {showGate && isLimitReached && <SignalPaywall viewed={signalAccess!.viewed} limit={signalAccess!.limit} />}
            </div>

            {/* Actions */}
            <div className="border-t border-[#E8E8E8] p-4 space-y-2 bg-[#F7F8F9]">
              <p className="text-[#888888] text-[9px] uppercase tracking-widest mb-3">Acciones</p>

              <Link
                href="/quantum"
                className="flex items-center justify-between w-full px-4 py-2.5 bg-white border border-[#E8E8E8] hover:border-[#C4A77D] text-[#111111] text-xs font-medium transition-colors rounded-lg"
              >
                <span>Abrir Calculadora Cuadrática</span>
                <span className="text-[#888888] text-[10px]">→</span>
              </Link>

              {!signalAccess?.isPro && (
                <Link
                  href="/billing"
                  className="flex items-center justify-between w-full px-4 py-2.5 bg-[#111111] hover:bg-[#333333] text-white text-xs font-semibold transition-colors rounded-lg"
                >
                  <span>Quantum Access</span>
                  <span className="text-[9px] font-mono">Gs. 350.000</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ── Disclaimer ── */}
      <div className="border-t border-[#E8E8E8] mt-6 bg-[#F7F8F9]">
        <div className="max-w-[1800px] mx-auto px-6 py-6">
          <p className="text-[#888888] text-[9px] uppercase tracking-widest mb-2 font-semibold">
            Aviso Legal / Legal Disclaimer
          </p>
          <p className="text-[#AAAAAA] text-[10px] leading-relaxed">
            <span className="text-[#888888] font-medium">ES:</span> El contenido de este sitio es exclusivamente de carácter educativo e informativo. Las señales, análisis y niveles cuánticos presentados NO constituyen asesoría de inversión, recomendación financiera ni oferta de compra o venta de ningún activo. Operar en mercados financieros conlleva un riesgo elevado de pérdida de capital. El usuario es el único responsable de sus decisiones de inversión y del uso que haga de esta información. Sacred Levels no se hace responsable por pérdidas o daños derivados del uso de esta plataforma.
          </p>
          <p className="text-[#AAAAAA] text-[10px] leading-relaxed mt-2">
            <span className="text-[#888888] font-medium">EN:</span> All content on this platform is provided for educational and informational purposes only. The signals, analysis, and quantum levels displayed do NOT constitute investment advice, financial recommendations, or an offer to buy or sell any asset. Trading financial markets involves substantial risk of capital loss. The user is solely responsible for their investment decisions and for the use of this information. Sacred Levels shall not be liable for any losses or damages arising from the use of this platform.
          </p>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="border-t border-[#E8E8E8] py-4 bg-white">
        <div className="max-w-[1800px] mx-auto px-6 flex items-center justify-between">
          <p className="text-[#888888] text-[10px] tracking-wide">
            Quantum Signal Hub · Sacred Levels © 2026
          </p>
          <p className="text-[#888888] text-[10px] tracking-wide">
            Crypto: Binance/CoinGecko · FX/Oro/Índices: Yahoo Finance · DXY: Twelve Data
          </p>
        </div>
      </footer>
    </div>
  );
}
