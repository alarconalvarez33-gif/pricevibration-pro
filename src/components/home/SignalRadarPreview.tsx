'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

// ── Tokens ─────────────────────────────────────────────────────────────────────
const CYAN  = '#00D4FF';
const GREEN = '#00E676';
const RED   = '#FF4757';
const GOLD  = '#FFD700';
const TXT   = '#EDF1F5';
const DIM   = '#6E7A8A';
const PANEL = '#11161F';

// ── Asset catalogue (mirror of /hub) ───────────────────────────────────────────
interface AssetDef {
  ticker: string;
  apiSymbol: string;
  category: 'Forex' | 'Metales' | 'Crypto' | 'Índices';
  decimals: number;
}

const ASSETS: AssetDef[] = [
  { ticker: 'XAUUSD', apiSymbol: 'XAU/USD', category: 'Metales', decimals: 2 },
  { ticker: 'EURUSD', apiSymbol: 'EUR/USD', category: 'Forex',   decimals: 4 },
  { ticker: 'BTCUSD', apiSymbol: 'BTC/USD', category: 'Crypto',  decimals: 0 },
  { ticker: 'US30',   apiSymbol: 'US30',    category: 'Índices', decimals: 0 },
  { ticker: 'GBPUSD', apiSymbol: 'GBP/USD', category: 'Forex',   decimals: 4 },
  { ticker: 'ETHUSD', apiSymbol: 'ETH/USD', category: 'Crypto',  decimals: 2 },
  { ticker: 'USDJPY', apiSymbol: 'USD/JPY', category: 'Forex',   decimals: 2 },
  { ticker: 'NAS100', apiSymbol: 'NAS100',  category: 'Índices', decimals: 0 },
  { ticker: 'XAGUSD', apiSymbol: 'XAG/USD', category: 'Metales', decimals: 2 },
  { ticker: 'USOIL',  apiSymbol: 'USOIL',   category: 'Forex',   decimals: 2 },
  { ticker: 'AUDUSD', apiSymbol: 'AUD/USD', category: 'Forex',   decimals: 4 },
  { ticker: 'GBPJPY', apiSymbol: 'GBP/JPY', category: 'Forex',   decimals: 2 },
];

const FREE = new Set(['XAUUSD', 'EURUSD']);
const SYMBOL_MAP: Record<string, string> = Object.fromEntries(ASSETS.map(a => [a.ticker, a.apiSymbol]));

interface MarketRow {
  symbol: string;
  price: number;
  changePercent: number;
  offline?: boolean;
}

type Verdict = 'buy' | 'sell' | 'wait';

function verdictFor(price: number): { verdict: Verdict; confidence: number } {
  const sq = Math.sqrt(price);
  let best = Infinity;
  let kind: Verdict = 'wait';
  for (let n = 1; n <= 8; n++) {
    const sup = (sq - n * 0.0625) ** 2;
    const res = (sq + n * 0.0625) ** 2;
    if (sup > 0 && sup < price) {
      const d = (price - sup) / price;
      if (d < best) { best = d; kind = d < 0.005 ? 'buy' : 'wait'; }
    }
    if (res > price) {
      const d = (res - price) / price;
      if (d < best) { best = d; kind = d < 0.005 ? 'sell' : 'wait'; }
    }
  }
  const conf = Math.max(40, Math.min(95, Math.round(100 - best * 100)));
  return { verdict: kind, confidence: conf };
}

function fmt(decimals: number, v: number) {
  return v.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

const COLOR: Record<Verdict, string> = { buy: GREEN, sell: RED, wait: GOLD };
const LABEL: Record<Verdict, string> = { buy: 'Compra', sell: 'Venta', wait: 'Espera' };

export default function SignalRadarPreview() {
  const [bySymbol, setBySymbol] = useState<Record<string, MarketRow>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch('/api/markets');
        const data = await res.json();
        if (cancelled || !data?.markets) return;
        const next: Record<string, MarketRow> = {};
        for (const m of data.markets as MarketRow[]) next[m.symbol] = m;
        setBySymbol(next);
      } catch { /* network error — keep last */ }
      finally { if (!cancelled) setLoaded(true); }
    };
    load();
    const id = setInterval(load, 15_000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  const rows = ASSETS.map(def => {
    const raw = bySymbol[SYMBOL_MAP[def.ticker]] ?? null;
    const price = raw && !raw.offline && raw.price > 0 ? raw.price : null;
    const changePct = raw && !raw.offline ? raw.changePercent : null;
    const sig = price != null ? verdictFor(price) : { verdict: 'wait' as Verdict, confidence: 40 };
    return {
      def,
      price,
      changePct,
      verdict: sig.verdict,
      confidence: sig.confidence,
      locked: !FREE.has(def.ticker),
    };
  });

  // sort by urgency (buy/sell first by confidence)
  const sortedRows = [...rows].sort((a, b) => {
    const order: Record<Verdict, number> = { buy: 0, sell: 1, wait: 2 };
    if (order[a.verdict] !== order[b.verdict]) return order[a.verdict] - order[b.verdict];
    return b.confidence - a.confidence;
  });

  const buys = rows.filter(r => r.verdict === 'buy' && r.price != null).length;
  const sells = rows.filter(r => r.verdict === 'sell' && r.price != null).length;
  const monitored = rows.filter(r => r.price != null).length;

  return (
    <section
      id="radar-en-vivo"
      aria-labelledby="radar-heading"
      className="relative py-14 md:py-20 px-4"
      style={{
        background: 'linear-gradient(180deg, #08111F 0%, #0A0E16 100%)',
        backgroundImage: 'radial-gradient(circle at 10% 0%, rgba(0,212,255,0.06), transparent 55%), radial-gradient(circle at 90% 100%, rgba(255,215,0,0.05), transparent 50%)',
      }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Heading row */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 mb-7">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] mb-3" style={{ color: CYAN, fontFamily: "'Space Grotesk', sans-serif" }}>
              <span className="inline-block w-2 h-2 rounded-full mr-2 align-middle animate-pulse" style={{ backgroundColor: GREEN }} />
              Radar en vivo · 12 mercados
            </p>
            <h2
              id="radar-heading"
              className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight"
              style={{ color: TXT, fontFamily: "'Montserrat', sans-serif", letterSpacing: '-1px' }}
            >
              Señales de trading <span style={{ color: CYAN }}>en tiempo real</span>
              <br className="hidden sm:block" />
              <span className="text-2xl md:text-3xl lg:text-4xl block mt-2" style={{ color: '#B7BFCC', fontWeight: 700 }}>
                Oro · Forex · Crypto · Índices
              </span>
            </h2>
          </div>
          <div className="flex items-center gap-5">
            <Counter color={GREEN} label="Compra" value={buys} />
            <Counter color={RED}   label="Venta"  value={sells} />
            <Counter color={CYAN}  label="Activos" value={monitored} />
          </div>
        </div>

        <p className="text-base md:text-lg leading-relaxed mb-8 max-w-3xl" style={{ color: '#B7BFCC' }}>
          El radar monitorea continuamente 12 mercados (XAUUSD, EURUSD, BTCUSD, US30, GBPUSD, ETHUSD, USDJPY, NAS100, XAGUSD, USOIL, AUDUSD, GBPJPY). Cuando el precio entra en una zona de alta probabilidad, lo detecta al instante.
        </p>

        {/* Mini heatgrid */}
        <div
          className="grid gap-2.5 grid-2-on-mobile"
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))' }}
        >
          {sortedRows.map(r => (
            <MiniTile
              key={r.def.ticker}
              ticker={r.def.ticker}
              category={r.def.category}
              price={r.price}
              changePct={r.changePct}
              verdict={r.verdict}
              confidence={r.confidence}
              locked={r.locked}
              loaded={loaded}
              decimals={r.def.decimals}
            />
          ))}
        </div>

        {/* CTAs */}
        <div className="mt-9 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-center">
          <Link
            href="/hub"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-md font-bold text-sm transition-opacity hover:opacity-90"
            style={{ backgroundColor: CYAN, color: '#05080E', fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Abrir Radar Completo →
          </Link>
          <Link
            href="/billing"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-md font-bold text-sm transition-colors"
            style={{ border: '1px solid rgba(0,212,255,0.35)', color: CYAN, fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Activar Quantum Access · $30
          </Link>
        </div>

        <p className="text-xs text-center mt-5" style={{ color: DIM }}>
          2 activos gratis sin registro · 12 activos con acceso completo
        </p>

        {/* Aviso de responsabilidad */}
        <p
          className="text-[11px] leading-relaxed text-center mt-4 max-w-3xl mx-auto px-4"
          style={{ color: '#8893A4' }}
        >
          Los precios pueden tener una pequeña demora respecto al cotizador del broker. El radar es solo informativo
          y no constituye asesoramiento financiero. <strong style={{ color: '#B7BFCC' }}>Cada usuario es el único responsable de sus operaciones.</strong>
        </p>
      </div>

      <style jsx>{`
        @media (max-width: 480px) {
          .grid-2-on-mobile { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </section>
  );
}

function Counter({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="text-right">
      <p className="text-2xl md:text-3xl font-black leading-none" style={{ color, fontFamily: "'JetBrains Mono', monospace" }}>
        {value}
      </p>
      <p className="text-[10px] uppercase tracking-[0.18em] mt-1" style={{ color: DIM, fontFamily: "'Space Grotesk', sans-serif" }}>
        {label}
      </p>
    </div>
  );
}

interface MiniTileProps {
  ticker: string;
  category: string;
  price: number | null;
  changePct: number | null;
  verdict: Verdict;
  confidence: number;
  locked: boolean;
  loaded: boolean;
  decimals: number;
}

function MiniTile({ ticker, category, price, changePct, verdict, confidence, locked, loaded, decimals }: MiniTileProps) {
  const color = COLOR[verdict];
  const up = (changePct ?? 0) >= 0;
  const priceStr = price != null && price > 0 ? fmt(decimals, price) : '—';
  const pctStr = changePct != null ? `${up ? '▲' : '▼'} ${Math.abs(changePct).toFixed(2)}%` : '—';

  if (!loaded) {
    return (
      <div
        className="rounded-md p-3"
        style={{ backgroundColor: PANEL, borderTop: '3px solid rgba(255,255,255,0.06)', minHeight: 110 }}
      >
        <div className="shimmer w-14 h-3 rounded mb-2" />
        <div className="shimmer w-20 h-4 rounded mb-2" />
        <div className="shimmer w-16 h-2 rounded" />
        <style jsx>{`
          .shimmer {
            background: linear-gradient(90deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.11) 50%, rgba(255,255,255,0.05) 100%);
            background-size: 200% 100%;
            animation: shimmer 1.6s infinite;
          }
          @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        `}</style>
      </div>
    );
  }

  return (
    <Link
      href="/hub"
      aria-label={locked ? `${ticker} bloqueado — abrir radar` : `${ticker} ${LABEL[verdict]} ${confidence}%`}
      className="relative block rounded-md p-3 transition-all hover:-translate-y-0.5"
      style={{
        backgroundColor: PANEL,
        borderTop: `3px solid ${color}`,
        boxShadow: `0 0 0 1px rgba(255,255,255,0.04), 0 0 14px ${color}22`,
      }}
    >
      <div className="flex items-start justify-between mb-1.5">
        <div>
          <p className="text-[13px] font-bold leading-none" style={{ color: TXT, fontFamily: "'JetBrains Mono', monospace" }}>
            {ticker}
          </p>
          <p className="text-[9px] uppercase tracking-[0.18em] mt-1" style={{ color: DIM, fontFamily: "'Space Grotesk', sans-serif" }}>
            {category}
          </p>
        </div>
        {locked && (
          <span aria-hidden className="inline-flex items-center justify-center w-4 h-4 rounded-full" style={{ backgroundColor: 'rgba(255,215,0,0.12)', color: GOLD }}>
            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="4" y="11" width="16" height="10" rx="2" />
              <path d="M8 11V7a4 4 0 018 0v4" />
            </svg>
          </span>
        )}
      </div>

      <p
        className="text-[15px] font-bold leading-none"
        style={{ color: TXT, fontFamily: "'JetBrains Mono', monospace", filter: locked ? 'blur(4px)' : 'none' }}
      >
        {priceStr}
      </p>
      <p
        className="text-[10px] font-semibold mt-1.5"
        style={{ color: up ? GREEN : RED, fontFamily: "'JetBrains Mono', monospace", filter: locked ? 'blur(3px)' : 'none' }}
      >
        {pctStr}
      </p>

      <div className="flex items-center justify-between mt-2 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <p className="text-[10px] font-bold" style={{ color, fontFamily: "'Space Grotesk', sans-serif" }}>
          {LABEL[verdict]}
        </p>
        <p className="text-[9px]" style={{ color: DIM, fontFamily: "'JetBrains Mono', monospace" }}>
          {confidence}%
        </p>
      </div>
    </Link>
  );
}
