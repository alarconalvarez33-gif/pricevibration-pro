'use client'

import { useState } from 'react'

const INCREMENTOS = [0.0625, 0.125, 0.1875, 0.25, 0.3125, 0.375, 0.4375, 0.5]
const ETIQUETAS = ['1/16', '2/16', '3/16', '4/16', '5/16', '6/16', '7/16', '8/16']

const ASSETS = [
  { id: 'XAUUSD', label: 'XAU/USD', decimals: 2 },
  { id: 'BTCUSD', label: 'BTC/USD', decimals: 2 },
  { id: 'EURUSD', label: 'EUR/USD', decimals: 5 },
  { id: 'GBPUSD', label: 'GBP/USD', decimals: 5 },
  { id: 'US30',   label: 'US30',    decimals: 2 },
  { id: 'NAS100', label: 'NAS100',  decimals: 2 },
  { id: 'DXY',    label: 'DXY',     decimals: 3 },
]

interface LevelRow {
  label: string
  value: number
  increment: number
}

interface AureaResult {
  resistances: LevelRow[]
  supports: LevelRow[]
  precioMin: number
  precioMax: number
  decimals: number
  sqrtMin: number
  sqrtMax: number
}

export default function GannAurea() {
  const [asset, setAsset] = useState(ASSETS[0])
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [result, setResult] = useState<AureaResult | null>(null)
  const [expandedR, setExpandedR] = useState<number | null>(null)
  const [expandedS, setExpandedS] = useState<number | null>(null)
  const [error, setError] = useState('')

  const handleCalc = () => {
    const min = parseFloat(minPrice.replace(',', '.'))
    const max = parseFloat(maxPrice.replace(',', '.'))

    if (isNaN(min) || isNaN(max) || min <= 0 || max <= 0) {
      setError('Ingresá precios válidos mayores a 0.')
      return
    }
    if (min >= max) {
      setError('El precio mínimo debe ser menor al máximo.')
      return
    }
    setError('')

    const sqrtMin = Math.sqrt(min)
    const sqrtMax = Math.sqrt(max)

    const resistances: LevelRow[] = INCREMENTOS.map((inc, i) => ({
      label: ETIQUETAS[i],
      value: Math.pow(sqrtMin + inc, 2),
      increment: inc,
    }))

    const supports: LevelRow[] = INCREMENTOS.map((inc, i) => ({
      label: ETIQUETAS[i],
      value: Math.pow(sqrtMax - inc, 2),
      increment: inc,
    }))

    setResult({ resistances, supports, precioMin: min, precioMax: max, decimals: asset.decimals, sqrtMin, sqrtMax })
    setExpandedR(null)
    setExpandedS(null)
  }

  const fmt = (val: number, dec: number) => val.toFixed(dec)

  return (
    <div className="space-y-6">
      {/* Input panel */}
      <div className="bg-[#141415] border border-[#222] rounded-xl p-5 sm:p-6">
        <h2 className="text-white font-bold text-lg mb-1 flex items-center gap-2">
          <span className="text-[#fbbf24]">◈</span> Calculadora Áurea de Gann
        </h2>
        <p className="text-[#555] text-xs mb-5">Método raíz cuadrada · 8 incrementos (1/16 a 8/16)</p>

        {/* Asset selector */}
        <div className="mb-5">
          <label className="text-[#555] text-[10px] uppercase tracking-widest mb-2 block">Activo</label>
          <div className="flex flex-wrap gap-2">
            {ASSETS.map((a) => (
              <button
                key={a.id}
                onClick={() => setAsset(a)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all ${
                  asset.id === a.id
                    ? 'bg-[#fbbf24] text-black border-[#fbbf24]'
                    : 'bg-transparent text-[#666] border-[#2a2a2a] hover:border-[#444] hover:text-white'
                }`}
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>

        {/* Price inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <div>
            <label className="text-[#555] text-[10px] uppercase tracking-widest mb-2 block">Precio Mínimo (Soporte)</label>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCalc()}
              placeholder="ej. 3024.95"
              className="w-full bg-[#0A0A0B] border border-[#2a2a2a] text-white px-4 rounded-lg focus:border-[#fbbf24] focus:outline-none transition-colors min-h-[52px] text-sm"
            />
          </div>
          <div>
            <label className="text-[#555] text-[10px] uppercase tracking-widest mb-2 block">Precio Máximo (Resistencia)</label>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCalc()}
              placeholder="ej. 3180.00"
              className="w-full bg-[#0A0A0B] border border-[#2a2a2a] text-white px-4 rounded-lg focus:border-[#fbbf24] focus:outline-none transition-colors min-h-[52px] text-sm"
            />
          </div>
        </div>

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        <button
          onClick={handleCalc}
          className="w-full min-h-[52px] font-bold text-sm uppercase tracking-[0.12em] rounded-lg transition-all hover:opacity-90 active:scale-[0.99]"
          style={{ backgroundColor: '#fbbf24', color: '#000' }}
        >
          Calcular Niveles Áureos
        </button>
      </div>

      {/* Results */}
      {result && (
        <>
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Resistances — from MIN */}
            <div className="bg-[#141415] border border-[#222] rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-[#222] bg-red-950/20 flex items-center justify-between">
                <div>
                  <p className="text-[#555] text-[10px] uppercase tracking-widest mb-0.5">Desde Mínimo</p>
                  <p className="text-red-400 font-bold text-sm">Resistencias</p>
                </div>
                <span className="text-[#444] font-mono text-xs">{fmt(result.precioMin, result.decimals)}</span>
              </div>
              <div className="divide-y divide-[#111]">
                {result.resistances.map((r, i) => (
                  <div key={i}>
                    <button
                      onClick={() => setExpandedR(expandedR === i ? null : i)}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.02] transition-colors group text-left"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-[#3a3a3a] text-xs font-mono w-6">R{i + 1}</span>
                        <span className="text-[#555] text-xs">{r.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-red-400 font-bold font-mono text-sm">{fmt(r.value, result.decimals)}</span>
                        <span className="text-[#333] text-[10px] group-hover:text-[#555] transition-colors">
                          {expandedR === i ? '▲' : '▼'}
                        </span>
                      </div>
                    </button>
                    {expandedR === i && (
                      <div className="px-4 py-3 bg-[#0d0d0e] border-t border-[#111] text-[#444] text-xs font-mono leading-relaxed">
                        <span className="text-[#333]">(√{fmt(result.precioMin, result.decimals)} + {r.increment})²</span><br />
                        <span className="text-[#333]">= ({result.sqrtMin.toFixed(6)} + {r.increment})²</span><br />
                        <span className="text-[#333]">= {(result.sqrtMin + r.increment).toFixed(6)}²</span><br />
                        <span className="text-red-400 font-bold">= {fmt(r.value, result.decimals)}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Supports — from MAX */}
            <div className="bg-[#141415] border border-[#222] rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-[#222] bg-emerald-950/20 flex items-center justify-between">
                <div>
                  <p className="text-[#555] text-[10px] uppercase tracking-widest mb-0.5">Desde Máximo</p>
                  <p className="text-emerald-400 font-bold text-sm">Soportes</p>
                </div>
                <span className="text-[#444] font-mono text-xs">{fmt(result.precioMax, result.decimals)}</span>
              </div>
              <div className="divide-y divide-[#111]">
                {result.supports.map((s, i) => (
                  <div key={i}>
                    <button
                      onClick={() => setExpandedS(expandedS === i ? null : i)}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.02] transition-colors group text-left"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-[#3a3a3a] text-xs font-mono w-6">S{i + 1}</span>
                        <span className="text-[#555] text-xs">{s.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400 font-bold font-mono text-sm">{fmt(s.value, result.decimals)}</span>
                        <span className="text-[#333] text-[10px] group-hover:text-[#555] transition-colors">
                          {expandedS === i ? '▲' : '▼'}
                        </span>
                      </div>
                    </button>
                    {expandedS === i && (
                      <div className="px-4 py-3 bg-[#0d0d0e] border-t border-[#111] text-[#444] text-xs font-mono leading-relaxed">
                        <span className="text-[#333]">(√{fmt(result.precioMax, result.decimals)} - {s.increment})²</span><br />
                        <span className="text-[#333]">= ({result.sqrtMax.toFixed(6)} - {s.increment})²</span><br />
                        <span className="text-[#333]">= {(result.sqrtMax - s.increment).toFixed(6)}²</span><br />
                        <span className="text-emerald-400 font-bold">= {fmt(s.value, result.decimals)}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Formula reminder */}
          <div className="p-3 bg-[#fbbf24]/5 border border-[#fbbf24]/10 rounded-lg">
            <p className="text-[#fbbf24]/60 text-[10px] font-mono text-center tracking-wide">
              R_n = (√PrecioMínimo + n/16)² &nbsp;·&nbsp; S_n = (√PrecioMáximo − n/16)²
            </p>
          </div>
        </>
      )}
    </div>
  )
}
