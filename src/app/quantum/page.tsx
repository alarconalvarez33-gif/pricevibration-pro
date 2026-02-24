'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

interface QuantumLevel {
  price: number
  probability: number
  label: string
  type: 'resistance' | 'support' | 'pivot' | 'neutral'
}

const PROBABILITIES: { prob: number; label: string; type: QuantumLevel['type'] }[] = [
  { prob: 100,  label: 'Maximum',             type: 'resistance' },
  { prob: 93.3, label: 'Strong Resistance',   type: 'resistance' },
  { prob: 84.1, label: 'Upper Node',          type: 'resistance' },
  { prob: 75,   label: 'Upper Quarter',       type: 'resistance' },
  { prob: 66.7, label: 'Upper Third',         type: 'neutral'    },
  { prob: 50,   label: 'Pivot (Equilibrium)', type: 'pivot'      },
  { prob: 33.3, label: 'Lower Third',         type: 'neutral'    },
  { prob: 25,   label: 'Lower Quarter',       type: 'support'    },
  { prob: 15.9, label: 'Lower Node',          type: 'support'    },
  { prob: 6.7,  label: 'Strong Support',      type: 'support'    },
  { prob: 0,    label: 'Minimum',             type: 'support'    },
]

function calculateQuantumLevels(max: number, min: number): QuantumLevel[] {
  const range = max - min
  return PROBABILITIES.map((p) => ({
    price: min + (range * p.prob / 100),
    probability: p.prob,
    label: p.label,
    type: p.type,
  }))
}

export default function QuantumPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [maxVal, setMaxVal] = useState('')
  const [minVal, setMinVal] = useState('')
  const [levels, setLevels] = useState<QuantumLevel[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user?.email !== 'raul@sacredlevels.com') {
      router.replace('/dashboard')
    }
  }, [session, status, router])

  if (status === 'loading' || !session || session.user?.email !== 'raul@sacredlevels.com') {
    return null
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const max = parseFloat(maxVal)
    const min = parseFloat(minVal)
    if (isNaN(max) || isNaN(min)) { setError('Ingresá valores numéricos válidos.'); return }
    if (min >= max) { setError('El máximo debe ser mayor al mínimo.'); return }
    setLevels(calculateQuantumLevels(max, min))
  }

  const typeIcon = (type: QuantumLevel['type']) =>
    type === 'resistance' ? '🔴' : type === 'support' ? '🟢' : type === 'pivot' ? '⚪' : '🟡'

  const typeBorder = (type: QuantumLevel['type']) =>
    type === 'resistance' ? 'bg-red-900/20 border-red-500/30' :
    type === 'support'    ? 'bg-green-900/20 border-green-500/30' :
    type === 'pivot'      ? 'bg-yellow-900/20 border-yellow-500/30' :
                            'bg-gray-900/20 border-gray-500/30'

  const probColor = (prob: number) =>
    prob > 66 ? 'text-red-400' : prob < 33 ? 'text-green-400' : 'text-yellow-400'

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <div className="border-b border-[#c9a227]/20 bg-[#0a0a0f]/95 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔬</span>
            <div>
              <h1 className="text-lg font-bold text-white flex items-center gap-2">
                Quantum Probability Levels
                <span className="bg-purple-600 text-white text-xs px-2 py-0.5 rounded-full">BETA</span>
              </h1>
              <p className="text-xs text-purple-400">Based on Schrödinger wave function principles</p>
            </div>
          </div>
          <a href="/dashboard" className="text-sm text-gray-400 hover:text-white transition-colors">
            ← Dashboard
          </a>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="bg-gradient-to-br from-[#1a1a2e] to-[#0d0d0d] border border-[#c9a227]/30 rounded-xl p-6">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-gray-400 text-sm mb-2 block">Maximum (High)</label>
                <input
                  type="number"
                  value={maxVal}
                  onChange={(e) => setMaxVal(e.target.value)}
                  placeholder="5217"
                  step="0.01"
                  className="w-full bg-[#0d0d0d] border border-gray-700 rounded-lg px-4 py-3 text-white text-xl focus:outline-none focus:border-purple-500/60 transition-colors"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-2 block">Minimum (Low)</label>
                <input
                  type="number"
                  value={minVal}
                  onChange={(e) => setMinVal(e.target.value)}
                  placeholder="5175"
                  step="0.01"
                  className="w-full bg-[#0d0d0d] border border-gray-700 rounded-lg px-4 py-3 text-white text-xl focus:outline-none focus:border-purple-500/60 transition-colors"
                />
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-sm mb-4">{error}</p>
            )}

            <button
              type="submit"
              className="w-full bg-[#c9a227] hover:bg-[#d4af37] text-black font-bold py-4 rounded-lg text-lg transition-all hover:scale-[1.01] active:scale-95"
            >
              🔬 Calculate Quantum Levels
            </button>
          </div>
        </form>

        {/* Results */}
        {levels.length > 0 && (
          <>
            {/* Wave visualization */}
            <div className="mt-8 bg-[#0d0d0d] border border-purple-500/20 rounded-xl p-4 h-40 relative overflow-hidden">
              <p className="text-purple-400 text-xs uppercase tracking-widest mb-2 absolute top-3 left-4">ψ(x)² — Probability Distribution</p>
              <svg viewBox="0 0 100 40" className="w-full h-full" preserveAspectRatio="none">
                {/* Grid lines */}
                {[10, 20, 30].map((y) => (
                  <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#ffffff08" strokeWidth="0.5" />
                ))}
                {/* Wave */}
                <path
                  d="M 0 20 Q 12 4, 25 20 Q 37 36, 50 20 Q 62 4, 75 20 Q 87 36, 100 20"
                  stroke="#c9a227"
                  strokeWidth="1.5"
                  fill="none"
                  opacity="0.7"
                />
                {/* Level markers */}
                {levels.map((level, i) => (
                  <circle
                    key={i}
                    cx={level.probability}
                    cy={20 + Math.sin(level.probability * Math.PI / 50) * 14}
                    r="1.8"
                    fill={
                      level.type === 'resistance' ? '#ef4444' :
                      level.type === 'support'    ? '#22c55e' :
                      level.type === 'pivot'      ? '#c9a227' : '#a855f7'
                    }
                  />
                ))}
              </svg>
            </div>

            {/* Level cards */}
            <div className="mt-6 space-y-3">
              {levels.map((level, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-4 rounded-lg border ${typeBorder(level.type)}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{typeIcon(level.type)}</span>
                    <span className="text-xl font-mono font-bold text-white">
                      {level.price.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-gray-400 text-sm">{level.label}</div>
                    <div className={`font-bold ${probColor(level.probability)}`}>
                      {level.probability.toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Disclaimer */}
            <p className="text-gray-500 text-sm mt-6 text-center">
              🔬 Experimental feature. Based on quantum probability theory adapted for price analysis.
              This is for educational purposes only. Not financial advice.
            </p>
          </>
        )}
      </div>
    </main>
  )
}
