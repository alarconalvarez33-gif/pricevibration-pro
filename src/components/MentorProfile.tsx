'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

const GOLD = '#C9A84C'
const BG   = '#0A0A0B'
const CARD = '#0f0f10'
const BORDER = '#1e1e1f'
const SANS = "'Space Grotesk', sans-serif"
const SERIF = "Georgia, 'Times New Roman', serif"
const MONO = "'JetBrains Mono', monospace"

const DOMAINS = [
  {
    n: '01',
    title: 'Análisis Cuántico de Activos',
    body: 'Especialista en el cálculo de niveles de reversión mediante la Ley de Cuadrados y raíz cuadrada del precio (n²).',
  },
  {
    n: '02',
    title: 'Mercados Globales',
    body: 'Trader comprobado en la operativa de Acciones, Commodities (Oro/Petróleo) y Divisas (Forex).',
  },
  {
    n: '03',
    title: 'Ingeniería de Momentum',
    body: 'Desarrollo de sistemas quirúrgicos para la identificación de liquidez institucional y giros de alta probabilidad.',
  },
  {
    n: '04',
    title: 'Arquitectura Algorítmica',
    body: 'Creador de la terminal Sacred Levels v6.0 y sistemas de señales en tiempo real (Signal Hub).',
  },
]

const ACHIEVEMENTS = [
  {
    metric: '15',
    unit: 'años',
    label: 'Skin in the Game',
    desc: 'Década y media de gestión de capital propio y análisis de ciclos macroeconómicos.',
  },
  {
    metric: '24K',
    unit: 'visitas/mes',
    label: 'Sacred Levels',
    desc: 'Plataforma tecnológica consolidada como referente de precisión matemática para traders profesionales.',
  },
  {
    metric: 'n²',
    unit: '',
    label: 'Método Central',
    desc: 'Modelos predictivos basados en econofísica aplicada y la geometría del precio.',
  },
]

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } }, { threshold })
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, visible }
}

export default function MentorProfile() {
  const { ref, visible } = useInView(0.1)

  return (
    <section
      ref={ref}
      style={{ backgroundColor: BG, borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}`, overflow: 'hidden' }}
    >
      <style>{`
        @keyframes fadeUp   { from { opacity: 0; transform: translateY(28px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes fadeLeft { from { opacity: 0; transform: translateX(-28px) } to { opacity: 1; transform: translateX(0) } }
        @keyframes fadeRight{ from { opacity: 0; transform: translateX(28px) } to { opacity: 1; transform: translateX(0) } }
        .mentor-fadeup   { opacity: 0 }
        .mentor-fadeleft { opacity: 0 }
        .mentor-faderight{ opacity: 0 }
        .is-visible .mentor-fadeup    { animation: fadeUp   0.7s ease forwards }
        .is-visible .mentor-fadeleft  { animation: fadeLeft 0.7s ease forwards }
        .is-visible .mentor-faderight { animation: fadeRight 0.7s ease forwards }
      `}</style>

      <div className={visible ? 'is-visible' : ''}>

        {/* ── TOP: photo + intro ── */}
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px 60px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 48, alignItems: 'start' }}
            className="md:grid-cols-[200px_1fr]"
          >

            {/* Photo column */}
            <div className="mentor-fadeleft" style={{ animationDelay: '0.1s', position: 'relative', flexShrink: 0 }}>
              {/* Gold accent line */}
              <div style={{ position: 'absolute', top: -16, left: -16, width: 2, height: '60%', background: `linear-gradient(to bottom, ${GOLD}, transparent)` }} />
              <div style={{ position: 'absolute', top: -16, left: -16, width: '60%', height: 2, background: `linear-gradient(to right, ${GOLD}, transparent)` }} />

              <div style={{
                position: 'relative', borderRadius: 4,
                border: `1px solid rgba(201,168,76,0.3)`,
                overflow: 'hidden',
                height: 200,
                width: 200,
                boxShadow: `0 0 80px rgba(201,168,76,0.08), 0 32px 64px rgba(0,0,0,0.6)`,
              }}>
                <Image
                  src="/thementor.png"
                  alt="Raúl Alarcón — The Mentor"
                  fill
                  style={{ objectFit: 'cover' }}
                  priority
                />
                {/* Gradient overlay bottom */}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '35%', background: 'linear-gradient(to top, rgba(10,10,11,0.85), transparent)' }} />
                {/* Label bottom */}
                <div style={{ position: 'absolute', bottom: 16, left: 20 }}>
                  <p style={{ fontFamily: MONO, fontSize: 10, color: GOLD, letterSpacing: '0.2em', textTransform: 'uppercase' }}>The Mentor</p>
                </div>
              </div>

              {/* Bottom accent */}
              <div style={{ position: 'absolute', bottom: -16, right: -16, width: 2, height: '40%', background: `linear-gradient(to top, ${GOLD}, transparent)` }} />
              <div style={{ position: 'absolute', bottom: -16, right: -16, width: '40%', height: 2, background: `linear-gradient(to left, ${GOLD}, transparent)` }} />
            </div>

            {/* Text column */}
            <div>
              {/* Eyebrow */}
              <p className="mentor-fadeup" style={{ animationDelay: '0.15s', fontFamily: MONO, fontSize: 10, color: GOLD, letterSpacing: '0.35em', textTransform: 'uppercase', marginBottom: 16 }}>
                Fundador · Sacred Levels
              </p>

              {/* Name */}
              <h2 className="mentor-fadeup" style={{ animationDelay: '0.22s', fontFamily: SERIF, fontSize: 'clamp(38px, 6vw, 64px)', fontWeight: 400, color: '#fff', lineHeight: 1.05, letterSpacing: '-0.01em', marginBottom: 8 }}>
                Raúl Alarcón
              </h2>

              {/* Title */}
              <p className="mentor-fadeup" style={{ animationDelay: '0.28s', fontFamily: SANS, fontSize: 13, color: GOLD, fontWeight: 600, letterSpacing: '0.05em', marginBottom: 28 }}>
                Especialista en Ingeniería de Mercados y Algoritmos n²
              </p>

              {/* Divider */}
              <div className="mentor-fadeup" style={{ animationDelay: '0.32s', width: 48, height: 1, background: GOLD, marginBottom: 28, opacity: 0.5 }} />

              {/* Bio */}
              <p className="mentor-fadeup" style={{ animationDelay: '0.38s', fontFamily: SANS, fontSize: 14, color: '#888', lineHeight: 1.8, marginBottom: 36 }}>
                Estratega de mercados financieros con <span style={{ color: '#ccc', fontWeight: 600 }}>15 años</span> de trayectoria operativa y académica.
                Fundador y Ex Presidente de <span style={{ color: '#ccc', fontWeight: 600 }}>SMARTUM SA</span>, Instituto Superior reconocido por el Ministerio de Educación y Ciencias (MEC).
                Experto en <span style={{ color: '#ccc', fontWeight: 600 }}>Econofísica aplicada</span>, especializado en la arquitectura de modelos predictivos
                para el mercado de capitales global y líder de opinión en la comunidad de trading digital.
              </p>

              {/* Domain grid */}
              <div className="mentor-fadeup" style={{ animationDelay: '0.44s', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 1, background: BORDER }}>
                {DOMAINS.map((d) => (
                  <div key={d.n} style={{ background: CARD, padding: '20px 18px' }}>
                    <p style={{ fontFamily: MONO, fontSize: 10, color: GOLD, marginBottom: 8, opacity: 0.7 }}>{d.n}</p>
                    <p style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: '#ddd', marginBottom: 6 }}>{d.title}</p>
                    <p style={{ fontFamily: SANS, fontSize: 11, color: '#555', lineHeight: 1.6 }}>{d.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── METRICS BAR ── */}
        <div className="mentor-fadeup" style={{ animationDelay: '0.5s', borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 1, background: BORDER }}>
            {ACHIEVEMENTS.map((a) => (
              <div key={a.metric} style={{ background: BG, padding: '36px 32px' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 4 }}>
                  <span style={{ fontFamily: MONO, fontSize: 'clamp(36px, 5vw, 52px)', fontWeight: 700, color: GOLD, lineHeight: 1 }}>{a.metric}</span>
                  {a.unit && <span style={{ fontFamily: SANS, fontSize: 13, color: '#555' }}>{a.unit}</span>}
                </div>
                <p style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, color: '#ccc', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 8 }}>{a.label}</p>
                <p style={{ fontFamily: SANS, fontSize: 11, color: '#555', lineHeight: 1.6 }}>{a.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── QUOTE ── */}
        <div className="mentor-fadeup" style={{ animationDelay: '0.55s', maxWidth: 860, margin: '0 auto', padding: '72px 24px' }}>
          <div style={{ position: 'relative', paddingLeft: 32 }}>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 2, background: `linear-gradient(to bottom, ${GOLD}, transparent)` }} />
            <p style={{ fontFamily: SERIF, fontSize: 'clamp(20px, 3vw, 28px)', color: '#ccc', lineHeight: 1.55, fontStyle: 'italic', fontWeight: 400 }}>
              " La rentabilidad no es una cuestión de suerte, es una consecuencia de la gestión algorítmica del riesgo y del dominio de estas técnicas..&rdquo;
            </p>
            <p style={{ fontFamily: MONO, fontSize: 10, color: GOLD, letterSpacing: '0.25em', textTransform: 'uppercase', marginTop: 20 }}>
              — Raúl Alarcón
            </p>
          </div>
        </div>

        {/* ── FOOTER ROW ── */}
        <div className="mentor-fadeup" style={{ animationDelay: '0.6s', borderTop: `1px solid ${BORDER}` }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 24px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
              {['trading.com.py', 'sacredlevels.com'].map(link => (
                <span key={link} style={{ fontFamily: MONO, fontSize: 10, color: '#444', letterSpacing: '0.1em' }}>{link}</span>
              ))}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
              <span style={{ fontFamily: MONO, fontSize: 10, color: '#444', letterSpacing: '0.1em' }}>@thelastmentor · TikTok</span>
              <span style={{ fontFamily: MONO, fontSize: 10, color: '#444', letterSpacing: '0.1em' }}>Asunción / San Lorenzo, Paraguay</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
