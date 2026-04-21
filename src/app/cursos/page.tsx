'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

const C = {
  bg:     '#0A0A0B',
  card:   '#141415',
  border: '#222222',
  cyan:   '#00E5FF',
  gold:   '#c9a227',
  muted:  '#555555',
} as const;

interface Course {
  id:          string;
  slug:        string;
  name:        string;
  subtitle:    string;
  description: string;
  price:       string;
  priceUSD:    string;
  flyer:       string;
  badge:       string;
  badgeColor:  string;
  isNew?:      boolean;
  buyPath:     string;
}

const COURSES: Course[] = [
  {
    id:          'frecuencia',
    slug:        'frecuencia',
    name:        'Frecuencia',
    subtitle:    'Decodificá la estructura fractal del mercado',
    description: 'Herramienta de análisis técnico avanzado que sincroniza tiempo y precio para proyectar zonas geométricas exactas de reversión, aceleración o consolidación.',
    price:       'Gs. 200.000',
    priceUSD:    '$27 USD',
    flyer:       '/cuadradex.png',
    badge:       'Nuevo',
    badgeColor:  C.gold,
    isNew:       true,
    buyPath:     '/cursos/frecuencia',
  },
  {
    id:          'super-estrategia',
    slug:        'super-estrategia',
    name:        'Super Estrategia',
    subtitle:    'El punto de partida definitivo',
    description: 'La estrategia base que todo trader debe dominar antes de cualquier otro método. Estructura, disciplina y entradas de alta probabilidad.',
    price:       'Gs. 65.000',
    priceUSD:    '$10 USD',
    flyer:       '/super-estrategia.jpg.png',
    badge:       'Básico',
    badgeColor:  C.cyan,
    buyPath:     '/curso',
  },
  {
    id:          'adx',
    slug:        'adx',
    name:        'Estrategia ADX',
    subtitle:    'Tendencia con confirmación cuantitativa',
    description: 'Domina el indicador ADX para filtrar tendencias reales y eliminar el ruido del mercado. Incluye guía PDF descargable exclusiva.',
    price:       'Gs. 220.000',
    priceUSD:    '$30 USD',
    flyer:       '/vaso.png',
    badge:       'Avanzado',
    badgeColor:  C.gold,
    buyPath:     '/',
  },
  {
    id:          'expansion-matematica',
    slug:        'expansion-matematica',
    name:        'Genesis',
    subtitle:    'Expansión matemática del precio',
    description: 'El método de raíz cuadrada aplicado con precisión quirúrgica. Aprende a calcular los niveles exactos donde el precio reacciona.',
    price:       'Gs. 500.000',
    priceUSD:    '$77 USD',
    flyer:       '/flyer1.jpg',
    badge:       'Premium',
    badgeColor:  C.gold,
    buyPath:     '/',
  },
];

export default function CursosPage() {
  const [buyLoading, setBuyLoading] = useState<string | null>(null);

  const handleBuy = async (productId: string, redirectPath: string) => {
    // For courses with a dedicated page, navigate there
    if (redirectPath !== '/') {
      window.location.href = redirectPath;
      return;
    }
    setBuyLoading(productId);
    try {
      const res = await fetch('/api/pagopar/create-product-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();
      if (res.status === 401) {
        window.location.href = `/login?callbackUrl=${encodeURIComponent('/cursos')}`;
        return;
      }
      if (data.success && data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        alert('Error: ' + (data.error || 'No se pudo generar el pago'));
      }
    } catch {
      alert('Error al procesar el pago.');
    }
    setBuyLoading(null);
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen pb-20 md:pb-0" style={{ backgroundColor: C.bg, fontFamily: "'Inter', sans-serif" }}>

        {/* ── HEADER ── */}
        <section className="pt-28 sm:pt-36 pb-12 px-4 sm:px-6" style={{ borderBottom: `1px solid ${C.border}` }}>
          <div className="max-w-6xl mx-auto">
            <p className="text-[10px] font-semibold uppercase tracking-[0.35em] mb-4" style={{ color: C.cyan, fontFamily: "'Space Grotesk', sans-serif" }}>
              Formación
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Cursos de Trading
            </h1>
            <p className="text-base max-w-xl" style={{ color: C.muted }}>
              Comprás una vez, accedés para siempre. Sin suscripción.
            </p>
          </div>
        </section>

        {/* ── GRID ── */}
        <section className="py-12 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">

            {/* Course access notice */}
            <div
              className="flex items-start gap-3 mb-10 px-4 py-3 rounded-xl"
              style={{ background: `${C.cyan}10`, border: `1px solid ${C.cyan}25` }}
            >
              <span className="text-lg shrink-0 mt-0.5">ℹ️</span>
              <p className="text-sm" style={{ color: C.cyan }}>
                Al comprar cualquier curso, accedé al contenido completo desde la sección <strong>CURSOS</strong> en tu cuenta.
              </p>
            </div>

            <div className="grid md:grid-cols-2 xl:grid-cols-2 gap-6">
              {COURSES.map((course) => (
                <div
                  key={course.id}
                  className="group flex flex-col overflow-hidden rounded-xl transition-all duration-300 hover:-translate-y-1"
                  style={{
                    backgroundColor: C.card,
                    border: `1px solid ${course.badgeColor}30`,
                    boxShadow: `0 0 30px ${course.badgeColor}08`,
                  }}
                >
                  {/* Flyer */}
                  <div className="relative overflow-hidden" style={{ backgroundColor: '#0e0e0f', minHeight: '220px' }}>
                    {course.isNew && (
                      <div className="absolute top-3 left-3 z-10">
                        <span
                          className="text-[9px] font-bold uppercase tracking-[0.25em] px-2.5 py-1"
                          style={{
                            backgroundColor: `${C.gold}18`,
                            color: C.gold,
                            fontFamily: "'Space Grotesk', sans-serif",
                            border: `1px solid ${C.gold}40`,
                          }}
                        >
                          NUEVO
                        </span>
                      </div>
                    )}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={course.flyer}
                      alt={course.name}
                      className="w-full transition-transform duration-300 group-hover:scale-[1.03]"
                      style={{ objectFit: 'cover', display: 'block', maxHeight: '260px', width: '100%' }}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex flex-col flex-1 p-5 gap-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span
                          className="text-[9px] font-bold uppercase tracking-[0.25em] px-2 py-0.5 rounded"
                          style={{ backgroundColor: `${course.badgeColor}18`, color: course.badgeColor, fontFamily: "'Space Grotesk', sans-serif" }}
                        >
                          {course.badge}
                        </span>
                        <h2
                          className="text-xl font-bold text-white mt-2 leading-tight"
                          style={{ fontFamily: "'Playfair Display', serif" }}
                        >
                          {course.name}
                        </h2>
                        <p
                          className="text-xs italic mt-0.5"
                          style={{ color: C.cyan, fontFamily: "'Playfair Display', serif" }}
                        >
                          {course.subtitle}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-base font-bold text-white" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                          {course.price}
                        </p>
                        <p className="text-[11px]" style={{ color: C.muted }}>{course.priceUSD}</p>
                      </div>
                    </div>

                    <p className="text-sm leading-relaxed" style={{ color: '#777' }}>
                      {course.description}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-2 mt-auto pt-2">
                      <Link
                        href={course.buyPath === '/' ? `/cursos/${course.slug}` : course.buyPath}
                        className="flex-1 py-2.5 text-xs font-bold uppercase tracking-[0.12em] text-center transition-all duration-200 hover:opacity-80"
                        style={{
                          border: `1px solid ${course.badgeColor}`,
                          color: course.badgeColor,
                          fontFamily: "'Space Grotesk', sans-serif",
                        }}
                      >
                        Más Info
                      </Link>
                      <button
                        onClick={() => handleBuy(course.id, course.buyPath)}
                        disabled={buyLoading === course.id}
                        className="flex-1 py-2.5 text-xs font-bold uppercase tracking-[0.12em] transition-all duration-200 hover:opacity-90 disabled:opacity-50"
                        style={{
                          backgroundColor: course.badgeColor === C.gold ? C.gold : C.cyan,
                          color: '#000',
                          fontFamily: "'Space Grotesk', sans-serif",
                        }}
                      >
                        {buyLoading === course.id ? 'Procesando...' : 'Comprar Ahora'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>
    </>
  );
}
