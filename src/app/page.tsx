'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';

/* ── Design tokens ── */
const C = {
  bg:     '#0A0A0B',
  card:   '#141415',
  border: '#222222',
  cyan:   '#00E5FF',
  green:  '#00D26A',
  red:    '#FF4757',
  muted:  '#555555',
  subtle: '#333333',
} as const;

export default function HomePage() {
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState('');
  const [cursoLoading, setCursoLoading] = useState(false);

  const handleBuyCurso = async () => {
    setCursoLoading(true);
    try {
      const res = await fetch('/api/pagopar/curso-order', { method: 'POST' });
      const data = await res.json();
      if (data.success && data.paymentUrl) window.location.href = data.paymentUrl;
      else alert('Error: ' + (data.error || data.pagoparError || 'No se pudo generar el pago'));
    } catch { alert('Error al procesar el pago'); }
    setCursoLoading(false);
  };

  const [flyer1Loading, setFlyer1Loading] = useState(false);

  const handleBuyFlyer1 = async () => {
    setFlyer1Loading(true);
    try {
      const res = await fetch('/api/pagopar/create-product-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: 'expansion-matematica' }),
      });
      const data = await res.json();
      if (data.success && data.paymentUrl) window.location.href = data.paymentUrl;
      else alert('Error: ' + (data.error || data.pagoparError || 'No se pudo generar el pago'));
    } catch { alert('Error al procesar el pago'); }
    setFlyer1Loading(false);
  };

  const handleContactSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');
    setFormSuccess(false);
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await response.json();
      if (response.ok && json.success) {
        setFormSuccess(true);
        form.reset();
      } else {
        setFormError(json.error || 'Error al enviar. Intenta de nuevo.');
      }
    } catch {
      setFormError('Error al enviar. Escribinos a info@sacredlevels.com');
    }
    setFormLoading(false);
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen" style={{ backgroundColor: C.bg, fontFamily: "'Inter', sans-serif" }}>

        {/* ── HERO ─────────────────────────────────────────────────── */}
        <section className="relative pt-40 pb-28 px-6 overflow-hidden">
          {/* Subtle grid texture */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(${C.border} 1px, transparent 1px), linear-gradient(90deg, ${C.border} 1px, transparent 1px)`,
              backgroundSize: '60px 60px',
            }}
          />
          {/* Top glow — restrained */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[1px]"
            style={{ background: `linear-gradient(90deg, transparent, ${C.cyan}40, transparent)` }}
          />

          <div className="relative max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">

              {/* ── Left: hero copy ── */}
              <div>
                <div className="flex items-center gap-3 mb-8">
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: C.green }} />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.3em]"
                    style={{ color: C.muted, fontFamily: "'Space Grotesk', sans-serif" }}>
                    Sacred Levels — Plataforma Cuántica de Trading
                  </span>
                </div>

                <h1 className="text-5xl md:text-6xl font-bold leading-[1.05] mb-8 text-white"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Predice niveles donde<br />
                  <span style={{ color: C.cyan }}>el precio va a girar.</span>
                </h1>

                <p className="text-lg text-[#666] mb-12 leading-relaxed">
                  Niveles cuánticos de alta probabilidad para Forex, Oro y Crypto.
                  Matemática n² aplicada al precio.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mb-12">
                  <Link href="/quantum"
                    className="inline-flex items-center gap-2 px-8 py-4 font-bold text-sm uppercase tracking-[0.12em] text-black transition-all duration-200"
                    style={{ backgroundColor: C.cyan, fontFamily: "'Space Grotesk', sans-serif" }}>
                    Probar Calculadora Cuadrática
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                  <Link href="/billing"
                    className="inline-flex items-center gap-2 px-8 py-4 font-bold text-sm uppercase tracking-[0.12em] text-white border transition-all duration-200 hover:border-[#00E5FF]/50 hover:text-[#00E5FF]"
                    style={{ borderColor: C.border, fontFamily: "'Space Grotesk', sans-serif" }}>
                    Ver Planes
                  </Link>
                </div>

                <div className="flex flex-wrap gap-6 text-[#444] text-xs">
                  {['3 usos gratis sin registrarse', 'Sin tarjeta de crédito', 'Resultados instantáneos'].map((t) => (
                    <span key={t} className="flex items-center gap-2">
                      <svg className="w-3 h-3 shrink-0" fill="none" stroke={C.green} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* ── Right: course flyers ── */}
              <div className="flex gap-4 justify-center">

                {/* Flyer 1 — Curso Premium */}
                <div className="group flex flex-col items-center gap-2 flex-1 min-w-0">
                  <div
                    className="w-full rounded-xl overflow-hidden transition-transform duration-300 group-hover:scale-[1.03]"
                    style={{
                      backgroundColor: C.bg,
                      border: `1px solid ${C.border}`,
                      boxShadow: `0 0 30px ${C.cyan}10, 0 0 60px ${C.cyan}06`,
                    }}
                  >
                    <img
                      src="/flyer1.jpg"
                      alt="Curso Premium"
                      style={{ width: '100%', height: 'auto', objectFit: 'contain', display: 'block' }}
                    />
                  </div>
                  <p
                    className="text-white text-xs font-bold text-center"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    Gs. 500.000 <span style={{ color: C.muted }}>/ $77 USD</span>
                  </p>
                  <button
                    onClick={handleBuyFlyer1}
                    disabled={flyer1Loading}
                    className="w-full py-2.5 text-xs font-bold uppercase tracking-[0.15em] text-black rounded transition-opacity hover:opacity-90 disabled:opacity-50"
                    style={{ backgroundColor: C.cyan, fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {flyer1Loading ? 'Procesando...' : 'Comprar'}
                  </button>
                </div>

                {/* Flyer 2 — Próximamente */}
                <div className="flex flex-col items-center gap-2 flex-1">
                  <div
                    className="w-full rounded-xl flex flex-col items-center justify-center"
                    style={{
                      aspectRatio: '210/297',
                      border: `1.5px dashed ${C.cyan}40`,
                      backgroundColor: `${C.cyan}05`,
                    }}
                  >
                    <span
                      className="text-[10px] font-bold uppercase tracking-[0.3em]"
                      style={{ color: `${C.cyan}70`, fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      Próximamente
                    </span>
                  </div>
                  <p className="text-[10px] text-center" style={{ color: C.muted }}>Nuevo curso en camino</p>
                </div>

              </div>

            </div>
          </div>
        </section>

        {/* ── SUPER ESTRATEGIA ─────────────────────────────────────── */}
        <section className="py-20 px-6" style={{ backgroundColor: '#0d0d0e' }}>
          <div className="max-w-[900px] mx-auto">
            <div className="text-center mb-10">
              <p
                className="text-[10px] font-semibold uppercase tracking-[0.3em] mb-4"
                style={{ color: C.cyan, fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Curso Exclusivo
              </p>
              <h2
                className="text-4xl font-bold text-white mb-3"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Super Estrategia
              </h2>
              <p className="text-sm" style={{ color: C.muted }}>
                Curso independiente de trading avanzado con estrategias probadas
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-10 items-center">
              {/* Flyer */}
              <div
                className="rounded-xl overflow-hidden"
                style={{ border: `1px solid #222`, backgroundColor: '#111' }}
              >
                <img
                  src="/Super estrategia.jpg"
                  alt="Super Estrategia - Curso Exclusivo"
                  style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'contain' }}
                />
              </div>

              {/* Info */}
              <div>
                <ul className="space-y-3 mb-8">
                  {[
                    'Estrategia de trading probada en mercados reales',
                    'Análisis técnico avanzado paso a paso',
                    'Gestión de riesgo profesional',
                    'Estrategias probadas en mercados reales',
                    'Acceso de por vida al material',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm" style={{ color: C.muted }}>
                      <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke={C.cyan} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="flex items-baseline gap-3 mb-1">
                  <p
                    className="text-4xl font-bold"
                    style={{ color: '#C4A77D', fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    Gs. 65.000
                  </p>
                  <p className="text-sm" style={{ color: C.muted }}>/ $10 USD</p>
                </div>
                <p className="text-xs mb-2" style={{ color: C.muted }}>
                  Pago único · Cuotas disponibles con tarjetas Familiar y Ueno
                </p>
                <p className="text-[10px] mb-6" style={{ color: '#444' }}>
                  Internacionales: podés pagar con tarjeta de crédito/débito internacional en el checkout. El contenido es educativo y no constituye asesoramiento financiero.
                </p>

                <button
                  onClick={handleBuyCurso}
                  disabled={cursoLoading}
                  className="w-full py-4 text-sm font-bold uppercase tracking-[0.1em] text-black transition-opacity hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: '#C4A77D', fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {cursoLoading ? 'Procesando...' : 'Comprar Curso — Gs. 65.000'}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── VIDEO TUTORIAL ───────────────────────────────────────── */}
        <section className="py-20 px-6" style={{ backgroundColor: C.bg }}>
          <div className="max-w-[800px] mx-auto">
            <div className="text-center mb-8">
              <p
                className="text-[10px] font-semibold uppercase tracking-[0.3em] mb-4"
                style={{ color: C.cyan, fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Tutorial
              </p>
              <h2
                className="text-3xl font-bold text-white mb-3"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Cómo Usar Sacred Levels
              </h2>
              <p className="text-sm" style={{ color: C.muted }}>
                Mirá este tutorial rápido para comenzar
              </p>
            </div>

            {/* Video container */}
            <div
              className="relative w-full overflow-hidden rounded-xl"
              style={{
                paddingBottom: '56.25%', /* 16:9 */
                backgroundColor: '#000',
                boxShadow: '0 0 40px rgba(196, 167, 125, 0.08), 0 0 80px rgba(196, 167, 125, 0.04)',
                border: `1px solid ${C.border}`,
              }}
            >
              <iframe
                className="absolute top-0 left-0 w-full h-full rounded-xl"
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/nSOP0BqqNfw?si=QiIwtdOgsQXWKBBQ"
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ─────────────────────────────────────────── */}
        <section className="py-24 px-6 border-y" style={{ borderColor: C.border }}>
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p
                className="text-[10px] font-semibold uppercase tracking-[0.3em] mb-6"
                style={{ color: C.cyan, fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Metodología
              </p>
              <h2
                className="text-4xl font-bold text-white mb-10"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Cómo funciona
              </h2>
              <div className="space-y-8">
                {[
                  { n: '01', title: 'Ingresa el rango', desc: 'Precio máximo y mínimo del período que analizas.' },
                  { n: '02', title: 'Obtén los niveles', desc: '9 niveles cuánticos calculados con la fórmula E=n² de distribución de energía.' },
                  { n: '03', title: 'Opera con ventaja', desc: 'Compra en zonas de acumulación Q0–Q3, vende en distribución Q6–Q8.' },
                ].map((item) => (
                  <div key={item.n} className="flex gap-6">
                    <span
                      className="text-sm font-bold shrink-0 mt-0.5 w-8"
                      style={{ color: C.cyan, fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      {item.n}
                    </span>
                    <div>
                      <h3 className="text-white font-semibold text-sm mb-1.5" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                        {item.title}
                      </h3>
                      <p className="text-[#555] text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Terminal-style level preview */}
            <div
              className="border rounded-sm overflow-hidden"
              style={{ backgroundColor: C.card, borderColor: C.border }}
            >
              <div
                className="flex items-center justify-between px-5 py-3 border-b"
                style={{ borderColor: C.border, backgroundColor: '#0d0d0e' }}
              >
                <span
                  className="text-[11px] font-semibold tracking-widest uppercase"
                  style={{ color: C.cyan, fontFamily: "'JetBrains Mono', monospace" }}
                >
                  XAU/USD
                </span>
                <span className="text-[10px] uppercase tracking-widest text-[#333]">demo</span>
              </div>
              <div className="p-1">
                {[
                  { level: 'Q8', price: '2,700.00', type: 'sell' },
                  { level: 'Q7', price: '2,676.56', type: 'sell' },
                  { level: 'Q6', price: '2,656.25', type: 'sell' },
                  { level: 'Q5', price: '2,625.00', type: 'eq' },
                  { level: 'Q4', price: '2,600.00', type: 'eq' },
                  { level: 'Q3', price: '2,556.25', type: 'buy' },
                  { level: 'Q2', price: '2,525.00', type: 'buy' },
                  { level: 'Q1', price: '2,506.25', type: 'buy' },
                ].map((row) => {
                  const col = row.type === 'sell' ? C.red : row.type === 'buy' ? C.green : '#c9a227';
                  const label = row.type === 'sell' ? 'DIST' : row.type === 'buy' ? 'ACCUM' : 'EQ';
                  return (
                    <div
                      key={row.level}
                      className="flex items-center justify-between px-4 py-2.5 border-l-2 mb-0.5"
                      style={{
                        borderLeftColor: col,
                        backgroundColor: `${col}08`,
                      }}
                    >
                      <span
                        className="text-xs font-bold w-8"
                        style={{ color: col, fontFamily: "'JetBrains Mono', monospace" }}
                      >
                        {row.level}
                      </span>
                      <span
                        className="text-xs text-white"
                        style={{ fontFamily: "'JetBrains Mono', monospace" }}
                      >
                        {row.price}
                      </span>
                      <span
                        className="text-[9px] font-bold tracking-widest w-12 text-right"
                        style={{ color: col }}
                      >
                        {label}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="px-5 py-4 border-t" style={{ borderColor: C.border }}>
                <Link
                  href="/quantum"
                  className="block w-full py-3 text-center text-black text-sm font-bold uppercase tracking-[0.12em] transition-opacity hover:opacity-90"
                  style={{ backgroundColor: C.cyan, fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Calcular Mis Niveles
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── COURSES ──────────────────────────────────────────────── */}
        <section className="py-24 px-6" style={{ backgroundColor: C.bg }}>
          <div className="max-w-6xl mx-auto">
            <div className="mb-14">
              <p
                className="text-[10px] font-semibold uppercase tracking-[0.3em] mb-4"
                style={{ color: C.cyan, fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Formación
              </p>
              <h2
                className="text-4xl font-bold text-white"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Cursos de Trading
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-px" style={{ backgroundColor: C.border }}>
              {[
                {
                  id: 'canal-paralelo',
                  name: 'Canal Paralelo',
                  price: 'Gs. 320.000',
                  usd: '$50 USD',
                  flyer: '/canal1.png',
                  desc: 'Técnica del canal paralelo para identificar tendencias y puntos de entrada precisos.',
                },
                {
                  id: 'fibonacci',
                  name: 'Fibonacci Avanzado',
                  price: 'Gs. 320.000',
                  usd: '$50 USD',
                  flyer: '/desbloquea el poder de forex.png',
                  desc: 'Retrocesos y extensiones de Fibonacci aplicados al trading profesional.',
                },
                {
                  id: 'expansion-matematica',
                  name: 'Curso Premium',
                  price: 'Gs. 500.000',
                  usd: '$77 USD',
                  flyer: '/flyer1.jpg',
                  desc: 'Técnicas de trading avanzadas nunca antes vistas, sumamente eficientes y demostrables.',
                },
              ].map((course) => (
                <div
                  key={course.id}
                  className="group flex flex-col transition-all duration-200"
                  style={{ backgroundColor: C.card }}
                >
                  {/* Flyer — siempre completo, sin recorte */}
                  <div
                    className="w-full overflow-hidden"
                    style={{ height: '260px', backgroundColor: '#0d0d0d' }}
                  >
                    <Image
                      src={course.flyer}
                      alt={course.name}
                      width={400}
                      height={260}
                      className="w-full h-full transition-transform duration-500 group-hover:scale-105"
                      style={{ objectFit: 'contain' }}
                    />
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <h3
                      className="text-white font-bold text-base mb-2"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      {course.name}
                    </h3>
                    <p className="text-[#444] text-sm mb-5 leading-relaxed flex-1">{course.desc}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <span
                          className="text-white font-bold text-sm"
                          style={{ fontFamily: "'JetBrains Mono', monospace" }}
                        >
                          {course.price}
                        </span>
                        <p className="text-[#444] text-[10px] mt-0.5">{course.usd} · pago único</p>
                      </div>
                      <Link
                        href="/billing"
                        className="border px-4 py-2 text-[11px] font-bold uppercase tracking-[0.1em] transition-all duration-200 hover:border-[#00E5FF]/50 hover:text-[#00E5FF] text-[#555]"
                        style={{ borderColor: C.border, fontFamily: "'Space Grotesk', sans-serif" }}
                      >
                        Comprar
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-[#333] text-xs mt-6 text-center uppercase tracking-[0.2em]">
              Cursos independientes del plan · la suscripción{' '}
              <span style={{ color: C.cyan }}>Quantum Access</span>{' '}
              incluye Calculadora, Signal Hub, DXY y análisis IA
            </p>
          </div>
        </section>

        {/* ── QUANTUM ACCESS PRICING ───────────────────────────────── */}
        <section className="py-24 px-6 border-y" style={{ borderColor: C.border }}>
          <div className="max-w-5xl mx-auto">
            <div className="mb-14 text-center">
              <p
                className="text-[10px] font-semibold uppercase tracking-[0.3em] mb-4"
                style={{ color: C.cyan, fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Suscripción
              </p>
              <h2
                className="text-4xl font-bold text-white"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Un plan. Todo incluido.
              </h2>
            </div>

            <div
              className="border"
              style={{ backgroundColor: C.card, borderColor: C.border }}
            >
              {/* Top accent line */}
              <div className="h-px w-full" style={{ background: `linear-gradient(90deg, transparent, ${C.cyan}, transparent)` }} />

              <div className="grid md:grid-cols-[1fr_1.2fr]">
                {/* Left — flyer + precio */}
                <div
                  className="flex flex-col items-center p-10 gap-8 border-r"
                  style={{ borderColor: C.border, backgroundColor: '#0d0d0e' }}
                >
                  <div
                    className="w-full max-w-[280px] overflow-hidden"
                    style={{ backgroundColor: '#111', aspectRatio: '1/1' }}
                  >
                    <Image
                      src="/signal.png"
                      alt="Quantum Access"
                      width={280}
                      height={280}
                      className="w-full h-full"
                      style={{ objectFit: 'contain' }}
                    />
                  </div>

                  <div className="text-center w-full">
                    <div
                      className="inline-flex items-center gap-2 border px-3 py-1 mb-4"
                      style={{ borderColor: `${C.cyan}30`, backgroundColor: `${C.cyan}08` }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: C.cyan }} />
                      <span
                        className="text-[9px] font-bold uppercase tracking-[0.3em]"
                        style={{ color: C.cyan }}
                      >
                        Plan Único
                      </span>
                    </div>

                    <h3
                      className="text-2xl font-bold text-white mb-4"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      QUANTUM ACCESS
                    </h3>

                    <div
                      className="text-4xl font-bold text-white mb-1"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      Gs. 350.000
                    </div>
                    <p className="text-[#444] text-sm">$50 USD / mes</p>

                    <Link
                      href="/billing"
                      className="mt-6 block w-full py-3.5 text-black text-sm font-bold uppercase tracking-[0.1em] text-center transition-opacity hover:opacity-90"
                      style={{ backgroundColor: C.cyan, fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      Suscribirme Ahora
                    </Link>
                    <p className="text-[#333] text-[10px] mt-3 uppercase tracking-widest">
                      3 usos gratis sin registrarse
                    </p>
                  </div>
                </div>

                {/* Right — features + cuotas */}
                <div className="p-10">
                  <p
                    className="text-[9px] font-bold uppercase tracking-[0.3em] mb-6"
                    style={{ color: C.cyan }}
                  >
                    Incluye
                  </p>
                  <ul className="space-y-3 mb-10">
                    {[
                      ['Calculadora Cuadrática ilimitada', 'Niveles n² en cualquier mercado'],
                      ['Signal Hub completo', 'Señales en tiempo real'],
                      ['DXY Dollar Index', 'Índice del dólar en vivo'],
                      ['Todos los mercados', 'Forex · Crypto · Oro · Índices'],
                      ['Análisis IA cuántico', 'Interpretación automática por zona'],
                      ['Dashboard Quantum Levels', 'Panel exclusivo de acceso rápido'],
                      ['Acceso 24/7', 'Sin restricciones'],
                    ].map(([title, sub], i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="w-1 h-1 rounded-full mt-2 shrink-0" style={{ backgroundColor: C.cyan }} />
                        <div>
                          <p className="text-white text-sm font-medium" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                            {title}
                          </p>
                          <p className="text-[#444] text-xs mt-0.5">{sub}</p>
                        </div>
                      </li>
                    ))}
                  </ul>

                  {/* Payment badges — 0% interés */}
                  <div className="border-t pt-6" style={{ borderColor: C.border }}>
                    <p className="text-[9px] uppercase tracking-[0.3em] text-[#333] mb-4">
                      Pagá en cuotas · 0% interés
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { cuotas: '1', monto: '350.000' },
                        { cuotas: '3', monto: '116.667' },
                        { cuotas: '6', monto: '58.334' },
                        { cuotas: '12', monto: '29.167' },
                      ].map((c) => (
                        <div
                          key={c.cuotas}
                          className="border p-3 flex items-center justify-between transition-colors duration-200 hover:border-[#333]"
                          style={{ borderColor: C.border, backgroundColor: '#0d0d0e' }}
                        >
                          <div>
                            <span
                              className="text-[9px] font-bold uppercase tracking-[0.2em]"
                              style={{ color: C.cyan }}
                            >
                              {c.cuotas}x
                            </span>
                            <p className="text-[9px] text-[#333] uppercase tracking-widest">0% interés</p>
                          </div>
                          <span
                            className="text-xs font-bold text-white"
                            style={{ fontFamily: "'JetBrains Mono', monospace" }}
                          >
                            Gs. {c.monto}
                          </span>
                        </div>
                      ))}
                    </div>
                    <p className="text-[#333] text-[9px] mt-3 uppercase tracking-[0.2em]">
                      Visa · Mastercard · Bancard
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment logos */}
            <div
              className="mt-4 border p-6 flex flex-wrap items-center justify-center gap-8"
              style={{ borderColor: C.border, backgroundColor: C.card }}
            >
              <Image src="/familiar.png" alt="Banco Familiar" width={110} height={44} className="object-contain opacity-70 hover:opacity-100 transition-opacity" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/ueno.jpeg" alt="Ueno" width={110} height={44} className="object-contain opacity-70 hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </section>

        {/* ── EXNESS AFFILIATION ───────────────────────────────────── */}
        <section
          className="py-16 px-6 border-b"
          style={{ backgroundColor: C.card, borderColor: C.border }}
        >
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <p
                className="text-[9px] font-semibold uppercase tracking-[0.3em] mb-2"
                style={{ color: C.muted, fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Broker Recomendado
              </p>
              <h3
                className="text-3xl font-bold text-white mb-2"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Exness
              </h3>
              <p className="text-[#444] text-sm max-w-md">
                El broker de confianza de la comunidad Sacred Levels. Spreads ultra-bajos, ejecución rápida y retiros instantáneos.
              </p>
            </div>
            <a
              href="#exness"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 border px-8 py-4 text-sm font-bold uppercase tracking-[0.12em] transition-all duration-200 hover:border-[#00E5FF]/50 hover:text-[#00E5FF] text-[#555] whitespace-nowrap"
              style={{ borderColor: C.border, fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Abrir Cuenta en Exness
            </a>
          </div>
        </section>

        {/* ── CONTACTO ─────────────────────────────────────────────── */}
        <section className="py-24 px-6">
          <div className="max-w-lg mx-auto">
            <div className="mb-10">
              <p
                className="text-[10px] font-semibold uppercase tracking-[0.3em] mb-4"
                style={{ color: C.cyan, fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Contacto
              </p>
              <h2
                className="text-4xl font-bold text-white"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Hablemos
              </h2>
            </div>

            {formSuccess ? (
              <div
                className="border p-10 text-center"
                style={{ backgroundColor: C.card, borderColor: `${C.green}30` }}
              >
                <div
                  className="w-10 h-10 border flex items-center justify-center mx-auto mb-4"
                  style={{ borderColor: `${C.green}40` }}
                >
                  <svg className="w-5 h-5" fill="none" stroke={C.green} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p
                  className="text-white font-semibold mb-1"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  ¡Mensaje enviado correctamente!
                </p>
                <p className="text-[#444] text-sm">Te contactaremos pronto.</p>
              </div>
            ) : (
              <form
                onSubmit={handleContactSubmit}
                className="border space-y-5 p-8"
                style={{ backgroundColor: C.card, borderColor: C.border }}
              >
                <div>
                  <label
                    htmlFor="name"
                    className="block text-[10px] uppercase tracking-[0.2em] mb-2"
                    style={{ color: C.muted, fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    Nombre
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    className="w-full border px-4 py-3 text-white text-sm focus:outline-none transition-colors duration-200 focus:border-[#00E5FF]/40"
                    style={{ backgroundColor: '#0d0d0e', borderColor: C.border, fontFamily: "'Inter', sans-serif" }}
                    placeholder="Tu nombre"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-[10px] uppercase tracking-[0.2em] mb-2"
                    style={{ color: C.muted, fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="w-full border px-4 py-3 text-white text-sm focus:outline-none transition-colors duration-200 focus:border-[#00E5FF]/40"
                    style={{ backgroundColor: '#0d0d0e', borderColor: C.border, fontFamily: "'Inter', sans-serif" }}
                    placeholder="tu@email.com"
                  />
                </div>
                <div>
                  <label
                    htmlFor="message"
                    className="block text-[10px] uppercase tracking-[0.2em] mb-2"
                    style={{ color: C.muted, fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    Mensaje
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    className="w-full border px-4 py-3 text-white text-sm focus:outline-none transition-colors duration-200 focus:border-[#00E5FF]/40 resize-none"
                    style={{ backgroundColor: '#0d0d0e', borderColor: C.border, fontFamily: "'Inter', sans-serif" }}
                    placeholder="¿En qué podemos ayudarte?"
                  />
                </div>
                {formError && <p className="text-[#FF4757] text-xs">{formError}</p>}
                <button
                  type="submit"
                  disabled={formLoading}
                  className="w-full py-3.5 text-sm font-bold uppercase tracking-[0.12em] text-black transition-opacity hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: C.cyan, fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {formLoading ? 'Enviando...' : 'Enviar Mensaje'}
                </button>
              </form>
            )}
          </div>
        </section>

        {/* ── FOOTER ───────────────────────────────────────────────── */}
        <footer
          className="border-t py-10 px-6"
          style={{ borderColor: C.border, backgroundColor: C.card }}
        >
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <Image src="/logosacred.png" alt="Sacred Levels" width={36} height={36} className="rounded" />
              <div>
                <span
                  className="text-white font-semibold text-sm"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Sacred Levels
                </span>
                <p className="text-[#333] text-[10px] mt-0.5">© 2025 Todos los derechos reservados</p>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-[#333] text-[10px] uppercase tracking-[0.2em]">
              <Link href="/quantum" className="hover:text-[#00E5FF] transition-colors duration-200">Calculadora</Link>
              <Link href="/courses" className="hover:text-[#00E5FF] transition-colors duration-200">Cursos</Link>
              <Link href="/billing" className="hover:text-[#00E5FF] transition-colors duration-200">Planes</Link>
              <Link href="/hub" className="hover:text-[#00E5FF] transition-colors duration-200">Signal Hub</Link>
              <a href="mailto:soporte@sacredlevels.com" className="hover:text-[#00E5FF] transition-colors duration-200">Contacto</a>
            </div>
          </div>
        </footer>

      </main>
    </>
  );
}
