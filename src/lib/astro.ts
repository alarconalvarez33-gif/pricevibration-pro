// Astronomical calculations for planetary positions
// Using simplified VSOP87-based calculations

export interface Planet {
  name: string
  symbol: string
  color: string
  longitude: number // degrees 0-360
  sign: string
  degree: number // degree within sign 0-30
}

export interface Aspect {
  planet1: string
  planet2: string
  type: AspectType
  angle: number
  orb: number
  exact: boolean
  date?: Date
}

export type AspectType = 'conjunction' | 'opposition' | 'square' | 'trine' | 'sextile'

export const ASPECT_ANGLES: Record<AspectType, number> = {
  conjunction: 0,
  sextile: 60,
  square: 90,
  trine: 120,
  opposition: 180
}

export const ASPECT_ORBS: Record<AspectType, number> = {
  conjunction: 8,
  sextile: 6,
  square: 8,
  trine: 8,
  opposition: 8
}

export const ASPECT_SYMBOLS: Record<AspectType, string> = {
  conjunction: '☌',
  sextile: '⚹',
  square: '□',
  trine: '△',
  opposition: '☍'
}

export const ZODIAC_SIGNS = [
  { name: 'Aries', symbol: '♈', element: 'fire' },
  { name: 'Taurus', symbol: '♉', element: 'earth' },
  { name: 'Gemini', symbol: '♊', element: 'air' },
  { name: 'Cancer', symbol: '♋', element: 'water' },
  { name: 'Leo', symbol: '♌', element: 'fire' },
  { name: 'Virgo', symbol: '♍', element: 'earth' },
  { name: 'Libra', symbol: '♎', element: 'air' },
  { name: 'Scorpio', symbol: '♏', element: 'water' },
  { name: 'Sagittarius', symbol: '♐', element: 'fire' },
  { name: 'Capricorn', symbol: '♑', element: 'earth' },
  { name: 'Aquarius', symbol: '♒', element: 'air' },
  { name: 'Pisces', symbol: '♓', element: 'water' },
]

// Orbital elements for planets (simplified)
const PLANET_DATA = {
  sun: { symbol: '☉', color: '#FFD700', period: 365.25, offset: 280.46 },
  moon: { symbol: '☽', color: '#C0C0C0', period: 27.32, offset: 218.32 },
  mercury: { symbol: '☿', color: '#B5B5B5', period: 87.97, offset: 252.25 },
  venus: { symbol: '♀', color: '#FFC0CB', period: 224.7, offset: 181.98 },
  mars: { symbol: '♂', color: '#FF4500', period: 686.98, offset: 355.45 },
  jupiter: { symbol: '♃', color: '#FFA500', period: 4332.59, offset: 34.35 },
  saturn: { symbol: '♄', color: '#DAA520', period: 10759.22, offset: 50.08 },
}

// Calculate Julian Date
function getJulianDate(date: Date): number {
  const y = date.getUTCFullYear()
  const m = date.getUTCMonth() + 1
  const d = date.getUTCDate() + date.getUTCHours() / 24 + date.getUTCMinutes() / 1440

  let year = y
  let month = m

  if (m <= 2) {
    year -= 1
    month += 12
  }

  const A = Math.floor(year / 100)
  const B = 2 - A + Math.floor(A / 4)

  return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + d + B - 1524.5
}

// Calculate days since J2000.0 epoch
function getDaysSinceJ2000(date: Date): number {
  const jd = getJulianDate(date)
  return jd - 2451545.0 // J2000.0 epoch
}

// Normalize angle to 0-360
function normalizeAngle(angle: number): number {
  let normalized = angle % 360
  if (normalized < 0) normalized += 360
  return normalized
}

// Get zodiac sign from longitude
function getZodiacSign(longitude: number): { sign: string; degree: number } {
  const signIndex = Math.floor(longitude / 30)
  const degree = longitude % 30
  return {
    sign: ZODIAC_SIGNS[signIndex].name,
    degree: Math.round(degree * 100) / 100
  }
}

// Calculate planetary longitude (simplified)
function calculatePlanetLongitude(planetKey: string, date: Date): number {
  const planet = PLANET_DATA[planetKey as keyof typeof PLANET_DATA]
  const days = getDaysSinceJ2000(date)

  // Mean longitude calculation (simplified)
  let longitude = planet.offset + (360 / planet.period) * days

  // Add perturbations for more accuracy (simplified)
  if (planetKey === 'moon') {
    // Moon has significant perturbations
    const sunLong = calculatePlanetLongitude('sun', date)
    longitude += 6.29 * Math.sin((longitude - sunLong) * Math.PI / 180)
  }

  return normalizeAngle(longitude)
}

// Get current planetary positions
export function getPlanetaryPositions(date: Date = new Date()): Planet[] {
  const planets: Planet[] = []

  for (const [key, data] of Object.entries(PLANET_DATA)) {
    const longitude = calculatePlanetLongitude(key, date)
    const { sign, degree } = getZodiacSign(longitude)

    planets.push({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      symbol: data.symbol,
      color: data.color,
      longitude: Math.round(longitude * 100) / 100,
      sign,
      degree
    })
  }

  return planets
}

// Calculate aspects between planets
export function calculateAspects(planets: Planet[], orb: number = 8): Aspect[] {
  const aspects: Aspect[] = []

  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const p1 = planets[i]
      const p2 = planets[j]

      let diff = Math.abs(p1.longitude - p2.longitude)
      if (diff > 180) diff = 360 - diff

      for (const [aspectType, targetAngle] of Object.entries(ASPECT_ANGLES)) {
        const aspectOrb = ASPECT_ORBS[aspectType as AspectType]
        const deviation = Math.abs(diff - targetAngle)

        if (deviation <= aspectOrb) {
          aspects.push({
            planet1: p1.name,
            planet2: p2.name,
            type: aspectType as AspectType,
            angle: Math.round(diff * 100) / 100,
            orb: Math.round(deviation * 100) / 100,
            exact: deviation < 1
          })
        }
      }
    }
  }

  return aspects.sort((a, b) => a.orb - b.orb)
}

// Find upcoming aspects
export function findUpcomingAspects(days: number = 30): Aspect[] {
  const aspects: Aspect[] = []
  const now = new Date()

  // Check each day for the next N days
  for (let d = 0; d < days; d++) {
    const checkDate = new Date(now.getTime() + d * 24 * 60 * 60 * 1000)
    const planets = getPlanetaryPositions(checkDate)
    const dayAspects = calculateAspects(planets)

    for (const aspect of dayAspects) {
      if (aspect.exact) {
        aspect.date = checkDate
        // Avoid duplicates
        const exists = aspects.some(a =>
          a.planet1 === aspect.planet1 &&
          a.planet2 === aspect.planet2 &&
          a.type === aspect.type
        )
        if (!exists) {
          aspects.push(aspect)
        }
      }
    }
  }

  return aspects.sort((a, b) => (a.date?.getTime() || 0) - (b.date?.getTime() || 0))
}

// Correlate aspects with Gann levels
export interface GannAstroCorrelation {
  aspect: Aspect
  gannLevel: number
  type: 'resistance' | 'support'
  confluence: 'high' | 'medium' | 'low'
  description: string
}

export function correlateAspectsWithGann(
  aspects: Aspect[],
  centerPrice: number,
  resistances: number[],
  supports: number[]
): GannAstroCorrelation[] {
  const correlations: GannAstroCorrelation[] = []

  for (const aspect of aspects) {
    // Map aspect angles to price movements
    // Conjunction = neutral/reversal, Opposition = major reversal
    // Square = resistance/support test, Trine = continuation

    let targetLevel: number
    let type: 'resistance' | 'support'
    let confluence: 'high' | 'medium' | 'low'

    switch (aspect.type) {
      case 'conjunction':
        // Strong reversal point - check nearest levels
        targetLevel = aspect.planet1 === 'Sun' || aspect.planet1 === 'Moon'
          ? resistances[0] : supports[0]
        type = aspect.planet1 === 'Sun' ? 'resistance' : 'support'
        confluence = aspect.exact ? 'high' : 'medium'
        break

      case 'opposition':
        // Major reversal - R4 or S4 level
        targetLevel = resistances[3]
        type = 'resistance'
        confluence = 'high'
        break

      case 'square':
        // Tension - R2/S2 levels
        targetLevel = Math.random() > 0.5 ? resistances[1] : supports[1]
        type = targetLevel > centerPrice ? 'resistance' : 'support'
        confluence = 'medium'
        break

      case 'trine':
        // Harmonious flow - continuation
        targetLevel = resistances[2]
        type = 'resistance'
        confluence = 'medium'
        break

      case 'sextile':
        // Opportunity - minor levels
        targetLevel = supports[0]
        type = 'support'
        confluence = 'low'
        break

      default:
        continue
    }

    correlations.push({
      aspect,
      gannLevel: targetLevel,
      type,
      confluence,
      description: `${aspect.planet1} ${ASPECT_SYMBOLS[aspect.type]} ${aspect.planet2} suggests ${type} at $${targetLevel.toFixed(2)}`
    })
  }

  return correlations
}

// Get aspect significance for trading
export function getAspectSignificance(aspect: Aspect): {
  impact: 'major' | 'moderate' | 'minor'
  direction: 'bullish' | 'bearish' | 'neutral'
  description: string
} {
  const majorPlanets = ['Sun', 'Moon', 'Jupiter', 'Saturn']
  const isMajor = majorPlanets.includes(aspect.planet1) && majorPlanets.includes(aspect.planet2)

  let impact: 'major' | 'moderate' | 'minor' = 'minor'
  let direction: 'bullish' | 'bearish' | 'neutral' = 'neutral'
  let description = ''

  if (isMajor) {
    impact = aspect.exact ? 'major' : 'moderate'
  } else {
    impact = aspect.exact ? 'moderate' : 'minor'
  }

  switch (aspect.type) {
    case 'conjunction':
      direction = 'neutral'
      description = 'New cycle beginning - watch for trend change'
      break
    case 'opposition':
      direction = 'bearish'
      description = 'Maximum tension - expect volatility'
      break
    case 'square':
      direction = 'bearish'
      description = 'Challenge point - resistance likely'
      break
    case 'trine':
      direction = 'bullish'
      description = 'Harmonious flow - trend continuation'
      break
    case 'sextile':
      direction = 'bullish'
      description = 'Opportunity window - minor support'
      break
  }

  return { impact, direction, description }
}
