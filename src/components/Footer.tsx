import Link from 'next/link'

const MUTED = '#64748B'
const LINK_COLOR = '#94A3B8'

export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#000000', borderTop: '1px solid #1a1a1a' }}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-12 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-6">

          {/* ── Columna 1: Marca ── */}
          <div className="sm:col-span-2 md:col-span-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logonuevos.png"
              alt="Sacred Levels"
              style={{ height: '44px', width: 'auto', display: 'block', marginBottom: '16px' }}
            />
            <p className="text-sm leading-relaxed mb-4" style={{ color: MUTED, fontFamily: "'Inter', sans-serif" }}>
              Plataforma de educación en trading con tecnología de análisis técnico avanzado.
              Formamos traders con métodos probados y disciplina profesional.
            </p>
            <p className="text-xs" style={{ color: '#374151', fontFamily: "'Inter', sans-serif" }}>
              Paraguay · sacredlevels.com
            </p>
          </div>

          {/* ── Columna 2: Cursos ── */}
          <div>
            <h4
              className="text-xs font-bold uppercase tracking-[0.2em] mb-4"
              style={{ color: '#CBD5E1', fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Cursos
            </h4>
            <ul className="space-y-2.5">
              {[
                { href: '/cursos', label: 'Super Estrategia' },
                { href: '/cursos', label: 'Génesis' },
                { href: '/cursos/frecuencia', label: 'Frecuencia' },
                { href: '/billing', label: 'Señales' },
              ].map(item => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-sm transition-colors hover:text-white"
                    style={{ color: LINK_COLOR, fontFamily: "'Inter', sans-serif" }}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Columna 3: Plataforma ── */}
          <div>
            <h4
              className="text-xs font-bold uppercase tracking-[0.2em] mb-4"
              style={{ color: '#CBD5E1', fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Plataforma
            </h4>
            <ul className="space-y-2.5">
              {[
                { href: '/la-mente-del-trader', label: 'La Mente del Trader' },
                { href: '/login', label: 'Iniciar Sesión' },
                { href: '/register', label: 'Registro' },
                { href: '/dashboard', label: 'Calculadora' },
                { href: '/contact', label: 'Contacto' },
              ].map(item => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-sm transition-colors hover:text-white"
                    style={{ color: LINK_COLOR, fontFamily: "'Inter', sans-serif" }}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Columna 4: Legal ── */}
          <div>
            <h4
              className="text-xs font-bold uppercase tracking-[0.2em] mb-4"
              style={{ color: '#CBD5E1', fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Legal
            </h4>
            <ul className="space-y-2.5">
              {[
                { href: '/terms', label: 'Términos y Condiciones' },
                { href: '/privacy', label: 'Política de Privacidad' },
                { href: '/disclaimer', label: 'Aviso de Riesgo' },
                { href: '/refund', label: 'Reembolsos' },
              ].map(item => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-sm transition-colors hover:text-white"
                    style={{ color: LINK_COLOR, fontFamily: "'Inter', sans-serif" }}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div style={{ borderTop: '1px solid #111' }}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <p
            className="text-center text-xs"
            style={{ color: '#374151', fontFamily: "'Inter', sans-serif" }}
          >
            © 2026 Sacred Levels. Todos los derechos reservados.{' '}
            <span style={{ color: '#1F2937' }}>|</span>{' '}
            El trading conlleva riesgos significativos.
          </p>
        </div>
      </div>
    </footer>
  )
}
