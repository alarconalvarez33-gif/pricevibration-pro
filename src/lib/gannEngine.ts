/**
 * GANN ENGINE - Motor de cálculos de la Ley de Vibración de Gann
 * Implementa la teoría de W.D. Gann para análisis de mercados
 */

// ============================================
// TIPOS E INTERFACES
// ============================================

export interface GannLevel {
  level: number
  price: number
  type: 'support' | 'resistance' | 'center'
  sqrtValue: number
  angle: number // Ángulo en la rueda de Gann (0-360)
}

export interface GannCalculation {
  centerPrice: number
  centerSqrt: number
  levels: GannLevel[]
  resistances: GannLevel[]
  supports: GannLevel[]
  planetaryLevels: PlanetaryLevel[]
}

export interface PlanetaryLevel {
  planet: string
  degree: number
  price: number
  gannAngle: number
  isCardinal: boolean // 0°, 90°, 180°, 270°
}

export interface PlanetPosition {
  name: string
  symbol: string
  degree: number
  sign: string
  color: string
}

// ============================================
// CONSTANTES
// ============================================

// Ángulos cardinales de Gann
export const GANN_CARDINAL_ANGLES = [0, 90, 180, 270]
export const GANN_MAJOR_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315]

// Incremento estándar de Gann para raíz cuadrada
export const GANN_INCREMENT = 0.25

// Posiciones planetarias de ejemplo (reemplazar con API real)
export const SAMPLE_PLANET_POSITIONS: PlanetPosition[] = [
  { name: 'Mercury', symbol: '☿', degree: 45.5, sign: 'Taurus', color: '#B5B5B5' },
  { name: 'Venus', symbol: '♀', degree: 120.3, sign: 'Leo', color: '#FFC0CB' },
  { name: 'Mars', symbol: '♂', degree: 210.7, sign: 'Scorpio', color: '#FF4500' },
  { name: 'Jupiter', symbol: '♃', degree: 88.2, sign: 'Cancer', color: '#FFA500' },
  { name: 'Saturn', symbol: '♄', degree: 335.9, sign: 'Pisces', color: '#DAA520' },
  { name: 'Uranus', symbol: '♅', degree: 22.1, sign: 'Taurus', color: '#40E0D0' },
  { name: 'Neptune', symbol: '♆', degree: 358.4, sign: 'Pisces', color: '#4169E1' },
  { name: 'Pluto', symbol: '♇', degree: 300.6, sign: 'Capricorn', color: '#8B4513' },
]

// ============================================
// FUNCIONES DE CÁLCULO GANN
// ============================================

/**
 * Calcula la raíz cuadrada de un precio
 */
export function priceToSqrt(price: number): number {
  return Math.sqrt(Math.abs(price))
}

/**
 * Convierte valor de raíz cuadrada a precio
 */
export function sqrtToPrice(sqrtValue: number): number {
  return Math.pow(sqrtValue, 2)
}

/**
 * Calcula el ángulo de Gann para un precio dado
 * La rueda de Gann mapea precios a ángulos de 0-360°
 */
export function priceToGannAngle(price: number, basePrice: number): number {
  const baseSqrt = priceToSqrt(basePrice)
  const priceSqrt = priceToSqrt(price)
  const diff = priceSqrt - baseSqrt

  // Cada 0.25 en sqrt = 22.5° en la rueda
  const degreesPerIncrement = 360 / 16 // 22.5°
  const increments = diff / GANN_INCREMENT
  let angle = (increments * degreesPerIncrement) % 360

  if (angle < 0) angle += 360
  return Math.round(angle * 100) / 100
}

/**
 * Convierte un ángulo de Gann a precio
 */
export function gannAngleToPrice(angle: number, basePrice: number): number {
  const baseSqrt = priceToSqrt(basePrice)
  const degreesPerIncrement = 360 / 16
  const increments = angle / degreesPerIncrement
  const targetSqrt = baseSqrt + (increments * GANN_INCREMENT)
  return sqrtToPrice(targetSqrt)
}

/**
 * Calcula niveles de soporte y resistencia usando la fórmula de Gann
 * Fórmula: (√precio ± n*0.25)²
 */
export function calculateGannLevels(
  centerPrice: number,
  levelsCount: number = 8
): GannCalculation {
  const centerSqrt = priceToSqrt(centerPrice)
  const levels: GannLevel[] = []
  const resistances: GannLevel[] = []
  const supports: GannLevel[] = []

  // Nivel central
  levels.push({
    level: 0,
    price: centerPrice,
    type: 'center',
    sqrtValue: centerSqrt,
    angle: 0
  })

  // Calcular resistencias (√precio + n*0.25)²
  let currentSqrt = centerSqrt
  for (let i = 1; i <= levelsCount; i++) {
    currentSqrt += GANN_INCREMENT
    const price = sqrtToPrice(currentSqrt)
    const level: GannLevel = {
      level: i,
      price: Math.round(price * 100) / 100,
      type: 'resistance',
      sqrtValue: Math.round(currentSqrt * 10000) / 10000,
      angle: priceToGannAngle(price, centerPrice)
    }
    levels.push(level)
    resistances.push(level)
  }

  // Calcular soportes (√precio - n*0.25)²
  currentSqrt = centerSqrt
  for (let i = 1; i <= levelsCount; i++) {
    currentSqrt -= GANN_INCREMENT
    if (currentSqrt <= 0) break

    const price = sqrtToPrice(currentSqrt)
    const level: GannLevel = {
      level: -i,
      price: Math.round(price * 100) / 100,
      type: 'support',
      sqrtValue: Math.round(currentSqrt * 10000) / 10000,
      angle: priceToGannAngle(price, centerPrice)
    }
    levels.push(level)
    supports.push(level)
  }

  // Calcular niveles planetarios
  const planetaryLevels = calculatePlanetaryLevels(centerPrice, SAMPLE_PLANET_POSITIONS)

  return {
    centerPrice,
    centerSqrt: Math.round(centerSqrt * 10000) / 10000,
    levels: levels.sort((a, b) => b.price - a.price),
    resistances,
    supports,
    planetaryLevels
  }
}

// ============================================
// CONVERSIÓN PLANETARIA
// ============================================

/**
 * Convierte grados planetarios a niveles de precio en la rueda de Gann
 * 1° de movimiento planetario = nivel de precio específico
 */
export function degreeToPrice(degree: number, basePrice: number): number {
  // Normalizar grado a 0-360
  let normalizedDegree = degree % 360
  if (normalizedDegree < 0) normalizedDegree += 360

  // Convertir grado a precio usando la rueda de Gann
  return gannAngleToPrice(normalizedDegree, basePrice)
}

/**
 * Convierte precio a grado en la rueda
 */
export function priceToDegree(price: number, basePrice: number): number {
  return priceToGannAngle(price, basePrice)
}

/**
 * Calcula niveles de precio basados en posiciones planetarias
 */
export function calculatePlanetaryLevels(
  basePrice: number,
  planets: PlanetPosition[]
): PlanetaryLevel[] {
  return planets.map(planet => {
    const price = degreeToPrice(planet.degree, basePrice)
    const isCardinal = GANN_CARDINAL_ANGLES.some(
      angle => Math.abs(planet.degree - angle) < 5
    )

    return {
      planet: planet.name,
      degree: planet.degree,
      price: Math.round(price * 100) / 100,
      gannAngle: planet.degree,
      isCardinal
    }
  })
}

/**
 * Encuentra confluencias entre niveles Gann y posiciones planetarias
 */
export function findConfluences(
  gannLevels: GannLevel[],
  planetaryLevels: PlanetaryLevel[],
  tolerance: number = 5 // grados de tolerancia
): Array<{ gannLevel: GannLevel; planetaryLevel: PlanetaryLevel; strength: number }> {
  const confluences: Array<{ gannLevel: GannLevel; planetaryLevel: PlanetaryLevel; strength: number }> = []

  for (const gann of gannLevels) {
    for (const planet of planetaryLevels) {
      const angleDiff = Math.abs(gann.angle - planet.gannAngle)
      const normalizedDiff = angleDiff > 180 ? 360 - angleDiff : angleDiff

      if (normalizedDiff <= tolerance) {
        // Calcular fuerza de la confluencia (1 = perfecta, 0 = límite)
        const strength = 1 - (normalizedDiff / tolerance)

        confluences.push({
          gannLevel: gann,
          planetaryLevel: planet,
          strength: Math.round(strength * 100) / 100
        })
      }
    }
  }

  return confluences.sort((a, b) => b.strength - a.strength)
}

// ============================================
// UTILIDADES
// ============================================

/**
 * Formatea precio para display
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price)
}

/**
 * Obtiene el nivel Gann más cercano a un precio dado
 */
export function getNearestGannLevel(
  price: number,
  levels: GannLevel[]
): GannLevel | null {
  if (levels.length === 0) return null

  return levels.reduce((nearest, current) => {
    const currentDiff = Math.abs(current.price - price)
    const nearestDiff = Math.abs(nearest.price - price)
    return currentDiff < nearestDiff ? current : nearest
  })
}

/**
 * Verifica si un precio está en un ángulo cardinal de Gann
 */
export function isAtCardinalAngle(price: number, basePrice: number, tolerance: number = 2): boolean {
  const angle = priceToGannAngle(price, basePrice)
  return GANN_CARDINAL_ANGLES.some(cardinal => Math.abs(angle - cardinal) <= tolerance)
}
