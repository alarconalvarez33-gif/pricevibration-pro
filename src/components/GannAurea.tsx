'use client'

import { useState } from 'react'
import CalcGuide from '@/components/CalcGuide'
import { GUIDE_AUREA } from '@/lib/calcGuides'

const STEPS = [0.0625, 0.125, 0.1875, 0.25, 0.3125, 0.375, 0.4375, 0.5]

const ASSETS = [
  { id: 'XAUUSD', label: 'XAU/USD', decimals: 2 },
  { id: 'BTCUSD', label: 'BTC/USD', decimals: 2 },
  { id: 'EURUSD', label: 'EUR/USD', decimals: 5 },
  { id: 'GBPUSD', label: 'GBP/USD', decimals: 5 },
  { id: 'US30',   label: 'US30',    decimals: 2 },
  { id: 'NAS100', label: 'NAS100',  decimals: 2 },
  { id: 'DXY',    label: 'DXY',     decimals: 3 },
]

interface AureaResult {
  resistances: number[]
  supports: number[]
  precioMin: number
  precioMax: number
  decimals: number
}

export default function GannAurea() {
  const [asset, setAsset] = useState(ASSETS[0])
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [result, setResult] = useState<AureaResult | null>(null)
  const [error, setError] = useState('')
  const [guideOpen, setGuideOpen] = useState(false)

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

    setResult({
      resistances: STEPS.map((s) => Math.pow(sqrtMin + s, 2)),
      supports:    STEPS.map((s) => Math.pow(sqrtMax - s, 2)),
      precioMin: min,
      precioMax: max,
      decimals: asset.decimals,
    })
  }

  const fmt = (val: number, dec: number) => val.toFixed(dec)

  return (
    <>
    <div className="space-y-6">
      {/* Input panel */}
      <div className="bg-[#141415] border border-[#222] rounded-xl p-5 sm:p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white font-bold text-lg flex items-center gap-2">
            <span className="text-[#fbbf24]">◈</span> Calculadora Áurea de Gann
          </h2>
          <button
            onClick={() => setGuideOpen(true)}
            className="w-8 h-8 rounded-full border border-[#2a2a2a] flex items-center justify-center text-sm font-bold text-[#555] hover:text-white hover:border-[#444] transition-colors"
            title="Guía de uso"
          >
            ?
          </button>
        </div>

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
        <div className="grid sm:grid-cols-2 gap-4">
          {/* Resistances */}
          <div className="bg-[#141415] border border-[#222] rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-[#222] bg-red-950/20 flex items-center justify-between">
              <div>
                <p className="text-[#555] text-[10px] uppercase tracking-widest mb-0.5">Desde Mínimo</p>
                <p className="text-red-400 font-bold text-sm">Resistencias</p>
              </div>
              <span className="text-[#444] font-mono text-xs">{fmt(result.precioMin, result.decimals)}</span>
            </div>
            <div className="divide-y divide-[#111]">
              {result.resistances.map((val, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-3">
                  <span className="text-[#3a3a3a] text-xs font-mono">R{i + 1}</span>
                  <span className="text-red-400 font-bold font-mono text-sm">{fmt(val, result.decimals)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Supports */}
          <div className="bg-[#141415] border border-[#222] rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-[#222] bg-emerald-950/20 flex items-center justify-between">
              <div>
                <p className="text-[#555] text-[10px] uppercase tracking-widest mb-0.5">Desde Máximo</p>
                <p className="text-emerald-400 font-bold text-sm">Soportes</p>
              </div>
              <span className="text-[#444] font-mono text-xs">{fmt(result.precioMax, result.decimals)}</span>
            </div>
            <div className="divide-y divide-[#111]">
              {result.supports.map((val, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-3">
                  <span className="text-[#3a3a3a] text-xs font-mono">S{i + 1}</span>
                  <span className="text-emerald-400 font-bold font-mono text-sm">{fmt(val, result.decimals)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>

    <CalcGuide
      isOpen={guideOpen}
      onClose={() => setGuideOpen(false)}
      title="Guía · Calculadora Áurea"
      content={GUIDE_AUREA}
    />
    </>
  )
}
