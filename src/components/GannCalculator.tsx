'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { calculateGannLevels, validatePrice, INCREMENT_OPTIONS, GannLevels, ASSET_FACTORS } from '@/lib/gann'
import { useLanguage } from '@/contexts/LanguageContext'
import * as XLSX from 'xlsx'

interface GannCalculatorProps {
  onCalculate?: (levels: GannLevels) => void
  showIncrementSelector?: boolean
  isPremium?: boolean
  userEmail?: string
  trialUses?: number
  trialExpired?: boolean
}

export default function GannCalculator({
  onCalculate,
  showIncrementSelector = true,
  isPremium = false,
  userEmail = 'guest@user.com',
  trialUses = 0,
  trialExpired = false
}: GannCalculatorProps) {
  const { t } = useLanguage()
  // Input state - completely controlled by user, no auto-updates
  const [inputValue, setInputValue] = useState('')
  const [selectedAsset, setSelectedAsset] = useState<string>('XAU/USD')
  const [increment, setIncrement] = useState(0.25)
  const [hasCalculated, setHasCalculated] = useState(false)
  const [showLegalWarning, setShowLegalWarning] = useState(false)
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false)
  const [isCalculating, setIsCalculating] = useState(false)
  const [remainingTrialUses, setRemainingTrialUses] = useState(3 - trialUses)
  const [showTrialExpiredModal, setShowTrialExpiredModal] = useState(false)
  const [termsCheckboxAccepted, setTermsCheckboxAccepted] = useState(false)

  // Check if user has accepted terms before
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const accepted = localStorage.getItem('gann_terms_accepted')
      setHasAcceptedTerms(accepted === 'true')
    }
  }, [])

  // Validation
  const validation = useMemo(() => {
    return validatePrice(inputValue)
  }, [inputValue])

  // Calculate levels instantly when we have valid input
  const levels = useMemo(() => {
    if (!validation.valid || !hasCalculated) return null
    return calculateGannLevels(validation.price, increment, 8, selectedAsset)
  }, [validation.valid, validation.price, increment, hasCalculated, selectedAsset])

  // Get current asset config for formatting
  const currentAssetConfig = useMemo(() => {
    return ASSET_FACTORS[selectedAsset] || ASSET_FACTORS['XAU/USD']
  }, [selectedAsset])

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
  const handleCalculate = useCallback(async () => {
    if (!validation.valid || isCalculating) return

    // Show legal warning if not accepted yet
    if (!hasAcceptedTerms) {
      setShowLegalWarning(true)
      return
    }

    setIsCalculating(true)

    try {
      // For non-premium users, check trial usage
      if (!isPremium && !trialExpired) {
        const response = await fetch('/api/trial/use', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        })

        const data = await response.json()

        if (!response.ok || data.error) {
          // Trial expired
          setShowTrialExpiredModal(true)
          return
        }

        // Update remaining uses
        if (data.remainingUses !== undefined && data.remainingUses >= 0) {
          setRemainingTrialUses(data.remainingUses)
        }
      }

      setHasCalculated(true)
      const calculatedLevels = calculateGannLevels(validation.price, increment, 8, selectedAsset)
      onCalculate?.(calculatedLevels)
    } catch (error) {
      console.error('Error during calculation:', error)
      alert('An error occurred. Please try again.')
    } finally {
      setIsCalculating(false)
    }
  }, [validation, increment, onCalculate, hasAcceptedTerms, isPremium, trialExpired, isCalculating, selectedAsset])

  // Handle terms acceptance
  const handleAcceptTerms = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('gann_terms_accepted', 'true')
    }
    setHasAcceptedTerms(true)
    setShowLegalWarning(false)

    // Now calculate
    if (validation.valid) {
      setHasCalculated(true)
      const calculatedLevels = calculateGannLevels(validation.price, increment, 8, selectedAsset)
      onCalculate?.(calculatedLevels)
    }
  }, [validation, increment, onCalculate, selectedAsset])

  // Handle increment change
  const handleIncrementChange = useCallback((newIncrement: number) => {
    setIncrement(newIncrement)
    if (hasCalculated && validation.valid) {
      const calculatedLevels = calculateGannLevels(validation.price, newIncrement, 8, selectedAsset)
      onCalculate?.(calculatedLevels)
    }
  }, [hasCalculated, validation, onCalculate, selectedAsset])

  // Handle asset change - clear results
  const handleAssetChange = useCallback((newAsset: string) => {
    setSelectedAsset(newAsset)
    setHasCalculated(false) // Clear results when changing asset
  }, [])

  // Export to Excel
  const exportToExcel = useCallback(() => {
    if (!levels) return

    // Get asset info
    const assetInfo = ASSET_FACTORS[selectedAsset]
    const decimals = assetInfo.decimals

    // Create data for Excel
    const data = []

    // Header
    data.push(['Sacred Levels - Resultados Calculadora Gann'])
    data.push([])
    data.push(['Activo:', `${selectedAsset} (${assetInfo.name})`])
    data.push(['Precio Central:', `$${levels.centerPrice.toFixed(decimals)}`])
    data.push(['Incremento:', levels.increment])
    data.push([])
    // WATERMARK - User identification
    data.push(['Generado para:', userEmail])
    data.push(['Fecha:', new Date().toLocaleString()])
    data.push(['⚠️ SOLO USO PERSONAL - Está prohibida la distribución comercial'])
    data.push([])

    // Resistance levels
    data.push(['NIVELES DE RESISTENCIA'])
    data.push(['Nivel', 'Precio', '%'])
    levels.resistances.forEach((price, i) => {
      data.push([
        `R${i + 1}`,
        price.toFixed(decimals),
        `+${((price - levels.centerPrice) / levels.centerPrice * 100).toFixed(2)}%`
      ])
    })

    data.push([])

    // Support levels
    data.push(['NIVELES DE SOPORTE'])
    data.push(['Nivel', 'Precio', '%'])
    levels.supports.forEach((price, i) => {
      data.push([
        `S${i + 1}`,
        price > 0 ? price.toFixed(decimals) : '-',
        price > 0 ? `${((price - levels.centerPrice) / levels.centerPrice * 100).toFixed(2)}%` : '-'
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
    const filename = `sacred-levels-${selectedAsset.replace('/', '-')}-${levels.centerPrice}-${timestamp}.xlsx`

    // Download file
    XLSX.writeFile(wb, filename)
  }, [levels, userEmail, selectedAsset])

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
          Calculadora Cuadrado de Gann
        </h3>

        {/* Asset Selector */}
        <div className="space-y-4">
          <div>
            <label className="block text-terminal-muted text-sm mb-2">
              Seleccionar Activo
            </label>
            <div className="relative">
              <select
                value={selectedAsset}
                onChange={(e) => handleAssetChange(e.target.value)}
                className="w-full bg-terminal-bg border-2 border-terminal-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold-500 transition-colors appearance-none cursor-pointer pr-10"
              >
                {Object.entries(ASSET_FACTORS).map(([key, config]) => (
                  <option key={key} value={key} className="bg-terminal-bg">
                    {key} - {config.name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                <svg className="w-5 h-5 text-terminal-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Price Input */}
          <div>
            <label className="block text-terminal-muted text-sm mb-2">
              Precio Central
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
                  placeholder="Coloca aquí el precio de un mínimo o máximo"
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

          {/* Trial Counter - Only for non-premium users */}
          {!isPremium && !trialExpired && (
            <div className="mb-4 p-3 bg-gold-500/10 border border-gold-500/30 rounded-lg">
              <p className="text-sm text-gold-500 text-center">
                ⚡ <strong>{t('trial.remaining')} {remainingTrialUses}/2 {t('trial.usesRemaining')}</strong>
              </p>
              <p className="text-xs text-terminal-muted text-center mt-1">
                {t('trial.subscribe')}
              </p>
            </div>
          )}

          {/* Calculate Button */}
          <button
            onClick={handleCalculate}
            disabled={!validation.valid || isCalculating}
            className="w-full btn-gold py-3 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isCalculating ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {t('calc.calculating')}
              </>
            ) : (
              t('calc.calculate')
            )}
          </button>
        </div>
      </div>

      {/* Results */}
      {levels && (
        <div className="card-terminal animate-fadeIn">
          {/* Watermark - User identification */}
          <div className="mb-4 p-2 bg-terminal-bg/50 border border-terminal-border/30 rounded text-center">
            <p className="text-terminal-muted/60 text-xs">
              Generado para: <span className="text-gold-500/60 font-mono">{userEmail}</span>
            </p>
            <p className="text-terminal-muted/40 text-xs mt-1">
              ⚠️ Solo uso personal - Está prohibida la distribución comercial
            </p>
          </div>

          {/* Center Price Display */}
          <div className="text-center mb-4 p-3 bg-gold-500/10 border border-gold-500/30 rounded-lg">
            <div className="text-terminal-muted text-xs mb-1">{selectedAsset} - {currentAssetConfig.name}</div>
            <span className="text-terminal-muted text-sm">Precio Central</span>
            <div className="text-2xl font-bold text-gold-500 font-mono">
              ${levels.centerPrice.toLocaleString('en-US', { minimumFractionDigits: currentAssetConfig.decimals, maximumFractionDigits: currentAssetConfig.decimals })}
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
                Descargar Excel
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
                Niveles de Resistencia
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-terminal-muted text-xs">
                      <th className="text-left py-1 pr-2">Nivel</th>
                      <th className="text-right py-1 pr-2">Precio</th>
                      <th className="text-right py-1">%</th>
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
                            ${price.toLocaleString('en-US', { minimumFractionDigits: currentAssetConfig.decimals, maximumFractionDigits: currentAssetConfig.decimals })}
                          </span>
                        </td>
                        <td className="py-2 text-right">
                          <span className="font-mono text-red-400/70 text-xs">
                            +{((price - levels.centerPrice) / levels.centerPrice * 100).toFixed(2)}%
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
                Niveles de Soporte
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-terminal-muted text-xs">
                      <th className="text-left py-1 pr-2">Nivel</th>
                      <th className="text-right py-1 pr-2">Precio</th>
                      <th className="text-right py-1">%</th>
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
                              ? `$${price.toLocaleString('en-US', { minimumFractionDigits: currentAssetConfig.decimals, maximumFractionDigits: currentAssetConfig.decimals })}`
                              : '-'
                            }
                          </span>
                        </td>
                        <td className="py-2 text-right">
                          <span className="font-mono text-green-400/70 text-xs">
                            {price > 0 ? ((price - levels.centerPrice) / levels.centerPrice * 100).toFixed(2) + '%' : '-'}
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

      {/* Legal Warning Modal */}
      {showLegalWarning && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-terminal-card border-2 border-gold-500 rounded-xl sm:rounded-2xl max-w-2xl w-full p-4 sm:p-6 md:p-8 my-4 sm:my-8 shadow-2xl animate-scaleIn max-h-[95vh] overflow-y-auto">
            {/* Warning Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gold-500/20 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-gold-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-white text-center mb-4">
              {t('calc.legalWarning.title')}
            </h2>

            {/* Content */}
            <div className="space-y-4 text-terminal-muted mb-8">
              <p className="leading-relaxed">
                {t('calc.legalWarning.personalText')} <strong className="text-white">{t('calc.legalWarning.personal')}</strong>.
              </p>

              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <p className="text-red-400 font-semibold mb-2">{t('calc.legalWarning.prohibited')}</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>{t('calc.legalWarning.resell')}</li>
                  <li>{t('calc.legalWarning.shareSignals')}</li>
                  <li>{t('calc.legalWarning.distributeExports')}</li>
                  <li>{t('calc.legalWarning.derivedServices')}</li>
                </ul>
              </div>

              <div className="bg-gold-500/10 border border-gold-500/30 rounded-lg p-4">
                <p className="text-gold-500 font-semibold mb-2">{t('calc.legalWarning.protectionTitle')}</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>{t('calc.legalWarning.watermark')}</li>
                  <li>{t('calc.legalWarning.traceable')}</li>
                  <li>{t('calc.legalWarning.suspension')}</li>
                  <li>{t('calc.legalWarning.legalAction')}</li>
                </ul>
              </div>

              <p className="text-sm text-center text-terminal-muted/70 mt-4">
                {t('calc.legalWarning.confirmText')}
              </p>
            </div>

            {/* Checkbox de aceptación */}
            <div className="mb-6 p-3 sm:p-4 border-2 border-terminal-border rounded-lg bg-terminal-bg/50">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={termsCheckboxAccepted}
                  onChange={(e) => setTermsCheckboxAccepted(e.target.checked)}
                  className="mt-1 w-5 h-5 min-w-[20px] rounded border-terminal-border text-gold-500 focus:ring-gold-500 focus:ring-offset-0 bg-terminal-bg cursor-pointer"
                />
                <span className="text-xs sm:text-sm text-terminal-muted flex-1 leading-relaxed">
                  {t('calc.legalWarning.confirmText')}
                </span>
              </label>
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-3">
              <button
                onClick={handleAcceptTerms}
                disabled={!termsCheckboxAccepted}
                className="w-full px-4 sm:px-6 py-3 bg-gold-500 text-black rounded-lg sm:rounded-xl font-semibold hover:bg-gold-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {t('calc.legalWarning.accept')}
              </button>
              <button
                onClick={() => setShowLegalWarning(false)}
                className="w-full px-4 sm:px-6 py-3 bg-terminal-bg border-2 border-terminal-border text-white rounded-lg sm:rounded-xl font-semibold hover:border-red-500 hover:text-red-500 transition-all text-sm sm:text-base"
              >
                {t('common.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Trial Expired Modal */}
      {showTrialExpiredModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-terminal-card border-2 border-gold-500 rounded-2xl max-w-md w-full p-8 shadow-2xl animate-scaleIn">
            <div className="text-center">
              <div className="w-16 h-16 bg-gold-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>

              <h2 className="text-2xl font-bold text-white mb-3">{t('trial.expired')}</h2>

              <p className="text-terminal-muted mb-6">
                {t('trial.expiredMessage')}
              </p>

              <div className="flex flex-col gap-3">
                <a
                  href="/billing"
                  className="w-full px-6 py-3 bg-gold-500 text-black rounded-xl font-semibold hover:bg-gold-400 transition-all text-center"
                >
                  {t('trial.viewPlans')}
                </a>
                <button
                  onClick={() => setShowTrialExpiredModal(false)}
                  className="w-full px-6 py-3 bg-terminal-bg border-2 border-terminal-border text-white rounded-xl font-semibold hover:border-gold-500 transition-all"
                >
                  {t('common.close')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
