'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import CryptoPayment from '@/components/CryptoPayment';

const C = {
  bg:     '#0A0A0B',
  card:   '#141415',
  border: '#222222',
  cyan:   '#00E5FF',
  gold:   '#c9a227',
  muted:  '#555555',
} as const;

const WA_MSG = 'Hola, quiero comprar el curso Frecuencia (200.000 Gs) en cuotas sin interés con Banco Familiar. ¿Cómo lo hacemos?';

export default function FrecuenciaPage() {
  const [loading, setLoading] = useState(false);

  const handleBuy = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/pagopar/create-product-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: 'frecuencia' }),
      });
      const data = await res.json();
      if (res.status === 401) {
        window.location.href = `/login?callbackUrl=${encodeURIComponent('/cursos/frecuencia')}`;
        return;
      }
      if (data.success && data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        alert('Error: ' + (data.error || data.pagoparError || 'No se pudo generar el pago'));
      }
    } catch {
      alert('Error al procesar el pago. Intentá nuevamente.');
    }
    setLoading(false);
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen pb-20 md:pb-0" style={{ backgroundColor: C.bg, fontFamily: "'Inter', sans-serif" }}>

        {/* ── HERO ── */}
        <section className="pt-28 sm:pt-36 pb-16 px-4 sm:px-6" style={{ borderBottom: `1px solid ${C.border}` }}>
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

              {/* Flyer */}
              <div className="order-2 lg:order-1">
                <div
                  className="overflow-hidden rounded-xl"
                  style={{ border: `1px solid ${C.border}`, backgroundColor: '#0e0e0f', boxShadow: `0 0 60px ${C.cyan}15` }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/cuadradex.png"
                    alt="Frecuencia — Curso de Trading"
                    className="w-full block"
                    style={{ objectFit: 'contain', maxHeight: '480px' }}
                  />
                </div>
              </div>

              {/* Copy */}
              <div className="order-1 lg:order-2">
                <div className="flex items-center gap-3 mb-5">
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: C.cyan }} />
                  <span
                    className="text-[10px] font-semibold uppercase tracking-[0.35em]"
                    style={{ color: C.cyan, fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    NUEVO CURSO · SACRED LEVELS
                  </span>
                  <span
                    className="text-[9px] font-bold uppercase tracking-[0.2em] px-2 py-0.5 rounded"
                    style={{ backgroundColor: `${C.gold}18`, color: C.gold, fontFamily: "'Space Grotesk', sans-serif", border: `1px solid ${C.gold}40` }}
                  >
                    NUEVO
                  </span>
                </div>

                <h1
                  className="text-5xl sm:text-6xl font-bold text-white mb-3 leading-[1.05]"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Frecuencia
                </h1>
                <p
                  className="text-lg mb-8 italic"
                  style={{ color: C.cyan, fontFamily: "'Playfair Display', serif" }}
                >
                  Decodificá la estructura fractal del mercado
                </p>

                {/* Price */}
                <div className="mb-8">
                  <span className="text-4xl font-bold text-white" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    Gs. 200.000
                  </span>
                  <span className="ml-3 text-sm" style={{ color: C.muted }}>/ $27 USD · Pago único</span>
                </div>

                {/* CTA */}
                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleBuy}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 py-4 px-8 font-bold text-sm uppercase tracking-[0.15em] text-black transition-opacity hover:opacity-90 disabled:opacity-50"
                    style={{ backgroundColor: C.cyan, fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {loading ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Procesando...
                      </>
                    ) : (
                      <>
                        Adquirir Ahora
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-center uppercase tracking-[0.15em]" style={{ color: C.muted, fontFamily: "'Space Grotesk', sans-serif" }}>
                    Acceso inmediato · Pago seguro vía PagoPar
                  </p>
                </div>

                {/* Quick trust */}
                <div className="flex flex-wrap gap-4 mt-6">
                  {['Acceso inmediato', 'Material descargable', 'Soporte WhatsApp'].map((t) => (
                    <span key={t} className="flex items-center gap-1.5 text-xs" style={{ color: '#555' }}>
                      <svg className="w-3 h-3 shrink-0" fill="none" stroke={C.cyan} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                      {t}
                    </span>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </section>


        {/* ── DESCRIPCIÓN ── */}
        <section className="py-16 px-4 sm:px-6" style={{ borderBottom: `1px solid ${C.border}` }}>
          <div className="max-w-3xl mx-auto">
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] mb-4" style={{ color: C.cyan, fontFamily: "'Space Grotesk', sans-serif" }}>
              El curso
            </p>
            <h2 className="text-3xl font-bold text-white mb-8" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              ¿Qué vas a aprender?
            </h2>

            <div className="pl-4 mb-8" style={{ borderLeft: `3px solid ${C.cyan}` }}>
              <p className="text-base leading-relaxed" style={{ color: '#888' }}>
                Frecuencia es una herramienta de análisis técnico avanzado que decodifica la estructura fractal del mercado
                mediante la sincronización del tiempo y el precio. Anclando la matriz en los extremos estructurales más
                relevantes del activo, esta herramienta proyecta zonas geométricas exactas donde el ciclo del mercado
                tiende a revertir, acelerarse o consolidar.
              </p>
            </div>

            {/* Feature list */}
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                'Estructura fractal del mercado',
                'Sincronización tiempo y precio',
                'Zonas geométricas de reversión',
                'Identificación de ciclos de mercado',
                'Extremos estructurales relevantes',
                'Proyecciones de aceleración y consolidación',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 py-2">
                  <span className="mt-1.5 w-1 h-1 shrink-0 rounded-full" style={{ backgroundColor: C.cyan }} />
                  <span className="text-sm" style={{ color: '#777' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FORMAS DE PAGO ── */}
        <section className="py-16 px-4 sm:px-6" style={{ borderBottom: `1px solid ${C.border}` }}>
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                💳 Pagá con total confianza
              </h2>
              <p className="text-sm mt-2" style={{ color: C.muted }}>
                Elegí el método que mejor se adapte a vos
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">

              {/* Card 1 — PagoPar */}
              <div
                className="flex flex-col p-6 rounded-xl"
                style={{ border: `1px solid ${C.cyan}30`, backgroundColor: C.card, boxShadow: `0 0 30px ${C.cyan}08` }}
              >
                <div className="mb-5">
                  {/* Logo placeholder — displays once pagopar.png is uploaded */}
                  <div className="mb-4 h-14 flex items-center">
                    <img
                      src="/pagopar.png"
                      alt="PagoPar"
                      style={{ height: '52px', objectFit: 'contain' }}
                      onError={(e) => {
                        const t = e.currentTarget as HTMLImageElement;
                        t.style.display = 'none';
                        const sibling = t.nextElementSibling as HTMLElement | null;
                        if (sibling) sibling.style.display = 'inline-block';
                      }}
                    />
                    <span
                      className="hidden text-lg font-bold"
                      style={{ color: C.cyan, fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      PagoPar
                    </span>
                  </div>
                  <h3 className="text-white font-bold text-lg mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Pago seguro online
                  </h3>
                  <p className="text-sm mb-4" style={{ color: C.muted }}>
                    Tarjetas de crédito/débito, transferencia, billeteras
                  </p>
                  <div className="flex items-center gap-2 text-sm" style={{ color: '#555' }}>
                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke={C.cyan} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                    Acceso inmediato tras el pago
                  </div>
                </div>
                <button
                  onClick={handleBuy}
                  disabled={loading}
                  className="mt-auto py-3.5 font-bold text-sm uppercase tracking-[0.12em] text-black transition-opacity hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: C.cyan, fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {loading ? 'Procesando...' : 'PAGAR CON PAGOPAR — Gs. 200.000'}
                </button>
              </div>

              {/* Card 2 — Cuotas Banco Familiar */}
              <div
                className="flex flex-col p-6 rounded-xl"
                style={{ border: `1px solid ${C.gold}30`, backgroundColor: C.card, boxShadow: `0 0 30px ${C.gold}08` }}
              >
                <div className="mb-5">
                  <div className="mb-4 h-14 flex items-center">
                    <img
                      src="/familiar.png"
                      alt="Banco Familiar"
                      style={{ height: '52px', objectFit: 'contain' }}
                    />
                  </div>
                  <h3 className="text-white font-bold text-lg mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Cuotas sin interés con Banco Familiar
                  </h3>
                  <p className="text-sm mb-4" style={{ color: C.muted }}>
                    Disponible para tarjetas de crédito Familiar
                  </p>
                  <div className="flex flex-col gap-2">
                    {[
                      '3, 6 o 12 cuotas sin interés',
                      'Mismo precio total: Gs. 200.000',
                    ].map((item) => (
                      <div key={item} className="flex items-center gap-2 text-sm" style={{ color: '#555' }}>
                        <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke={C.gold} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
                <WhatsAppButton
                  phoneNumber="595981234128"
                  message={WA_MSG}
                  label="CONSULTAR CUOTAS POR WHATSAPP"
                  variant="button"
                  className="mt-auto w-full justify-center py-3.5 font-bold text-xs uppercase tracking-[0.12em]"
                />
              </div>

            </div>

            {/* Crypto option */}
            <div className="mt-6 max-w-xl mx-auto">
              <CryptoPayment productName="Frecuencia · Estructura fractal del mercado" priceGs="200.000" priceUsd="31" />
            </div>
          </div>
        </section>

        {/* ── GARANTÍA Y CONFIANZA ── */}
        <section className="py-14 px-4 sm:px-6" style={{ backgroundColor: '#0d0d0e', borderBottom: `1px solid ${C.border}` }}>
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { icon: '🔒', title: 'Pagos 100% seguros', sub: 'Procesado por PagoPar' },
                { icon: '⚡', title: 'Acceso inmediato', sub: 'Tras confirmar el pago' },
                { icon: '📚', title: 'Material completo', sub: 'Descargable + videos' },
                { icon: '💬', title: 'Soporte incluido', sub: 'Respuesta por WhatsApp' },
              ].map(({ icon, title, sub }) => (
                <div
                  key={title}
                  className="flex flex-col items-center text-center p-4 rounded-xl"
                  style={{ border: `1px solid ${C.border}`, backgroundColor: C.card }}
                >
                  <span className="text-2xl mb-3">{icon}</span>
                  <p className="text-white font-semibold text-sm mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {title}
                  </p>
                  <p className="text-[11px]" style={{ color: C.muted }}>{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA FINAL ── */}
        <section className="py-16 px-4 sm:px-6" style={{ borderBottom: `1px solid ${C.border}` }}>
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
              ¿Listo para operar con la frecuencia del mercado?
            </h2>
            <p className="text-sm mb-8" style={{ color: C.muted }}>
              Acceso inmediato · Pago único · Sin suscripción
            </p>
            <button
              onClick={handleBuy}
              disabled={loading}
              className="w-full sm:w-auto px-10 py-4 font-bold text-base uppercase tracking-[0.15em] text-black transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: C.cyan, fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {loading ? 'Procesando...' : 'ADQUIRIR FRECUENCIA — Gs. 200.000'}
            </button>
            <p className="text-[10px] mt-3 uppercase tracking-[0.15em]" style={{ color: C.muted, fontFamily: "'Space Grotesk', sans-serif" }}>
              Cancelá cuando quieras · Pago seguro con Visa / Mastercard / Bancard
            </p>
          </div>
        </section>

        {/* ── DISCLAIMER ── */}
        <section className="py-8 px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xs leading-relaxed" style={{ color: '#333' }}>
              El contenido de este curso tiene fines educativos. El trading conlleva riesgo de pérdida de capital.
              Los resultados dependen de la disciplina y gestión de cada operador.
            </p>
          </div>
        </section>

      </main>
    </>
  );
}
