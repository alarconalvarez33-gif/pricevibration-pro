// Gann Calculator Core Library
// Mathematical precision verified for professional trading

export interface GannLevels {
  centerPrice: number
  resistances: number[]
  supports: number[]
  increment: number
  asset?: string
}

export interface IncrementOption {
  value: number
  label: string
  description: string
}

export interface AssetConfig {
  factor: number
  decimals: number
  name: string
}

export const INCREMENT_OPTIONS: IncrementOption[] = [
  { value: 0.25, label: '0.25', description: 'Scalping' },
  { value: 0.3125, label: '0.3125', description: 'Intraday' },
  { value: 0.375, label: '0.375', description: 'Swing' },
  { value: 0.5, label: '0.5', description: 'Position' },
]

export const ASSET_FACTORS: Record<string, AssetConfig> = {
  'XAU/USD': { factor: 1, decimals: 2, name: 'Gold' },
  'BTC/USD': { factor: 1, decimals: 2, name: 'Bitcoin' },
  'USD/JPY': { factor: 100, decimals: 3, name: 'Dollar/Yen' },
  'EUR/USD': { factor: 10000, decimals: 5, name: 'Euro/Dollar' },
  'GBP/USD': { factor: 10000, decimals: 5, name: 'Pound/Dollar' },
  'XAG/USD': { factor: 100, decimals: 3, name: 'Silver' },
  'US30': { factor: 1, decimals: 2, name: 'Dow Jones' },
  'SPX500': { factor: 1, decimals: 2, name: 'S&P 500' },
  'NAS100': { factor: 1, decimals: 2, name: 'Nasdaq' },
}

/**
 * Calculate Gann levels using the Square of 9 methodology
 *
 * Formula:
 * - Resistance: (√price + increment)² iteratively
 * - Support: (√price - increment)² iteratively
 *
 * For forex pairs and low-priced assets, we multiply by a factor before calculation
 * and divide the results by the same factor to maintain precision.
 *
 * Example with price 4100 and increment 0.25:
 * - √4100 = 64.0312...
 * - R1: (64.0312 + 0.25)² = 4132.08
 * - S1: (64.0312 - 0.25)² = 4068.05
 */
export function calculateGannLevels(
  centerPrice: number,
  increment: number = 0.25,
  numLevels: number = 8,
  assetKey: string = 'XAU/USD'
): GannLevels {
  // Validation
  if (centerPrice <= 0 || !isFinite(centerPrice)) {
    return {
      centerPrice: 0,
      resistances: Array(numLevels).fill(0),
      supports: Array(numLevels).fill(0),
      increment,
      asset: assetKey
    }
  }

  // Get asset configuration
  const assetConfig = ASSET_FACTORS[assetKey] || ASSET_FACTORS['XAU/USD']
  const { factor, decimals } = assetConfig

  // Adjust price by factor for calculation
  const adjustedPrice = centerPrice * factor

  const resistances: number[] = []
  const supports: number[] = []

  // Calculate resistance levels iteratively
  let currentPrice = adjustedPrice
  for (let i = 0; i < numLevels; i++) {
    const sqrtPrice = Math.sqrt(currentPrice)
    const newPrice = Math.pow(sqrtPrice + increment, 2)
    // Divide by factor and round to appropriate decimals
    const finalPrice = newPrice / factor
    resistances.push(Math.round(finalPrice * Math.pow(10, decimals)) / Math.pow(10, decimals))
    currentPrice = newPrice
  }

  // Calculate support levels iteratively
  currentPrice = adjustedPrice
  for (let i = 0; i < numLevels; i++) {
    const sqrtPrice = Math.sqrt(currentPrice)
    const newSqrt = sqrtPrice - increment
    // Prevent negative sqrt values
    if (newSqrt <= 0) {
      supports.push(0)
      currentPrice = 0.01
    } else {
      const newPrice = Math.pow(newSqrt, 2)
      // Divide by factor and round to appropriate decimals
      const finalPrice = newPrice / factor
      supports.push(Math.round(finalPrice * Math.pow(10, decimals)) / Math.pow(10, decimals))
      currentPrice = newPrice
    }
  }

  return {
    centerPrice,
    resistances,
    supports,
    increment,
    asset: assetKey
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
  increment: number = 0.25,
  assetKey: string = 'XAU/USD'
): number {
  if (centerPrice <= 0) return 0

  // Get asset configuration
  const assetConfig = ASSET_FACTORS[assetKey] || ASSET_FACTORS['XAU/USD']
  const { factor, decimals } = assetConfig

  // Adjust price by factor
  let price = centerPrice * factor
  const absLevel = Math.abs(levelNumber)
  const isResistance = levelNumber > 0

  for (let i = 0; i < absLevel; i++) {
    const sqrt = Math.sqrt(price)
    price = isResistance
      ? Math.pow(sqrt + increment, 2)
      : Math.pow(Math.max(0.01, sqrt - increment), 2)
  }

  // Divide by factor and round to appropriate decimals
  const finalPrice = price / factor
  return Math.round(finalPrice * Math.pow(10, decimals)) / Math.pow(10, decimals)
}

/**
 * Find which Gann level is closest to a target price
 */
export function findNearestLevel(
  centerPrice: number,
  targetPrice: number,
  increment: number = 0.25,
  assetKey: string = 'XAU/USD'
): { level: number; price: number; distance: number } {
  const levels = calculateGannLevels(centerPrice, increment, 8, assetKey)
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
