'use client'

import { useState } from 'react'
import type { GuideContent } from '@/lib/calcGuides'

interface CalcGuideProps {
  isOpen: boolean
  onClose: () => void
  title: string
  content: GuideContent
}

function renderGuideText(text: string) {
  const lines = text.split('\n')
  const elements: React.ReactNode[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // Title (first non-empty line)
    if (i === 0) {
      elements.push(
        <h3 key={i} className="text-white font-bold text-base mb-3">{line}</h3>
      )
      i++; continue
    }

    // Empty line — skip
    if (line.trim() === '') { i++; continue }

    // Section label (ends with ':')
    if (/^[A-ZÁÉÍÓÚÜÑCómo].+:$/.test(line) && !line.startsWith('💡')) {
      elements.push(
        <p key={i} className="text-[#fbbf24] text-[10px] font-bold uppercase tracking-widest mt-4 mb-1">{line}</p>
      )
      i++; continue
    }

    // Tip (starts with 💡)
    if (line.startsWith('💡')) {
      elements.push(
        <div key={i} className="mt-4 bg-[#fbbf24]/5 border border-[#fbbf24]/15 rounded-lg p-3">
          <p className="text-[#fbbf24] text-xs leading-relaxed">{line}</p>
        </div>
      )
      i++; continue
    }

    // Numbered item
    if (/^\d+\./.test(line)) {
      elements.push(
        <p key={i} className="text-[#999] text-xs mb-1 pl-3 leading-relaxed">{line}</p>
      )
      i++; continue
    }

    // Sub-bullet (3+ spaces + -)
    if (/^ {3,}- /.test(line)) {
      elements.push(
        <p key={i} className="text-[#666] text-xs mb-0.5 pl-6 leading-relaxed">◦ {line.replace(/^ +- /, '')}</p>
      )
      i++; continue
    }

    // Bullet (starts with '- ')
    if (line.startsWith('- ')) {
      elements.push(
        <p key={i} className="text-[#999] text-xs mb-1 pl-3 leading-relaxed">• {line.slice(2)}</p>
      )
      i++; continue
    }

    // Normal text
    elements.push(
      <p key={i} className="text-[#777] text-xs leading-relaxed">{line}</p>
    )
    i++
  }

  return elements
}

export default function CalcGuide({ isOpen, onClose, title, content }: CalcGuideProps) {
  const [lang, setLang] = useState<'es' | 'en'>('es')

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-lg sm:mx-4 bg-[#141415] border-t sm:border border-[#2a2a2a] sm:rounded-xl overflow-hidden flex flex-col"
        style={{ maxHeight: '82vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#1e1e1e] bg-[#0d0d0e] shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="text-sm">📖</span>
            <span className="text-white font-semibold text-sm">{title}</span>
          </div>
          <div className="flex items-center gap-2">
            {/* ES/EN toggle */}
            <div className="flex rounded-full overflow-hidden border border-[#2a2a2a] text-xs font-semibold">
              <button
                onClick={() => setLang('es')}
                className={`px-3 py-1.5 transition-colors ${
                  lang === 'es' ? 'bg-[#fbbf24] text-black' : 'text-[#555] hover:text-white'
                }`}
              >
                ES
              </button>
              <button
                onClick={() => setLang('en')}
                className={`px-3 py-1.5 transition-colors ${
                  lang === 'en' ? 'bg-[#fbbf24] text-black' : 'text-[#555] hover:text-white'
                }`}
              >
                EN
              </button>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-[#444] hover:text-white text-xl leading-none transition-colors"
              aria-label="Cerrar"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-5">
          {renderGuideText(lang === 'es' ? content.es : content.en)}
        </div>
      </div>
    </div>
  )
}
