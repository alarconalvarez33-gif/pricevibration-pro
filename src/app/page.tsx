'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import PromoPopup from '@/components/PromoPopup';
import MentorProfile from '@/components/MentorProfile';

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

interface ProofResult {
  id: string
  description: string
  date: string | null
}

function ResultsGrid({ results }: { results: ProofResult[] }) {
  const [selected, setSelected] = useState<ProofResult | null>(null)

  const cols =
    results.length === 1 ? 'max-w-md mx-auto' :
    results.length === 2 ? 'grid sm:grid-cols-2' :
    'grid sm:grid-cols-2 lg:grid-cols-3'

  return (
    <>
      <div className={cols} style={{ gap: 16, display: results.length === 1 ? 'block' : undefined }}>
        {results.map((r) => (
          <div
            key={r.id}
            onClick={() => setSelected(r)}
            className="rounded-xl overflow-hidden cursor-zoom-in transition-all duration-200 hover:scale-[1.02]"
            style={{ border: '1px solid rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.03)' }}
          >
            <div style={{ aspectRatio: '16/9', overflow: 'hidden', backgroundColor: '#0a0a0b' }}>
              <img
                src={`/api/results/image/${r.id}`}
                alt={r.description}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                loading="lazy"
              />
            </div>
            <div className="p-3">
              <p style={{ color: '#aaa', fontSize: 12, fontFamily: "'JetBrains Mono', monospace", margin: 0 }}>
                {r.description}
              </p>
              {r.date && (
                <p style={{ color: '#555', fontSize: 11, marginTop: 4, fontFamily: "'JetBrains Mono', monospace" }}>
                  {r.date}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div
          onClick={() => setSelected(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            backgroundColor: 'rgba(0,0,0,0.92)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '20px', cursor: 'zoom-out',
          }}
        >
          <img
            src={`/api/results/image/${selected.id}`}
            alt={selected.description}
            style={{ maxWidth: '95vw', maxHeight: '82vh', objectFit: 'contain', boxShadow: '0 0 60px rgba(0,229,255,0.1)' }}
          />
          <p style={{ color: '#aaa', fontSize: 13, fontFamily: "'JetBrains Mono', monospace", marginTop: 14 }}>
            {selected.description}
          </p>
          {selected.date && (
            <p style={{ color: '#555', fontSize: 11, marginTop: 4, fontFamily: "'JetBrains Mono', monospace" }}>
              {selected.date}
            </p>
          )}
          <p style={{ color: '#555', fontSize: 11, marginTop: 8 }}>Toca para cerrar</p>
        </div>
      )}
    </>
  )
}

export default function HomePage() {
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState('');
  const [cursoLoading, setCursoLoading] = useState(false);
  const [proofResults, setProofResults] = useState<ProofResult[]>([]);

  useEffect(() => {
    fetch('/api/results')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data.results)) setProofResults(data.results) })
      .catch(() => {})
  }, []);

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
  const [adxLoading, setAdxLoading] = useState(false);

  const handleBuyAdx = async () => {
    setAdxLoading(true);
    try {
      const res = await fetch('/api/pagopar/create-product-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: 'adx' }),
      });
      const data = await res.json();
      if (data.success && data.paymentUrl) window.location.href = data.paymentUrl;
      else alert('Error: ' + (data.error || data.pagoparError || 'No se pudo generar el pago'));
    } catch { alert('Error al procesar el pago'); }
    setAdxLoading(false);
  };

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
      <PromoPopup />
      {/* pb-20 md:pb-0 accounts for mobile sticky CTA bar */}
      <main className="min-h-screen pb-20 md:pb-0" style={{ backgroundColor: C.bg, fontFamily: "'Inter', sans-serif" }}>

        {/* ── HERO ─────────────────────────────────────────────────── */}
        <section className="relative pt-28 sm:pt-40 pb-16 sm:pb-28 px-4 sm:px-6 overflow-hidden">
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
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[min(600px,100vw)] h-[1px]"
            style={{ background: `linear-gradient(90deg, transparent, ${C.cyan}40, transparent)` }}
          />

          <div className="relative max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">

              {/* ── Left: hero copy ── */}
              <div>
                <div className="flex items-center gap-3 mb-8">
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: C.green }} />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.3em]"
                    style={{ color: C.cyan, fontFamily: "'Space Grotesk', sans-serif" }}>
                    Sacred Levels — Plataforma Cuántica de Trading
                  </span>
                </div>

                <h1 className="text-[28px] sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] mb-6 sm:mb-8 text-white"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Opera con la precisión que el mercado exige.{' '}
                  <span style={{ color: C.cyan }}>— Tecnología de precisión al servicio de tu operativa.</span>
                </h1>

                <p className="text-base sm:text-lg text-[#666] mb-8 sm:mb-12 leading-relaxed">
                  Soportes/resistencias en segundos para XAUUSD, Bitcoin y los principales pares de Forex.Zonas de alta probabilidad calculadas en segundos. Sin experiencia previa. Sin tarjeta de crédito.
               
                </p>

                <div className="flex flex-col gap-3 mb-8 sm:mb-12">
                  <Link href="/quantum"
                    className="flex items-center justify-center gap-2 px-6 py-4 font-bold text-sm uppercase tracking-[0.12em] text-black transition-all duration-200 w-full sm:w-auto min-h-[52px]"
                    style={{ backgroundColor: C.cyan, fontFamily: "'Space Grotesk', sans-serif" }}>
                    Probar Gratis — Sin Registro
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                  <div className="flex flex-col gap-1">
                    <Link href="/billing"
                      className="flex items-center justify-center gap-2 px-6 py-4 font-bold text-sm uppercase tracking-[0.12em] text-white border transition-all duration-200 hover:border-[#00E5FF]/50 hover:text-[#00E5FF] w-full sm:w-auto min-h-[52px]"
                      style={{ borderColor: C.border, fontFamily: "'Space Grotesk', sans-serif" }}>
                      Ver Precios
                    </Link>
                    <span className="text-[10px] text-center" style={{ color: C.muted, fontFamily: "'Space Grotesk', sans-serif" }}>Desde Gs. 65.000 / $10 USD</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 sm:gap-6 text-[#444] text-xs">
                  {['3 cálculos gratis sin crear cuenta', 'Resultados en 2 segundos', 'Oro · Forex · Crypto · Índices'].map((t) => (
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

                {/* Flyer 1 — Genesis */}
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
                      alt="Genesis"
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
                    {flyer1Loading ? 'Procesando...' : 'QUIERO APRENDER'}
                  </button>
                </div>

                {/* Flyer 2 — Super Estrategia */}
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
                      src="/Super estrategia.jpg"
                      alt="Super Estrategia"
                      style={{ width: '100%', height: 'auto', objectFit: 'contain', display: 'block' }}
                    />
                  </div>
                  <p
                    className="text-white text-xs font-bold text-center"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    Gs. 65.000 <span style={{ color: C.muted }}>/ $10 USD</span>
                  </p>
                  <button
                    onClick={handleBuyCurso}
                    disabled={cursoLoading}
                    className="w-full py-2.5 text-xs font-bold uppercase tracking-[0.15em] text-black rounded transition-opacity hover:opacity-90 disabled:opacity-50"
                    style={{ backgroundColor: C.cyan, fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {cursoLoading ? 'Procesando...' : 'QUIERO ESTE CONOCIMIENTO'}
                  </button>
                </div>

                {/* Flyer 3 — ADX / El Vaso */}
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
                      src="/vaso.png"
                      alt="Estrategia ADX"
                      style={{ width: '100%', height: 'auto', objectFit: 'contain', display: 'block' }}
                    />
                  </div>
                  <p
                    className="text-white text-xs font-bold text-center"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    Gs. 220.000 <span style={{ color: C.muted }}>/ $30 USD</span>
                  </p>
                  <button
                    onClick={handleBuyAdx}
                    disabled={adxLoading}
                    className="w-full py-2.5 text-xs font-bold uppercase tracking-[0.15em] text-black rounded transition-opacity hover:opacity-90 disabled:opacity-50"
                    style={{ backgroundColor: C.cyan, fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {adxLoading ? 'Procesando...' : '¡QUIERO LA ESTRATEGIA!'}
                  </button>
                </div>

              </div>

            </div>
          </div>
        </section>

        {/* ── VIDEO ────────────────────────────────────────────────── */}
        <section className="w-full max-w-3xl mx-auto px-4 py-12">
          <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-white/10">
            <iframe
              src="https://www.youtube.com/embed/b_MA_UHN_sw"
              title="Sacred Levels — Trading Profesional"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>
        </section>

        {/* ── TRUST BANNER ─────────────────────────────────────────── */}
        <section className="py-3 px-4 border-y" style={{ borderColor: C.border, backgroundColor: '#0d0d0e' }}>
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
              {['24,000+ visitas mensuales', 'Desde 2023', 'Método W.D. Gann', 'Paraguay 🇵🇾'].map((item, i) => (
                <span key={i} className="text-[10px] tracking-[0.2em] uppercase" style={{ color: C.muted, fontFamily: "'JetBrains Mono', monospace" }}>
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── QUANTUM ACCESS PRICING ───────────────────────────────── */}
        <section className="px-6 py-10" style={{ backgroundColor: C.bg, borderBottom: `1px solid ${C.border}` }}>
          <div className="max-w-6xl mx-auto">
            <div className="border" style={{ borderColor: C.border, backgroundColor: C.card }}>
              <div className="h-px w-full" style={{ background: `linear-gradient(90deg, transparent, ${C.cyan}, transparent)` }} />
              <div className="flex flex-col md:flex-row">

                {/* Flyer */}
                <div className="shrink-0 flex items-center justify-center p-4 border-b md:border-b-0 md:border-r" style={{ borderColor: C.border, backgroundColor: '#0d0d0e' }}>
                  <Image
                    src="/signal.png"
                    alt="Quantum Access"
                    width={120}
                    height={120}
                    style={{ objectFit: 'contain', display: 'block' }}
                  />
                </div>

                {/* Price + label */}
                <div className="flex flex-col justify-center items-center px-4 sm:px-8 py-5 border-b md:border-b-0 md:border-r shrink-0 gap-1" style={{ borderColor: C.border, backgroundColor: '#0d0d0e' }}>
                  <div className="inline-flex items-center gap-2 mb-1">
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: C.cyan }} />
                    <span className="text-[9px] font-bold uppercase tracking-[0.3em]" style={{ color: C.cyan, fontFamily: "'Space Grotesk', sans-serif" }}>Acceso Cuántico</span>
                  </div>
                  <div className="text-2xl font-bold text-white" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Gs. 180.000</div>
                  <p className="text-[#444] text-[11px]">$25 USD · pago mensual</p>
                  <Link
                    href="/billing"
                    className="mt-3 px-6 py-2.5 text-black text-[11px] font-bold uppercase tracking-[0.1em] text-center transition-opacity hover:opacity-90"
                    style={{ backgroundColor: C.cyan, fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    Suscribirme ahora!
                  </Link>
                  <p className="text-[#333] text-[9px] mt-1 uppercase tracking-widest">3 usos gratis sin registrarse</p>
                </div>

                {/* Features */}
                <div className="flex flex-wrap gap-x-6 gap-y-3 px-8 py-6 items-center">
                  {[
                    ['⚡', 'Calculadora Cuadrática ilimitada'],
                    ['📡', 'Signal Hub en tiempo real'],
                    ['🌐', 'Forex · Crypto · Oro · Índices'],
                    ['🤖', 'Análisis IA cuántico'],
                    ['📊', 'Dashboard Quantum Levels'],
                    ['🔓', 'Acceso 24/7 sin restricciones'],
                  ].map(([icon, label]) => (
                    <div key={label} className="flex items-center gap-2">
                      <span className="text-sm">{icon}</span>
                      <span className="text-[11px] text-[#888]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{label}</span>
                    </div>
                  ))}
                </div>

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
                src="https://www.youtube.com/embed/n2UHGeKKH_o"
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
          </div>
        </section>


        {/* ── NIVELES EN ACCIÓN — solo visible cuando hay resultados ── */}
        {proofResults.length > 0 && (
          <section className="py-20 px-4 sm:px-6 border-y" style={{ borderColor: C.border }}>
            <div className="max-w-5xl mx-auto">
              <div className="mb-10 text-center">
                <p
                  className="text-[10px] font-semibold uppercase tracking-[0.3em] mb-4"
                  style={{ color: C.cyan, fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Resultados
                </p>
                <h2
                  className="text-3xl sm:text-4xl font-bold text-white mb-3"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Niveles en Acción — Resultados Reales
                </h2>
                <p className="text-sm" style={{ color: C.muted }}>
                  Capturas reales de nuestros niveles funcionando en el mercado
                </p>
              </div>

              <ResultsGrid results={proofResults} />
            </div>
          </section>
        )}

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

            {/* Course access notice */}
            <div
              className="flex items-start gap-3 mb-8 px-4 py-3 rounded-xl"
              style={{ background: `${C.cyan}10`, border: `1px solid ${C.cyan}25` }}
            >
              <span className="text-lg shrink-0 mt-0.5">ℹ️</span>
              <p className="text-sm" style={{ color: C.cyan }}>
                Al comprar cualquier curso, accedé al contenido completo desde la sección <strong>CURSOS</strong> en tu cuenta.
              </p>
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
                  name: 'Genesis',
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
                        className="flex items-center justify-center border px-4 min-h-[44px] text-[11px] font-bold uppercase tracking-[0.1em] transition-all duration-200 hover:border-[#00E5FF]/50 hover:text-[#00E5FF] text-[#555]"
                        style={{ borderColor: C.border, fontFamily: "'Space Grotesk', sans-serif" }}
                      >
                        Comprar
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-[#333] text-[10px] mt-4 text-center uppercase tracking-[0.2em]">
              Cursos independientes del plan · suscripción mensual renovable
            </p>
          </div>
        </section>

        {/* ── MENTOR PROFILE ───────────────────────────────────────── */}
        <MentorProfile />

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
              <Link href="/quantum" className="hover:text-[#00E5FF] transition-colors duration-200">Calculadora Gratis</Link>
              <Link href="/courses" className="hover:text-[#00E5FF] transition-colors duration-200">Cursos</Link>
              <Link href="/billing" className="hover:text-[#00E5FF] transition-colors duration-200">Precios</Link>
              <Link href="/hub" className="hover:text-[#00E5FF] transition-colors duration-200">Signal Hub</Link>
              <a href="mailto:soporte@sacredlevels.com" className="hover:text-[#00E5FF] transition-colors duration-200">Contacto</a>
            </div>
          </div>
        </footer>

      </main>
    </>
  );
}
