'use client'

import { useState, useMemo, useCallback } from 'react'
import { calculateGannLevels, validatePrice, INCREMENT_OPTIONS, GannLevels } from '@/lib/gann'

interface GannCalculatorProps {
  onCalculate?: (levels: GannLevels) => void
  showIncrementSelector?: boolean
}

export default function GannCalculator({
  onCalculate,
  showIncrementSelector = true
}: GannCalculatorProps) {
  // Input state - completely controlled by user, no auto-updates
  const [inputValue, setInputValue] = useState('')
  const [increment, setIncrement] = useState(0.25)
  const [hasCalculated, setHasCalculated] = useState(false)

  // Validation
  const validation = useMemo(() => {
    return validatePrice(inputValue)
  }, [inputValue])

  // Calculate levels instantly when we have valid input
  const levels = useMemo(() => {
    if (!validation.valid || !hasCalculated) return null
    return calculateGannLevels(validation.price, increment)
  }, [validation.valid, validation.price, increment, hasCalculated])

  // Handle input change - only allow valid characters
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Only allow numbers and one decimal point
    const sanitized = value.replace(/[^0-9.]/g, '')
    // Prevent multiple decimal points
    const parts = sanitized.split('.')
    const final = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : sanitized
    setInputValue(final)
  }, [])

  // Handle calculate button
  const handleCalculate = useCallback(() => {
    if (!validation.valid) return

    setHasCalculated(true)
    const calculatedLevels = calculateGannLevels(validation.price, increment)
    onCalculate?.(calculatedLevels)
  }, [validation, increment, onCalculate])

  // Handle increment change
  const handleIncrementChange = useCallback((newIncrement: number) => {
    setIncrement(newIncrement)
    if (hasCalculated && validation.valid) {
      const calculatedLevels = calculateGannLevels(validation.price, newIncrement)
      onCalculate?.(calculatedLevels)
    }
  }, [hasCalculated, validation, onCalculate])

  // Handle clear
  const handleClear = useCallback(() => {
    setInputValue('')
    setHasCalculated(false)
  }, [])

  // Handle enter key
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCalculate()
    }
  }, [handleCalculate])

  return (
    <div className="space-y-4">
      <div className="card-terminal">
        <h3 className="text-gold-500 font-semibold text-lg mb-4 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          Gann Square Calculator
        </h3>

        {/* Price Input */}
        <div className="space-y-4">
          <div>
            <label className="block text-terminal-muted text-sm mb-2">
              Center Price
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gold-500 font-mono">$</span>
                <input
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="3280"
                  className={`w-full bg-terminal-bg border-2 rounded-lg px-4 py-3 pl-8 text-white placeholder-terminal-muted/50 focus:outline-none font-mono text-lg transition-colors ${
                    validation.error
                      ? 'border-red-500 focus:border-red-400'
                      : 'border-terminal-border focus:border-gold-500'
                  }`}
                />
              </div>
              <button
                onClick={handleClear}
                className="px-4 border-2 border-terminal-border rounded-lg text-terminal-muted hover:border-red-500 hover:text-red-500 transition-colors"
                title="Clear"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {validation.error && (
              <p className="text-red-400 text-xs mt-1">{validation.error}</p>
            )}
          </div>

          {/* Increment Selector */}
          {showIncrementSelector && (
            <div>
              <label className="block text-terminal-muted text-sm mb-2">
                Increment (√ adjustment)
              </label>
              <div className="grid grid-cols-4 gap-2">
                {INCREMENT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleIncrementChange(opt.value)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      increment === opt.value
                        ? 'bg-gold-500 text-black'
                        : 'bg-terminal-bg border border-terminal-border text-terminal-muted hover:border-gold-500 hover:text-gold-500'
                    }`}
                  >
                    <div className="font-mono">{opt.label}</div>
                    <div className={`text-xs ${increment === opt.value ? 'text-black/70' : 'text-terminal-muted'}`}>
                      {opt.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Calculate Button */}
          <button
            onClick={handleCalculate}
            disabled={!validation.valid}
            className="w-full btn-gold py-3 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Calculate Levels
          </button>
        </div>
      </div>

      {/* Results */}
      {levels && (
        <div className="card-terminal animate-fadeIn">
          {/* Center Price Display */}
          <div className="text-center mb-4 p-3 bg-gold-500/10 border border-gold-500/30 rounded-lg">
            <span className="text-terminal-muted text-sm">Center Price</span>
            <div className="text-2xl font-bold text-gold-500 font-mono">
              ${levels.centerPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span className="text-terminal-muted text-xs">
              √ = {Math.sqrt(levels.centerPrice).toFixed(4)} | Increment: {levels.increment}
            </span>
          </div>

          {/* Levels Table */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Resistances */}
            <div>
              <h4 className="text-red-400 font-medium mb-2 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                Resistance Levels
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-terminal-muted text-xs">
                      <th className="text-left py-1 pr-2">Level</th>
                      <th className="text-right py-1 pr-2">Price</th>
                      <th className="text-right py-1">Distance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {levels.resistances.map((price, i) => (
                      <tr
                        key={i}
                        className="border-t border-terminal-border/50 hover:bg-red-500/5 transition-colors"
                      >
                        <td className="py-2 pr-2">
                          <span className="text-red-400 font-semibold">R{i + 1}</span>
                        </td>
                        <td className="py-2 pr-2 text-right">
                          <span className="font-mono text-white">
                            ${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </td>
                        <td className="py-2 text-right">
                          <span className="font-mono text-red-400/70 text-xs">
                            +{(price - levels.centerPrice).toFixed(2)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Supports */}
            <div>
              <h4 className="text-green-400 font-medium mb-2 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
                Support Levels
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-terminal-muted text-xs">
                      <th className="text-left py-1 pr-2">Level</th>
                      <th className="text-right py-1 pr-2">Price</th>
                      <th className="text-right py-1">Distance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {levels.supports.map((price, i) => (
                      <tr
                        key={i}
                        className="border-t border-terminal-border/50 hover:bg-green-500/5 transition-colors"
                      >
                        <td className="py-2 pr-2">
                          <span className="text-green-400 font-semibold">S{i + 1}</span>
                        </td>
                        <td className="py-2 pr-2 text-right">
                          <span className="font-mono text-white">
                            {price > 0
                              ? `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                              : '-'
                            }
                          </span>
                        </td>
                        <td className="py-2 text-right">
                          <span className="font-mono text-green-400/70 text-xs">
                            {price > 0 ? (price - levels.centerPrice).toFixed(2) : '-'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Formula Reference */}
          <div className="mt-4 p-3 bg-terminal-bg rounded-lg border border-terminal-border">
            <p className="text-terminal-muted text-xs">
              <strong className="text-gold-500">Formula:</strong>{' '}
              R = (√price + {increment})² | S = (√price - {increment})²
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
