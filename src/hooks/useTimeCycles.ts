'use client'

import { useState, useMemo, useCallback } from 'react'

// ============================================
// TIPOS
// ============================================

export interface SwingPoint {
  date: Date
  price: number
  type: 'high' | 'low'
}

export interface CycleDate {
  name: string
  days: number
  date: Date
  isPast: boolean
  daysRemaining: number
  significance: 'high' | 'medium' | 'low'
}

export interface PriceTimeConvergence {
  date: Date
  daysFromSwing: number
  factor: number
  convergenceStrength: number // 0-100
  expectedAction: 'reversal' | 'acceleration' | 'neutral'
}

// ============================================
// CICLOS DE GANN SAGRADOS
// ============================================

export const GANN_CYCLES = {
  // Ciclos cortos
  short: [
    { name: '7 Days', days: 7, significance: 'low' as const },
    { name: '14 Days', days: 14, significance: 'low' as const },
    { name: '21 Days', days: 21, significance: 'medium' as const },
    { name: '28 Days (Lunar)', days: 28, significance: 'medium' as const },
    { name: '30 Days', days: 30, significance: 'medium' as const },
  ],
  // Ciclos medios
  medium: [
    { name: '45 Days', days: 45, significance: 'medium' as const },
    { name: '49 Days (7²)', days: 49, significance: 'high' as const },
    { name: '52 Days', days: 52, significance: 'medium' as const },
    { name: '60 Days', days: 60, significance: 'medium' as const },
    { name: '72 Days', days: 72, significance: 'high' as const },
    { name: '90 Days (Quarter)', days: 90, significance: 'high' as const },
  ],
  // Ciclos largos
  long: [
    { name: '120 Days', days: 120, significance: 'medium' as const },
    { name: '144 Days (Gann Sacred)', days: 144, significance: 'high' as const },
    { name: '180 Days (Half Year)', days: 180, significance: 'high' as const },
    { name: '216 Days', days: 216, significance: 'medium' as const },
    { name: '288 Days (2×144)', days: 288, significance: 'high' as const },
    { name: '360 Days (Full Year)', days: 360, significance: 'high' as const },
    { name: '52 Weeks', days: 364, significance: 'high' as const },
  ],
  // Ciclos extendidos
  extended: [
    { name: '18 Months', days: 540, significance: 'medium' as const },
    { name: '2 Years', days: 720, significance: 'high' as const },
    { name: '30 Months', days: 900, significance: 'medium' as const },
    { name: '3 Years', days: 1080, significance: 'high' as const },
    { name: '5 Years', days: 1800, significance: 'high' as const },
  ]
}

// ============================================
// FUNCIONES DE CÁLCULO
// ============================================

function daysBetween(date1: Date, date2: Date): number {
  return Math.floor(
    (date2.getTime() - date1.getTime()) / (24 * 60 * 60 * 1000)
  )
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000)
}

export function calculateCycleDates(
  swingDate: Date,
  currentDate: Date = new Date()
): CycleDate[] {
  const allCycles = [
    ...GANN_CYCLES.short,
    ...GANN_CYCLES.medium,
    ...GANN_CYCLES.long,
    ...GANN_CYCLES.extended
  ]

  return allCycles.map(cycle => {
    const cycleDate = addDays(swingDate, cycle.days)
    const daysRemaining = daysBetween(currentDate, cycleDate)

    return {
      name: cycle.name,
      days: cycle.days,
      date: cycleDate,
      isPast: daysRemaining < 0,
      daysRemaining,
      significance: cycle.significance
    }
  }).sort((a, b) => a.days - b.days)
}

export function getUpcomingCycles(
  swingDate: Date,
  limit: number = 10
): CycleDate[] {
  const allDates = calculateCycleDates(swingDate)
  return allDates
    .filter(c => !c.isPast)
    .slice(0, limit)
}

export function getNearestCycle(
  swingDate: Date,
  currentDate: Date = new Date()
): CycleDate | null {
  const upcoming = getUpcomingCycles(swingDate, 1)
  return upcoming.length > 0 ? upcoming[0] : null
}

// ============================================
// PRICE-TIME SQUARING
// ============================================

export function calculatePriceTimeSquaring(
  swingPrice: number,
  swingDate: Date,
  currentDate: Date = new Date()
): PriceTimeConvergence[] {
  const daysDiff = daysBetween(swingDate, currentDate)
  const sqrtPrice = Math.sqrt(swingPrice)

  const factors = [
    { factor: 1, name: '1:1' },
    { factor: 2, name: '1:2' },
    { factor: 4, name: '1:4' },
    { factor: 0.5, name: '2:1' },
    { factor: 0.25, name: '4:1' },
  ]

  const convergences: PriceTimeConvergence[] = []

  for (const { factor, name } of factors) {
    // Cuando √precio × factor ≈ días, hay convergencia
    const expectedDays = sqrtPrice * factor
    const deviation = Math.abs(daysDiff - expectedDays)
    const maxDeviation = expectedDays * 0.1 // 10% tolerancia
    const convergenceStrength = Math.max(0, 100 - (deviation / maxDeviation) * 100)

    if (convergenceStrength > 0) {
      const convergenceDate = addDays(swingDate, Math.round(expectedDays))

      convergences.push({
        date: convergenceDate,
        daysFromSwing: Math.round(expectedDays),
        factor,
        convergenceStrength: Math.round(convergenceStrength),
        expectedAction: convergenceStrength > 80 ? 'reversal' :
          convergenceStrength > 50 ? 'acceleration' : 'neutral'
      })
    }
  }

  return convergences.sort((a, b) => b.convergenceStrength - a.convergenceStrength)
}

// Encontrar próximas fechas de cuadratura precio-tiempo
export function findNextSquareDates(
  swingPrice: number,
  swingDate: Date,
  currentDate: Date = new Date(),
  lookAheadDays: number = 365
): PriceTimeConvergence[] {
  const sqrtPrice = Math.sqrt(swingPrice)
  const factors = [1, 2, 4, 8]
  const results: PriceTimeConvergence[] = []

  for (const factor of factors) {
    const targetDays = sqrtPrice * factor
    const targetDate = addDays(swingDate, Math.round(targetDays))

    if (targetDate > currentDate && daysBetween(currentDate, targetDate) <= lookAheadDays) {
      results.push({
        date: targetDate,
        daysFromSwing: Math.round(targetDays),
        factor,
        convergenceStrength: 100,
        expectedAction: 'reversal'
      })
    }
  }

  return results.sort((a, b) => a.daysFromSwing - b.daysFromSwing)
}

// ============================================
// GANN ANGLES EN TIEMPO
// ============================================

export interface TimeAngle {
  name: string
  ratio: string
  angle: number
  expectedPrice: number
  currentDeviation: number
}

export function calculateTimeAngles(
  swingPrice: number,
  swingDate: Date,
  currentPrice: number,
  currentDate: Date = new Date(),
  isSwingLow: boolean = true
): TimeAngle[] {
  const daysDiff = daysBetween(swingDate, currentDate)

  const angles = [
    { name: '8×1', ratio: '8:1', multiplier: 8 },
    { name: '4×1', ratio: '4:1', multiplier: 4 },
    { name: '3×1', ratio: '3:1', multiplier: 3 },
    { name: '2×1', ratio: '2:1', multiplier: 2 },
    { name: '1×1', ratio: '1:1', multiplier: 1 },
    { name: '1×2', ratio: '1:2', multiplier: 0.5 },
    { name: '1×3', ratio: '1:3', multiplier: 0.333 },
    { name: '1×4', ratio: '1:4', multiplier: 0.25 },
    { name: '1×8', ratio: '1:8', multiplier: 0.125 },
  ]

  return angles.map(angle => {
    const priceChange = daysDiff * angle.multiplier
    const expectedPrice = isSwingLow
      ? swingPrice + priceChange
      : swingPrice - priceChange

    const deviation = Math.abs(currentPrice - expectedPrice)
    const deviationPct = (deviation / expectedPrice) * 100

    return {
      name: angle.name,
      ratio: angle.ratio,
      angle: Math.atan(angle.multiplier) * (180 / Math.PI),
      expectedPrice: Math.round(expectedPrice * 100) / 100,
      currentDeviation: Math.round(deviationPct * 100) / 100
    }
  })
}

// ============================================
// HOOK PRINCIPAL
// ============================================

export function useTimeCycles() {
  const [swingPoint, setSwingPoint] = useState<SwingPoint | null>(null)

  const cycleDates = useMemo(() =>
    swingPoint ? calculateCycleDates(swingPoint.date) : [],
    [swingPoint]
  )

  const upcomingCycles = useMemo(() =>
    swingPoint ? getUpcomingCycles(swingPoint.date, 15) : [],
    [swingPoint]
  )

  const nearestCycle = useMemo(() =>
    swingPoint ? getNearestCycle(swingPoint.date) : null,
    [swingPoint]
  )

  const priceTimeSquaring = useMemo(() =>
    swingPoint ? calculatePriceTimeSquaring(swingPoint.price, swingPoint.date) : [],
    [swingPoint]
  )

  const nextSquareDates = useMemo(() =>
    swingPoint ? findNextSquareDates(swingPoint.price, swingPoint.date) : [],
    [swingPoint]
  )

  const setSwing = useCallback((date: Date, price: number, type: 'high' | 'low') => {
    setSwingPoint({ date, price, type })
  }, [])

  const clearSwing = useCallback(() => {
    setSwingPoint(null)
  }, [])

  const getTimeAngles = useCallback((currentPrice: number) => {
    if (!swingPoint) return []
    return calculateTimeAngles(
      swingPoint.price,
      swingPoint.date,
      currentPrice,
      new Date(),
      swingPoint.type === 'low'
    )
  }, [swingPoint])

  return {
    swingPoint,
    cycleDates,
    upcomingCycles,
    nearestCycle,
    priceTimeSquaring,
    nextSquareDates,
    setSwing,
    clearSwing,
    getTimeAngles,
    // Constantes expuestas
    GANN_CYCLES
  }
}

export default useTimeCycles
