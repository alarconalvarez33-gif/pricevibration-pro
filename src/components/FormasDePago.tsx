'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

const C = {
  bg:     '#0A0A0B',
  card:   '#141415',
  border: '#222222',
  cyan:   '#00E5FF',
  muted:  '#555555',
} as const;

const trustSignals = [
  { icon: '🔒', label: 'Pagos 100% seguros' },
  { icon: '💳', label: 'Múltiples métodos disponibles' },
  { icon: '🇵🇾', label: 'Guaraníes y USD' },
  { icon: '⚡', label: 'Acceso inmediato tras el pago' },
];

export default function FormasDePago() {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.08 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className="py-20 md:py-28 px-6"
      style={{ backgroundColor: C.bg, borderBottom: `1px solid ${C.border}` }}
    >
      <div
        className="max-w-5xl mx-auto text-center"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(28px)',
          transition: 'opacity 0.65s ease, transform 0.65s ease',
        }}
      >
        {/* Eyebrow */}
        <p
          className="text-[10px] font-semibold uppercase tracking-[0.3em] mb-4"
          style={{ color: C.cyan, fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Formas de Pago
        </p>

        {/* Title */}
        <h2
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 leading-tight"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Paga con Total Confianza
        </h2>

        {/* Description */}
        <p
          className="text-sm sm:text-base leading-relaxed max-w-xl mx-auto mb-12"
          style={{ color: C.muted, fontFamily: "'Inter', sans-serif" }}
        >
          Múltiples opciones de pago disponibles para clientes en Paraguay y el mundo.
          Operaciones seguras, simples y con acceso inmediato a tu contenido.
        </p>

        {/* Image — glassmorphism container */}
        <div
          className="mx-auto max-w-4xl rounded-2xl overflow-hidden mb-12"
          style={{
            backgroundColor: `${C.card}cc`,
            border: `1px solid ${C.cyan}20`,
            boxShadow: `0 0 40px ${C.cyan}08, 0 8px 32px rgba(0,0,0,0.5)`,
            backdropFilter: 'blur(8px)',
          }}
        >
          <Image
            src="/pagos.png"
            alt="Formas de pago aceptadas"
            width={1200}
            height={600}
            className="w-full h-auto"
            style={{ display: 'block' }}
          />
        </div>

        {/* Trust signals */}
        <div className="flex flex-wrap justify-center gap-3 sm:gap-5 mb-12">
          {trustSignals.map(({ icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl"
              style={{
                backgroundColor: `${C.cyan}08`,
                border: `1px solid ${C.cyan}18`,
              }}
            >
              <span className="text-base leading-none">{icon}</span>
              <span
                className="text-xs font-medium text-white"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Secondary CTA */}
        <a
          href="#contacto"
          className="inline-flex items-center gap-2 border px-8 py-3.5 text-sm font-bold uppercase tracking-[0.12em] transition-all duration-200 hover:border-[#00E5FF]/50 hover:text-[#00E5FF] text-[#555]"
          style={{ borderColor: C.border, fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Reservar mi lugar
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </a>
      </div>
    </section>
  );
}
