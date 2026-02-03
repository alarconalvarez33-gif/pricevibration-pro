'use client'

import { useState, useEffect, useMemo } from 'react'

// ============================================
// TIPOS
// ============================================

export interface PlanetPosition {
  name: string
  symbol: string
  degree: number // 0-360 heliocéntrico
  sign: string
  signSymbol: string
  degreeInSign: number // 0-30 dentro del signo
  color: string
  orbitDays: number
  distanceAU: number
}

export interface Aspect {
  planet1: string
  planet2: string
  type: AspectType
  angle: number
  orb: number
  isExact: boolean
  isApplying: boolean
  influence: 'major' | 'minor'
}

export type AspectType = 'conjunction' | 'sextile' | 'square' | 'trine' | 'opposition'

export interface GannPlanetaryLevel {
  planet: string
  degree: number
  price: number
  type: 'support' | 'resistance'
  strength: number
}

export interface UserLocation {
  latitude: number
  longitude: number
  timezone: string
  city: string
}

// ============================================
// CONSTANTES
// ============================================

export const ZODIAC_SIGNS = [
  { name: 'Aries', symbol: '♈', element: 'fire', start: 0 },
  { name: 'Taurus', symbol: '♉', element: 'earth', start: 30 },
  { name: 'Gemini', symbol: '♊', element: 'air', start: 60 },
  { name: 'Cancer', symbol: '♋', element: 'water', start: 90 },
  { name: 'Leo', symbol: '♌', element: 'fire', start: 120 },
  { name: 'Virgo', symbol: '♍', element: 'earth', start: 150 },
  { name: 'Libra', symbol: '♎', element: 'air', start: 180 },
  { name: 'Scorpio', symbol: '♏', element: 'water', start: 210 },
  { name: 'Sagittarius', symbol: '♐', element: 'fire', start: 240 },
  { name: 'Capricorn', symbol: '♑', element: 'earth', start: 270 },
  { name: 'Aquarius', symbol: '♒', element: 'air', start: 300 },
  { name: 'Pisces', symbol: '♓', element: 'water', start: 330 },
]

export const ASPECT_CONFIG = {
  conjunction: { angle: 0, orb: 8, symbol: '☌', influence: 'major' as const },
  sextile: { angle: 60, orb: 6, symbol: '⚹', influence: 'minor' as const },
  square: { angle: 90, orb: 8, symbol: '□', influence: 'major' as const },
  trine: { angle: 120, orb: 8, symbol: '△', influence: 'major' as const },
  opposition: { angle: 180, orb: 8, symbol: '☍', influence: 'major' as const },
}

export const GANN_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315]

// Datos orbitales heliocéntricos (simplificados)
// En producción usar swisseph o API de efemérides
const PLANET_DATA = {
  mercury: {
    name: 'Mercury',
    symbol: '☿',
    color: '#B5B5B5',
    orbitDays: 87.97,
    distanceAU: 0.387,
    meanLongJ2000: 252.25,
    dailyMotion: 4.0923
  },
  venus: {
    name: 'Venus',
    symbol: '♀',
    color: '#FFC0CB',
    orbitDays: 224.7,
    distanceAU: 0.723,
    meanLongJ2000: 181.98,
    dailyMotion: 1.6021
  },
  earth: {
    name: 'Earth',
    symbol: '⊕',
    color: '#4169E1',
    orbitDays: 365.25,
    distanceAU: 1.0,
    meanLongJ2000: 100.46,
    dailyMotion: 0.9856
  },
  mars: {
    name: 'Mars',
    symbol: '♂',
    color: '#FF4500',
    orbitDays: 686.98,
    distanceAU: 1.524,
    meanLongJ2000: 355.45,
    dailyMotion: 0.5240
  },
  jupiter: {
    name: 'Jupiter',
    symbol: '♃',
    color: '#FFA500',
    orbitDays: 4332.59,
    distanceAU: 5.203,
    meanLongJ2000: 34.35,
    dailyMotion: 0.0831
  },
  saturn: {
    name: 'Saturn',
    symbol: '♄',
    color: '#DAA520',
    orbitDays: 10759.22,
    distanceAU: 9.537,
    meanLongJ2000: 50.08,
    dailyMotion: 0.0335
  },
  uranus: {
    name: 'Uranus',
    symbol: '♅',
    color: '#40E0D0',
    orbitDays: 30688.5,
    distanceAU: 19.19,
    meanLongJ2000: 314.06,
    dailyMotion: 0.0117
  },
  neptune: {
    name: 'Neptune',
    symbol: '♆',
    color: '#4169E1',
    orbitDays: 60182,
    distanceAU: 30.07,
    meanLongJ2000: 304.35,
    dailyMotion: 0.0060
  },
  pluto: {
    name: 'Pluto',
    symbol: '♇',
    color: '#8B4513',
    orbitDays: 90560,
    distanceAU: 39.48,
    meanLongJ2000: 238.96,
    dailyMotion: 0.0040
  },
}

// ============================================
// FUNCIONES DE CÁLCULO
// ============================================

function getJulianDate(date: Date): number {
  const y = date.getUTCFullYear()
  const m = date.getUTCMonth() + 1
  const d = date.getUTCDate() + date.getUTCHours() / 24

  let year = y, month = m
  if (m <= 2) { year--; month += 12 }

  const A = Math.floor(year / 100)
  const B = 2 - A + Math.floor(A / 4)

  return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + d + B - 1524.5
}

function getDaysSinceJ2000(date: Date): number {
  return getJulianDate(date) - 2451545.0
}

function normalizeAngle(angle: number): number {
  let norm = angle % 360
  return norm < 0 ? norm + 360 : norm
}

function getZodiacSign(longitude: number): { sign: string, symbol: string, degree: number } {
  const normalized = normalizeAngle(longitude)
  const signIndex = Math.floor(normalized / 30)
  const degree = normalized % 30

  return {
    sign: ZODIAC_SIGNS[signIndex].name,
    symbol: ZODIAC_SIGNS[signIndex].symbol,
    degree: Math.round(degree * 100) / 100
  }
}

// Calcula posición heliocéntrica (vista desde el Sol)
function calculateHeliocentricPosition(
  planetKey: string,
  date: Date
): number {
  const planet = PLANET_DATA[planetKey as keyof typeof PLANET_DATA]
  if (!planet) return 0

  const days = getDaysSinceJ2000(date)
  const longitude = planet.meanLongJ2000 + (planet.dailyMotion * days)

  return normalizeAngle(longitude)
}

// ============================================
// API PRINCIPAL
// ============================================

export function getPlanetaryPositions(
  date: Date = new Date(),
  heliocentric: boolean = true
): PlanetPosition[] {
  const planets: PlanetPosition[] = []

  // Excluir la Tierra en vista heliocéntrica (estamos "en el Sol")
  const planetKeys = Object.keys(PLANET_DATA).filter(k =>
    heliocentric ? k !== 'earth' : true
  )

  for (const key of planetKeys) {
    const data = PLANET_DATA[key as keyof typeof PLANET_DATA]
    const longitude = calculateHeliocentricPosition(key, date)
    const zodiac = getZodiacSign(longitude)

    planets.push({
      name: data.name,
      symbol: data.symbol,
      degree: Math.round(longitude * 100) / 100,
      sign: zodiac.sign,
      signSymbol: zodiac.symbol,
      degreeInSign: zodiac.degree,
      color: data.color,
      orbitDays: data.orbitDays,
      distanceAU: data.distanceAU
    })
  }

  return planets.sort((a, b) => a.distanceAU - b.distanceAU)
}

export function calculateAspects(planets: PlanetPosition[]): Aspect[] {
  const aspects: Aspect[] = []

  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const p1 = planets[i]
      const p2 = planets[j]

      let diff = Math.abs(p1.degree - p2.degree)
      if (diff > 180) diff = 360 - diff

      for (const [aspectType, config] of Object.entries(ASPECT_CONFIG)) {
        const orb = Math.abs(diff - config.angle)

        if (orb <= config.orb) {
          aspects.push({
            planet1: p1.name,
            planet2: p2.name,
            type: aspectType as AspectType,
            angle: Math.round(diff * 100) / 100,
            orb: Math.round(orb * 100) / 100,
            isExact: orb < 1,
            isApplying: p1.degree < p2.degree, // Simplificado
            influence: config.influence
          })
        }
      }
    }
  }

  return aspects.sort((a, b) => a.orb - b.orb)
}

// Conversión: 1 grado planetario = nivel de precio
export function degreeToGannPrice(
  degree: number,
  basePrice: number
): number {
  const baseSqrt = Math.sqrt(basePrice)
  const increment = (degree / 360) * 2 // 360° = 2 unidades de sqrt
  const newSqrt = baseSqrt + increment
  return Math.round(Math.pow(newSqrt, 2) * 100) / 100
}

export function calculatePlanetaryGannLevels(
  planets: PlanetPosition[],
  basePrice: number
): GannPlanetaryLevel[] {
  const levels: GannPlanetaryLevel[] = []

  for (const planet of planets) {
    const price = degreeToGannPrice(planet.degree, basePrice)

    // Determinar si es soporte o resistencia basado en el grado
    const isResistance = planet.degree > 180

    levels.push({
      planet: planet.name,
      degree: planet.degree,
      price,
      type: isResistance ? 'resistance' : 'support',
      strength: planet.distanceAU < 5 ? 1 : 0.5 // Planetas internos más fuertes
    })
  }

  return levels.sort((a, b) => b.price - a.price)
}

// Encontrar confluencias entre aspectos y niveles Gann
export function findAspectGannConfluence(
  aspects: Aspect[],
  basePrice: number,
  tolerance: number = 2
): Array<{
  aspect: Aspect
  gannAngle: number
  price: number
  strength: 'high' | 'medium' | 'low'
}> {
  const confluences: Array<{
    aspect: Aspect
    gannAngle: number
    price: number
    strength: 'high' | 'medium' | 'low'
  }> = []

  for (const aspect of aspects) {
    for (const gannAngle of GANN_ANGLES) {
      const diff = Math.abs(aspect.angle - gannAngle)

      if (diff <= tolerance || Math.abs(diff - 180) <= tolerance) {
        const price = degreeToGannPrice(aspect.angle, basePrice)
        const strength = aspect.isExact ? 'high' : aspect.orb < 3 ? 'medium' : 'low'

        confluences.push({
          aspect,
          gannAngle,
          price,
          strength
        })
      }
    }
  }

  return confluences
}

// ============================================
// HOOK PRINCIPAL
// ============================================

export function useAstrology(
  basePrice: number | null = null,
  userLocation: UserLocation | null = null
) {
  const [currentDate, setCurrentDate] = useState(new Date())

  // Actualizar fecha cada minuto
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDate(new Date())
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  const planets = useMemo(() =>
    getPlanetaryPositions(currentDate, true),
    [currentDate]
  )

  const aspects = useMemo(() =>
    calculateAspects(planets),
    [planets]
  )

  const majorAspects = useMemo(() =>
    aspects.filter(a => a.influence === 'major'),
    [aspects]
  )

  const exactAspects = useMemo(() =>
    aspects.filter(a => a.isExact),
    [aspects]
  )

  const planetaryLevels = useMemo(() =>
    basePrice ? calculatePlanetaryGannLevels(planets, basePrice) : [],
    [planets, basePrice]
  )

  const confluences = useMemo(() =>
    basePrice ? findAspectGannConfluence(aspects, basePrice) : [],
    [aspects, basePrice]
  )

  // Calcular hora local y UTC
  const times = useMemo(() => {
    const utc = currentDate.toISOString().slice(11, 16)
    const local = currentDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: userLocation?.timezone || 'America/Asuncion'
    })

    return { utc, local, timezone: userLocation?.timezone || 'UTC-3' }
  }, [currentDate, userLocation])

  return {
    planets,
    aspects,
    majorAspects,
    exactAspects,
    planetaryLevels,
    confluences,
    currentDate,
    times,
    // Funciones expuestas
    calculateAspects,
    degreeToGannPrice,
    getPlanetaryPositions,
  }
}

export default useAstrology
