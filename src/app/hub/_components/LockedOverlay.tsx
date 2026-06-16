'use client';

import { useEffect } from 'react';
import Link from 'next/link';

interface Props {
  open: boolean;
  ticker: string;
  onClose: () => void;
}

export default function LockedOverlay({ open, ticker, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleEsc);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', handleEsc);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-5" role="dialog" aria-modal="true" aria-label="Activar acceso premium">
      <div
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(5,8,14,0.78)', backdropFilter: 'blur(6px)' }}
        onClick={onClose}
      />
      <div
        className="relative w-full max-w-md rounded-xl overflow-hidden modal-anim"
        style={{
          background: 'linear-gradient(180deg, #11161F 0%, #0E131C 100%)',
          border: '1px solid rgba(0,212,255,0.25)',
          boxShadow: '0 24px 60px rgba(0,0,0,0.6), 0 0 80px rgba(0,212,255,0.12)',
        }}
      >
        <style jsx>{`
          .modal-anim { animation: pop 0.22s cubic-bezier(.2,.8,.2,1); }
          @keyframes pop { from { transform: scale(.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        `}</style>

        <button
          type="button"
          aria-label="Cerrar"
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
          style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: '#EDF1F5' }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 6l12 12M6 18L18 6" /></svg>
        </button>

        <div className="p-7 text-center">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-5"
            style={{ backgroundColor: 'rgba(255,215,0,0.12)', border: '1px solid rgba(255,215,0,0.25)' }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFD700" strokeWidth="2.4">
              <rect x="4" y="11" width="16" height="10" rx="2" />
              <path d="M8 11V7a4 4 0 018 0v4" />
            </svg>
          </div>

          <p className="text-[10px] uppercase tracking-[0.3em] mb-2" style={{ color: '#FFD700', fontFamily: "'Space Grotesk', sans-serif" }}>
            {ticker} · Bloqueado
          </p>
          <h3 className="text-2xl font-black mb-3" style={{ color: '#EDF1F5', fontFamily: "'Montserrat', sans-serif", letterSpacing: '-0.5px' }}>
            Desbloqueá los 12 activos del radar
          </h3>
          <p className="text-sm leading-relaxed mb-6" style={{ color: '#B7BFCC', fontFamily: "'Inter', sans-serif" }}>
            Señales en tiempo real. Niveles exactos. Probabilidad calculada por algoritmo.
          </p>

          <Link
            href="/billing"
            className="inline-flex items-center gap-2 w-full justify-center px-6 py-3.5 rounded-md font-bold text-sm transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#00D4FF', color: '#05080E', fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Activar Quantum Access →
          </Link>

          <p className="text-[11px] mt-4" style={{ color: '#6E7A8A' }}>
            $30 USD · 30 USDT · Gs. 180.000 / mes
          </p>
        </div>
      </div>
    </div>
  );
}
