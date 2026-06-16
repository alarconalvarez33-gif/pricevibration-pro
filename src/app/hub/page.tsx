'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import LegalDisclaimer from '@/components/LegalDisclaimer';
import Tile, { type Verdict } from './_components/Tile';
import TickerStrip from './_components/TickerStrip';
import DetailDrawer from './_components/DetailDrawer';
import LockedOverlay from './_components/LockedOverlay';
import CTAFooter from './_components/CTAFooter';

// ── Design tokens ──────────────────────────────────────────────────────────────
const BG    = '#0A0E16';
const PANEL = '#11161F';
const CYAN  = '#00D4FF';
const GOLD  = '#FFD700';
const GREEN = '#00E676';
const RED   = '#FF4757';
const TXT   = '#EDF1F5';
const DIM   = '#6E7A8A';

// ── Asset catalogue ────────────────────────────────────────────────────────────
type Category = 'Forex' | 'Metales' | 'Crypto' | 'Índices';

interface AssetDef {
  ticker: string;          // internal display key (no slash)
  apiSymbol: string;       // key as returned by /api/markets
  category: Category;
  decimals: number;
}

const ASSETS: AssetDef[] = [
  { ticker: 'XAUUSD', apiSymbol: 'XAU/USD', category: 'Metales',  decimals: 2 },
  { ticker: 'EURUSD', apiSymbol: 'EUR/USD', category: 'Forex',    decimals: 4 },
  { ticker: 'BTCUSD', apiSymbol: 'BTC/USD', category: 'Crypto',   decimals: 0 },
  { ticker: 'US30',   apiSymbol: 'US30',    category: 'Índices',  decimals: 0 },
  { ticker: 'GBPUSD', apiSymbol: 'GBP/USD', category: 'Forex',    decimals: 4 },
  { ticker: 'ETHUSD', apiSymbol: 'ETH/USD', category: 'Crypto',   decimals: 2 },
  { ticker: 'USDJPY', apiSymbol: 'USD/JPY', category: 'Forex',    decimals: 2 },
  { ticker: 'NAS100', apiSymbol: 'NAS100',  category: 'Índices',  decimals: 0 },
  { ticker: 'XAGUSD', apiSymbol: 'XAG/USD', category: 'Metales',  decimals: 2 },
  { ticker: 'USOIL',  apiSymbol: 'USOIL',   category: 'Forex',    decimals: 2 },
  { ticker: 'AUDUSD', apiSymbol: 'AUD/USD', category: 'Forex',    decimals: 4 },
  { ticker: 'GBPJPY', apiSymbol: 'GBP/JPY', category: 'Forex',    decimals: 2 },
];

const FREE_TICKERS = new Set(['XAUUSD', 'EURUSD']);

// ── Symbol map (internal → API) for safe lookup by symbol, never index ─────────
const SYMBOL_MAP: Record<string, string> = Object.fromEntries(
  ASSETS.map(a => [a.ticker, a.apiSymbol])
);

// ── Types from API ─────────────────────────────────────────────────────────────
interface MarketRow {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  source?: 'live' | 'simulated' | 'offline';
  offline?: boolean;
}

// ── Level math (algorithmic) ───────────────────────────────────────────────────
function computeLevels(price: number): { resistances: { n: number; price: number }[]; supports: { n: number; price: number }[] } {
  const sq = Math.sqrt(price);
  const resistances = Array.from({ length: 8 }, (_, i) => {
    const n = i + 1;
    return { n, price: (sq + n * 0.0625) ** 2 };
  });
  const supports = Array.from({ length: 8 }, (_, i) => {
    const n = i + 1;
    const p = (sq - n * 0.0625) ** 2;
    return { n, price: p };
  });
  return { resistances, supports };
}

function deriveVerdict(price: number, resistances: { n: number; price: number }[], supports: { n: number; price: number }[]): { verdict: Verdict; confidence: number } {
  const nearestSupport = supports
    .filter(s => s.price > 0 && s.price < price)
    .sort((a, b) => b.price - a.price)[0];
  const nearestResistance = resistances
    .filter(r => r.price > price)
    .sort((a, b) => a.price - b.price)[0];

  const distSupport = nearestSupport ? Math.abs(price - nearestSupport.price) / price : Infinity;
  const distResistance = nearestResistance ? Math.abs(nearestResistance.price - price) / price : Infinity;

  let verdict: Verdict = 'wait';
  let nearestDist = Math.min(distSupport, distResistance);

  if (distSupport < 0.005 && distSupport <= distResistance) {
    verdict = 'buy';
    nearestDist = distSupport;
  } else if (distResistance < 0.005) {
    verdict = 'sell';
    nearestDist = distResistance;
  }

  const conf = Math.round(100 - nearestDist * 100);
  const confidence = Math.max(40, Math.min(95, conf));
  return { verdict, confidence };
}

// ── Format helpers ─────────────────────────────────────────────────────────────
function formatPrice(decimals: number) {
  return (v: number) => v.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function formatTime(d: Date) {
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }) + ' · ' + d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

// ── Live clock subcomponent ────────────────────────────────────────────────────
function LiveClock({ lastUpdatedAt }: { lastUpdatedAt: number | null }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const ago = lastUpdatedAt ? Math.max(0, Math.floor((now.getTime() - lastUpdatedAt) / 1000)) : null;
  return (
    <div className="flex items-center gap-2 text-[12px]" style={{ color: TXT, fontFamily: "'JetBrains Mono', monospace" }}>
      <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: GREEN, boxShadow: `0 0 8px ${GREEN}` }} />
      <span className="hidden sm:inline">En vivo · {formatTime(now)}{ago != null && ` · act. hace ${ago}s`}</span>
      <span className="sm:hidden text-[11px] font-bold" style={{ color: GREEN }}>Live</span>
    </div>
  );
}

// ── Asset row enriched with computed signal ────────────────────────────────────
interface Row {
  def: AssetDef;
  raw: MarketRow | null;
  price: number | null;
  changePct: number | null;
  verdict: Verdict;
  confidence: number;
  resistances: { n: number; price: number }[];
  supports: { n: number; price: number }[];
  format: (v: number) => string;
  locked: boolean;
}

export default function SignalRadar() {
  const { data: session, status: authStatus } = useSession();

  const [marketsBySymbol, setMarketsBySymbol] = useState<Record<string, MarketRow>>({});
  const [loading, setLoading] = useState(true);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null);
  const [fetchError, setFetchError] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [filter, setFilter] = useState<'Todos' | Category>('Todos');
  const [openDetail, setOpenDetail] = useState<string | null>(null);
  const [lockedModal, setLockedModal] = useState<string | null>(null);
  const [showStickyCTA, setShowStickyCTA] = useState(false);
  const heroEndRef = useRef<HTMLDivElement>(null);

  // Track previous verdicts to badge "Nueva"
  const verdictHistory = useRef<Map<string, { verdict: Verdict; changedAt: number }>>(new Map());

  // Fetch markets every 15s
  const fetchMarkets = useCallback(async () => {
    try {
      const res = await fetch('/api/markets');
      const data = await res.json();
      if (!data.markets || !Array.isArray(data.markets)) throw new Error('empty');
      const next: Record<string, MarketRow> = {};
      for (const m of data.markets as MarketRow[]) {
        next[m.symbol] = m;
      }
      setMarketsBySymbol(next);
      setLastUpdatedAt(Date.now());
      setFetchError(false);
    } catch {
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMarkets();
    const id = setInterval(fetchMarkets, 15_000);
    return () => clearInterval(id);
  }, [fetchMarkets]);

  // Premium check (preserves existing access logic: admin / quantum / signal_hub / pro / whale / ser plans)
  useEffect(() => {
    if (authStatus === 'loading') return;
    fetch('/api/signals/check-limit')
      .then(r => r.json())
      .then(d => setIsPremium(d?.isPro === true))
      .catch(() => setIsPremium(false));
  }, [authStatus, session]);

  // Sticky CTA after scrolling past hero
  useEffect(() => {
    const onScroll = () => {
      if (!heroEndRef.current) return;
      const rect = heroEndRef.current.getBoundingClientRect();
      setShowStickyCTA(rect.top < 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Build enriched rows
  const rows: Row[] = useMemo(() => {
    const now = Date.now();
    return ASSETS.map(def => {
      const raw = marketsBySymbol[SYMBOL_MAP[def.ticker]] ?? null;
      const price = raw && !raw.offline && raw.price > 0 ? raw.price : null;
      const changePct = raw && !raw.offline ? raw.changePercent : null;
      let verdict: Verdict = 'wait';
      let confidence = 40;
      let resistances: { n: number; price: number }[] = [];
      let supports: { n: number; price: number }[] = [];

      if (price != null) {
        const lvl = computeLevels(price);
        resistances = lvl.resistances;
        supports = lvl.supports;
        const sig = deriveVerdict(price, resistances, supports);
        verdict = sig.verdict;
        confidence = sig.confidence;
      }

      // Track verdict change for "Nueva" badge
      const prev = verdictHistory.current.get(def.ticker);
      if (!prev || prev.verdict !== verdict) {
        verdictHistory.current.set(def.ticker, { verdict, changedAt: now });
      }

      return {
        def,
        raw,
        price,
        changePct,
        verdict,
        confidence,
        resistances,
        supports,
        format: formatPrice(def.decimals),
        locked: !isPremium && !FREE_TICKERS.has(def.ticker),
      };
    });
  }, [marketsBySymbol, isPremium]);

  // Sort by urgency (buy/sell first, sorted by confidence desc; wait at end)
  const sortedRows = useMemo(() => {
    const order: Record<Verdict, number> = { buy: 0, sell: 1, wait: 2 };
    return [...rows].sort((a, b) => {
      if (order[a.verdict] !== order[b.verdict]) return order[a.verdict] - order[b.verdict];
      return b.confidence - a.confidence;
    });
  }, [rows]);

  const filteredRows = useMemo(() => {
    if (filter === 'Todos') return sortedRows;
    return sortedRows.filter(r => r.def.category === filter);
  }, [sortedRows, filter]);

  const detail = openDetail ? rows.find(r => r.def.ticker === openDetail) : null;

  const stats = useMemo(() => {
    const buys = rows.filter(r => r.verdict === 'buy' && !r.locked && r.price != null).length;
    const sells = rows.filter(r => r.verdict === 'sell' && !r.locked && r.price != null).length;
    const waits = rows.filter(r => r.verdict === 'wait' && r.price != null).length;
    const monitored = rows.filter(r => r.price != null).length;
    return { buys, sells, waits, monitored };
  }, [rows]);

  const tickerItems = rows.map(r => ({
    ticker: r.def.ticker,
    price: r.price,
    changePct: r.changePct,
    format: r.format,
  }));

  const handleTileClick = (r: Row) => {
    if (r.locked) {
      setLockedModal(r.def.ticker);
    } else {
      setOpenDetail(r.def.ticker);
    }
  };

  return (
    <div
      className="min-h-screen relative"
      style={{
        backgroundColor: BG,
        backgroundImage: `radial-gradient(circle at 0% 0%, rgba(0,212,255,0.07), transparent 55%), radial-gradient(circle at 100% 100%, rgba(255,215,0,0.05), transparent 50%)`,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* ── Header ── */}
      <header
        className="sticky top-0 z-30"
        style={{
          backgroundColor: 'rgba(10,14,22,0.92)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 h-[58px]">
          <Link href="/" aria-label="Sacred Levels">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logonuevos.png" alt="Sacred Levels" height={38} style={{ height: 38, width: 'auto' }} />
          </Link>
          <LiveClock lastUpdatedAt={lastUpdatedAt} />
        </div>
      </header>

      {/* Ticker strip */}
      <TickerStrip items={tickerItems} />

      <LegalDisclaimer variant="banner" />

      {/* ── Hero ── */}
      <section className="px-4 sm:px-6 pt-12 sm:pt-14 pb-10">
        <div className="max-w-5xl mx-auto">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] mb-4" style={{ color: CYAN, fontFamily: "'Space Grotesk', sans-serif" }}>
            Radar de Señales · En tiempo real
          </p>
          <h1
            className="text-[34px] sm:text-[48px] lg:text-[58px] font-black leading-[1.05] mb-5"
            style={{ color: TXT, fontFamily: "'Montserrat', sans-serif", letterSpacing: '-1.2px' }}
          >
            El radar de <span style={{ color: CYAN }}>12 mercados</span> activo ahora mismo
          </h1>
          <p className="text-base sm:text-lg max-w-2xl leading-relaxed" style={{ color: '#B7BFCC' }}>
            Cada activo es analizado en tiempo real. Cuando el precio entra en zona de alta
            probabilidad, el radar lo detecta al instante con una señal clara de compra o venta.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-9">
            <Stat label="Señales de compra"   value={stats.buys}      color={GREEN} />
            <Stat label="Señales de venta"    value={stats.sells}     color={RED} />
            <Stat label="En espera"           value={stats.waits}     color={GOLD} />
            <Stat label="Activos monitoreados" value={stats.monitored} color={CYAN} />
          </div>

          {/* Inline CTA banner */}
          {!isPremium && (
            <div
              className="mt-8 rounded-xl p-5 sm:p-6 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between"
              style={{
                background: 'linear-gradient(135deg, rgba(0,212,255,0.07), rgba(255,215,0,0.05))',
                border: '1px solid rgba(0,212,255,0.25)',
              }}
            >
              <div>
                <p className="text-base sm:text-lg font-black" style={{ color: TXT, fontFamily: "'Montserrat', sans-serif" }}>
                  Desbloqueá los 12 activos del radar
                </p>
                <p className="text-sm mt-1" style={{ color: '#B7BFCC' }}>
                  Señales en tiempo real. Niveles exactos. Probabilidad calculada por algoritmo.
                </p>
              </div>
              <Link
                href="/billing"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md font-bold text-sm transition-opacity hover:opacity-90 whitespace-nowrap shrink-0"
                style={{ backgroundColor: CYAN, color: '#05080E', fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Activar Quantum Access →
              </Link>
            </div>
          )}
        </div>
        <div ref={heroEndRef} />
      </section>

      {/* ── Aviso de precios + responsabilidad ── */}
      <section className="px-4 sm:px-6 pb-4">
        <div
          className="max-w-7xl mx-auto rounded-md px-4 py-3 flex items-start gap-3"
          style={{
            backgroundColor: 'rgba(255,215,0,0.06)',
            border: '1px solid rgba(255,215,0,0.22)',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2" className="shrink-0 mt-0.5" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M5.07 19h13.86a2 2 0 001.74-3L13.74 4a2 2 0 00-3.48 0L3.33 16a2 2 0 001.74 3z" />
          </svg>
          <p className="text-[12px] leading-relaxed" style={{ color: '#D9D2A8', fontFamily: "'Inter', sans-serif" }}>
            <strong style={{ color: GOLD }}>Aviso importante:</strong> los precios pueden tener una demora respecto al spot del broker. El radar es solo informativo —
            no constituye asesoramiento financiero. <strong style={{ color: '#EDF1F5' }}>Cada usuario es el único responsable de sus operaciones y de la gestión de su capital.</strong> Esperá siempre la vela de confirmación antes de operar.
          </p>
        </div>
      </section>

      {/* ── Heatgrid ── */}
      <section className="px-4 sm:px-6 pb-24">
        <div className="max-w-7xl mx-auto">
          {/* Filter chips */}
          <div className="flex flex-wrap gap-2 mb-5">
            {(['Todos', 'Forex', 'Metales', 'Crypto', 'Índices'] as const).map(f => {
              const active = filter === f;
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className="px-4 py-2 text-[12px] font-bold uppercase tracking-[0.15em] rounded-full transition-all"
                  style={{
                    backgroundColor: active ? CYAN : 'rgba(255,255,255,0.04)',
                    color: active ? '#05080E' : '#B7BFCC',
                    border: `1px solid ${active ? CYAN : 'rgba(255,255,255,0.08)'}`,
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}
                >
                  {f}
                </button>
              );
            })}
          </div>

          {fetchError && (
            <div
              className="mb-4 px-4 py-3 rounded-md text-sm"
              style={{ backgroundColor: 'rgba(255,71,87,0.08)', border: '1px solid rgba(255,71,87,0.2)', color: '#FFB8BF' }}
            >
              No pudimos refrescar los datos. Mostrando últimos precios disponibles. <button onClick={fetchMarkets} className="underline ml-1">Reintentar</button>
            </div>
          )}

          {/* Grid */}
          {loading ? (
            <div
              className="grid gap-3"
              style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}
            >
              {ASSETS.map(a => <SkeletonTile key={a.ticker} />)}
            </div>
          ) : (
            <div
              className="grid gap-3 grid-mobile-2"
              style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}
            >
              {filteredRows.map(r => {
                const hist = verdictHistory.current.get(r.def.ticker);
                const isNew = hist != null && (r.verdict === 'buy' || r.verdict === 'sell') && (Date.now() - hist.changedAt) < 60_000;
                return (
                  <Tile
                    key={r.def.ticker}
                    ticker={r.def.ticker}
                    category={r.def.category}
                    price={r.price}
                    changePct={r.changePct}
                    verdict={r.verdict}
                    confidence={r.confidence}
                    locked={r.locked}
                    isNew={isNew}
                    onClick={() => handleTileClick(r)}
                    format={r.format}
                  />
                );
              })}
            </div>
          )}

          <style jsx>{`
            @media (max-width: 480px) {
              .grid-mobile-2 { grid-template-columns: repeat(2, 1fr) !important; }
            }
          `}</style>
        </div>
      </section>

      {/* Disclaimer */}
      <div className="border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <LegalDisclaimer variant="full" />
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 text-center">
          <p className="text-[11px] tracking-wide" style={{ color: DIM, fontFamily: "'Inter', sans-serif" }}>
            Sacred Levels · Análisis algorítmico de mercados en tiempo real · No constituye asesoría financiera.
          </p>
        </div>
      </footer>

      {/* Detail drawer */}
      {detail && (
        <DetailDrawer
          open
          onClose={() => setOpenDetail(null)}
          ticker={detail.def.ticker}
          category={detail.def.category}
          price={detail.price}
          changePct={detail.changePct}
          verdict={detail.verdict}
          confidence={detail.confidence}
          resistances={detail.resistances}
          supports={detail.supports}
          format={detail.format}
          isPremium={isPremium}
        />
      )}

      {/* Locked modal */}
      {lockedModal && (
        <LockedOverlay
          open
          ticker={lockedModal}
          onClose={() => setLockedModal(null)}
        />
      )}

      {/* Sticky bottom CTA — visible only for non-premium after scrolling past hero */}
      {!isPremium && <CTAFooter visible={showStickyCTA} />}
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div
      className="rounded-lg p-4"
      style={{ backgroundColor: PANEL, border: '1px solid rgba(255,255,255,0.04)' }}
    >
      <p className="text-[11px] uppercase tracking-[0.18em]" style={{ color: DIM, fontFamily: "'Space Grotesk', sans-serif" }}>
        {label}
      </p>
      <p
        className="text-3xl font-black mt-1.5"
        style={{ color, fontFamily: "'JetBrains Mono', monospace" }}
      >
        {value}
      </p>
    </div>
  );
}

function SkeletonTile() {
  return (
    <div
      className="rounded-lg p-4"
      style={{
        backgroundColor: PANEL,
        borderTop: '4px solid rgba(255,255,255,0.06)',
        minHeight: 132,
      }}
    >
      <div className="shimmer w-16 h-3 rounded mb-2" />
      <div className="shimmer w-10 h-2 rounded mb-4" />
      <div className="shimmer w-24 h-5 rounded mb-2" />
      <div className="shimmer w-12 h-2 rounded mb-5" />
      <div className="shimmer w-20 h-3 rounded" />
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
