'use client'

const WA_TEXT = encodeURIComponent('Hola, abrí una cuenta en Exness con el código xwx0gc598n y adjunto el comprobante para activar 1 mes gratis de Sacred Levels')
const WA_URL = `https://wa.me/595981234128?text=${WA_TEXT}`

export default function ExnessBanner() {
  return (
    <div style={{ backgroundColor: '#04040a', borderBottom: '1px solid #14120a' }}>
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-5 flex flex-col items-center gap-3">

        {/* Embed exacto provisto por Exness */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <a href="https://one.exnessonelink.com/intl/es/a/xwx0gc598n" target="_blank" rel="noopener noreferrer sponsored" style={{ display: 'block', maxWidth: '720px', width: '100%' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://d3dpek1g0ty5ed.cloudfront.net/ES_Take_control_720x90.png" width="720" height="90" alt="" style={{ width: '100%', height: 'auto', display: 'block' }} />
        </a>

        {/* Promo strip */}
        <div
          className="w-full max-w-[720px] flex flex-col sm:flex-row items-start sm:items-center gap-4 px-4 py-3"
          style={{ backgroundColor: '#090800', border: '1px solid #1e1a06' }}
        >
          <p className="flex-1 text-[11px] leading-relaxed" style={{ color: '#7a6a28', fontFamily: "'Inter', sans-serif" }}>
            <span className="font-bold" style={{ color: '#F3BA2F' }}>⚡ 1 mes GRATIS</span>
            {' '}— Abrí cuenta en Exness usando el enlace de arriba y accedés a todas las herramientas más poderosas.
            Si ya tenés cuenta, solicitá el cambio de socio en el chat de Exness con el código{' '}
            <code className="px-1.5 py-0.5 text-[10px] font-bold" style={{ backgroundColor: '#181200', color: '#F3BA2F', fontFamily: "'JetBrains Mono', monospace" }}>
              xwx0gc598n
            </code>
            {' '}y enviá el comprobante por WhatsApp.
          </p>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href="https://one.exnessonelink.com/intl/es/a/xwx0gc598n"
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="px-4 py-2 text-[10px] font-bold uppercase tracking-[0.1em] transition-opacity hover:opacity-80"
              style={{ backgroundColor: '#F3BA2F', color: '#000', fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Abrir cuenta
            </a>
            <a
              href={WA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 text-[10px] font-semibold transition-opacity hover:opacity-80"
              style={{ border: '1px solid rgba(37,211,102,0.3)', color: '#25D366', fontFamily: "'Space Grotesk', sans-serif" }}
            >
              <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.612.616l4.54-1.472A11.942 11.942 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.325 0-4.47-.744-6.228-2.01l-.435-.327-2.927.949.974-2.883-.36-.467A9.958 9.958 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/>
              </svg>
              Comprobante
            </a>
          </div>
        </div>

      </div>
    </div>
  )
}
