/**
 * Aviso legal en español para páginas de trading.
 * Variante 'banner' → barra compacta de una línea (para cabeceras).
 * Variante 'full'   → bloque completo (para billing y footer de herramientas).
 */

const BORDER = '#222222'
const MUTED  = '#333333'

interface LegalDisclaimerProps {
  variant?: 'banner' | 'full'
}

export default function LegalDisclaimer({ variant = 'full' }: LegalDisclaimerProps) {
  if (variant === 'banner') {
    return (
      <div
        className="w-full px-6 py-2 text-center text-[10px] uppercase tracking-[0.2em]"
        style={{ backgroundColor: '#0d0d0e', borderBottom: `1px solid ${BORDER}`, color: MUTED, fontFamily: "'Space Grotesk', sans-serif" }}
      >
        Solo con fines educativos · No constituye asesoramiento financiero · El trading conlleva riesgo de pérdida de capital
      </div>
    )
  }

  return (
    <div
      className="border p-5 text-[11px] leading-relaxed"
      style={{ borderColor: BORDER, backgroundColor: '#0d0d0e', color: '#444', fontFamily: "'Inter', sans-serif" }}
    >
      <p
        className="text-[9px] uppercase tracking-[0.25em] mb-3"
        style={{ color: MUTED, fontFamily: "'Space Grotesk', sans-serif" }}
      >
        Aviso Legal
      </p>
      <p className="mb-2">
        <strong className="text-[#555]">Solo para fines educativos.</strong>{' '}
        Las herramientas, señales y niveles proporcionados por Sacred Levels son únicamente de carácter informativo y educativo.
        No constituyen asesoramiento financiero, de inversión ni de ningún otro tipo.
      </p>
      <p className="mb-2">
        El trading en mercados financieros (Forex, Criptomonedas, Metales, Índices) implica un alto nivel de riesgo y puede
        resultar en la pérdida parcial o total del capital invertido. Los resultados pasados no son garantía de resultados
        futuros.
      </p>
      <p>
        Al utilizar esta plataforma, aceptás que Sacred Levels no es responsable de ninguna decisión de inversión tomada
        en base a la información aquí presentada. Consultá con un asesor financiero certificado antes de operar.
      </p>
    </div>
  )
}
