'use client'

import { useState, useMemo, useCallback } from 'react'
import { calculateGannLevels, validatePrice, INCREMENT_OPTIONS, GannLevels } from '@/lib/gann'
import * as XLSX from 'xlsx'

interface GannCalculatorProps {
  onCalculate?: (levels: GannLevels) => void
  showIncrementSelector?: boolean
  isPremium?: boolean
}

export default function GannCalculator({
  onCalculate,
  showIncrementSelector = true,
  isPremium = false
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

  // Export to Excel
  const exportToExcel = useCallback(() => {
    if (!levels) return

    // Create data for Excel
    const data = []

    // Header
    data.push(['Sacred Levels - Gann Calculator Results'])
    data.push([])
    data.push(['Center Price:', `$${levels.centerPrice.toFixed(2)}`])
    data.push(['Increment:', levels.increment])
    data.push([])

    // Resistance levels
    data.push(['RESISTANCE LEVELS'])
    data.push(['Level', 'Price', 'Distance'])
    levels.resistances.forEach((price, i) => {
      data.push([
        `R${i + 1}`,
        price.toFixed(2),
        `+${(price - levels.centerPrice).toFixed(2)}`
      ])
    })

    data.push([])

    // Support levels
    data.push(['SUPPORT LEVELS'])
    data.push(['Level', 'Price', 'Distance'])
    levels.supports.forEach((price, i) => {
      data.push([
        `S${i + 1}`,
        price > 0 ? price.toFixed(2) : '-',
        price > 0 ? (price - levels.centerPrice).toFixed(2) : '-'
      ])
    })

    // Create workbook and worksheet
    const ws = XLSX.utils.aoa_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Gann Levels')

    // Set column widths
    ws['!cols'] = [{ wch: 20 }, { wch: 15 }, { wch: 15 }]

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `sacred-levels-${levels.centerPrice}-${timestamp}.xlsx`

    // Download file
    XLSX.writeFile(wb, filename)
  }, [levels])

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
                Increment Level
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
          </div>

          {/* Export Button (Pro/Whale only) */}
          {isPremium && (
            <div className="mb-4">
              <button
                onClick={exportToExcel}
                className="w-full btn-gold py-2.5 font-medium flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Excel
              </button>
            </div>
          )}

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
        </div>
      )}
    </div>
  )
}
