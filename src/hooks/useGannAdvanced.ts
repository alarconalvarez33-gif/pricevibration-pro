'use client'

import { useMemo } from 'react'

// ============================================
// TYPES
// ============================================

export interface GannLevel {
  price: number
  angle: number
  type: 'support' | 'resistance' | 'cardinal' | 'cross'
  source: string
}

export interface Square9Cell {
  value: number
  ring: number
  position: number
  angle: number
  isCardinal: boolean
  isCross: boolean
}

export interface HexagonLevel {
  price: number
  ring: number
  axis: number
  angle: number
}

export interface TimeCycle {
  name: string
  days: number
  date: Date
  description: string
}

export interface PriceTimeSquare {
  price: number
  days: number
  factor: number
  isSquared: boolean
  deviation: number
}

export interface GannAngle {
  name: string
  ratio: string
  angle: number
  price: number
}

// ============================================
// 1. WHEEL OF 24 (Law of Vibration)
// ============================================

export function calculateWheel24(centerPrice: number, increment: number = 0.25): GannLevel[] {
  if (centerPrice <= 0 || !isFinite(centerPrice)) return []

  const levels: GannLevel[] = []
  const sqrt = Math.sqrt(centerPrice)

  // 24 divisions of 15 degrees each
  for (let i = 0; i <= 24; i++) {
    const degree = i * 15
    const factor = (degree / 360) * 2 // Full circle = 2 sqrt units

    // Resistance levels (above center)
    const resistancePrice = Math.pow(sqrt + factor * increment, 2)
    if (isFinite(resistancePrice) && resistancePrice > 0) {
      levels.push({
        price: Math.round(resistancePrice * 100) / 100,
        angle: degree,
        type: degree % 90 === 0 ? 'cardinal' : degree % 45 === 0 ? 'cross' : 'resistance',
        source: 'wheel24'
      })
    }

    // Support levels (below center)
    if (i > 0) {
      const supportSqrt = sqrt - factor * increment
      if (supportSqrt > 0) {
        const supportPrice = Math.pow(supportSqrt, 2)
        if (isFinite(supportPrice) && supportPrice > 0) {
          levels.push({
            price: Math.round(supportPrice * 100) / 100,
            angle: degree,
            type: 'support',
            source: 'wheel24'
          })
        }
      }
    }
  }

  return levels.sort((a, b) => b.price - a.price)
}

// ============================================
// 2. SQUARE OF 9 COMPLETE
// ============================================

export function generateSquare9(
  centerPrice: number,
  rings: number = 5,
  increment: number = 0.25
): Square9Cell[] {
  if (centerPrice <= 0 || !isFinite(centerPrice)) return []

  const cells: Square9Cell[] = []
  const centerSqrt = Math.sqrt(centerPrice)

  // Center cell
  cells.push({
    value: centerPrice,
    ring: 0,
    position: 0,
    angle: 0,
    isCardinal: true,
    isCross: false
  })

  // Generate spiral
  for (let ring = 1; ring <= rings; ring++) {
    const cellsInRing = ring * 8
    const anglePerCell = 360 / cellsInRing

    for (let pos = 0; pos < cellsInRing; pos++) {
      const angle = pos * anglePerCell
      const sqrtValue = centerSqrt + (ring * increment) * (1 + pos / cellsInRing)
      const price = Math.pow(sqrtValue, 2)

      if (isFinite(price) && price > 0) {
        const isCardinal = Math.abs(angle % 90) < anglePerCell / 2 || Math.abs((angle % 90) - 90) < anglePerCell / 2
        const isCross = Math.abs(angle % 45) < anglePerCell / 2 && !isCardinal

        cells.push({
          value: Math.round(price * 100) / 100,
          ring,
          position: pos,
          angle: Math.round(angle * 100) / 100,
          isCardinal,
          isCross
        })
      }
    }
  }

  return cells
}

export function getSquare9Levels(
  centerPrice: number,
  increment: number = 0.25
): { resistances: number[], supports: number[], cardinals: number[] } {
  if (centerPrice <= 0 || !isFinite(centerPrice)) {
    return { resistances: [], supports: [], cardinals: [] }
  }

  const sqrt = Math.sqrt(centerPrice)
  const resistances: number[] = []
  const supports: number[] = []
  const cardinals: number[] = []

  // 8 levels in each direction
  for (let i = 1; i <= 8; i++) {
    // Resistances
    const rPrice = Math.pow(sqrt + i * increment, 2)
    if (isFinite(rPrice)) {
      resistances.push(Math.round(rPrice * 100) / 100)
    }

    // Supports
    const sSqrt = sqrt - i * increment
    if (sSqrt > 0) {
      const sPrice = Math.pow(sSqrt, 2)
      if (isFinite(sPrice)) {
        supports.push(Math.round(sPrice * 100) / 100)
      }
    }

    // Cardinals (every 90 degrees = every 4 increments)
    if (i % 4 === 0 && isFinite(rPrice)) {
      cardinals.push(Math.round(rPrice * 100) / 100)
    }
  }

  return { resistances, supports, cardinals }
}

// ============================================
// 3. GANN HEXAGON
// ============================================

export function calculateHexagon(centerPrice: number, rings: number = 6): HexagonLevel[] {
  if (centerPrice <= 0 || !isFinite(centerPrice)) return []

  const levels: HexagonLevel[] = []
  const axes = [0, 60, 120, 180, 240, 300] // 6 axes at 60° each

  for (let ring = 1; ring <= rings; ring++) {
    for (let axisIndex = 0; axisIndex < axes.length; axisIndex++) {
      const angle = axes[axisIndex]
      // Hexagon formula: price + (ring × 6) adjusted by axis
      const priceIncrement = centerPrice * (ring * 0.01) * (1 + axisIndex * 0.1)
      const price = centerPrice + priceIncrement

      if (isFinite(price) && price > 0) {
        levels.push({
          price: Math.round(price * 100) / 100,
          ring,
          axis: axisIndex,
          angle
        })
      }
    }
  }

  return levels.sort((a, b) => a.price - b.price)
}

// ============================================
// 4. TIME CYCLES
// ============================================

export function calculateTimeCycles(swingDate: Date): TimeCycle[] {
  const cycles = [
    { name: 'Lunar Month', days: 30, description: '1 solar month - basic cycle' },
    { name: 'Quarter', days: 90, description: '1 season - square' },
    { name: 'Gann 144', days: 144, description: 'Gann sacred number' },
    { name: 'Half Year', days: 180, description: 'Half turn - opposition' },
    { name: 'Full Year', days: 360, description: 'Full turn' },
    { name: '52 Weeks', days: 364, description: 'Trading year' },
    { name: 'Gann 288', days: 288, description: 'Double 144' },
    { name: '18 Months', days: 540, description: 'Cycle and half' },
    { name: '2 Years', days: 720, description: 'Double turn' },
  ]

  return cycles.map(cycle => ({
    ...cycle,
    date: new Date(swingDate.getTime() + cycle.days * 24 * 60 * 60 * 1000)
  }))
}

export function getUpcomingCycleDates(
  swingDate: Date,
  currentDate: Date = new Date()
): TimeCycle[] {
  const allCycles = calculateTimeCycles(swingDate)
  return allCycles.filter(cycle => cycle.date > currentDate)
    .sort((a, b) => a.date.getTime() - b.date.getTime())
}

// ============================================
// 5. PRICE-TIME SQUARING
// ============================================

export function calculatePriceTimeSquare(
  price: number,
  swingDate: Date,
  currentDate: Date = new Date()
): PriceTimeSquare[] {
  if (price <= 0 || !isFinite(price)) return []

  const daysDiff = Math.floor(
    (currentDate.getTime() - swingDate.getTime()) / (24 * 60 * 60 * 1000)
  )

  const sqrt = Math.sqrt(price)
  const factors = [1, 2, 4, 8, 16]
  const results: PriceTimeSquare[] = []

  for (const factor of factors) {
    const expectedDays = sqrt * factor
    const deviation = Math.abs(daysDiff - expectedDays)
    const isSquared = deviation < 5 // 5 day tolerance

    results.push({
      price,
      days: daysDiff,
      factor,
      isSquared,
      deviation: Math.round(deviation * 100) / 100
    })
  }

  return results
}

export function findNextSquareDate(
  price: number,
  swingDate: Date
): { factor: number, date: Date, daysRemaining: number }[] {
  if (price <= 0 || !isFinite(price)) return []

  const sqrt = Math.sqrt(price)
  const factors = [1, 2, 4, 8]
  const results: { factor: number, date: Date, daysRemaining: number }[] = []
  const now = new Date()

  for (const factor of factors) {
    const targetDays = sqrt * factor
    const targetDate = new Date(swingDate.getTime() + targetDays * 24 * 60 * 60 * 1000)

    if (targetDate > now) {
      const daysRemaining = Math.ceil(
        (targetDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)
      )
      results.push({ factor, date: targetDate, daysRemaining })
    }
  }

  return results.sort((a, b) => a.daysRemaining - b.daysRemaining)
}

// ============================================
// 6. GANN ANGLES IN PRICE
// Exact angles: 1×1=45°, 2×1=63.75°, 1×2=26.25°, etc.
// ============================================

export function calculateGannAngles(
  swingPrice: number,
  swingDate: Date,
  currentDate: Date = new Date(),
  isSwingLow: boolean = true
): GannAngle[] {
  if (swingPrice <= 0 || !isFinite(swingPrice)) return []

  const daysDiff = Math.floor(
    (currentDate.getTime() - swingDate.getTime()) / (24 * 60 * 60 * 1000)
  )

  // Exact Gann angles
  const angles = [
    { name: '1×8', ratio: '1:8', angle: 7.5, multiplier: 0.125 },
    { name: '1×4', ratio: '1:4', angle: 15, multiplier: 0.25 },
    { name: '1×3', ratio: '1:3', angle: 18.75, multiplier: 0.333 },
    { name: '1×2', ratio: '1:2', angle: 26.25, multiplier: 0.5 },
    { name: '1×1', ratio: '1:1', angle: 45, multiplier: 1 },
    { name: '2×1', ratio: '2:1', angle: 63.75, multiplier: 2 },
    { name: '3×1', ratio: '3:1', angle: 71.25, multiplier: 3 },
    { name: '4×1', ratio: '4:1', angle: 75, multiplier: 4 },
    { name: '8×1', ratio: '8:1', angle: 82.5, multiplier: 8 },
  ]

  return angles.map(angle => {
    const priceChange = daysDiff * angle.multiplier
    const price = isSwingLow
      ? swingPrice + priceChange
      : swingPrice - priceChange

    return {
      name: angle.name,
      ratio: angle.ratio,
      angle: angle.angle,
      price: Math.round(Math.max(0, price) * 100) / 100
    }
  })
}

// ============================================
// 7. 144 SERIES (Sacred Numbers)
// ============================================

export function calculate144Series(centerPrice: number): GannLevel[] {
  if (centerPrice <= 0 || !isFinite(centerPrice)) return []

  const levels: GannLevel[] = []
  const divisions = [18, 36, 48, 72, 144, 288]

  for (const div of divisions) {
    // Add/subtract absolute value
    const rPrice = centerPrice + div
    const sPrice = centerPrice - div

    if (isFinite(rPrice) && rPrice > 0) {
      levels.push({
        price: Math.round(rPrice * 100) / 100,
        angle: 0,
        type: 'resistance',
        source: `+${div}`
      })
    }

    if (isFinite(sPrice) && sPrice > 0) {
      levels.push({
        price: Math.round(sPrice * 100) / 100,
        angle: 0,
        type: 'support',
        source: `-${div}`
      })
    }

    // Apply as percentage
    const pctUp = div / 1000
    const pctDown = div / 1000
    const rPctPrice = centerPrice * (1 + pctUp)
    const sPctPrice = centerPrice * (1 - pctDown)

    if (isFinite(rPctPrice) && rPctPrice > 0) {
      levels.push({
        price: Math.round(rPctPrice * 100) / 100,
        angle: 0,
        type: 'resistance',
        source: `+${(pctUp * 100).toFixed(1)}%`
      })
    }

    if (isFinite(sPctPrice) && sPctPrice > 0) {
      levels.push({
        price: Math.round(sPctPrice * 100) / 100,
        angle: 0,
        type: 'support',
        source: `-${(pctDown * 100).toFixed(1)}%`
      })
    }
  }

  return levels.sort((a, b) => b.price - a.price)
}

// ============================================
// 8. MASTER TIME FACTOR (360)
// ============================================

export function calculateMasterTimeFactor(centerPrice: number, increment: number = 0.25): GannLevel[] {
  if (centerPrice <= 0 || !isFinite(centerPrice)) return []

  const levels: GannLevel[] = []
  const sqrt = Math.sqrt(centerPrice)

  // Natural divisions of 360
  const divisions = [
    { degrees: 30, name: '360/12' },
    { degrees: 45, name: '360/8' },
    { degrees: 60, name: '360/6' },
    { degrees: 90, name: '360/4' },
    { degrees: 120, name: '360/3' },
    { degrees: 180, name: '360/2' },
    { degrees: 360, name: '360/1' },
  ]

  for (const div of divisions) {
    // Convert degrees to sqrt increment
    const incr = (div.degrees / 360) * 2 * increment

    // Resistance
    const rPrice = Math.pow(sqrt + incr, 2)
    if (isFinite(rPrice) && rPrice > 0) {
      levels.push({
        price: Math.round(rPrice * 100) / 100,
        angle: div.degrees,
        type: 'resistance',
        source: div.name
      })
    }

    // Support
    const sSqrt = sqrt - incr
    if (sSqrt > 0) {
      const sPrice = Math.pow(sSqrt, 2)
      if (isFinite(sPrice) && sPrice > 0) {
        levels.push({
          price: Math.round(sPrice * 100) / 100,
          angle: div.degrees,
          type: 'support',
          source: div.name
        })
      }
    }
  }

  return levels.sort((a, b) => b.price - a.price)
}

// ============================================
// MAIN HOOK
// ============================================

export function useGannAdvanced(centerPrice: number | null, increment: number = 0.25) {
  const wheel24 = useMemo(() =>
    centerPrice ? calculateWheel24(centerPrice, increment) : [],
    [centerPrice, increment]
  )

  const square9 = useMemo(() =>
    centerPrice ? getSquare9Levels(centerPrice, increment) : { resistances: [], supports: [], cardinals: [] },
    [centerPrice, increment]
  )

  const hexagon = useMemo(() =>
    centerPrice ? calculateHexagon(centerPrice) : [],
    [centerPrice]
  )

  const series144 = useMemo(() =>
    centerPrice ? calculate144Series(centerPrice) : [],
    [centerPrice]
  )

  const masterTime = useMemo(() =>
    centerPrice ? calculateMasterTimeFactor(centerPrice, increment) : [],
    [centerPrice, increment]
  )

  return {
    wheel24,
    square9,
    hexagon,
    series144,
    masterTime,
    // Functions for dynamic calculations
    calculateTimeCycles,
    calculatePriceTimeSquare,
    calculateGannAngles,
    findNextSquareDate,
    generateSquare9,
  }
}

export default useGannAdvanced
