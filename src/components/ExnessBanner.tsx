'use client'

const WA_TEXT = encodeURIComponent('Hola, abrí una cuenta en Exness con el código xwx0gc598n y adjunto el comprobante para activar 1 mes gratis de Sacred Levels')
const WA_URL = `https://wa.me/595981234128?text=${WA_TEXT}`

export default function ExnessBanner() {
  return (
    <div style={{ background: '#0a0900', borderTop: '2px solid #F3BA2F', borderBottom: '1px solid #1e1a06' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>

        {/* Embed exacto Exness */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <a href="https://one.exnessonelink.com/intl/es/a/xwx0gc598n" target="_blank" rel="noopener noreferrer" style={{ display: 'block', width: '100%', maxWidth: '990px' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://d3dpek1g0ty5ed.cloudfront.net/ES_Take_control_990x250.png"
            width="990"
            height="250"
            alt="Exness"
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </a>

        {/* Promo strip */}
        <div style={{ width: '100%', maxWidth: '990px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px', padding: '12px 16px', background: '#060500', border: '1px solid #2a2200' }}>
          <p style={{ flex: 1, minWidth: '200px', fontSize: '11px', lineHeight: '1.6', color: '#8a7a30', fontFamily: 'Inter, sans-serif', margin: 0 }}>
            <strong style={{ color: '#F3BA2F' }}>⚡ 1 mes GRATIS</strong>
            {' '}— Abrí cuenta en Exness usando el enlace de arriba y accedés a todas las herramientas más poderosas de Sacred Levels.
            Si ya tenés cuenta, solicitá el cambio de socio en el chat de Exness con el código{' '}
            <code style={{ background: '#181200', color: '#F3BA2F', padding: '1px 6px', fontFamily: 'monospace', fontSize: '10px', fontWeight: 'bold' }}>
              xwx0gc598n
            </code>
            {' '}y enviá el comprobante por WhatsApp.
          </p>
          <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
            <a
              href="https://one.exnessonelink.com/intl/es/a/xwx0gc598n"
              target="_blank"
              rel="noopener noreferrer"
              style={{ background: '#F3BA2F', color: '#000', padding: '8px 16px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.08em', textDecoration: 'none', fontFamily: 'sans-serif' }}
            >
              Abrir cuenta
            </a>
            <a
              href={WA_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{ border: '1px solid rgba(37,211,102,0.4)', color: '#25D366', padding: '8px 12px', fontSize: '10px', fontWeight: '600', textDecoration: 'none', fontFamily: 'sans-serif' }}
            >
              WhatsApp →
            </a>
          </div>
        </div>

      </div>
    </div>
  )
}
