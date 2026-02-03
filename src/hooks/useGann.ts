'use client'

import { useState, useCallback, useMemo } from 'react'
import {
  calculateGannLevels,
  GannCalculation,
  GannLevel,
  PlanetaryLevel,
  findConfluences,
  getNearestGannLevel,
  formatPrice,
  SAMPLE_PLANET_POSITIONS
} from '@/lib/gannEngine'

export interface UseGannReturn {
  // Estado
  centerPrice: number | null
  calculation: GannCalculation | null
  isCalculating: boolean
  error: string | null

  // Acciones
  calculate: (price: number) => void
  reset: () => void

  // Datos derivados
  resistances: GannLevel[]
  supports: GannLevel[]
  planetaryLevels: PlanetaryLevel[]
  confluences: Array<{ gannLevel: GannLevel; planetaryLevel: PlanetaryLevel; strength: number }>

  // Utilidades
  getNearestLevel: (price: number) => GannLevel | null
  formatPrice: (price: number) => string
}

export function useGann(levelsCount: number = 8): UseGannReturn {
  const [centerPrice, setCenterPrice] = useState<number | null>(null)
  const [calculation, setCalculation] = useState<GannCalculation | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const calculate = useCallback((price: number) => {
    setError(null)

    // Validación
    if (isNaN(price) || price <= 0) {
      setError('Price must be a positive number')
      return
    }

    if (price < 1 || price > 100000) {
      setError('Price must be between 1 and 100,000')
      return
    }

    setIsCalculating(true)

    try {
      const result = calculateGannLevels(price, levelsCount)
      setCenterPrice(price)
      setCalculation(result)
    } catch (e) {
      setError('Error calculating Gann levels')
      console.error(e)
    } finally {
      setIsCalculating(false)
    }
  }, [levelsCount])

  const reset = useCallback(() => {
    setCenterPrice(null)
    setCalculation(null)
    setError(null)
  }, [])

  // Datos derivados con memoización
  const resistances = useMemo(() =>
    calculation?.resistances || [],
    [calculation]
  )

  const supports = useMemo(() =>
    calculation?.supports || [],
    [calculation]
  )

  const planetaryLevels = useMemo(() =>
    calculation?.planetaryLevels || [],
    [calculation]
  )

  const confluences = useMemo(() => {
    if (!calculation) return []
    return findConfluences(calculation.levels, calculation.planetaryLevels)
  }, [calculation])

  const getNearestLevel = useCallback((price: number) => {
    if (!calculation) return null
    return getNearestGannLevel(price, calculation.levels)
  }, [calculation])

  return {
    centerPrice,
    calculation,
    isCalculating,
    error,
    calculate,
    reset,
    resistances,
    supports,
    planetaryLevels,
    confluences,
    getNearestLevel,
    formatPrice
  }
}

export default useGann
