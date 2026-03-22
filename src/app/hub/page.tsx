'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

// ── Types ─────────────────────────────────────────────────────────────────────

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

// ── Design tokens ──────────────────────────────────────────────────────────────
const BG     = '#0A0A0B';
const CARD   = '#141415';
const BORDER = '#222222';
const CYAN   = '#00E5FF';
const GREEN  = '#00D26A';
const RED    = '#FF4757';
const MUTED  = '#555555';
const DARK   = '#0d0d0e';

// ── Quantum helpers ────────────────────────────────────────────────────────────

function calculateQuantumLevels(high: number, low: number): QuantumLevel[] {
  const range = high - low;
  return Array.from({ length: 9 }, (_, n) => ({
    level: `Q${n}`,
    price: Math.round((low + range * Math.pow(n / 8, 2)) * 10000) / 10000,
    type: (n <= 3 ? 'buy' : n >= 6 ? 'sell' : 'neutral') as QuantumLevel['type'],
    strength: n === 0 || n === 8 ? 100 : n === 4 ? 80 : 60,
  }));
}

function deriveSignal(price: number, levels: QuantumLevel[]): 'BUY' | 'SELL' | 'WAIT' {
  const near = levels.reduce((p, c) => Math.abs(c.price - price) < Math.abs(p.price - price) ? c : p);
  return near.type === 'buy' ? 'BUY' : near.type === 'sell' ? 'SELL' : 'WAIT';
}

function generateAI(symbol: string, price: number, levels: QuantumLevel[]): string {
  const near = levels.reduce((p, c) => Math.abs(c.price - price) < Math.abs(p.price - price) ? c : p);
  const pct  = Math.abs((price - near.price) / price * 100).toFixed(2);
  const dir  = price >= near.price ? 'above' : 'below';
  const zone = near.type === 'buy' ? 'accumulation' : near.type === 'sell' ? 'distribution' : 'equilibrium';
  const bias = near.type === 'buy' ? 'bullish accumulation' : near.type === 'sell' ? 'bearish distribution' : 'consolidation';
  const opts = [
    `Price is ${pct}% ${dir} ${near.level} (${near.price}), a key ${zone} zone. Watch for reversal confirmation before entry.`,
    `${near.level} at ${near.price} is the nearest quantum reference. The ${zone} zone suggests ${bias} may be underway. Confidence: ${near.strength}%.`,
    `Quantum structure places ${symbol} within the ${zone} zone near ${near.level}. ${bias.charAt(0).toUpperCase() + bias.slice(1)} patterns are prevalent at this level.`,
  ];
  return opts[Math.floor(Math.random() * opts.length)];
}

function buildMarket(raw: Omit<MarketData, 'levels' | 'signal' | 'aiAnalysis'>): MarketData {
  if (raw.offline) return { ...raw, levels: [], signal: 'WAIT', aiAnalysis: 'Market data temporarily unavailable.' };
  const levels = calculateQuantumLevels(raw.high, raw.low);
  return { ...raw, levels, signal: deriveSignal(raw.price, levels), aiAnalysis: generateAI(raw.symbol, raw.price, levels) };
}

const DEMO_SIGNALS = [
  { id: '1', symbol: 'XAU/USD', type: 'BUY'  as const, level: 'Q3', time: '02:14',  confidence: 87 },
  { id: '2', symbol: 'BTC/USD', type: 'BUY'  as const, level: 'Q2', time: '14:52',  confidence: 92 },
  { id: '3', symbol: 'EUR/USD', type: 'SELL' as const, level: 'Q6', time: '32:07',  confidence: 78 },
  { id: '4', symbol: 'SPX500',  type: 'BUY'  as const, level: 'Q4', time: '01:14h', confidence: 85 },
  { id: '5', symbol: 'ETH/USD', type: 'SELL' as const, level: 'Q7', time: '02:03h', confidence: 73 },
];

function fmt(m: Pick<MarketData, 'symbol'>, v: number): string {
  if (m.symbol === 'USD/JPY') return v.toFixed(2);
  if (['BTC/USD', 'SPX500', 'NAS100'].includes(m.symbol)) return v.toFixed(0);
  if (m.symbol === 'DXY') return v.toFixed(3);
  return v.toFixed(v < 10 ? 4 : 2);
}

function Chevron({ up }: { up: boolean }) {
  return (
    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d={up ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'} />
    </svg>
  );
}

function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );
}

// ── Paywalls ──────────────────────────────────────────────────────────────────

function SignalPaywall({ viewed, limit }: { viewed: number; limit: number }) {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center">
      <div className="absolute inset-0" style={{ backdropFilter: 'blur(4px)', backgroundColor: `${BG}cc` }} />
      <div className="relative z-10 w-full max-w-[280px] mx-auto">
        <div className="border p-6" style={{ backgroundColor: CARD, borderColor: BORDER }}>
          <div className="mb-4">
            <p className="text-[9px] uppercase tracking-[0.25em] mb-1" style={{ color: MUTED, fontFamily: "'Space Grotesk', sans-serif" }}>
              Acceso Restringido
            </p>
            <h3 className="text-white text-base font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {limit} señales gratuitas usadas
            </h3>
          </div>
          <div className="border-t pt-4 mb-4" style={{ borderColor: BORDER }}>
            <p className="text-[#444] text-xs leading-relaxed mb-3">
              Suscribite a Quantum Access para señales ilimitadas, todos los mercados, DXY y análisis cuántico.
            </p>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="font-bold text-lg" style={{ color: CYAN, fontFamily: "'JetBrains Mono', monospace" }}>
                Gs. 350.000
              </span>
              <span className="text-[#333] text-xs">/ mes</span>
            </div>
            <p className="text-[#333] text-xs">$50 USD equivalente</p>
          </div>
          <Link
            href="/billing"
            className="block w-full py-2.5 px-4 text-sm font-bold uppercase tracking-[0.1em] text-black text-center transition-opacity hover:opacity-90"
            style={{ backgroundColor: CYAN, fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Suscribirse
          </Link>
          <p className="text-[#333] text-[9px] text-center mt-3">{viewed} / {limit} señales gratuitas usadas</p>
        </div>
      </div>
    </div>
  );
}

function LoginGate() {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center">
      <div className="absolute inset-0" style={{ backdropFilter: 'blur(4px)', backgroundColor: `${BG}cc` }} />
      <div className="relative z-10 w-full max-w-[280px] mx-auto">
        <div className="border p-6" style={{ backgroundColor: CARD, borderColor: BORDER }}>
          <p className="text-[9px] uppercase tracking-[0.25em] mb-1" style={{ color: MUTED, fontFamily: "'Space Grotesk', sans-serif" }}>
            Autenticación Requerida
          </p>
          <h3 className="text-white text-base font-bold mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Iniciá sesión para ver señales
          </h3>
          <p className="text-[#444] text-xs leading-relaxed mb-4">
            Cuentas gratuitas tienen 3 señales de por vida. Sin tarjeta.
          </p>
          <Link
            href="/login?redirect=/hub"
            className="block w-full py-2.5 px-4 text-sm font-bold uppercase tracking-[0.1em] text-black text-center transition-opacity hover:opacity-90 mb-2"
            style={{ backgroundColor: CYAN, fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Iniciar Sesión
          </Link>
          <Link
            href="/register"
            className="block w-full border py-2.5 px-4 text-sm font-medium text-center transition-colors duration-200 hover:border-[#333] text-[#555]"
            style={{ borderColor: BORDER, fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Crear Cuenta
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function QuantumSignalHub() {
  const { data: session, status: authStatus } = useSession();
  const [markets, setMarkets]       = useState<MarketData[]>([]);
  const [selected, setSelected]     = useState<MarketData | null>(null);
  const [filter, setFilter]         = useState<'ALL' | 'FX' | 'CRYPTO' | 'INDEX'>('ALL');
  const [isLoading, setIsLoading]   = useState(true);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [secondsAgo, setSecondsAgo] = useState(0);
  const [fetchError, setFetchError] = useState(false);
  const [signalAccess, setSignalAccess] = useState<SignalAccess | null>(null);
  const incrementedRef = useRef(false);

  const fetchMarkets = useCallback(async () => {
    try {
      const res  = await fetch('/api/markets');
      const data = await res.json();
      if (!data.markets) throw new Error('empty');
      setMarkets(prev => {
        const bySymbol = new Map((data.markets as Omit<MarketData, 'levels' | 'signal' | 'aiAnalysis'>[]).map(m => [m.symbol, m]));
        const fresh    = data.markets.map((r: Omit<MarketData, 'levels' | 'signal' | 'aiAnalysis'>) => buildMarket(r));
        return [...fresh, ...prev.filter(p => !bySymbol.has(p.symbol))];
      });
      setLastUpdated(Date.now());
      setSecondsAgo(0);
      setFetchError(false);
    } catch { setFetchError(true); }
    finally  { setIsLoading(false); }
  }, []);

  useEffect(() => { fetchMarkets(); const id = setInterval(fetchMarkets, 30_000); return () => clearInterval(id); }, [fetchMarkets]);
  useEffect(() => { if (!lastUpdated) return; const id = setInterval(() => setSecondsAgo(Math.floor((Date.now() - lastUpdated) / 1000)), 1000); return () => clearInterval(id); }, [lastUpdated]);
  useEffect(() => {
    if (markets.length === 0) return;
    if (!selected) { setSelected(markets[0]); return; }
    const u = markets.find(m => m.symbol === selected.symbol);
    if (u) setSelected(u);
  }, [markets]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (authStatus === 'loading') return;
    if (!session) { setSignalAccess({ canView: false, isPro: false, viewed: 0, limit: 3, reason: 'unauthenticated' }); return; }
    fetch('/api/signals/check-limit').then(r => r.json()).then((d: SignalAccess) => setSignalAccess(d)).catch(() => setSignalAccess({ canView: false, isPro: false, viewed: 0, limit: 3 }));
  }, [authStatus, session]);

  useEffect(() => {
    if (!signalAccess?.canView || signalAccess.isPro || incrementedRef.current) return;
    incrementedRef.current = true;
    fetch('/api/signals/increment-view', { method: 'POST' }).then(r => r.json()).then(d => setSignalAccess(p => p ? { ...p, viewed: d.viewed } : p)).catch(() => {});
  }, [signalAccess]);

  const filtered       = markets.filter(m => {
    if (filter === 'FX')     return ['EUR/USD', 'GBP/USD', 'USD/JPY'].includes(m.symbol);
    if (filter === 'CRYPTO') return ['BTC/USD', 'ETH/USD'].includes(m.symbol);
    if (filter === 'INDEX')  return ['SPX500', 'NAS100', 'DXY'].includes(m.symbol);
    return true;
  });
  const showGate       = signalAccess !== null && !signalAccess.canView;
  const isUnauthed     = signalAccess?.reason === 'unauthenticated';
  const isLimitReached = signalAccess?.reason === 'limit_reached';

  if (isLoading || authStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: BG }}>
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-3" style={{ borderColor: CYAN, borderTopColor: 'transparent' }} />
          <p className="text-[10px] uppercase tracking-[0.25em]" style={{ color: MUTED, fontFamily: "'Space Grotesk', sans-serif" }}>
            Cargando datos de mercado
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: BG, fontFamily: "'Inter', sans-serif" }}>

      {/* ── Header ── */}
      <header
        className="border-b sticky top-0 z-50"
        style={{ backgroundColor: BG, borderColor: BORDER }}
      >
        <div className="max-w-[1800px] mx-auto px-6 h-13 flex items-center justify-between" style={{ height: '52px' }}>
          <Link href="/" className="flex items-center gap-3">
            <div
              className="w-7 h-7 border flex items-center justify-center"
              style={{ borderColor: `${CYAN}40` }}
            >
              <span
                className="text-xs font-bold"
                style={{ color: CYAN, fontFamily: "'JetBrains Mono', monospace" }}
              >
                Q
              </span>
            </div>
            <span
              className="text-white text-xs font-semibold uppercase tracking-[0.2em]"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Signal Hub
            </span>
            <span className="hidden sm:block text-[#222] text-xs">|</span>
            <span className="hidden sm:block text-[#333] text-xs tracking-wide">Sacred Levels</span>
          </Link>

          <div className="flex items-center gap-5">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: GREEN }} />
              <span className="text-xs font-medium" style={{ color: GREEN, fontFamily: "'JetBrains Mono', monospace" }}>
                {lastUpdated ? (secondsAgo < 5 ? 'LIVE' : `${secondsAgo}s`) : 'LIVE'}
              </span>
            </div>
            <button onClick={fetchMarkets} title="Refresh" className="transition-colors duration-200 hover:text-white" style={{ color: MUTED }}>
              <RefreshIcon className="w-3.5 h-3.5" />
            </button>
            {signalAccess && !signalAccess.isPro && session && (
              <span className="hidden md:block text-[10px]" style={{ color: MUTED, fontFamily: "'JetBrains Mono', monospace" }}>
                SIG{' '}
                <span style={{ color: signalAccess.viewed >= signalAccess.limit ? RED : CYAN }}>
                  {signalAccess.limit - signalAccess.viewed}
                </span>/{signalAccess.limit}
              </span>
            )}
            {signalAccess?.isPro && (
              <span className="hidden md:block text-[10px] font-bold uppercase tracking-widest" style={{ color: CYAN, fontFamily: "'Space Grotesk', sans-serif" }}>
                PRO
              </span>
            )}
            <Link href="/quantum" className="text-[10px] uppercase tracking-[0.15em] font-semibold transition-colors duration-200 hover:text-white" style={{ color: MUTED, fontFamily: "'Space Grotesk', sans-serif" }}>
              Calculadora
            </Link>
            <Link
              href="/billing"
              className="border px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] transition-all duration-200 hover:border-[#00E5FF]/60 hover:text-[#00E5FF]"
              style={{ borderColor: BORDER, color: MUTED, fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Planes
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-[1800px] mx-auto px-6 py-4">

        {/* Error bar */}
        {fetchError && (
          <div className="mb-4 px-4 py-2.5 border-l-2 text-xs flex items-center gap-3" style={{ backgroundColor: `${RED}08`, borderLeftColor: RED, color: RED }}>
            <span>Datos de mercado no disponibles — mostrando últimos precios conocidos</span>
            <button onClick={fetchMarkets} className="ml-auto underline text-[#ff4757]/60 hover:text-[#ff4757] transition-colors">Reintentar</button>
          </div>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px mb-4" style={{ backgroundColor: BORDER }}>
          {[
            { label: 'Señales Activas',  value: '24',               sub: '+5 hoy',       subColor: GREEN,  accent: CYAN  },
            { label: 'Win Rate',         value: '78.5%',            sub: 'últimos 30d',  subColor: MUTED,  accent: GREEN },
            { label: 'Mercados',         value: String(markets.length), sub: `${markets.filter(m => !m.offline).length} en vivo`, subColor: '#4a9eff', accent: '#4a9eff' },
            { label: 'Confianza Media',  value: '85%',              sub: 'modelo IA',    subColor: MUTED,  accent: CYAN  },
          ].map(s => (
            <div key={s.label} className="p-4 border-l-2" style={{ backgroundColor: CARD, borderLeftColor: s.accent }}>
              <p className="text-[9px] uppercase tracking-[0.2em] mb-1" style={{ color: MUTED, fontFamily: "'Space Grotesk', sans-serif" }}>{s.label}</p>
              <p className="text-2xl font-bold text-white" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{s.value}</p>
              <p className="text-[9px] mt-0.5 tracking-wide uppercase" style={{ color: s.subColor, fontFamily: "'Space Grotesk', sans-serif" }}>{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Main 3-col grid */}
        <div className="grid lg:grid-cols-[300px_1fr_280px] gap-px" style={{ backgroundColor: BORDER }}>

          {/* ── Left: market table ── */}
          <div style={{ backgroundColor: DARK }}>
            {/* Filter tabs */}
            <div className="flex border-b" style={{ borderColor: BORDER }}>
              {(['ALL', 'FX', 'CRYPTO', 'INDEX'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className="flex-1 py-2.5 text-[9px] font-bold uppercase tracking-[0.2em] transition-colors duration-200"
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    color: filter === f ? CYAN : MUTED,
                    borderBottom: filter === f ? `1px solid ${CYAN}` : 'none',
                    marginBottom: filter === f ? '-1px' : 0,
                    backgroundColor: filter === f ? `${CYAN}06` : 'transparent',
                  }}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Column headers */}
            <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2 px-3 py-2 border-b" style={{ borderColor: BORDER, backgroundColor: BG }}>
              {['Símbolo', 'Precio', 'Var%', 'Señal'].map((h, i) => (
                <span key={h} className="text-[8px] uppercase tracking-[0.2em]" style={{ color: MUTED, fontFamily: "'Space Grotesk', sans-serif", textAlign: i > 0 ? 'right' : 'left' }}>
                  {h}
                </span>
              ))}
            </div>

            {/* Rows */}
            <div>
              {filtered.map(m => {
                const isSelected = selected?.symbol === m.symbol;
                const up         = m.changePercent >= 0;
                return (
                  <div
                    key={m.symbol}
                    onClick={() => setSelected(m)}
                    className="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-center px-3 py-2.5 cursor-pointer border-b border-l-2 transition-colors duration-150"
                    style={{
                      borderBottomColor: BORDER,
                      borderLeftColor: isSelected ? CYAN : 'transparent',
                      backgroundColor: isSelected ? `${CYAN}06` : 'transparent',
                    }}
                    onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.backgroundColor = '#ffffff04'; }}
                    onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-white text-xs font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                          {m.symbol}
                        </span>
                        {m.offline
                          ? <span className="text-[7px] font-bold tracking-widest" style={{ color: RED }}>OFFLINE</span>
                          : <span className="w-1 h-1 rounded-full" style={{ backgroundColor: GREEN }} />
                        }
                      </div>
                      <span className="text-[9px]" style={{ color: MUTED }}>{m.name}</span>
                    </div>
                    <span className="text-xs text-white text-right" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      {fmt(m, m.price)}
                    </span>
                    <span className="text-xs text-right flex items-center gap-0.5 justify-end" style={{ color: up ? GREEN : RED, fontFamily: "'JetBrains Mono', monospace" }}>
                      <Chevron up={up} />
                      {Math.abs(m.changePercent).toFixed(2)}%
                    </span>
                    <span
                      className="text-[9px] font-bold tracking-wide text-right uppercase"
                      style={{
                        color: m.signal === 'BUY' ? GREEN : m.signal === 'SELL' ? RED : MUTED,
                        fontFamily: "'Space Grotesk', sans-serif",
                      }}
                    >
                      {m.signal}
                    </span>
                  </div>
                );
              })}
            </div>

            {lastUpdated && (
              <div className="px-3 py-2" style={{ backgroundColor: BG }}>
                <p className="text-[8px] uppercase tracking-[0.2em]" style={{ color: '#333', fontFamily: "'Space Grotesk', sans-serif" }}>
                  Actualizado {secondsAgo}s · auto 30s
                </p>
              </div>
            )}
          </div>

          {/* ── Center: detail + levels ── */}
          <div style={{ backgroundColor: CARD }}>
            {selected ? (
              <>
                {/* Market header */}
                <div className="border-b p-5" style={{ borderColor: BORDER }}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h2
                          className="text-xl font-bold text-white"
                          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                        >
                          {selected.symbol}
                        </h2>
                        <span
                          className="text-[8px] font-bold uppercase tracking-[0.2em] px-2 py-0.5"
                          style={{
                            backgroundColor: selected.offline ? `${RED}15` : selected.source === 'live' ? `${GREEN}15` : `${CYAN}12`,
                            color: selected.offline ? RED : selected.source === 'live' ? GREEN : CYAN,
                          }}
                        >
                          {selected.offline ? 'OFFLINE' : selected.source === 'live' ? 'LIVE' : 'SIM'}
                        </span>
                      </div>
                      <p className="text-xs" style={{ color: MUTED }}>{selected.name}</p>
                    </div>
                    <div className="text-right">
                      <p
                        className="text-2xl font-bold text-white"
                        style={{ fontFamily: "'JetBrains Mono', monospace" }}
                      >
                        {fmt(selected, selected.price)}
                      </p>
                      <p
                        className="flex items-center justify-end gap-1 text-sm"
                        style={{ color: selected.changePercent >= 0 ? GREEN : RED, fontFamily: "'JetBrains Mono', monospace" }}
                      >
                        <Chevron up={selected.changePercent >= 0} />
                        {Math.abs(selected.changePercent).toFixed(2)}%
                        <span className="text-xs ml-1" style={{ color: '#333' }}>
                          ({selected.changePercent >= 0 ? '+' : ''}{fmt(selected, selected.change)})
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: '24H HIGH', val: fmt(selected, selected.high) },
                      { label: '24H LOW',  val: fmt(selected, selected.low) },
                      { label: 'RANGE',    val: fmt(selected, selected.high - selected.low) },
                    ].map(({ label, val }) => (
                      <div key={label} className="p-3" style={{ backgroundColor: BG }}>
                        <p className="text-[8px] uppercase tracking-[0.2em] mb-1" style={{ color: MUTED, fontFamily: "'Space Grotesk', sans-serif" }}>
                          {label}
                        </p>
                        <p className="text-sm font-bold text-white" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                          {val}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Analysis */}
                <div className="border-b border-l-2 p-4" style={{ borderColor: BORDER, borderLeftColor: CYAN }}>
                  <p className="text-[8px] uppercase tracking-[0.25em] mb-2" style={{ color: MUTED, fontFamily: "'Space Grotesk', sans-serif" }}>
                    Análisis Cuántico IA
                  </p>
                  <p className="text-xs leading-relaxed" style={{ color: '#555' }}>{selected.aiAnalysis}</p>
                </div>

                {/* Levels table */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[8px] uppercase tracking-[0.25em]" style={{ color: MUTED, fontFamily: "'Space Grotesk', sans-serif" }}>
                      Niveles Cuánticos
                    </p>
                    <span
                      className="text-xs font-bold px-2 py-0.5 uppercase tracking-[0.1em]"
                      style={{
                        color: selected.signal === 'BUY' ? GREEN : selected.signal === 'SELL' ? RED : MUTED,
                        backgroundColor: selected.signal === 'BUY' ? `${GREEN}12` : selected.signal === 'SELL' ? `${RED}12` : `${MUTED}12`,
                        fontFamily: "'Space Grotesk', sans-serif",
                      }}
                    >
                      {selected.signal}
                    </span>
                  </div>

                  <div className="grid grid-cols-[40px_1fr_60px_46px] gap-2 mb-2 px-1">
                    {['Niv.', 'Fuerza', 'Precio', 'Zona'].map((h, i) => (
                      <span key={h} className="text-[8px] uppercase tracking-[0.2em]" style={{ color: '#333', fontFamily: "'Space Grotesk', sans-serif", textAlign: i > 0 ? 'right' : 'left' }}>
                        {h}
                      </span>
                    ))}
                  </div>

                  <div>
                    {[...selected.levels].reverse().map(lv => {
                      const near = Math.abs(lv.price - selected.price) / selected.price < 0.01;
                      const col  = lv.type === 'buy' ? GREEN : lv.type === 'sell' ? RED : '#c9a227';
                      return (
                        <div
                          key={lv.level}
                          className="grid grid-cols-[40px_1fr_60px_46px] gap-2 items-center px-1 py-2 border-b"
                          style={{
                            borderBottomColor: '#1a1a1a',
                            backgroundColor: near ? `${col}08` : 'transparent',
                          }}
                        >
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs" style={{ color: col, fontFamily: "'JetBrains Mono', monospace" }}>
                              {lv.level}
                            </span>
                            {near && <span className="w-1 h-1 rounded-full animate-pulse" style={{ backgroundColor: col }} />}
                          </div>
                          <div className="h-0.5 rounded-full overflow-hidden" style={{ backgroundColor: '#1a1a1a' }}>
                            <div className="h-full rounded-full" style={{ width: `${lv.strength}%`, backgroundColor: col }} />
                          </div>
                          <span className="text-[11px] text-white text-right" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                            {fmt(selected, lv.price)}
                          </span>
                          <span className="text-[8px] text-right font-bold uppercase tracking-wide" style={{ color: col, fontFamily: "'Space Grotesk', sans-serif" }}>
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
                <p className="text-[10px] uppercase tracking-[0.25em]" style={{ color: MUTED, fontFamily: "'Space Grotesk', sans-serif" }}>
                  Selecciona un mercado
                </p>
              </div>
            )}
          </div>

          {/* ── Right: signals feed ── */}
          <div style={{ backgroundColor: DARK }}>
            <div className="relative overflow-hidden" style={{ minHeight: 380 }}>
              <div className="border-b px-4 py-2.5 flex items-center justify-between" style={{ borderColor: BORDER, backgroundColor: BG }}>
                <p className="text-[8px] uppercase tracking-[0.25em]" style={{ color: MUTED, fontFamily: "'Space Grotesk', sans-serif" }}>
                  Señales en Vivo
                </p>
                {signalAccess && !signalAccess.isPro && session && !showGate && (
                  <span className="text-[8px]" style={{ color: MUTED, fontFamily: "'JetBrains Mono', monospace" }}>
                    <span style={{ color: signalAccess.viewed >= signalAccess.limit ? RED : CYAN }}>
                      {signalAccess.limit - signalAccess.viewed}
                    </span>/{signalAccess.limit}
                  </span>
                )}
              </div>

              <div>
                {DEMO_SIGNALS.map((sig, i) => {
                  const mkt       = markets.find(m => m.symbol === sig.symbol);
                  const livePrice = mkt && !mkt.offline ? mkt.price : null;
                  return (
                    <div key={sig.id} className="px-4 py-3 border-b" style={{ borderColor: '#111' }}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span
                            className="text-[8px] font-bold tracking-widest px-1.5 py-0.5 uppercase"
                            style={{
                              backgroundColor: sig.type === 'BUY' ? `${GREEN}15` : `${RED}15`,
                              color: sig.type === 'BUY' ? GREEN : RED,
                              fontFamily: "'Space Grotesk', sans-serif",
                            }}
                          >
                            {sig.type}
                          </span>
                          <span className="text-xs font-semibold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                            {sig.symbol}
                          </span>
                        </div>
                        <span className="text-[10px]" style={{ color: '#333', fontFamily: "'JetBrains Mono', monospace" }}>
                          {sig.time}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px]" style={{ color: '#444', fontFamily: "'JetBrains Mono', monospace" }}>
                          {livePrice !== null
                            ? <>{`@ ${mkt ? fmt(mkt, livePrice) : livePrice} `}<span style={{ color: CYAN }}>{sig.level}</span></>
                            : <span style={{ color: RED }}>OFFLINE</span>
                          }
                        </span>
                        <div className="flex items-center gap-1.5">
                          <div className="w-10 h-0.5 overflow-hidden" style={{ backgroundColor: '#1a1a1a' }}>
                            <div
                              className="h-full"
                              style={{
                                width: `${sig.confidence}%`,
                                backgroundColor: sig.confidence >= 80 ? GREEN : sig.confidence >= 60 ? CYAN : RED,
                              }}
                            />
                          </div>
                          <span className="text-[10px] font-bold text-white" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                            {sig.confidence}%
                          </span>
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
            <div className="border-t p-4 space-y-2" style={{ borderColor: BORDER, backgroundColor: BG }}>
              <p className="text-[8px] uppercase tracking-[0.25em] mb-3" style={{ color: '#333', fontFamily: "'Space Grotesk', sans-serif" }}>
                Acciones
              </p>
              <Link
                href="/quantum"
                className="flex items-center justify-between w-full px-4 py-2.5 border text-xs font-medium transition-all duration-200 hover:border-[#333] text-white"
                style={{ borderColor: BORDER, backgroundColor: CARD, fontFamily: "'Space Grotesk', sans-serif" }}
              >
                <span>Calculadora Cuadrática</span>
                <span style={{ color: MUTED }}>→</span>
              </Link>
              {!signalAccess?.isPro && (
                <Link
                  href="/billing"
                  className="flex items-center justify-between w-full px-4 py-2.5 text-xs font-bold uppercase tracking-[0.1em] text-black transition-opacity hover:opacity-90"
                  style={{ backgroundColor: CYAN, fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  <span>Quantum Access</span>
                  <span className="font-bold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    Gs. 350.000
                  </span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Disclaimer */}
      <div className="border-t mt-4" style={{ borderColor: BORDER, backgroundColor: CARD }}>
        <div className="max-w-[1800px] mx-auto px-6 py-5">
          <p className="text-[8px] uppercase tracking-[0.2em] mb-2 font-semibold" style={{ color: MUTED, fontFamily: "'Space Grotesk', sans-serif" }}>
            Aviso Legal / Legal Disclaimer
          </p>
          <p className="text-[9px] leading-relaxed" style={{ color: '#2a2a2a' }}>
            <span className="font-medium" style={{ color: '#333' }}>ES:</span>{' '}
            El contenido de este sitio es exclusivamente de carácter educativo e informativo. Las señales, análisis y niveles cuánticos presentados NO constituyen asesoría de inversión, recomendación financiera ni oferta de compra o venta de ningún activo. Operar en mercados financieros conlleva un riesgo elevado de pérdida de capital. El usuario es el único responsable de sus decisiones de inversión.
          </p>
          <p className="text-[9px] leading-relaxed mt-1.5" style={{ color: '#2a2a2a' }}>
            <span className="font-medium" style={{ color: '#333' }}>EN:</span>{' '}
            All content is provided for educational and informational purposes only. Signals, analysis, and quantum levels do NOT constitute investment advice. Trading financial markets involves substantial risk of capital loss.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t py-3" style={{ borderColor: BORDER, backgroundColor: BG }}>
        <div className="max-w-[1800px] mx-auto px-6 flex items-center justify-between">
          <p className="text-[9px] uppercase tracking-[0.2em]" style={{ color: '#333', fontFamily: "'Space Grotesk', sans-serif" }}>
            Quantum Signal Hub · Sacred Levels © 2026
          </p>
          <p className="text-[9px] tracking-wide" style={{ color: '#222' }}>
            Crypto: Binance/CoinGecko · FX/Gold/Indices: Yahoo Finance · DXY: Twelve Data
          </p>
        </div>
      </footer>
    </div>
  );
}
