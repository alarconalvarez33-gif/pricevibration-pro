'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/Footer'

const CYAN = '#00D4FF'
const DARK_BG = '#0F172A'

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    const form = e.currentTarget
    const fd = new FormData(form)
    const payload = {
      name: fd.get('name') as string,
      email: fd.get('email') as string,
      subject: fd.get('subject') as string,
      message: fd.get('message') as string,
    }
    try {
      const response = await fetch('https://formspree.io/f/xreapnkb', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
      if (response.ok) {
        setSubmitted(true)
        form.reset()
      } else {
        const err = await response.json().catch(() => ({}))
        alert('Error: ' + (err.error || 'No se pudo enviar. Intentá de nuevo.'))
      }
    } catch {
      alert('Error de red. Verificá tu conexión e intentá de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    backgroundColor: '#0D1B2E',
    border: '1px solid #1E293B',
    borderRadius: '10px',
    padding: '12px 16px',
    color: '#E2E8F0',
    fontSize: '14px',
    fontFamily: "'Inter', sans-serif",
    outline: 'none',
    transition: 'border-color 0.2s',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: '#64748B',
    marginBottom: '8px',
    fontFamily: "'Space Grotesk', sans-serif",
  }

  return (
    <main style={{ backgroundColor: DARK_BG, minHeight: '100vh' }}>
      <Header />

      {/* Page header */}
      <section
        style={{
          background: `linear-gradient(180deg, ${DARK_BG} 0%, #0c1529 100%)`,
          paddingTop: '96px',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-20">
          <p
            className="text-xs font-bold uppercase tracking-[0.35em] mb-4"
            style={{ color: CYAN, fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Soporte
          </p>
          <h1
            className="text-4xl sm:text-5xl font-black text-white mb-4 leading-tight"
            style={{ fontFamily: "'Montserrat', sans-serif", letterSpacing: '-1px' }}
          >
            Contacto
          </h1>
          <p className="text-base max-w-xl" style={{ color: '#64748B', fontFamily: "'Inter', sans-serif" }}>
            Tenés alguna duda o consulta? Escribinos y te respondemos a la brevedad.
          </p>
        </div>
      </section>

      {/* Form section */}
      <section style={{ backgroundColor: DARK_BG }}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16">
          <div className="grid md:grid-cols-5 gap-10 md:gap-16">

            {/* Left: info */}
            <div className="md:col-span-2 flex flex-col gap-8">
              <div>
                <h2
                  className="text-xl font-black text-white mb-3"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  Hablemos
                </h2>
                <p className="text-sm leading-relaxed" style={{ color: '#64748B', fontFamily: "'Inter', sans-serif" }}>
                  Podés contactarnos por cualquier consulta sobre los cursos, tu cuenta, métodos de pago o soporte técnico.
                </p>
              </div>

              {[
                {
                  icon: '📧',
                  label: 'Email',
                  value: 'contacto@sacredlevels.com',
                },
                {
                  icon: '⏱️',
                  label: 'Tiempo de respuesta',
                  value: 'Menos de 24 horas hábiles',
                },
                {
                  icon: '🌎',
                  label: 'Idioma',
                  value: 'Español (Paraguay)',
                },
              ].map(item => (
                <div key={item.label} className="flex items-start gap-4">
                  <div
                    className="text-xl shrink-0 flex items-center justify-center rounded-xl"
                    style={{ width: '44px', height: '44px', backgroundColor: '#0D1B2E', border: '1px solid #1E293B' }}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest mb-0.5" style={{ color: '#475569', fontFamily: "'Space Grotesk', sans-serif" }}>
                      {item.label}
                    </p>
                    <p className="text-sm" style={{ color: '#CBD5E1', fontFamily: "'Inter', sans-serif" }}>
                      {item.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Right: form */}
            <div className="md:col-span-3">
              <div
                style={{
                  backgroundColor: '#0D1B2E',
                  border: '1px solid #1E293B',
                  borderRadius: '20px',
                  padding: '32px',
                }}
              >
                {submitted ? (
                  <div className="text-center py-10">
                    <div
                      className="flex items-center justify-center mx-auto mb-5 rounded-full text-3xl"
                      style={{ width: '72px', height: '72px', backgroundColor: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)' }}
                    >
                      ✅
                    </div>
                    <h3
                      className="text-2xl font-black text-white mb-2"
                      style={{ fontFamily: "'Montserrat', sans-serif" }}
                    >
                      Mensaje enviado
                    </h3>
                    <p className="text-sm mb-6" style={{ color: '#64748B', fontFamily: "'Inter', sans-serif" }}>
                      Gracias por escribirnos. Te respondemos en menos de 24 horas.
                    </p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="px-6 py-2.5 text-sm font-bold uppercase tracking-widest rounded-lg transition-all hover:-translate-y-0.5"
                      style={{ border: `1px solid ${CYAN}`, color: CYAN, fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      Enviar otro mensaje
                    </button>
                  </div>
                ) : (
                  <form
                    action="https://formspree.io/f/xreapnkb"
                    method="POST"
                    onSubmit={handleSubmit}
                    className="space-y-5"
                  >
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label htmlFor="name" style={labelStyle}>Nombre *</label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          required
                          placeholder="Tu nombre"
                          style={inputStyle}
                          onFocus={e => (e.currentTarget.style.borderColor = CYAN)}
                          onBlur={e => (e.currentTarget.style.borderColor = '#1E293B')}
                        />
                      </div>
                      <div>
                        <label htmlFor="email" style={labelStyle}>Email *</label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          required
                          placeholder="tu@email.com"
                          style={inputStyle}
                          onFocus={e => (e.currentTarget.style.borderColor = CYAN)}
                          onBlur={e => (e.currentTarget.style.borderColor = '#1E293B')}
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="subject" style={labelStyle}>Asunto *</label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        required
                        placeholder="¿En qué podemos ayudarte?"
                        style={inputStyle}
                        onFocus={e => (e.currentTarget.style.borderColor = CYAN)}
                        onBlur={e => (e.currentTarget.style.borderColor = '#1E293B')}
                      />
                    </div>

                    <div>
                      <label htmlFor="message" style={labelStyle}>Mensaje *</label>
                      <textarea
                        id="message"
                        name="message"
                        required
                        rows={6}
                        placeholder="Escribí tu consulta aquí..."
                        style={{ ...inputStyle, resize: 'none' }}
                        onFocus={e => (e.currentTarget.style.borderColor = CYAN)}
                        onBlur={e => (e.currentTarget.style.borderColor = '#1E293B')}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 text-sm font-bold uppercase tracking-[0.1em] rounded-lg transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      style={{
                        backgroundColor: CYAN,
                        color: '#000',
                        fontFamily: "'Space Grotesk', sans-serif",
                        boxShadow: '0 4px 16px rgba(0,212,255,0.3)',
                      }}
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Enviando...
                        </>
                      ) : (
                        'ENVIAR MENSAJE →'
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Exness banner */}
      <section style={{ backgroundColor: '#080F1A', borderTop: '1px solid #1a1a1a', borderBottom: '1px solid #1a1a1a' }}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <a
            href="https://one.exnessonelink.com/intl/es/a/xwx0gc598n"
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://d3dpet1g0ty5ed.cloudfront.net/ES_Take_control_728x90.png"
              width={728}
              height={90}
              alt="Exness - Take Control"
              style={{ maxWidth: '100%', height: 'auto', display: 'block' }}
            />
          </a>
        </div>
      </section>

      <Footer />
    </main>
  )
}
