'use client';

import { useEffect, useRef, useState } from 'react';

export type Verdict = 'buy' | 'sell' | 'wait';

const GREEN = '#00E676';
const RED   = '#FF4757';
const GOLD  = '#FFD700';
const CYAN  = '#00D4FF';
const DIM   = '#6E7A8A';
const TXT   = '#EDF1F5';

const COLOR: Record<Verdict, string> = { buy: GREEN, sell: RED, wait: GOLD };
const LABEL: Record<Verdict, string> = { buy: 'Compra', sell: 'Venta', wait: 'Espera' };
const ICON:  Record<Verdict, string> = { buy: '🟢', sell: '🔴', wait: '🟡' };

interface Props {
  ticker: string;
  category: string;
  price: number | null;
  changePct: number | null;
  verdict: Verdict;
  confidence: number;
  locked: boolean;
  isNew: boolean;
  onClick: () => void;
  format: (v: number) => string;
}

export default function Tile({ ticker, category, price, changePct, verdict, confidence, locked, isNew, onClick, format }: Props) {
  const prevPrice = useRef<number | null>(null);
  const [flash, setFlash] = useState<'up' | 'down' | null>(null);

  useEffect(() => {
    if (price == null) return;
    if (prevPrice.current != null && price !== prevPrice.current) {
      setFlash(price > prevPrice.current ? 'up' : 'down');
      const t = setTimeout(() => setFlash(null), 320);
      prevPrice.current = price;
      return () => clearTimeout(t);
    }
    prevPrice.current = price;
  }, [price]);

  const color = COLOR[verdict];
  const up = (changePct ?? 0) >= 0;
  const priceStr = price != null && price > 0 ? format(price) : '—';
  const changeStr = changePct != null && price != null ? `${up ? '▲' : '▼'} ${Math.abs(changePct).toFixed(2)}%` : '—';

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={locked ? `${ticker} bloqueado — desbloqueá para ver` : `${ticker} ${LABEL[verdict]} confianza ${confidence}%`}
      className="group relative text-left rounded-lg overflow-hidden transition-all duration-200 focus:outline-none focus-visible:ring-2"
      style={{
        backgroundColor: '#11161F',
        borderTop: `4px solid ${color}`,
        boxShadow: `0 0 0 1px rgba(255,255,255,0.04), 0 0 18px ${color}22`,
        padding: '14px 14px 12px',
      }}
    >
      <style jsx>{`
        button:hover {
          transform: translateY(-3px);
          box-shadow: 0 0 0 1px rgba(255,255,255,0.08), 0 12px 28px ${color}44, 0 0 32px ${color}33;
        }
        button:focus-visible {
          outline: 2px solid ${CYAN};
          outline-offset: 2px;
        }
      `}</style>

      {/* Top row: ticker + lock/new */}
      <div className="flex items-start justify-between mb-1">
        <div>
          <p className="text-[15px] font-bold leading-none" style={{ color: TXT, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '-0.3px' }}>
            {ticker}
          </p>
          <p className="text-[9px] uppercase tracking-[0.18em] mt-1" style={{ color: DIM, fontFamily: "'Space Grotesk', sans-serif" }}>
            {category}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          {locked && (
            <span aria-hidden className="inline-flex items-center justify-center w-5 h-5 rounded-full" style={{ backgroundColor: 'rgba(255,215,0,0.12)', color: GOLD }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="4" y="11" width="16" height="10" rx="2" />
                <path d="M8 11V7a4 4 0 018 0v4" />
              </svg>
            </span>
          )}
          {isNew && !locked && (
            <span
              className="text-[8px] font-bold uppercase tracking-[0.2em] px-1.5 py-0.5 rounded-sm animate-pulse"
              style={{ backgroundColor: `${color}22`, color, fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Nueva
            </span>
          )}
        </div>
      </div>

      {/* Price + change */}
      <div className="mt-3 mb-3">
        <p
          className="text-[19px] font-bold leading-none transition-colors duration-300"
          style={{
            color: TXT,
            fontFamily: "'JetBrains Mono', monospace",
            backgroundColor: flash === 'up' ? 'rgba(0,230,118,0.22)' : flash === 'down' ? 'rgba(255,71,87,0.22)' : 'transparent',
            padding: '2px 4px',
            margin: '-2px -4px',
            borderRadius: 4,
            filter: locked ? 'blur(5px)' : 'none',
            userSelect: locked ? 'none' : 'auto',
          }}
        >
          {priceStr}
        </p>
        <p
          className="text-[11px] font-semibold mt-1.5"
          style={{
            color: up ? GREEN : RED,
            fontFamily: "'JetBrains Mono', monospace",
            filter: locked ? 'blur(4px)' : 'none',
            userSelect: locked ? 'none' : 'auto',
          }}
        >
          {changeStr}
        </p>
      </div>

      {/* Verdict bar */}
      <div className="flex items-center justify-between pt-2.5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <p className="text-[12px] font-bold" style={{ color, fontFamily: "'Space Grotesk', sans-serif" }}>
          {ICON[verdict]} {LABEL[verdict]}
        </p>
        <p className="text-[10px]" style={{ color: DIM, fontFamily: "'JetBrains Mono', monospace" }}>
          {confidence}%
        </p>
      </div>
    </button>
  );
}
