'use client';

import Link from 'next/link';

export default function CTAFooter({ visible }: { visible: boolean }) {
  return (
    <div
      aria-hidden={!visible}
      className="fixed bottom-0 left-0 right-0 z-40 transition-all duration-300"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        pointerEvents: visible ? 'auto' : 'none',
        background: 'linear-gradient(180deg, transparent 0%, rgba(10,14,22,0.92) 35%, #0A0E16 100%)',
        backdropFilter: 'blur(12px)',
        padding: '20px 16px 18px',
      }}
    >
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center gap-3 sm:gap-5 justify-between">
        <div className="text-center sm:text-left">
          <p className="text-[15px] sm:text-base font-bold leading-tight" style={{ color: '#EDF1F5', fontFamily: "'Montserrat', sans-serif" }}>
            Desbloqueá los 12 activos del radar
          </p>
          <p className="text-[12px] mt-0.5" style={{ color: '#B7BFCC' }}>
            Señales en tiempo real · Niveles exactos · Probabilidad por algoritmo
          </p>
        </div>
        <Link
          href="/billing"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-md font-bold text-sm transition-opacity hover:opacity-90 whitespace-nowrap shrink-0"
          style={{ backgroundColor: '#00D4FF', color: '#05080E', fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Activar Quantum Access →
        </Link>
      </div>
    </div>
  );
}
