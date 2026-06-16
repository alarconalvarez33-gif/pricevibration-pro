'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import type { Verdict } from './Tile';

const GREEN = '#00E676';
const RED   = '#FF4757';
const GOLD  = '#FFD700';
const CYAN  = '#00D4FF';
const DIM   = '#6E7A8A';
const TXT   = '#EDF1F5';

const COLOR: Record<Verdict, string> = { buy: GREEN, sell: RED, wait: GOLD };
const LABEL: Record<Verdict, string> = { buy: 'Compra', sell: 'Venta', wait: 'Espera' };

const DESCRIPTION: Record<Verdict, string> = {
  buy:  'El precio entró en una zona de soporte de alta probabilidad. Esperá la vela de confirmación antes de operar.',
  sell: 'El precio entró en una zona de resistencia de alta probabilidad. Esperá la vela de confirmación antes de operar.',
  wait: 'El precio está fuera de zonas de alta probabilidad. Mantenete al margen hasta que el radar detecte una entrada clara.',
};

interface Level { n: number; price: number; }

interface Props {
  open: boolean;
  onClose: () => void;
  ticker: string;
  category: string;
  price: number | null;
  changePct: number | null;
  verdict: Verdict;
  confidence: number;
  resistances: Level[];
  supports: Level[];
  format: (v: number) => string;
  isPremium: boolean;
}

export default function DetailDrawer({
  open, onClose, ticker, category, price, changePct, verdict, confidence, resistances, supports, format, isPremium,
}: Props) {

  useEffect(() => {
    if (!open) return;
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleEsc);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleEsc);
    };
  }, [open, onClose]);

  if (!open) return null;

  const color = COLOR[verdict];
  const up = (changePct ?? 0) >= 0;
  const priceStr = price != null && price > 0 ? format(price) : '—';
  const maxN = 8;

  return (
    <div className="fixed inset-0 z-[100] flex" role="dialog" aria-modal="true" aria-label={`Detalle de ${ticker}`}>
      <div
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(5,8,14,0.7)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      />
      <div
        className="relative ml-auto w-full md:w-[480px] max-h-screen overflow-y-auto drawer-anim"
        style={{ backgroundColor: '#0F141C', borderLeft: '1px solid rgba(255,255,255,0.08)' }}
      >
        <style jsx>{`
          .drawer-anim { animation: slide 0.28s cubic-bezier(.2,.8,.2,1); }
          @media (max-width: 767px) {
            .drawer-anim {
              margin-top: auto;
              border-radius: 16px 16px 0 0;
              max-height: 88vh;
              animation: rise 0.28s cubic-bezier(.2,.8,.2,1);
            }
          }
          @keyframes slide { from { transform: translateX(40px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
          @keyframes rise  { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        `}</style>

        <header className="sticky top-0 z-10 flex items-center justify-between p-5" style={{ backgroundColor: '#0F141C', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em]" style={{ color: DIM, fontFamily: "'Space Grotesk', sans-serif" }}>{category}</p>
            <h2 className="text-2xl font-black mt-1" style={{ color: TXT, fontFamily: "'Montserrat', sans-serif" }}>{ticker}</h2>
          </div>
          <button
            type="button"
            aria-label="Cerrar"
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
            style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: TXT }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 6l12 12M6 18L18 6" /></svg>
          </button>
        </header>

        <div className="p-5">
          {/* Price */}
          <div className="mb-5">
            <p className="text-[44px] font-black leading-none" style={{ color: TXT, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '-1.5px' }}>
              {priceStr}
            </p>
            <p className="text-sm mt-2 font-semibold" style={{ color: up ? GREEN : RED, fontFamily: "'JetBrains Mono', monospace" }}>
              {changePct != null ? `${up ? '▲' : '▼'} ${Math.abs(changePct).toFixed(2)}%` : '—'} <span style={{ color: DIM }}>· 24h</span>
            </p>
          </div>

          {/* Verdict banner */}
          <div
            className="mb-5 p-4 rounded-lg"
            style={{
              backgroundColor: `${color}10`,
              borderLeft: `4px solid ${color}`,
            }}
          >
            <p className="text-[10px] uppercase tracking-[0.25em] mb-1" style={{ color: DIM, fontFamily: "'Space Grotesk', sans-serif" }}>Veredicto</p>
            <p className="text-xl font-bold mb-2" style={{ color, fontFamily: "'Montserrat', sans-serif" }}>{LABEL[verdict]}</p>
            <p className="text-[13px] leading-relaxed" style={{ color: '#B7BFCC', fontFamily: "'Inter', sans-serif" }}>
              {DESCRIPTION[verdict]}
            </p>
          </div>

          {/* Confidence */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] uppercase tracking-[0.25em]" style={{ color: DIM, fontFamily: "'Space Grotesk', sans-serif" }}>Confianza</p>
              <p className="text-sm font-bold" style={{ color, fontFamily: "'JetBrains Mono', monospace" }}>{confidence}%</p>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${confidence}%`, backgroundColor: color }} />
            </div>
          </div>

          {/* Ladder */}
          <div className="mb-5">
            <p className="text-[10px] uppercase tracking-[0.25em] mb-3" style={{ color: DIM, fontFamily: "'Space Grotesk', sans-serif" }}>
              Escalera de niveles
            </p>

            <div className="space-y-1.5">
              {[...resistances].reverse().map(lv => (
                <LadderRow
                  key={`r-${lv.n}`}
                  label={`R${lv.n}`}
                  price={lv.price}
                  format={format}
                  color={RED}
                  fillPct={(lv.n / maxN) * 100}
                  align="right"
                />
              ))}

              <div
                className="my-2 px-3 py-2.5 rounded-md flex items-center justify-between"
                style={{ backgroundColor: 'rgba(0,212,255,0.08)', borderLeft: `3px solid ${CYAN}`, borderRight: `3px solid ${CYAN}` }}
              >
                <p className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: CYAN, fontFamily: "'Space Grotesk', sans-serif" }}>
                  Precio actual
                </p>
                <p className="text-sm font-bold" style={{ color: CYAN, fontFamily: "'JetBrains Mono', monospace" }}>
                  {priceStr}
                </p>
              </div>

              {supports.map(lv => (
                <LadderRow
                  key={`s-${lv.n}`}
                  label={`S${lv.n}`}
                  price={lv.price}
                  format={format}
                  color={GREEN}
                  fillPct={(lv.n / maxN) * 100}
                  align="right"
                />
              ))}
            </div>
          </div>

          {!isPremium && (
            <div
              className="mt-6 p-5 rounded-lg"
              style={{
                background: 'linear-gradient(135deg, rgba(0,212,255,0.08), rgba(255,215,0,0.06))',
                border: '1px solid rgba(0,212,255,0.25)',
              }}
            >
              <p className="text-base font-black mb-1" style={{ color: TXT, fontFamily: "'Montserrat', sans-serif" }}>
                Desbloqueá los 12 activos del radar
              </p>
              <p className="text-[13px] mb-4" style={{ color: '#B7BFCC' }}>
                Señales en tiempo real. Niveles exactos. Probabilidad calculada por algoritmo.
              </p>
              <Link
                href="/billing"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md font-bold text-sm transition-opacity hover:opacity-90"
                style={{ backgroundColor: CYAN, color: '#05080E', fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Activar Quantum Access →
              </Link>
            </div>
          )}

          {/* Disclaimer dentro del detalle */}
          <div
            className="mt-6 p-4 rounded-md"
            style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <p className="text-[11px] leading-relaxed" style={{ color: '#B7BFCC' }}>
              <strong style={{ color: GOLD }}>Aviso:</strong> los precios pueden diferir levemente del cotizador del broker. Esta información es solo educativa
              y no constituye asesoramiento financiero. <strong style={{ color: TXT }}>Ud. es el único responsable de sus decisiones de trading.</strong> Confirmá siempre con su vela de cierre.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function LadderRow({ label, price, format, color, fillPct, align }: { label: string; price: number; format: (v: number) => string; color: string; fillPct: number; align: 'left' | 'right' }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] font-bold w-7" style={{ color, fontFamily: "'JetBrains Mono', monospace" }}>{label}</span>
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${Math.max(8, fillPct)}%`,
            backgroundColor: color,
            marginLeft: align === 'right' ? 'auto' : 0,
            opacity: 0.85,
          }}
        />
      </div>
      <span className="text-[11px] w-20 text-right" style={{ color: '#B7BFCC', fontFamily: "'JetBrains Mono', monospace" }}>
        {format(price)}
      </span>
    </div>
  );
}
