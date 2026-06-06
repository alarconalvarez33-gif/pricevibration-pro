'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/layout/Header'
import { WhatsAppButton } from '@/components/WhatsAppButton'
import CryptoPayment from '@/components/CryptoPayment'

const C = {
  bg:     '#0F172A',
  card:   '#0D1B2E',
  border: '#1E293B',
  cyan:   '#00D4FF',
  gold:   '#c9a227',
  red:    '#FF4757',
  muted:  '#64748B',
} as const

export default function MetaLevelsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleBuy = async () => {
    if (!session?.user?.email) {
      router.push('/login?redirect=/metalevels')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/pagopar/create-product-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: 'metalevels' }),
      })
      const data = await res.json()
      if (data.success && data.paymentUrl) {
        window.location.href = data.paymentUrl
      } else {
        alert('Error: ' + (data.error || data.pagoparError || 'No se pudo generar el pago'))
      }
    } catch {
      alert('Error al procesar el pago')
    }
    setLoading(false)
  }

  return (
    <>
      <Header />
      <main
        className="min-h-screen pb-20 md:pb-0"
        style={{ backgroundColor: C.bg, fontFamily: "'Inter', sans-serif", overflowX: 'hidden' }}
      >

        {/* ── SECCIÓN 1: HERO ── */}
        <section
          className="pb-20 px-6 text-center"
          style={{ paddingTop: '120px', borderBottom: `1px solid ${C.border}` }}
        >
          {/* Eyebrow */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: C.cyan }} />
            <span
              className="text-[10px] font-semibold uppercase tracking-[0.3em]"
              style={{ color: C.cyan, fontFamily: "'Space Grotesk', sans-serif" }}
            >
              INDICADOR OFICIAL · THE MENTOR PRO
            </span>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: C.cyan }} />
          </div>

          {/* Flyer */}
          <div
            className="mx-auto max-w-[460px] rounded-2xl overflow-hidden mb-10"
            style={{
              border: `1px solid ${C.gold}30`,
              boxShadow: `0 0 60px ${C.gold}15, 0 12px 40px rgba(0,0,0,0.6)`,
            }}
          >
            <Image
              src="/metalevels.png"
              alt="MetaLevels — Indicador Pine Script"
              width={500}
              height={500}
              className="w-full h-auto block"
            />
          </div>

          {/* Title */}
          <h1
            className="text-5xl sm:text-6xl font-black text-white mb-3 leading-tight"
            style={{ fontFamily: "'Montserrat', sans-serif", letterSpacing: '-1px' }}
          >
            MetaLevels
          </h1>

          <p
            className="text-lg sm:text-xl mb-4"
            style={{ color: C.cyan, fontFamily: "'Inter', sans-serif" }}
          >
            Geometría Cuántica y Armonía de Precio
          </p>

          <p className="text-sm mb-8 max-w-lg mx-auto leading-relaxed" style={{ color: C.muted }}>
            El indicador exclusivo de The Mentor Pro para TradingView. Proyectá zonas futuras de
            soporte y resistencia con precisión institucional.
          </p>

          {/* Price */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <span
              className="text-3xl font-bold"
              style={{ color: C.gold, fontFamily: "'JetBrains Mono', monospace" }}
            >
              Gs. 150.000
            </span>
            <span
              className="text-xs px-2.5 py-1 rounded border font-bold uppercase tracking-widest"
              style={{ color: C.cyan, borderColor: `${C.cyan}30` }}
            >
              Pago único
            </span>
          </div>

          {/* CTA */}
          <button
            onClick={handleBuy}
            disabled={loading}
            className="inline-flex items-center gap-2 px-8 sm:px-12 py-4 font-bold text-sm uppercase tracking-[0.15em] text-black transition-all duration-200 hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: C.cyan, fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {loading ? 'PROCESANDO...' : 'ADQUIRIR AHORA'}
            {!loading && (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            )}
          </button>

          {!session && (
            <p className="text-xs mt-4" style={{ color: C.muted }}>
              Necesitás{' '}
              <Link href="/login?redirect=/metalevels" className="underline" style={{ color: C.cyan }}>
                iniciar sesión
              </Link>{' '}
              para comprar
            </p>
          )}

          <div className="mt-10 w-full max-w-lg">
            <CryptoPayment productName="MetaLevels · Indicador TradingView" priceGs="150.000" priceUsd="20" />
          </div>
        </section>

        {/* ── SECCIÓN 2: DESCRIPCIÓN GENERAL ── */}
        <section className="py-20 px-6" style={{ borderBottom: `1px solid ${C.border}` }}>
          <div className="max-w-3xl mx-auto">
            <p
              className="text-[10px] font-semibold uppercase tracking-[0.3em] mb-4"
              style={{ color: C.cyan, fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Descripción General
            </p>
            <h2
              className="text-3xl sm:text-4xl font-black text-white mb-8 leading-tight"
              style={{ fontFamily: "'Montserrat', sans-serif", letterSpacing: '-0.5px' }}
            >
              Un sistema de niveles construido sobre la geometría del precio
            </h2>
            <div className="space-y-5 text-base leading-relaxed" style={{ color: '#94A3B8' }}>
              <p>
                MetaLevels es un indicador Pine Script diseñado para TradingView que proyecta zonas
                futuras de soporte y resistencia utilizando principios de geometría de precio derivados
                de la metodología Gann y la armonía matemática del mercado.
              </p>
              <p>
                A diferencia de los indicadores convencionales que trabajan con medias móviles o
                retrocesos estándar, MetaLevels calcula estructuras de precio invisibles para el
                trader promedio — las mismas que utilizan las instituciones para posicionarse antes
                de los movimientos más importantes del mercado.

                Este indicador no promete milagros, reduce señales falsas si, pero depende en un 90 % de 
                tu disciplina, vision y conocimiento para operar.

                Por qué funciona: Los traders pierden NO por señales malas, sino por mala gestión. Un sistema que obliga a operar con R:R 1:3 mínimo hace ganar incluso con 40% de acierto.
Complejidad: Baja-Media.
Posicionamiento: El indicador que te hace rentable aunque aciertes el 40% (ángulo único, contraintuitivo)
              </p>
              <p>
                Cada nivel generado por el indicador representa una zona de alta probabilidad de
                reacción, donde el precio históricamente encuentra confluencia de órdenes institucionales.
                El resultado es una ventaja operativa clara, objetiva y repetible en cualquier activo
                y temporalidad de TradingView.
              </p>
            </div>
          </div>
        </section>

        {/* ── SECCIÓN 3: MECÁNICA DEL ALGORITMO ── */}
        <section
          className="py-20 px-6"
          style={{ backgroundColor: C.card, borderBottom: `1px solid ${C.border}` }}
        >
          <div className="max-w-3xl mx-auto">
            <p
              className="text-[10px] font-semibold uppercase tracking-[0.3em] mb-4"
              style={{ color: C.gold, fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Mecánica del Algoritmo
            </p>
            <h2
              className="text-3xl sm:text-4xl font-black text-white mb-8 leading-tight"
              style={{ fontFamily: "'Montserrat', sans-serif", letterSpacing: '-0.5px' }}
            >
              Motor analítico propietario de The Mentor Pro
            </h2>
            <div className="space-y-5 text-base leading-relaxed" style={{ color: '#94A3B8' }}>
              <p>
                El núcleo de MetaLevels opera sobre un motor de cálculo propietario que combina tres
                principios fundamentales: la cuadratura del tiempo y el precio según W.D. Gann, la
                expansión armónica de la raíz cuadrada aplicada a mínimos y máximos de ciclo, y la
                identificación de zonas de liquidez institucional mediante análisis de estructura de
                mercado.
              </p>
              <p>
                El algoritmo procesa cada barra en tiempo real, calculando la distancia geométrica
                entre los puntos de pivote más relevantes y proyectando hacia adelante las zonas
                donde la armonía matemática del precio anticipa una reacción. Este proceso ocurre
                de manera completamente automática dentro de TradingView, sin necesidad de ajuste
                manual por parte del operador.
              </p>
              <p>
                La precisión del sistema se potencia en confluencia con los niveles del Cuadrado de
                9 de Gann y los cálculos de Sacred Levels, formando un ecosistema analítico completo
                para la operativa de alta probabilidad.
              </p>
            </div>

            {/* Feature chips */}
            <div className="flex flex-wrap gap-3 mt-10">
              {[
                'Pine Script v6',
                'TradingView compatible',
                'Multi-activo',
                'Multi-temporalidad',
                'Tiempo real',
                'Licencia personal',
              ].map((feat) => (
                <span
                  key={feat}
                  className="text-xs px-3 py-1.5 border font-medium uppercase tracking-wider"
                  style={{
                    color: C.gold,
                    borderColor: `${C.gold}30`,
                    backgroundColor: `${C.gold}08`,
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}
                >
                  {feat}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── SECCIÓN 4: INTERPRETACIÓN VISUAL ── */}
        <section className="py-20 px-6" style={{ borderBottom: `1px solid ${C.border}` }}>
          <div className="max-w-4xl mx-auto">
            <p
              className="text-[10px] font-semibold uppercase tracking-[0.3em] mb-4 text-center"
              style={{ color: C.cyan, fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Interpretación Visual
            </p>
            <h2
              className="text-3xl sm:text-4xl font-black text-white mb-12 text-center leading-tight"
              style={{ fontFamily: "'Montserrat', sans-serif", letterSpacing: '-0.5px' }}
            >
              Tres tipos de niveles, tres lecturas de mercado
            </h2>

            <div className="grid sm:grid-cols-3 gap-6">
              {/* Líneas Celestes */}
              <div
                className="rounded-xl p-6"
                style={{
                  backgroundColor: C.card,
                  border: `1px solid ${C.cyan}25`,
                  boxShadow: `0 0 30px ${C.cyan}08`,
                }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-5"
                  style={{ backgroundColor: `${C.cyan}15`, border: `1px solid ${C.cyan}30` }}
                >
                  <span className="text-xl">↑</span>
                </div>
                <h3
                  className="font-bold text-white mb-2 text-lg"
                  style={{ fontFamily: "'Space Grotesk', sans-serif", color: C.cyan }}
                >
                  Líneas Celestes
                </h3>
                <p
                  className="text-xs uppercase tracking-[0.2em] mb-4 font-semibold"
                  style={{ color: C.cyan, opacity: 0.6 }}
                >
                  Señal Alcista · Bull Zone
                </p>
                <p className="text-sm leading-relaxed" style={{ color: '#94A3B8' }}>
                  Proyectan zonas donde la estructura de precio anticipa demanda institucional.
                  Actúan como soporte dinámico de alta probabilidad en el contexto del ciclo
                  geométrico activo.
                </p>
              </div>

              {/* Líneas Rojas */}
              <div
                className="rounded-xl p-6"
                style={{
                  backgroundColor: C.card,
                  border: `1px solid ${C.red}25`,
                  boxShadow: `0 0 30px ${C.red}08`,
                }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-5"
                  style={{ backgroundColor: `${C.red}15`, border: `1px solid ${C.red}30` }}
                >
                  <span className="text-xl">↓</span>
                </div>
                <h3
                  className="font-bold mb-2 text-lg"
                  style={{ fontFamily: "'Space Grotesk', sans-serif", color: C.red }}
                >
                  Líneas Rojas
                </h3>
                <p
                  className="text-xs uppercase tracking-[0.2em] mb-4 font-semibold"
                  style={{ color: C.red, opacity: 0.6 }}
                >
                  Señal Bajista · Bear Zone
                </p>
                <p className="text-sm leading-relaxed" style={{ color: '#94A3B8' }}>
                  Indican zonas de presión de oferta institucional proyectada. Actúan como
                  resistencia dinámica donde el precio históricamente encuentra rechazo
                  dentro del ciclo geométrico.
                </p>
              </div>

              {/* Líneas Doradas */}
              <div
                className="rounded-xl p-6"
                style={{
                  backgroundColor: C.card,
                  border: `1px solid ${C.gold}25`,
                  boxShadow: `0 0 30px ${C.gold}08`,
                }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-5"
                  style={{ backgroundColor: `${C.gold}15`, border: `1px solid ${C.gold}30` }}
                >
                  <span className="text-xl">◆</span>
                </div>
                <h3
                  className="font-bold mb-2 text-lg"
                  style={{ fontFamily: "'Space Grotesk', sans-serif", color: C.gold }}
                >
                  Líneas Doradas
                </h3>
                <p
                  className="text-xs uppercase tracking-[0.2em] mb-4 font-semibold"
                  style={{ color: C.gold, opacity: 0.6 }}
                >
                  Masters Level · Confluencia Máxima
                </p>
                <p className="text-sm leading-relaxed" style={{ color: '#94A3B8' }}>
                  Representan la confluencia más alta del sistema: zonas donde geometría cuántica,
                  armonía de precio e impulso institucional convergen simultáneamente. Las de mayor
                  peso operativo.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECCIÓN 5: REGLA OPERATIVA FUNDAMENTAL ── */}
        <section
          className="py-20 px-6"
          style={{ backgroundColor: C.card, borderBottom: `1px solid ${C.border}` }}
        >
          <div className="max-w-3xl mx-auto">
            <p
              className="text-[10px] font-semibold uppercase tracking-[0.3em] mb-4 text-center"
              style={{ color: C.gold, fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Regla Operativa Fundamental
            </p>
            <h2
              className="text-3xl sm:text-4xl font-black text-white mb-10 text-center leading-tight"
              style={{ fontFamily: "'Montserrat', sans-serif", letterSpacing: '-0.5px' }}
            >
              El nivel proyecta. La vela confirma.
            </h2>

            <div
              className="rounded-xl p-8"
              style={{
                border: `1px solid ${C.gold}35`,
                backgroundColor: `${C.gold}06`,
                boxShadow: `0 0 40px ${C.gold}08`,
              }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-10 h-10 rounded-lg shrink-0 flex items-center justify-center mt-0.5"
                  style={{ backgroundColor: `${C.gold}20`, border: `1px solid ${C.gold}30` }}
                >
                  <svg className="w-5 h-5" fill="none" stroke={C.gold} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  </svg>
                </div>
                <div className="space-y-4">
                  <p className="text-base leading-relaxed font-medium" style={{ color: '#ccc' }}>
                    MetaLevels es un sistema de <strong style={{ color: C.gold }}>proyección de zonas</strong>,
                    no un sistema de señales automáticas de entrada. Su función es indicar con anticipación
                    dónde el precio tiene mayor probabilidad de reaccionar.
                  </p>
                  <p className="text-base leading-relaxed" style={{ color: '#94A3B8' }}>
                    La <strong style={{ color: 'white' }}>confirmación de la vela</strong> sobre el nivel
                    proyectado es condición obligatoria antes de ejecutar cualquier operación. Ingresar
                    sin confirmación equivale a operar por anticipación, lo que invalida la ventaja
                    estadística del sistema.
                  </p>
                  <p className="text-base leading-relaxed" style={{ color: '#94A3B8' }}>
                    El trader que respeta esta regla opera con el mercado. El que no, opera contra él.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 grid sm:grid-cols-3 gap-4">
              {[
                { step: '01', label: 'Identificá el nivel proyectado', desc: 'MetaLevels calcula las zonas automáticamente' },
                { step: '02', label: 'Esperá la vela de confirmación', desc: 'Rechazo, envolvente o pin bar sobre el nivel' },
                { step: '03', label: 'Ejecutá con gestión de riesgo', desc: 'Stop bajo el nivel, TP en próxima zona proyectada' },
              ].map((item) => (
                <div
                  key={item.step}
                  className="rounded-lg p-5"
                  style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}
                >
                  <div
                    className="text-xs font-bold mb-2"
                    style={{ color: C.gold, fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {item.step}
                  </div>
                  <p className="text-sm font-semibold text-white mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {item.label}
                  </p>
                  <p className="text-xs leading-relaxed" style={{ color: C.muted }}>
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SECCIÓN 5b: REQUISITOS TÉCNICOS ── */}
        <section className="py-16 px-6" style={{ borderBottom: `1px solid ${C.border}` }}>
          <div className="max-w-3xl mx-auto">
            <div
              className="rounded-xl p-7"
              style={{
                backgroundColor: C.card,
                borderLeft: `4px solid ${C.gold}`,
                border: `1px solid ${C.gold}25`,
                borderLeftWidth: 4,
              }}
            >
              <div className="flex items-start gap-3 mb-5">
                <span className="text-xl shrink-0 mt-0.5">⚠️</span>
                <h3
                  className="text-base font-bold text-white"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Requisitos Técnicos para la Instalación
                </h3>
              </div>

              <p className="text-sm leading-relaxed mb-6" style={{ color: '#94A3B8' }}>
                MetaLevels se instala en TradingView a través del Editor Pine Script. Por
                limitaciones técnicas del editor móvil (bugs de indentación), la instalación
                inicial requiere una <strong className="text-white">computadora (PC o Mac)</strong>.
              </p>

              <div className="space-y-3 mb-6">
                {[
                  { icon: '✅', label: 'INSTALACIÓN', text: 'Requiere PC o Mac (una sola vez)' },
                  { icon: '📱', label: 'USO DIARIO', text: 'Funciona en celular tras la instalación' },
                  { icon: '🔄', label: 'SINCRONIZACIÓN', text: 'Automática entre todos tus dispositivos' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <span className="text-base shrink-0">{item.icon}</span>
                    <span className="text-xs font-bold uppercase tracking-wider shrink-0 w-28" style={{ color: C.gold }}>
                      {item.label}:
                    </span>
                    <span className="text-sm" style={{ color: '#999' }}>{item.text}</span>
                  </div>
                ))}
              </div>

              <p className="text-sm leading-relaxed mb-5" style={{ color: '#666' }}>
                Una vez instalado desde PC, TradingView sincroniza automáticamente tu cuenta.
                Desde ese momento, podés usar MetaLevels en cualquier dispositivo, incluyendo
                tu celular.
              </p>

              <div
                className="rounded-lg px-4 py-3 mb-5"
                style={{ backgroundColor: `${C.gold}10`, border: `1px solid ${C.gold}30` }}
              >
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: C.gold, fontFamily: "'Space Grotesk', sans-serif" }}>
                  Activos compatibles (actualmente)
                </p>
                <div className="flex flex-wrap gap-2">
                  {['US30', 'XAUUSD', 'BTCUSD', 'NASDAQ'].map((asset) => (
                    <span
                      key={asset}
                      className="text-xs font-bold px-2.5 py-1 rounded"
                      style={{
                        backgroundColor: `${C.gold}15`,
                        border: `1px solid ${C.gold}40`,
                        color: C.gold,
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    >
                      {asset}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm" style={{ color: '#555' }}>¿Dudas antes de comprar?</span>
                <WhatsAppButton
                  variant="inline"
                  label="Escribinos"
                  message="Hola, tengo una consulta sobre MetaLevels antes de comprar"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── SECCIÓN 6: CTA FINAL ── */}
        <section className="py-24 px-6 text-center" style={{ borderBottom: `1px solid ${C.border}` }}>
          <div className="max-w-2xl mx-auto">
            <p
              className="text-[10px] font-semibold uppercase tracking-[0.3em] mb-6"
              style={{ color: C.cyan, fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Acceso Inmediato · Licencia Personal
            </p>
            <h2
              className="text-4xl sm:text-5xl font-black text-white mb-4 leading-tight"
              style={{ fontFamily: "'Montserrat', sans-serif", letterSpacing: '-1px' }}
            >
              Comenzá a operar con MetaLevels hoy
            </h2>
            <p className="text-base mb-10 leading-relaxed" style={{ color: C.muted }}>
              Pago único. Código de activación personal entregado manualmente tras confirmar
              el pago. Compatible con TradingView gratuito y de pago.
            </p>

            <div className="flex items-center justify-center gap-4 mb-10">
              <span
                className="text-4xl font-bold"
                style={{ color: C.gold, fontFamily: "'JetBrains Mono', monospace" }}
              >
                Gs. 150.000
              </span>
              <div className="text-left">
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: C.cyan }}>Pago único</p>
                <p className="text-xs" style={{ color: C.muted }}>≈ $20 USD</p>
              </div>
            </div>

            <button
              onClick={handleBuy}
              disabled={loading}
              className="flex items-center justify-center gap-3 w-full sm:w-auto sm:inline-flex px-8 sm:px-14 py-5 font-bold text-sm sm:text-base uppercase tracking-[0.1em] sm:tracking-[0.15em] text-black transition-all duration-200 hover:opacity-90 disabled:opacity-50 animate-pulse"
              style={{
                backgroundColor: C.cyan,
                fontFamily: "'Space Grotesk', sans-serif",
                animationDuration: '2.5s',
              }}
            >
              {loading ? 'PROCESANDO...' : (
                <>
                  <span className="sm:hidden">ADQUIRIR METALEVELS</span>
                  <span className="hidden sm:inline">ADQUIRIR METALEVELS — Gs. 150.000</span>
                </>
              )}
              {!loading && (
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              )}
            </button>

            {!session && (
              <p className="text-sm mt-5" style={{ color: C.muted }}>
                Necesitás{' '}
                <Link href="/login?redirect=/metalevels" style={{ color: C.cyan }} className="underline">
                  iniciar sesión
                </Link>{' '}
                o{' '}
                <Link href="/register?redirect=/metalevels" style={{ color: C.cyan }} className="underline">
                  crear una cuenta gratis
                </Link>{' '}
                para comprar
              </p>
            )}

            <div className="flex flex-wrap justify-center gap-6 mt-10 text-xs" style={{ color: C.muted }}>
              {[
                'Pago procesado por PagoPar',
                'Licencia de uso personal',
                'Código entregado en 24hs',
                'Soporte por WhatsApp',
              ].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <svg className="w-3 h-3 shrink-0" fill="none" stroke={C.gold} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                  {t}
                </span>
              ))}
            </div>

            <div className="mt-10 max-w-lg mx-auto">
              <CryptoPayment productName="MetaLevels · Indicador TradingView" priceGs="150.000" priceUsd="20" />
            </div>
          </div>
        </section>

        {/* ── SECCIÓN 7: AVISO LEGAL ── */}
        <section className="py-16 px-6">
          <div className="max-w-2xl mx-auto">
            <p
              className="text-[9px] font-semibold uppercase tracking-[0.3em] mb-4"
              style={{ color: C.muted, fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Aviso Legal
            </p>
            <div className="space-y-3 text-xs leading-relaxed" style={{ color: '#3a3a3a' }}>
              <p>
                MetaLevels es una herramienta de análisis técnico con fines informativos y educativos.
                No constituye asesoramiento financiero, recomendación de inversión ni garantía de
                rendimiento futuro.
              </p>
              <p>
                El trading en mercados financieros implica riesgo de pérdida de capital. Los
                resultados pasados no son indicativos de resultados futuros. El usuario asume
                total responsabilidad por las decisiones de trading tomadas con base en este
                indicador.
              </p>
              <p>
                La licencia es de uso personal e intransferible. Queda prohibida la redistribución,
                reventa o compartición del código fuente o del código de activación. El
                incumplimiento resulta en la revocación inmediata de la licencia sin derecho
                a reembolso.
              </p>
            </div>
          </div>
        </section>

        {/* Footer minimal */}
        <footer
          className="border-t py-8 px-6"
          style={{ borderColor: C.border, backgroundColor: C.card }}
        >
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs" style={{ color: C.muted }}>
              © 2026 Sacred Levels · The Mentor Pro
            </p>
            <div className="flex gap-6 text-xs" style={{ color: C.muted }}>
              <Link href="/" className="hover:text-white transition-colors">Inicio</Link>
              <Link href="/quantum" className="hover:text-white transition-colors">Calculadora</Link>
              <Link href="/metalevels/acceso" style={{ color: C.cyan }} className="hover:opacity-80 transition-opacity">
                Mi licencia
              </Link>
            </div>
          </div>
        </footer>

      </main>
    </>
  )
}
