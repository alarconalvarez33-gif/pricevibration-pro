'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import LegalDisclaimer from '@/components/LegalDisclaimer';

// ── Types ─────────────────────────────────────────────────────────────────────

interface QuantumLevel {
  level: string;
  price: number;
  type: 'soporte' | 'resistencia';
  strength: number;   // probabilidad 20–95
  source: 'gann' | 'fib' | 'confluencia';
  isCardinal: boolean;
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

// ── Áurea de Gann — quantum helpers ───────────────────────────────────────────
// Lógica basada en la Calculadora Áurea de Gann (Sacred Levels):
//   Soportes:    (√high - incremento)²  — niveles probables de rebote desde el máximo
//   Resistencias:(√low  + incremento)²  — niveles probables de rechazo desde el mínimo
// La probabilidad sube por confluencia Gann+Fibonacci, ángulos cardinales y ratios áureos.

const GANN_INCS: { inc: number; cardinal: boolean }[] = [
  { inc: 0.0625, cardinal: false }, // 1/16 — 22.5°
  { inc: 0.125,  cardinal: false }, // 2/16 — 45°
  { inc: 0.25,   cardinal: true  }, // 4/16 — 90°
  { inc: 0.375,  cardinal: false }, // 6/16 — 135°
  { inc: 0.5,    cardinal: true  }, // 8/16 — 180°
  { inc: 0.625,  cardinal: false }, // 10/16 — 225°
  { inc: 0.75,   cardinal: true  }, // 12/16 — 270°
  { inc: 1.0,    cardinal: true  }, // 16/16 — 360°
];

const FIB_INCS: { inc: number; keyFib: boolean }[] = [
  { inc: 0.236, keyFib: false },
  { inc: 0.382, keyFib: false },
  { inc: 0.5,   keyFib: true  }, // áureo
  { inc: 0.618, keyFib: true  }, // áureo
  { inc: 0.786, keyFib: false },
  { inc: 1.0,   keyFib: false },
  { inc: 1.272, keyFib: false },
  { inc: 1.618, keyFib: true  }, // áureo
];

// ── Timeframe scaling ─────────────────────────────────────────────────────────
// Áurea de Gann: resistencias desde el MÍNIMO del timeframe elegido,
//                soportes desde el MÁXIMO del timeframe elegido.
// Como la API devuelve solo H/L de 24h, estimamos el H/L del TF escalando el rango diario.
const TF_SCALE: Record<string, number> = {
  'M1':  0.02,
  'M5':  0.05,
  'M15': 0.10,
  'M30': 0.15,
  'H1':  0.25,
  'H4':  0.50,
  'D1':  1.00,
};
const TIMEFRAMES = ['M1', 'M5', 'M15', 'M30', 'H1', 'H4', 'D1'] as const;

function getTimeframeHL(high: number, low: number, price: number, tf: string): { high: number; low: number } {
  if (tf === 'D1') return { high, low };
  const scale    = TF_SCALE[tf] ?? 0.25;
  const tfRange  = (high - low) * scale;
  return {
    high: Math.min(high, price + tfRange / 2),
    low:  Math.max(low,  price - tfRange / 2),
  };
}

function isRoundNumber(price: number): boolean {
  const mag = Math.pow(10, Math.floor(Math.log10(Math.max(price, 1))) - 1);
  return [mag * 100, mag * 50, mag * 10, mag * 5].some(
    rd => Math.abs(price - Math.round(price / rd) * rd) / price < 0.002
  );
}

function scoreGann(opts: { cardinal: boolean; keyFib: boolean; confluence: boolean; round: boolean; pct: number }): number {
  let s = 20;
  if (opts.confluence) s += 25;
  if (opts.cardinal)   s += 15;
  if (opts.keyFib)     s += 12;
  if (opts.round)      s += 10;
  if (opts.pct < 0.005)       s += 8;
  else if (opts.pct < 0.015)  s += 5;
  else if (opts.pct < 0.03)   s += 3;
  return Math.min(s, 95);
}

function calculateQuantumLevels(high: number, low: number, currentPrice: number): QuantumLevel[] {
  const sqH  = Math.sqrt(high);
  const sqL  = Math.sqrt(low);
  const tol  = currentPrice * 0.0018; // tolerancia de confluencia 0.18%

  type Raw = { price: number; cardinal: boolean; keyFib: boolean; dir: 'sop' | 'res'; src: 'gann' | 'fib' };
  const raws: Raw[] = [];

  // Soportes desde el máximo (Gann + Fibonacci)
  for (const g of GANN_INCS) {
    const p = (sqH - g.inc) ** 2;
    if (p > 0) raws.push({ price: p, cardinal: g.cardinal, keyFib: false, dir: 'sop', src: 'gann' });
  }
  for (const f of FIB_INCS) {
    const p = (sqH - f.inc) ** 2;
    if (p > 0) raws.push({ price: p, cardinal: false, keyFib: f.keyFib, dir: 'sop', src: 'fib' });
  }
  // Resistencias desde el mínimo (Gann + Fibonacci)
  for (const g of GANN_INCS) {
    const p = (sqL + g.inc) ** 2;
    raws.push({ price: p, cardinal: g.cardinal, keyFib: false, dir: 'res', src: 'gann' });
  }
  for (const f of FIB_INCS) {
    const p = (sqL + f.inc) ** 2;
    raws.push({ price: p, cardinal: false, keyFib: f.keyFib, dir: 'res', src: 'fib' });
  }

  // Fusionar niveles confluentes (mismo dir, distinta fuente, dentro de tolerancia)
  const used = new Set<number>();
  type Merged = { price: number; cardinal: boolean; keyFib: boolean; confluence: boolean; dir: 'sop' | 'res'; source: 'gann' | 'fib' | 'confluencia' };
  const merged: Merged[] = [];

  for (let i = 0; i < raws.length; i++) {
    if (used.has(i)) continue;
    let m: Merged = { price: raws[i].price, cardinal: raws[i].cardinal, keyFib: raws[i].keyFib, confluence: false, dir: raws[i].dir, source: raws[i].src };
    for (let j = i + 1; j < raws.length; j++) {
      if (used.has(j) || raws[j].dir !== raws[i].dir || raws[j].src === raws[i].src) continue;
      if (Math.abs(raws[j].price - raws[i].price) <= tol) {
        m = { price: (m.price + raws[j].price) / 2, cardinal: m.cardinal || raws[j].cardinal, keyFib: m.keyFib || raws[j].keyFib, confluence: true, dir: m.dir, source: 'confluencia' };
        used.add(j);
      }
    }
    used.add(i);
    merged.push(m);
  }

  // Puntuar y separar en soportes (< precio actual) y resistencias (> precio actual)
  const score = (m: Merged) => scoreGann({ cardinal: m.cardinal, keyFib: m.keyFib, confluence: m.confluence, round: isRoundNumber(m.price), pct: Math.abs(m.price - currentPrice) / currentPrice });

  const supports = merged
    .filter(m => m.dir === 'sop' && m.price < currentPrice && m.price > 0)
    .map(m => ({ ...m, str: score(m) }))
    .sort((a, b) => b.price - a.price)  // más cercanos primero
    .slice(0, 5);

  const resistances = merged
    .filter(m => m.dir === 'res' && m.price > currentPrice)
    .map(m => ({ ...m, str: score(m) }))
    .sort((a, b) => a.price - b.price)  // más cercanos primero
    .slice(0, 5);

  const result: QuantumLevel[] = [];

  // Resistencias (de la más lejana a la más próxima al precio, para display top-down)
  [...resistances].reverse().forEach((l, i) => {
    result.push({
      level: `R${resistances.length - i}`,
      price: Math.round(l.price * 10000) / 10000,
      type: 'resistencia',
      strength: l.str,
      source: l.source,
      isCardinal: l.cardinal,
    });
  });

  // Soportes (el más cercano al precio primero)
  supports.forEach((l, i) => {
    result.push({
      level: `S${i + 1}`,
      price: Math.round(l.price * 10000) / 10000,
      type: 'soporte',
      strength: l.str,
      source: l.source,
      isCardinal: l.cardinal,
    });
  });

  return result;
}

function deriveSignal(price: number, levels: QuantumLevel[]): 'BUY' | 'SELL' | 'WAIT' {
  // BUY solo si el precio está sobre un soporte cuántico de alta probabilidad
  if (levels.some(l => l.type === 'soporte' && Math.abs(l.price - price) / price < 0.005 && l.strength >= 55)) return 'BUY';
  // SELL solo si el precio está sobre una resistencia cuántica de alta probabilidad
  if (levels.some(l => l.type === 'resistencia' && Math.abs(l.price - price) / price < 0.005 && l.strength >= 55)) return 'SELL';
  return 'WAIT';
}

function generateAI(symbol: string, price: number, levels: QuantumLevel[]): string {
  if (levels.length === 0) return `${symbol}: datos insuficientes para calcular niveles cuánticos.`;
  const sorted = [...levels].sort((a, b) => Math.abs(a.price - price) - Math.abs(b.price - price));
  const near = sorted[0];
  const pct  = Math.abs((price - near.price) / price * 100).toFixed(2);
  const tipo = near.type === 'soporte' ? 'soporte cuántico' : 'resistencia cuántica';
  const conf = near.source === 'confluencia' ? 'confluencia Gann+Fibonacci' : near.source === 'gann' ? 'método Gann (raíz cuadrada)' : 'ratio Fibonacci';
  const card = near.isCardinal ? ' — ángulo cardinal de alta resonancia' : '';
  const opts = [
    `${symbol} a ${pct}% del ${tipo} ${near.level} (${near.price}) calculado por ${conf}${card}. Probabilidad estructural: ${near.strength}%. Esperá confirmación de cierre de vela antes de operar.`,
    `Nivel cuántico más próximo: ${near.level} en ${near.price} — ${tipo} por ${conf}${card}. El precio puede reaccionar en esta zona; la dirección depende del momentum y la tendencia dominante.`,
    `Referencia cuántica ${near.level} (${near.price}): ${tipo} con ${near.strength}% de probabilidad estructural${card}. No operes sin confirmación de vela de cierre en la zona.`,
  ];
  return opts[Math.floor(Math.random() * opts.length)];
}

function buildMarket(raw: Omit<MarketData, 'levels' | 'signal' | 'aiAnalysis'>): MarketData {
  if (raw.offline) return { ...raw, levels: [], signal: 'WAIT', aiAnalysis: 'Datos de mercado temporalmente no disponibles.' };
  const levels = calculateQuantumLevels(raw.high, raw.low, raw.price);
  return { ...raw, levels, signal: deriveSignal(raw.price, levels), aiAnalysis: generateAI(raw.symbol, raw.price, levels) };
}


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

// ── Paywalls removed — using inline blur/CTA teaser model ─────────────────────

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
  const [timeframe, setTimeframe]       = useState<string>('H1');
  const [guestCanView, setGuestCanView] = useState(false);
  const [guestSecondsLeft, setGuestSecondsLeft] = useState(0);

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
    fetch('/api/signals/check-limit').then(r => r.json()).then((d: SignalAccess) => setSignalAccess(d)).catch(() => setSignalAccess({ canView: false, isPro: false, viewed: 0, limit: 3, reason: 'limit_reached' }));
  }, [authStatus, session]);

  // Daily 5-minute guest window — tracked via localStorage, resets each calendar day.
  useEffect(() => {
    const WINDOW_MS = 5 * 60 * 1000;
    const KEY = 'hub_daily_access';

    const today = new Date().toDateString();
    let stored: { date: string; startedAt: number } | null = null;
    try { stored = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch { stored = null; }

    if (!stored || stored.date !== today) {
      stored = { date: today, startedAt: Date.now() };
      localStorage.setItem(KEY, JSON.stringify(stored));
    }

    const startedAt = stored.startedAt;

    const tick = () => {
      const elapsed = Date.now() - startedAt;
      const remaining = Math.max(0, WINDOW_MS - elapsed);
      setGuestSecondsLeft(Math.ceil(remaining / 1000));
      setGuestCanView(remaining > 0);
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Niveles recalculados con el H/L del timeframe elegido (Áurea de Gann).
  // priceBucket discretiza el precio en pasos de ~0.3%: los niveles solo se
  // recalculan cuando el precio se mueve esa distancia, no en cada tick de 30s.
  const priceBucket = selected
    ? Math.round(Math.log(Math.max(selected.price, 0.0001)) / Math.log(1.003))
    : 0;
  const { tfHL, detailLevels, detailSignal, detailAI } = useMemo(() => {
    if (!selected || selected.offline) {
      return {
        tfHL: null as { high: number; low: number } | null,
        detailLevels: selected?.levels ?? [],
        detailSignal: (selected?.signal ?? 'WAIT') as 'BUY' | 'SELL' | 'WAIT',
        detailAI: selected?.aiAnalysis ?? '',
      };
    }
    const hl     = getTimeframeHL(selected.high, selected.low, selected.price, timeframe);
    const levels = calculateQuantumLevels(hl.high, hl.low, selected.price);
    return {
      tfHL: hl,
      detailLevels: levels,
      detailSignal: deriveSignal(selected.price, levels),
      detailAI: generateAI(selected.symbol, selected.price, levels),
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.symbol, priceBucket, selected?.high, selected?.low, selected?.offline, timeframe]);

  // Señales accionables: soporte más cercano → BUY hint, resistencia más cercana → SELL hint
  const actionableSignals = useMemo(() => {
    type Sig = { symbol: string; type: 'BUY' | 'SELL'; price: number; strength: number };
    const out: Sig[] = [];
    for (const m of markets) {
      if (m.offline || m.levels.length === 0) continue;
      const sup = m.levels.filter(l => l.type === 'soporte').sort((a, b) => b.price - a.price)[0];
      const res = m.levels.filter(l => l.type === 'resistencia').sort((a, b) => a.price - b.price)[0];
      if (sup) out.push({ symbol: m.symbol, type: 'BUY',  price: sup.price, strength: sup.strength });
      if (res) out.push({ symbol: m.symbol, type: 'SELL', price: res.price, strength: res.strength });
    }
    return out.sort((a, b) => b.strength - a.strength).slice(0, 8);
  }, [markets]);

  const filtered       = markets.filter(m => {
    if (filter === 'FX')     return ['EUR/USD', 'GBP/USD', 'USD/JPY'].includes(m.symbol);
    if (filter === 'CRYPTO') return ['BTC/USD', 'ETH/USD'].includes(m.symbol);
    if (filter === 'INDEX')  return ['SPX500', 'NAS100', 'DXY'].includes(m.symbol);
    return true;
  });
  const isPro = signalAccess?.isPro === true;
  const canSeeDetails = isPro || guestCanView;

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
            {isPro && (
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

      <LegalDisclaimer variant="banner" />

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
                      { label: timeframe === 'D1' ? '24H HIGH' : `${timeframe} HIGH`, val: fmt(selected, tfHL?.high ?? selected.high) },
                      { label: timeframe === 'D1' ? '24H LOW'  : `${timeframe} LOW`,  val: fmt(selected, tfHL?.low  ?? selected.low)  },
                      { label: 'RANGE',    val: fmt(selected, (tfHL?.high ?? selected.high) - (tfHL?.low ?? selected.low)) },
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

                {/* Timeframe selector */}
                <div className="border-b px-5 py-3" style={{ borderColor: BORDER }}>
                  <p className="text-[8px] uppercase tracking-[0.25em] mb-2" style={{ color: MUTED, fontFamily: "'Space Grotesk', sans-serif" }}>
                    Temporalidad · Áurea de Gann
                  </p>
                  <div className="flex gap-1 flex-wrap">
                    {TIMEFRAMES.map(tf => (
                      <button
                        key={tf}
                        onClick={() => setTimeframe(tf)}
                        className="px-2 py-1 text-[9px] font-bold transition-colors duration-150"
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          color: timeframe === tf ? BG : MUTED,
                          backgroundColor: timeframe === tf ? CYAN : 'transparent',
                          border: `1px solid ${timeframe === tf ? CYAN : BORDER}`,
                        }}
                      >
                        {tf}
                      </button>
                    ))}
                  </div>
                </div>

                {/* AI Analysis */}
                <div className="border-b border-l-2 p-4" style={{ borderColor: BORDER, borderLeftColor: canSeeDetails ? CYAN : '#F59E0B' }}>
                  <p className="text-[8px] uppercase tracking-[0.25em] mb-2" style={{ color: MUTED, fontFamily: "'Space Grotesk', sans-serif" }}>
                    Análisis Cuántico IA
                  </p>
                  <div className="relative">
                    <p className="text-xs leading-relaxed" style={{ color: '#555', filter: canSeeDetails ? 'none' : 'blur(4px)', userSelect: canSeeDetails ? 'auto' : 'none' }}>{detailAI}</p>
                    {!canSeeDetails && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[9px] font-bold uppercase tracking-[0.15em] px-2 py-1" style={{ backgroundColor: '#F59E0B15', color: '#F59E0B', border: '1px solid #F59E0B30', fontFamily: "'Space Grotesk', sans-serif" }}>
                          🔒 Quantum Access
                        </span>
                      </div>
                    )}
                  </div>
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
                        color: detailSignal === 'BUY' ? GREEN : detailSignal === 'SELL' ? RED : MUTED,
                        backgroundColor: detailSignal === 'BUY' ? `${GREEN}12` : detailSignal === 'SELL' ? `${RED}12` : `${MUTED}12`,
                        fontFamily: "'Space Grotesk', sans-serif",
                      }}
                    >
                      {detailSignal}
                    </span>
                  </div>

                  <div className="grid grid-cols-[40px_1fr_72px] gap-2 mb-2 px-1">
                    {['Niv.', 'Fuerza', 'Precio'].map((h, i) => (
                      <span key={h} className="text-[8px] uppercase tracking-[0.2em]" style={{ color: '#333', fontFamily: "'Space Grotesk', sans-serif", textAlign: i > 0 ? 'right' : 'left' }}>
                        {h}
                      </span>
                    ))}
                  </div>

                  <div className="relative">
                    <div>
                      {detailLevels.map(lv => {
                        const near     = Math.abs(lv.price - selected.price) / selected.price < 0.008;
                        const col      = lv.type === 'soporte' ? CYAN : '#F59E0B';
                        const srcBadge = lv.source === 'confluencia' ? '⬡' : lv.source === 'gann' ? 'G' : 'F';
                        return (
                          <div
                            key={lv.level}
                            className="grid gap-2 items-center px-1 py-2 border-b"
                            style={{
                              gridTemplateColumns: '44px 1fr 72px',
                              borderBottomColor: '#1a1a1a',
                              backgroundColor: near ? `${col}08` : 'transparent',
                            }}
                          >
                            <div className="flex items-center gap-1">
                              <span className="font-bold text-[11px]" style={{ color: near ? col : '#444', fontFamily: "'JetBrains Mono', monospace" }}>
                                {lv.level}
                              </span>
                              {lv.isCardinal && <span className="text-[8px]" style={{ color: '#F59E0B' }} title="Ángulo cardinal">°</span>}
                              {near && <span className="w-1 h-1 rounded-full animate-pulse ml-0.5" style={{ backgroundColor: col }} />}
                            </div>
                            <div className="flex flex-col gap-0.5">
                              <div className="h-0.5 rounded-full overflow-hidden" style={{ backgroundColor: '#1a1a1a' }}>
                                <div className="h-full rounded-full" style={{ width: `${lv.strength}%`, backgroundColor: col }} />
                              </div>
                              <span className="text-[8px]" style={{ color: '#333', fontFamily: "'JetBrains Mono', monospace" }}>
                                {srcBadge} {lv.strength}%
                              </span>
                            </div>
                            <span className="text-[11px] text-right font-bold" style={{ color: near ? col : '#555', fontFamily: "'JetBrains Mono', monospace", filter: canSeeDetails ? 'none' : 'blur(6px)', userSelect: canSeeDetails ? 'auto' : 'none' }}>
                              {fmt(selected, lv.price)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    {!canSeeDetails && (
                      <div
                        className="absolute inset-x-0 bottom-0 flex flex-col items-center justify-end gap-3 pb-5 pt-16"
                        style={{ background: `linear-gradient(to bottom, transparent, ${CARD})` }}
                      >
                        <p className="text-xs font-bold text-center px-4" style={{ color: '#F59E0B', fontFamily: "'Space Grotesk', sans-serif" }}>
                          Para desbloquear los niveles, accedé a Quantum Access
                        </p>
                        <Link
                          href="/billing"
                          className="px-5 py-2 text-[10px] font-bold uppercase tracking-[0.15em] text-black transition-opacity hover:opacity-90"
                          style={{ backgroundColor: '#F59E0B', fontFamily: "'Space Grotesk', sans-serif" }}
                        >
                          Quantum Access →
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Metodología */}
                  <div className="mt-5 pt-4 border-t" style={{ borderColor: '#1a1a1a' }}>
                    <p className="text-[11px] leading-relaxed" style={{ color: '#ffffff', fontFamily: "'Inter', sans-serif" }}>
                      Estos son niveles donde el precio podría tener una reacción para venta/compra, dependiendo del contexto del mercado. Algunos niveles van a funcionar como soportes/resistencias; si es roto, se puede convertir en resistencia/soporte. Esperá siempre la vela de confirmación como rompimiento de una tendencia: una vela envolvente, vela martillo, etc. Cuidá siempre el riesgo. <span style={{ fontWeight: 700 }}>Ud. es el único responsable de su éxito.</span>
                    </p>
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
                {isPro && (
                  <span className="text-[8px] font-bold uppercase tracking-widest" style={{ color: CYAN, fontFamily: "'Space Grotesk', sans-serif" }}>PRO</span>
                )}
              </div>

              <div>
                {actionableSignals.map((sig, i) => {
                  const mkt = markets.find(m => m.symbol === sig.symbol);
                  const priceStr = mkt ? fmt(mkt, sig.price) : sig.price.toFixed(2);
                  const isBuy   = sig.type === 'BUY';
                  const col     = isBuy ? GREEN : RED;
                  const hint    = `Atención en ${priceStr} — esperá la vela de confirmación`;
                  return (
                    <div key={`${sig.symbol}-${sig.type}-${i}`} className="px-4 py-3 border-b" style={{ borderColor: '#111' }}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span
                          className="text-[8px] font-bold tracking-widest px-1.5 py-0.5 uppercase shrink-0"
                          style={{
                            backgroundColor: isBuy ? `${GREEN}15` : `${RED}15`,
                            color: col,
                            fontFamily: "'Space Grotesk', sans-serif",
                          }}
                        >
                          {sig.type}
                        </span>
                        <span className="text-xs font-semibold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                          {sig.symbol}
                        </span>
                      </div>
                      <p className="text-[10px] leading-relaxed mb-1.5" style={{ color: '#666', fontFamily: "'Inter', sans-serif", filter: canSeeDetails ? 'none' : 'blur(4px)', userSelect: canSeeDetails ? 'auto' : 'none' }}>
                        {hint}
                      </p>
                      <div className="flex items-center gap-1.5" style={{ filter: canSeeDetails ? 'none' : 'blur(4px)' }}>
                        <div className="flex-1 h-0.5 overflow-hidden" style={{ backgroundColor: '#1a1a1a' }}>
                          <div className="h-full" style={{ width: `${sig.strength}%`, backgroundColor: col }} />
                        </div>
                        <span className="text-[9px] font-bold shrink-0" style={{ color: col, fontFamily: "'JetBrains Mono', monospace" }}>
                          {sig.strength}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {!isPro && guestCanView && (
                <div className="px-4 py-2 border-t flex items-center justify-between" style={{ borderColor: '#F59E0B20', backgroundColor: '#F59E0B06' }}>
                  <p className="text-[8px] uppercase tracking-[0.2em]" style={{ color: '#F59E0B80', fontFamily: "'Space Grotesk', sans-serif" }}>Vista completa hoy</p>
                  <span className="text-[9px] font-bold" style={{ color: '#F59E0B', fontFamily: "'JetBrains Mono', monospace" }}>
                    {Math.floor(guestSecondsLeft / 60)}:{String(guestSecondsLeft % 60).padStart(2, '0')}
                  </span>
                </div>
              )}
              {!canSeeDetails && (
                <div className="px-4 py-4 border-t" style={{ borderColor: '#F59E0B30', backgroundColor: '#F59E0B08' }}>
                  <p className="text-[10px] font-semibold mb-2.5 leading-snug" style={{ color: '#F59E0B', fontFamily: "'Space Grotesk', sans-serif" }}>
                    Para desbloquear los niveles, accedé a Quantum Access
                  </p>
                  <Link
                    href="/billing"
                    className="inline-block px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-black transition-opacity hover:opacity-90"
                    style={{ backgroundColor: '#F59E0B', fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    Desbloquear →
                  </Link>
                </div>
              )}
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
              {!isPro && (
                <Link
                  href="/billing"
                  className="flex items-center justify-between w-full px-4 py-2.5 text-xs font-bold uppercase tracking-[0.1em] text-black transition-opacity hover:opacity-90"
                  style={{ backgroundColor: CYAN, fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  <span>Quantum Access</span>
                  <span className="font-bold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    Gs. 180.000
                  </span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Disclaimer */}
      <div className="border-t" style={{ borderColor: BORDER }}>
        <div className="max-w-[1800px] mx-auto px-6 py-5">
          <LegalDisclaimer variant="full" />
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
