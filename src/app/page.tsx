'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFormError('');

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    try {
      const response = await fetch('https://formspree.io/f/xpwzgkpr', {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' },
      });
      if (response.ok) {
        setSuccess(true);
        form.reset();
      } else {
        setFormError('Error al enviar. Intenta de nuevo.');
      }
    } catch {
      setFormError('Error de conexión.');
    }
    setLoading(false);
  };

  return (
    <>
      <Navbar />
      <main
        className="min-h-screen bg-white"
        style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
      >

        {/* ── HERO ──────────────────────────────────────────────────── */}
        <section className="pt-36 pb-24 px-6 bg-white">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-[#C4A77D] text-[11px] uppercase tracking-[0.2em] mb-6 font-medium">
              Sacred Levels — Quantum Trading Platform
            </p>
            <h1
              className="text-5xl md:text-7xl text-[#111111] mb-8 leading-tight"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 500 }}
            >
              Predice Niveles de{' '}
              <span style={{ color: '#C4A77D' }}>Alta Probabilidad</span>
            </h1>
            <p className="text-lg md:text-xl text-[#666666] mb-12 max-w-2xl mx-auto leading-relaxed">
              Calcula niveles cuánticos donde el precio tiene mayor probabilidad de girar.
              Usado por traders profesionales en Forex, Oro y Crypto.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link
                href="/quantum"
                className="bg-[#111111] hover:bg-[#333333] text-white px-10 py-4 rounded-lg text-base font-semibold transition-colors"
              >
                Probar Calculadora Cuadrática
              </Link>
              <Link
                href="/billing"
                className="border border-[#E8E8E8] hover:border-[#C4A77D] text-[#111111] hover:text-[#C4A77D] px-10 py-4 rounded-lg text-base font-semibold transition-colors"
              >
                Ver Planes
              </Link>
            </div>
            <div className="flex flex-wrap justify-center gap-10 text-[#888888] text-sm">
              {['3 usos gratis sin registrarse', 'Sin tarjeta de crédito', 'Resultados instantáneos'].map((t) => (
                <span key={t} className="flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 text-[#C4A77D] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  {t}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── CONTACTO ──────────────────────────────────────────────── */}
        <section className="py-24 px-6 bg-[#F7F8F9]">
          <div className="max-w-xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-[#C4A77D] text-[11px] uppercase tracking-[0.2em] mb-4 font-medium">Contacto</p>
              <h2
                className="text-4xl text-[#111111] mb-4"
                style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 500 }}
              >
                Hablemos
              </h2>
              <p className="text-[#666666] text-base">
                Preguntas sobre planes, cursos o soporte técnico.
              </p>
            </div>

            {success ? (
              <div className="bg-white rounded-lg border border-[#E8E8E8] p-10 text-center">
                <div className="w-12 h-12 bg-[#C4A77D]/12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-[#C4A77D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-[#111111] text-lg font-semibold mb-2">Mensaje enviado</h3>
                <p className="text-[#666666] text-sm">Te responderemos a la brevedad.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-[#E8E8E8] p-8 md:p-10 space-y-6">
                <div>
                  <label className="block text-[#111111] text-sm font-medium mb-2">Nombre</label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Tu nombre"
                    className="w-full border border-[#E8E8E8] rounded-lg px-4 py-3 text-[#111111] placeholder-[#BBBBBB] text-sm focus:outline-none focus:border-[#C4A77D] transition-colors bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[#111111] text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="tu@email.com"
                    className="w-full border border-[#E8E8E8] rounded-lg px-4 py-3 text-[#111111] placeholder-[#BBBBBB] text-sm focus:outline-none focus:border-[#C4A77D] transition-colors bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[#111111] text-sm font-medium mb-2">Mensaje</label>
                  <textarea
                    name="message"
                    required
                    rows={5}
                    placeholder="¿En qué te podemos ayudar?"
                    className="w-full border border-[#E8E8E8] rounded-lg px-4 py-3 text-[#111111] placeholder-[#BBBBBB] text-sm focus:outline-none focus:border-[#C4A77D] transition-colors bg-white resize-none"
                  />
                </div>
                {formError && (
                  <p className="text-red-500 text-sm">{formError}</p>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#111111] hover:bg-[#333333] text-white py-3.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  {loading ? 'Enviando...' : 'Enviar Mensaje'}
                </button>
              </form>
            )}
          </div>
        </section>

        {/* ── HOW IT WORKS ──────────────────────────────────────────── */}
        <section className="py-24 px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <p className="text-[#C4A77D] text-[11px] uppercase tracking-[0.2em] mb-5 font-medium">Metodología</p>
                <h2
                  className="text-4xl md:text-5xl text-[#111111] mb-10 leading-tight"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 500 }}
                >
                  Cómo funciona
                </h2>
                <div className="space-y-8">
                  {[
                    { n: '01', title: 'Ingresa el rango', desc: 'Precio máximo y mínimo del período que analizas.' },
                    { n: '02', title: 'Obtén los niveles', desc: '9 niveles cuánticos calculados con la fórmula n² de distribución de energía.' },
                    { n: '03', title: 'Opera con ventaja', desc: 'Compra en zonas de acumulación (Q0–Q3), vende en zonas de distribución (Q6–Q8).' },
                  ].map((item) => (
                    <div key={item.n} className="flex gap-6">
                      <div className="text-[#C4A77D] font-mono text-sm font-semibold shrink-0 mt-1 w-8">
                        {item.n}
                      </div>
                      <div>
                        <h3 className="text-[#111111] font-semibold text-base mb-2">{item.title}</h3>
                        <p className="text-[#666666] text-sm leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Calculator preview */}
              <div className="bg-[#F7F8F9] rounded-lg border border-[#E8E8E8] p-6">
                <div className="flex items-center justify-between mb-1 pb-4 border-b border-[#E8E8E8]">
                  <span className="text-[#C4A77D] text-xs font-mono font-semibold tracking-widest">XAU/USD</span>
                  <span className="text-[#888888] text-[10px] uppercase tracking-widest">Ejemplo</span>
                </div>
                <div className="space-y-1 mt-4">
                  {[
                    { level: 'Q8', price: '2,700.00', type: 'sell', label: 'DIST' },
                    { level: 'Q7', price: '2,676.56', type: 'sell', label: 'DIST' },
                    { level: 'Q6', price: '2,656.25', type: 'sell', label: 'DIST' },
                    { level: 'Q5', price: '2,625.00', type: 'neutral', label: 'EQ' },
                    { level: 'Q4', price: '2,600.00', type: 'neutral', label: 'EQ' },
                    { level: 'Q3', price: '2,556.25', type: 'buy', label: 'ACCUM' },
                    { level: 'Q2', price: '2,525.00', type: 'buy', label: 'ACCUM' },
                    { level: 'Q1', price: '2,506.25', type: 'buy', label: 'ACCUM' },
                  ].map((item) => (
                    <div
                      key={item.level}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-lg border-l-2 ${
                        item.type === 'sell'
                          ? 'bg-red-50 border-red-400'
                          : item.type === 'buy'
                          ? 'bg-green-50 border-green-500'
                          : 'bg-[#C4A77D]/8 border-[#C4A77D]'
                      }`}
                    >
                      <span className={`text-xs font-mono font-semibold ${
                        item.type === 'sell' ? 'text-red-500' : item.type === 'buy' ? 'text-green-600' : 'text-[#C4A77D]'
                      }`}>{item.level}</span>
                      <span className="text-[#111111] font-mono text-xs">{item.price}</span>
                      <span className={`text-[9px] uppercase tracking-widest font-medium ${
                        item.type === 'sell' ? 'text-red-400' : item.type === 'buy' ? 'text-green-500' : 'text-[#C4A77D]'
                      }`}>{item.label}</span>
                    </div>
                  ))}
                </div>
                <Link
                  href="/quantum"
                  className="block w-full mt-5 bg-[#111111] hover:bg-[#333333] text-white py-3 rounded-lg text-center text-sm font-semibold transition-colors"
                >
                  Calcular Mis Niveles
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── COURSES ───────────────────────────────────────────────── */}
        <section className="py-24 px-6 bg-[#F7F8F9]">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-[#C4A77D] text-[11px] uppercase tracking-[0.2em] mb-4 font-medium">Formación</p>
              <h2
                className="text-4xl md:text-5xl text-[#111111] mb-5"
                style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 500 }}
              >
                Cursos de Trading
              </h2>
              <p className="text-[#666666] max-w-xl mx-auto text-base">
                Domina técnicas avanzadas de análisis técnico. Compra por separado, pago único.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Canal Paralelo */}
              <div className="bg-white rounded-lg border border-[#E8E8E8] overflow-hidden hover:border-[#C4A77D] transition-colors group">
                <div className="relative h-72 overflow-hidden" style={{ backgroundColor: '#F1F1F1' }}>
                  <Image
                    src="/canal1.png"
                    alt="Canal Paralelo"
                    fill
                    className="group-hover:scale-105 transition-transform duration-500"
                    style={{ objectFit: 'contain' }}
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-[#111111] font-semibold text-base mb-2">Canal Paralelo</h3>
                  <p className="text-[#666666] text-sm mb-5 leading-relaxed">
                    Domina la técnica de canales de precio para identificar tendencias y puntos de entrada.
                  </p>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[#111111] font-semibold text-base">Gs. 320.000</span>
                      <p className="text-[#888888] text-xs mt-0.5">$50 USD · pago único</p>
                    </div>
                    <Link
                      href="/billing"
                      className="border border-[#111111] hover:bg-[#111111] text-[#111111] hover:text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                    >
                      Comprar
                    </Link>
                  </div>
                </div>
              </div>

              {/* Fibonacci */}
              <div className="bg-white rounded-lg border border-[#E8E8E8] overflow-hidden hover:border-[#C4A77D] transition-colors group">
                <div className="relative h-72 overflow-hidden" style={{ backgroundColor: '#F1F1F1' }}>
                  <Image
                    src="/desbloquea el poder de forex.png"
                    alt="Fibonacci Avanzado"
                    fill
                    className="group-hover:scale-105 transition-transform duration-500"
                    style={{ objectFit: 'contain' }}
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-[#111111] font-semibold text-base mb-2">Fibonacci Avanzado</h3>
                  <p className="text-[#666666] text-sm mb-5 leading-relaxed">
                    Retrocesos y extensiones de Fibonacci aplicados al trading profesional.
                  </p>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[#111111] font-semibold text-base">Gs. 320.000</span>
                      <p className="text-[#888888] text-xs mt-0.5">$50 USD · pago único</p>
                    </div>
                    <Link
                      href="/billing"
                      className="border border-[#111111] hover:bg-[#111111] text-[#111111] hover:text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                    >
                      Comprar
                    </Link>
                  </div>
                </div>
              </div>

              {/* Expansión Matemática */}
              <div className="bg-white rounded-lg border border-[#E8E8E8] overflow-hidden hover:border-[#C4A77D] transition-colors group">
                <div className="relative h-72 overflow-hidden" style={{ backgroundColor: '#F1F1F1' }}>
                  <Image
                    src="/expa.png"
                    alt="Expansión Matemática"
                    fill
                    className="group-hover:scale-105 transition-transform duration-500"
                    style={{ objectFit: 'contain' }}
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-[#111111] font-semibold text-base mb-2">Expansión Matemática</h3>
                  <p className="text-[#666666] text-sm mb-5 leading-relaxed">
                    Herramientas matemáticas avanzadas para análisis de mercados financieros.
                  </p>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[#111111] font-semibold text-base">Gs. 1.500.000</span>
                      <p className="text-[#888888] text-xs mt-0.5">$220 USD · pago único</p>
                    </div>
                    <Link
                      href="/billing"
                      className="bg-[#C4A77D] hover:bg-[#B8953C] text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                    >
                      Comprar
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-center text-[#888888] text-sm mt-10">
              Los cursos se compran por separado. La suscripción{' '}
              <span className="text-[#C4A77D] font-semibold">Quantum Access</span>{' '}
              incluye Calculadora Cuadrática, Signal Hub, DXY y análisis IA.
            </p>
          </div>
        </section>

        {/* ── PRICING ───────────────────────────────────────────────── */}
        <section className="py-24 px-6 bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-[#C4A77D] text-[11px] uppercase tracking-[0.2em] mb-4 font-medium">Suscripción</p>
              <h2
                className="text-4xl md:text-5xl text-[#111111] mb-4"
                style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 500 }}
              >
                Un solo plan. Todo incluido.
              </h2>
              <p className="text-[#666666] text-base">Sin niveles, sin confusión. Acceso completo desde el primer día.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-0 rounded-lg border border-[#E8E8E8] overflow-hidden">

              {/* Left: image + price */}
              <div className="border-b md:border-b-0 md:border-r border-[#E8E8E8] flex flex-col items-center justify-center p-10 gap-8 bg-[#F7F8F9]">
                <div className="relative w-full max-w-xs" style={{ aspectRatio: '1/1', backgroundColor: '#F1F1F1', borderRadius: '8px', overflow: 'hidden' }}>
                  <Image
                    src="/signal.png"
                    alt="Quantum Access"
                    fill
                    style={{ objectFit: 'contain' }}
                  />
                </div>
                <div className="text-center">
                  <p className="text-[#C4A77D] text-[10px] uppercase tracking-[0.2em] mb-3 font-medium">Plan Único</p>
                  <h3
                    className="text-2xl text-[#111111] mb-4"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 500 }}
                  >
                    Quantum Access
                  </h3>
                  <div className="flex items-baseline justify-center gap-2 mb-1">
                    <span className="text-4xl font-mono font-bold text-[#111111]">Gs. 350.000</span>
                  </div>
                  <p className="text-[#888888] text-sm mb-8">$50 USD / mes</p>
                  <Link
                    href="/billing"
                    className="block w-full py-3.5 rounded-lg font-semibold text-sm text-white text-center transition-colors bg-[#111111] hover:bg-[#333333]"
                  >
                    Suscribirme Ahora
                  </Link>
                  <p className="text-[#888888] text-xs mt-3">3 usos gratis sin registrarse</p>
                </div>
              </div>

              {/* Right: features */}
              <div className="p-10 bg-white flex flex-col justify-center">
                <p className="text-[#C4A77D] text-[10px] uppercase tracking-[0.2em] mb-6 font-medium">Todo lo que incluye</p>
                <ul className="space-y-4">
                  {[
                    { title: 'Calculadora Cuadrática ilimitada', sub: 'Niveles n² en cualquier mercado' },
                    { title: 'Signal Hub completo', sub: 'Señales en tiempo real' },
                    { title: 'DXY Dollar Index', sub: 'Índice del dólar en vivo' },
                    { title: 'Todos los mercados', sub: 'Forex, Crypto, Oro, Índices' },
                    { title: 'Análisis IA cuántico', sub: 'Interpretación automática por zona' },
                    { title: 'Dashboard Quantum Levels', sub: 'Panel exclusivo de acceso rápido' },
                    { title: 'Acceso 24/7', sub: 'Sin restricciones de horario' },
                  ].map((f, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#C4A77D] mt-2 shrink-0" />
                      <div>
                        <p className="text-[#111111] text-sm font-medium">{f.title}</p>
                        <p className="text-[#888888] text-xs mt-0.5">{f.sub}</p>
                      </div>
                    </li>
                  ))}
                </ul>

                {/* Cuotas */}
                <div className="mt-8 pt-6 border-t border-[#E8E8E8]">
                  <p className="text-[#888888] text-[10px] uppercase tracking-[0.15em] mb-4">Pagá en cuotas sin interés</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { n: '1 cuota', monto: '350.000' },
                      { n: '3 cuotas', monto: '116.667 / mes' },
                      { n: '6 cuotas', monto: '58.334 / mes' },
                      { n: '12 cuotas', monto: '29.167 / mes' },
                    ].map((c) => (
                      <div key={c.n} className="bg-[#F7F8F9] border border-[#E8E8E8] rounded-lg p-3">
                        <p className="text-[#888888] text-[10px] mb-1">{c.n}</p>
                        <p className="text-[#111111] text-xs font-semibold font-mono">Gs. {c.monto}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-[#888888] text-[10px] mt-3 uppercase tracking-widest">Visa · Mastercard · Bancard</p>
                </div>
              </div>
            </div>

            {/* Payment methods */}
            <div className="mt-8 bg-[#F7F8F9] rounded-lg border border-[#E8E8E8] p-8">
              <p className="text-[#888888] text-[10px] uppercase tracking-[0.2em] text-center mb-6">Métodos de Pago Aceptados</p>
              <div className="flex flex-wrap items-center justify-center gap-8 mb-6">
                <Image src="/familiar.png" alt="Banco Familiar" width={120} height={50} className="rounded-lg object-contain" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/ueno.jpeg" alt="Ueno" width={120} height={50} className="rounded-lg object-contain" />
              </div>
              <div className="text-center">
                <p className="text-[#111111] font-semibold text-base">Hasta 12 cuotas sin interés</p>
                <p className="text-[#888888] text-sm mt-1">Tarjetas de crédito y débito aceptadas</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ─────────────────────────────────────────────── */}
        <section className="py-24 px-6 bg-[#F7F8F9]">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-[#C4A77D] text-[11px] uppercase tracking-[0.2em] mb-5 font-medium">Acceso Inmediato</p>
            <h2
              className="text-4xl md:text-5xl text-[#111111] mb-6 leading-tight"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 500 }}
            >
              Gs. 350.000 al mes.
              <br />Todo incluido.
            </h2>
            <p className="text-[#666666] text-base mb-3 leading-relaxed">
              Calculadora Cuadrática, Signal Hub, DXY, todos los mercados y análisis IA.
            </p>
            <p className="text-[#888888] text-sm mb-12">
              Prueba <span className="text-[#C4A77D] font-semibold">3 veces gratis</span> sin registrarte. Sin tarjeta.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/billing"
                className="inline-block bg-[#111111] hover:bg-[#333333] text-white px-12 py-4 rounded-lg text-base font-semibold transition-colors"
              >
                Suscribirme — Gs. 350.000
              </Link>
              <Link
                href="/quantum"
                className="inline-block border border-[#E8E8E8] hover:border-[#C4A77D] text-[#111111] hover:text-[#C4A77D] px-12 py-4 rounded-lg text-base font-semibold transition-colors bg-white"
              >
                Probar Gratis
              </Link>
            </div>
          </div>
        </section>

        {/* ── FOOTER ───────────────────────────────────────────────── */}
        <footer className="border-t border-[#E8E8E8] py-12 px-6 bg-white">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <Image src="/logosacred.png" alt="Sacred Levels" width={40} height={40} className="rounded-lg" />
              <div>
                <span className="text-[#111111] font-semibold text-sm">Sacred Levels</span>
                <p className="text-[#888888] text-xs mt-0.5">© 2025 Todos los derechos reservados</p>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-[#888888] text-xs">
              <Link href="/quantum" className="hover:text-[#C4A77D] transition-colors">Calculadora Cuadrática</Link>
              <Link href="/courses" className="hover:text-[#C4A77D] transition-colors">Cursos</Link>
              <Link href="/billing" className="hover:text-[#C4A77D] transition-colors">Planes</Link>
              <Link href="/hub" className="hover:text-[#C4A77D] transition-colors">Signal Hub</Link>
              <a href="mailto:soporte@sacredlevels.com" className="hover:text-[#C4A77D] transition-colors">Contacto</a>
            </div>
          </div>
        </footer>

      </main>
    </>
  );
}
