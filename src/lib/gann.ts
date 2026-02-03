// Gann Calculator Core Library
// Mathematical precision verified for professional trading

export interface GannLevels {
  centerPrice: number
  resistances: number[]
  supports: number[]
  increment: number
}

export interface IncrementOption {
  value: number
  label: string
  description: string
}

export const INCREMENT_OPTIONS: IncrementOption[] = [
  { value: 0.25, label: '0.25', description: 'Scalping' },
  { value: 0.3125, label: '0.3125', description: 'Intraday' },
  { value: 0.375, label: '0.375', description: 'Swing' },
  { value: 0.5, label: '0.5', description: 'Position' },
]

/**
 * Calculate Gann levels using the Square of 9 methodology
 *
 * Formula:
 * - Resistance: (√price + increment)² iteratively
 * - Support: (√price - increment)² iteratively
 *
 * Example with price 3280 and increment 0.25:
 * - √3280 = 57.2713...
 * - R1: (57.2713 + 0.25)² = 3308.70
 * - S1: (57.2713 - 0.25)² = 3251.43
 */
export function calculateGannLevels(
  centerPrice: number,
  increment: number = 0.25,
  numLevels: number = 8
): GannLevels {
  // Validation
  if (centerPrice <= 0 || !isFinite(centerPrice)) {
    return {
      centerPrice: 0,
      resistances: Array(numLevels).fill(0),
      supports: Array(numLevels).fill(0),
      increment
    }
  }

  const resistances: number[] = []
  const supports: number[] = []

  // Calculate resistance levels iteratively
  let currentPrice = centerPrice
  for (let i = 0; i < numLevels; i++) {
    const sqrtPrice = Math.sqrt(currentPrice)
    const newPrice = Math.pow(sqrtPrice + increment, 2)
    // Round to 2 decimal places
    resistances.push(Math.round(newPrice * 100) / 100)
    currentPrice = newPrice
  }

  // Calculate support levels iteratively
  currentPrice = centerPrice
  for (let i = 0; i < numLevels; i++) {
    const sqrtPrice = Math.sqrt(currentPrice)
    const newSqrt = sqrtPrice - increment
    // Prevent negative sqrt values
    if (newSqrt <= 0) {
      supports.push(0)
      currentPrice = 0.01
    } else {
      const newPrice = Math.pow(newSqrt, 2)
      supports.push(Math.round(newPrice * 100) / 100)
      currentPrice = newPrice
    }
  }

  return {
    centerPrice,
    resistances,
    supports,
    increment
  }
}

/**
 * Get all levels sorted by price for visualization
 */
export function getAllLevels(gannLevels: GannLevels): {
  level: number
  price: number
  type: 'support' | 'center' | 'resistance'
  distance: number
}[] {
  const levels: {
    level: number
    price: number
    type: 'support' | 'center' | 'resistance'
    distance: number
  }[] = []

  // Add supports (reversed so S8 is furthest)
  for (let i = 7; i >= 0; i--) {
    const price = gannLevels.supports[i]
    levels.push({
      level: -(i + 1),
      price,
      type: 'support',
      distance: price - gannLevels.centerPrice
    })
  }

  // Center
  levels.push({
    level: 0,
    price: gannLevels.centerPrice,
    type: 'center',
    distance: 0
  })

  // Resistances
  for (let i = 0; i < 8; i++) {
    const price = gannLevels.resistances[i]
    levels.push({
      level: i + 1,
      price,
      type: 'resistance',
      distance: price - gannLevels.centerPrice
    })
  }

  return levels
}

/**
 * Calculate single level from center
 * Useful for quick calculations
 */
export function calculateSingleLevel(
  centerPrice: number,
  levelNumber: number,
  increment: number = 0.25
): number {
  if (centerPrice <= 0) return 0

  let price = centerPrice
  const absLevel = Math.abs(levelNumber)
  const isResistance = levelNumber > 0

  for (let i = 0; i < absLevel; i++) {
    const sqrt = Math.sqrt(price)
    price = isResistance
      ? Math.pow(sqrt + increment, 2)
      : Math.pow(Math.max(0.01, sqrt - increment), 2)
  }

  return Math.round(price * 100) / 100
}

/**
 * Find which Gann level is closest to a target price
 */
export function findNearestLevel(
  centerPrice: number,
  targetPrice: number,
  increment: number = 0.25
): { level: number; price: number; distance: number } {
  const levels = calculateGannLevels(centerPrice, increment)
  const allLevels = getAllLevels(levels)

  let nearest = allLevels[0]
  let minDistance = Math.abs(targetPrice - nearest.price)

  for (const level of allLevels) {
    const dist = Math.abs(targetPrice - level.price)
    if (dist < minDistance) {
      minDistance = dist
      nearest = level
    }
  }

  return {
    level: nearest.level,
    price: nearest.price,
    distance: minDistance
  }
}

/**
 * Validate price input
 */
export function validatePrice(value: string): {
  valid: boolean
  price: number
  error: string | null
} {
  const price = parseFloat(value)

  if (value === '' || value === undefined) {
    return { valid: false, price: 0, error: null }
  }

  if (isNaN(price)) {
    return { valid: false, price: 0, error: 'Invalid number format' }
  }

  if (price <= 0) {
    return { valid: false, price: 0, error: 'Price must be greater than 0' }
  }

  if (price > 999999) {
    return { valid: false, price: 0, error: 'Price must be less than 999,999' }
  }

  if (!isFinite(price)) {
    return { valid: false, price: 0, error: 'Invalid price value' }
  }

  return { valid: true, price, error: null }
}
