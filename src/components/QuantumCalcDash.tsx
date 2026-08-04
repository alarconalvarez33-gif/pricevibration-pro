'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import CalcGuide from '@/components/CalcGuide'
import { GUIDE_QUANTICA } from '@/lib/calcGuides'

const CARD   = '#141415'
const BORDER = '#222222'
const CYAN   = '#00E5FF'
const GREEN  = '#00D26A'
const RED    = '#FF4757'
const MUTED  = '#555555'
const DARK   = '#0d0d0e'
const CALC_LIMIT = 3
const N = 8

interface QuantumLevel {
  n: number
  price: number
  probability: number
  type: 'accumulation' | 'distribution' | 'equilibrium'
  strength: 'extreme' | 'strong' | 'moderate'
}

function calculateQuantumLevels(max: number, min: number): QuantumLevel[] {
  const range = max - min
  return Array.from({ length: N + 1 }, (_, n) => {
    const position    = Math.pow(n / N, 2)
    const price       = min + range * position
    const probability = position * 100
    const type: QuantumLevel['type']     = n <= 3 ? 'accumulation' : n <= 5 ? 'equilibrium' : 'distribution'
    const strength: QuantumLevel['strength'] = n === 0 || n === N ? 'extreme' : n <= 2 || n >= 6 ? 'strong' : 'moderate'
    return {
      n,
      price: Math.round(price * 100) / 100,
      probability: Math.round(probability * 10) / 10,
      type,
      strength,
    }
  })
}

function levelColor(type: QuantumLevel['type']) {
  return type === 'accumulation' ? GREEN : type === 'distribution' ? RED : CYAN
}

function Tag({ children, col }: { children: React.ReactNode; col: string }) {
  return (
    <span
      className="text-[10px] px-2 py-0.5 uppercase tracking-[0.08em] font-semibold border"
      style={{ color: col, borderColor: `${col}30`, backgroundColor: `${col}08` }}
    >
      {children}
    </span>
  )
}

function LevelCard({ level }: { level: QuantumLevel }) {
  const col = levelColor(level.type)
  return (
    <div
      className="border-l-2 p-4"
      style={{
        borderLeftColor: col,
        backgroundColor: `${col}06`,
        borderTop: `1px solid ${BORDER}`,
        borderRight: `1px solid ${BORDER}`,
        borderBottom: `1px solid ${BORDER}`,
      }}
    >
      <div className="flex justify-between items-start">
        <div>
          <span className="text-lg font-bold text-white" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            ${level.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="ml-2 text-xs" style={{ color: MUTED, fontFamily: "'JetBrains Mono', monospace" }}>
            n={level.n}
          </span>
        </div>
        <div className="text-right">
          <div className="text-xs font-bold uppercase tracking-[0.1em]" style={{ color: col, fontFamily: "'Space Grotesk', sans-serif" }}>
            {level.strength === 'extreme' ? 'EXTREMO' : level.strength === 'strong' ? 'FUERTE' : 'MODERADO'}
          </div>
          <div className="text-[9px] mt-0.5 uppercase tracking-widest" style={{ color: '#333', fontFamily: "'JetBrains Mono', monospace" }}>
            {level.probability}% energía
          </div>
        </div>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {level.type === 'accumulation' && <>
          <Tag col={GREEN}>Soporte / Rebote Alcista</Tag>
          {level.n === 0 && <Tag col={CYAN}>Base cuántica extrema</Tag>}
          {(level.strength === 'strong' || level.strength === 'extreme') && <Tag col="#f59e0b">Breakout Zone</Tag>}
        </>}
        {level.type === 'equilibrium' && <>
          <Tag col={CYAN}>Zona de Equilibrio</Tag>
          <Tag col="#a855f7">Flip Zone — S/R</Tag>
        </>}
        {level.type === 'distribution' && <>
          <Tag col={RED}>Resistencia / Rebote Bajista</Tag>
          {level.n === N && <Tag col={CYAN}>Techo cuántico extremo</Tag>}
          {(level.strength === 'strong' || level.strength === 'extreme') && <Tag col="#f59e0b">Breakout Zone</Tag>}
        </>}
      </div>
    </div>
  )
}

function getOrCreateFp(): string {
  const KEY = '_gzfp'
  let fp = localStorage.getItem(KEY)
  if (!fp) {
    fp = Math.random().toString(36).slice(2) + Date.now().toString(36)
    localStorage.setItem(KEY, fp)
  }
  return fp
}

interface Props {
  isPremium?: boolean
}

export default function QuantumCalcDash({ isPremium = false }: Props) {
  const [maxVal, setMaxVal]   = useState('')
  const [minVal, setMinVal]   = useState('')
  const [levels, setLevels]   = useState<QuantumLevel[]>([])
  const [error, setError]     = useState('')
  const [guideOpen, setGuideOpen] = useState(false)
  const [usesLeft, setUsesLeft] = useState<number | null>(null)
  const [trialBlocked, setTrialBlocked] = useState(false)
  const [checking, setChecking] = useState(false)
  const fpRef = useRef<string | null>(null)

  useEffect(() => {
    if (isPremium) return
    fpRef.current = getOrCreateFp()
    fetch('/api/free-usage/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fingerprint: fpRef.current, feature: 'gann-quantum' }),
    })
      .then(r => r.json())
      .then(d => {
        setUsesLeft(d.remaining ?? CALC_LIMIT)
        setTrialBlocked(!d.allowed && d.remaining === 0)
      })
      .catch(() => setUsesLeft(CALC_LIMIT))
  }, [isPremium])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const max = parseFloat(maxVal)
    const min = parseFloat(minVal)
    if (isNaN(max) || isNaN(min)) { setError('Ingresá valores numéricos válidos.'); return }
    if (min >= max) { setError('El máximo debe ser mayor al mínimo.'); return }

    if (!isPremium) {
      if (trialBlocked) return
      setChecking(true)
      try {
        const res = await fetch('/api/free-usage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fingerprint: fpRef.current, feature: 'gann-quantum' }),
        })
        const d = await res.json()
        if (!d.allowed) {
          setTrialBlocked(true)
          setChecking(false)
          return
        }
        setUsesLeft(d.remaining)
      } catch { /* allow on error */ }
      setChecking(false)
    }

    setLevels(calculateQuantumLevels(max, min))
  }

  return (
    <>
      <div className="space-y-4">
        {/* Form */}
        <div style={{ backgroundColor: CARD, borderColor: BORDER }} className="border rounded-xl p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-white font-bold text-base" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Calculadora Cuántica
              </h2>
              <p className="text-[10px] mt-0.5" style={{ color: CYAN, fontFamily: "'JetBrains Mono', monospace" }}>
                Niveles E=n² · distribución cuántica
              </p>
            </div>
            <div className="flex items-center gap-2">
              {!isPremium && usesLeft !== null && !trialBlocked && (
                <span className="text-[10px] px-2 py-0.5 rounded border font-bold" style={{ color: usesLeft === 0 ? RED : CYAN, borderColor: usesLeft === 0 ? `${RED}40` : `${CYAN}40` }}>
                  {usesLeft}/{CALC_LIMIT} usos
                </span>
              )}
              <button
                onClick={() => setGuideOpen(true)}
                className="w-8 h-8 rounded-full border flex items-center justify-center text-sm font-bold transition-colors hover:text-white"
                style={{ borderColor: '#2a2a2a', color: '#555' }}
                title="Guía de uso"
              >
                ?
              </button>
            </div>
          </div>

          {trialBlocked ? (
            <div className="border rounded-lg p-5 text-center" style={{ borderColor: '#333', backgroundColor: DARK }}>
              <p className="text-white font-bold mb-1">Pruebas gratuitas agotadas</p>
              <p className="text-sm mb-4" style={{ color: MUTED }}>Usaste tus {CALC_LIMIT} cálculos gratuitos en la Calculadora Cuántica.</p>
              <Link
                href="/billing"
                className="inline-block px-6 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wider text-black transition-opacity hover:opacity-90"
                style={{ backgroundColor: CYAN }}
              >
                Ver Planes
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                {[
                  { label: 'Máximo (High)', val: maxVal, set: setMaxVal, ph: '4180' },
                  { label: 'Mínimo (Low)',  val: minVal, set: setMinVal, ph: '4080' },
                ].map(f => (
                  <div key={f.label}>
                    <label
                      className="block text-[9px] uppercase tracking-[0.25em] mb-2"
                      style={{ color: MUTED, fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      {f.label}
                    </label>
                    <input
                      type="number"
                      value={f.val}
                      onChange={e => f.set(e.target.value)}
                      placeholder={f.ph}
                      step="0.01"
                      className="w-full border px-4 text-white text-lg focus:outline-none transition-colors min-h-[56px] rounded-lg"
                      style={{ backgroundColor: DARK, borderColor: BORDER, fontFamily: "'JetBrains Mono', monospace" }}
                      onFocus={e => { (e.target as HTMLInputElement).style.borderColor = `${CYAN}40` }}
                      onBlur={e  => { (e.target as HTMLInputElement).style.borderColor = BORDER }}
                    />
                  </div>
                ))}
              </div>

              {error && <p className="text-sm mb-3" style={{ color: RED }}>{error}</p>}

              <button
                type="submit"
                disabled={checking}
                className="w-full min-h-[52px] text-sm font-bold uppercase tracking-[0.12em] text-black transition-opacity hover:opacity-90 rounded-lg disabled:opacity-60"
                style={{ backgroundColor: CYAN, fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {checking ? 'Verificando...' : 'Generar Niveles Quantum'}
              </button>
            </form>
          )}
        </div>

        {/* Results */}
        {levels.length > 0 && (
          <>
            <div
              className="border rounded-xl p-4 relative overflow-hidden"
              style={{ backgroundColor: CARD, borderColor: BORDER, height: '152px' }}
            >
              <p
                className="absolute top-3 left-4 text-[9px] uppercase tracking-[0.2em]"
                style={{ color: CYAN, fontFamily: "'Space Grotesk', sans-serif" }}
              >
                ψ(x)² — Distribución cuántica E=n²
              </p>
              <svg viewBox="0 0 100 40" className="w-full h-full" preserveAspectRatio="none">
                {[10, 20, 30].map(y => (
                  <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#1a1a1a" strokeWidth="0.5" />
                ))}
                <line x1="0" y1="38" x2="100" y2="4" stroke={CYAN} strokeWidth="0.8" strokeDasharray="2,2" opacity="0.2" />
                <path
                  d={`M 0 38 ${levels.map(lv => `L ${lv.probability} ${38 - (lv.probability / 100) * 34}`).join(' ')}`}
                  stroke="white" strokeWidth="1.5" fill="none" opacity="0.8"
                />
                <path
                  d={`M 0 38 ${levels.map(lv => `L ${lv.probability} ${38 - (lv.probability / 100) * 34}`).join(' ')} L 100 38 Z`}
                  fill="white" opacity="0.03"
                />
                {levels.map(lv => (
                  <circle key={lv.n} cx={lv.probability} cy={38 - (lv.probability / 100) * 34} r="1.5" fill={levelColor(lv.type)} />
                ))}
              </svg>
            </div>

            <div className="space-y-2">
              {levels.map(level => <LevelCard key={level.n} level={level} />)}
            </div>

            <div className="grid grid-cols-3 gap-px" style={{ backgroundColor: BORDER }}>
              {[
                { col: GREEN, label: 'Acumulación', sub: 'n=0-3 · Alcista' },
                { col: CYAN,  label: 'Equilibrio',  sub: 'n=4,5 · Reversión' },
                { col: RED,   label: 'Distribución', sub: 'n=6-8 · Bajista' },
              ].map(({ col, label, sub }) => (
                <div key={label} className="p-2 sm:p-3 text-center" style={{ backgroundColor: CARD }}>
                  <div className="text-[10px] font-bold uppercase tracking-[0.06em] mb-0.5" style={{ color: col, fontFamily: "'Space Grotesk', sans-serif" }}>
                    {label}
                  </div>
                  <div className="text-[9px]" style={{ color: MUTED }}>{sub}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <CalcGuide
        isOpen={guideOpen}
        onClose={() => setGuideOpen(false)}
        title="Guía · Calculadora Cuántica"
        content={GUIDE_QUANTICA}
      />
    </>
  )
}
