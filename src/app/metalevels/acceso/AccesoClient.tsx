'use client'

import { useState } from 'react'
import Link from 'next/link'

const C = {
  bg:     '#0A0A0B',
  card:   '#141415',
  border: '#222222',
  cyan:   '#00E5FF',
  gold:   '#c9a227',
  green:  '#00D26A',
  muted:  '#555555',
} as const

interface Props {
  pineScript: string
  licenseCode: string
  userEmail: string
}

export default function AccesoClient({ pineScript, licenseCode, userEmail }: Props) {
  const [codeCopied, setCodeCopied] = useState(false)
  const [scriptCopied, setScriptCopied] = useState(false)

  const copyCode = async () => {
    await navigator.clipboard.writeText(licenseCode)
    setCodeCopied(true)
    setTimeout(() => setCodeCopied(false), 2500)
  }

  const copyScript = async () => {
    await navigator.clipboard.writeText(pineScript)
    setScriptCopied(true)
    setTimeout(() => setScriptCopied(false), 2500)
  }

  return (
    <main
      className="min-h-screen py-28 px-6"
      style={{ backgroundColor: C.bg, fontFamily: "'Inter', sans-serif" }}
    >
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-12 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: C.green }} />
            <span
              className="text-[10px] font-semibold uppercase tracking-[0.3em]"
              style={{ color: C.green, fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Licencia Activa
            </span>
          </div>
          <h1
            className="text-4xl sm:text-5xl font-bold text-white mb-3"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            MetaLevels
          </h1>
          <p className="text-sm" style={{ color: C.muted }}>
            Acceso de {userEmail}
          </p>
        </div>

        {/* Instrucciones */}
        <div
          className="rounded-xl p-6 mb-8"
          style={{
            backgroundColor: `${C.gold}06`,
            border: `1px solid ${C.gold}25`,
          }}
        >
          <p
            className="text-xs font-bold uppercase tracking-[0.2em] mb-3"
            style={{ color: C.gold, fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Instrucciones de Instalación
          </p>
          <ol className="space-y-2 text-sm leading-relaxed" style={{ color: '#999' }}>
            <li className="flex items-start gap-2">
              <span className="font-bold shrink-0" style={{ color: C.gold }}>1.</span>
              <span>Copiá el código Pine Script completo con el botón de abajo.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold shrink-0" style={{ color: C.gold }}>2.</span>
              <span>
                En TradingView, abrí el{' '}
                <strong className="text-white">Pine Editor</strong> (parte inferior de la pantalla).
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold shrink-0" style={{ color: C.gold }}>3.</span>
              <span>Pegá el código, reemplazando todo el contenido existente.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold shrink-0" style={{ color: C.gold }}>4.</span>
              <span>
                Hacé clic en <strong className="text-white">Guardar</strong> y luego en{' '}
                <strong className="text-white">Agregar al gráfico</strong>.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold shrink-0" style={{ color: C.gold }}>5.</span>
              <span>
                En la configuración del indicador, ingresá tu clave de activación personal en el
                campo <strong className="text-white">Clave de Activación</strong>.
              </span>
            </li>
          </ol>
        </div>

        {/* Clave de Activación */}
        <div
          className="rounded-xl p-6 mb-6"
          style={{
            backgroundColor: C.card,
            border: `1px solid ${C.border}`,
          }}
        >
          <p
            className="text-[10px] font-semibold uppercase tracking-[0.25em] mb-4"
            style={{ color: C.muted, fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Tu Clave de Activación Personal
          </p>
          <div className="flex items-center gap-3">
            <code
              className="flex-1 px-4 py-3 rounded-lg text-sm font-bold tracking-[0.15em] select-all"
              style={{
                backgroundColor: '#0d0d0e',
                border: `1px solid ${C.border}`,
                color: C.cyan,
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {licenseCode}
            </code>
            <button
              onClick={copyCode}
              className="shrink-0 px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] rounded-lg transition-all duration-200"
              style={{
                backgroundColor: codeCopied ? `${C.green}20` : `${C.cyan}15`,
                border: `1px solid ${codeCopied ? C.green : C.cyan}40`,
                color: codeCopied ? C.green : C.cyan,
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              {codeCopied ? 'COPIADO' : 'COPIAR'}
            </button>
          </div>
          <p className="text-xs mt-3" style={{ color: C.muted }}>
            Esta clave es personal e intransferible. No la compartas con nadie.
          </p>
        </div>

        {/* Pine Script */}
        <div
          className="rounded-xl overflow-hidden mb-10"
          style={{
            border: `1px solid ${C.border}`,
          }}
        >
          <div
            className="flex items-center justify-between px-5 py-3"
            style={{ backgroundColor: '#0d0d0e', borderBottom: `1px solid ${C.border}` }}
          >
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ff5f56' }} />
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ffbd2e' }} />
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#27c93f' }} />
              </div>
              <span
                className="text-xs font-medium"
                style={{ color: C.muted, fontFamily: "'JetBrains Mono', monospace" }}
              >
                metalevels.pine
              </span>
            </div>
            <button
              onClick={copyScript}
              className="flex items-center gap-2 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.12em] rounded transition-all duration-200"
              style={{
                backgroundColor: scriptCopied ? `${C.green}20` : `${C.cyan}15`,
                border: `1px solid ${scriptCopied ? C.green : C.cyan}40`,
                color: scriptCopied ? C.green : C.cyan,
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              {scriptCopied ? (
                <>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                  COPIADO
                </>
              ) : (
                <>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  COPIAR SCRIPT
                </>
              )}
            </button>
          </div>

          <pre
            className="p-5 text-xs leading-relaxed overflow-x-auto max-h-96"
            style={{
              backgroundColor: '#0a0a0c',
              color: '#888',
              fontFamily: "'JetBrains Mono', monospace",
              scrollbarWidth: 'thin',
              scrollbarColor: `${C.border} transparent`,
            }}
          >
            <code>{pineScript}</code>
          </pre>
        </div>

        {/* Aviso */}
        <div
          className="rounded-xl p-5 mb-8"
          style={{
            backgroundColor: '#1a0a0a',
            border: '1px solid #ff475720',
          }}
        >
          <p className="text-xs leading-relaxed" style={{ color: '#cc3344' }}>
            <strong>Aviso:</strong> La licencia es de uso personal e intransferible. Compartir el código
            de activación o el script resultará en la revocación inmediata de tu licencia sin derecho
            a reembolso.
          </p>
        </div>

        {/* Back link */}
        <div className="text-center">
          <Link
            href="/metalevels"
            className="text-xs uppercase tracking-[0.2em] transition-colors hover:text-white"
            style={{ color: C.muted, fontFamily: "'Space Grotesk', sans-serif" }}
          >
            ← Volver a MetaLevels
          </Link>
        </div>

      </div>
    </main>
  )
}
