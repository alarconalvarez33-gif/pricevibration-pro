'use client'

import { useState } from 'react'

const CYAN = '#00D4FF'
const DARK_BG = '#0F172A'

export default function ContactSection() {
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
    backgroundColor: '#0A0F1C',
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
    textTransform: 'uppercase' as const,
    color: '#64748B',
    marginBottom: '8px',
    fontFamily: "'Space Grotesk', sans-serif",
  }

  return (
    <section style={{ backgroundColor: DARK_BG, borderTop: '1px solid #1a1a1a' }}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24">

        <div className="grid md:grid-cols-5 gap-10 md:gap-16">

          {/* Left: info */}
          <div className="md:col-span-2 flex flex-col gap-8">
            <div>
              <p
                className="text-xs font-bold uppercase tracking-[0.35em] mb-3"
                style={{ color: CYAN, fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Soporte
              </p>
              <h2
                className="text-3xl sm:text-4xl font-black text-white mb-4 leading-tight"
                style={{ fontFamily: "'Montserrat', sans-serif", letterSpacing: '-0.5px' }}
              >
                Contacto
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: '#64748B', fontFamily: "'Inter', sans-serif" }}>
                ¿Tenés dudas sobre los cursos, tu cuenta o métodos de pago? Escribinos y te respondemos a la brevedad.
              </p>
            </div>

            {[
              { icon: '📧', label: 'Email', value: 'contacto@sacredlevels.com' },
              { icon: '⏱️', label: 'Tiempo de respuesta', value: 'Menos de 24 horas hábiles' },
              { icon: '🌎', label: 'Idioma', value: 'Español (Paraguay)' },
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
                  <h3 className="text-2xl font-black text-white mb-2" style={{ fontFamily: "'Montserrat', sans-serif" }}>
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
                      <label htmlFor="contact-name" style={labelStyle}>Nombre *</label>
                      <input
                        type="text"
                        id="contact-name"
                        name="name"
                        required
                        placeholder="Tu nombre"
                        style={inputStyle}
                        onFocus={e => (e.currentTarget.style.borderColor = CYAN)}
                        onBlur={e => (e.currentTarget.style.borderColor = '#1E293B')}
                      />
                    </div>
                    <div>
                      <label htmlFor="contact-email" style={labelStyle}>Email *</label>
                      <input
                        type="email"
                        id="contact-email"
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
                    <label htmlFor="contact-subject" style={labelStyle}>Asunto *</label>
                    <input
                      type="text"
                      id="contact-subject"
                      name="subject"
                      required
                      placeholder="¿En qué podemos ayudarte?"
                      style={inputStyle}
                      onFocus={e => (e.currentTarget.style.borderColor = CYAN)}
                      onBlur={e => (e.currentTarget.style.borderColor = '#1E293B')}
                    />
                  </div>

                  <div>
                    <label htmlFor="contact-message" style={labelStyle}>Mensaje *</label>
                    <textarea
                      id="contact-message"
                      name="message"
                      required
                      rows={5}
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
  )
}
