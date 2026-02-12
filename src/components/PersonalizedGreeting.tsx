'use client'

import { useEffect, useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'

interface GreetingProps {
  userName?: string
}

export default function PersonalizedGreeting({ userName }: GreetingProps) {
  const { t } = useLanguage()
  const [isLatinAmerica, setIsLatinAmerica] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Detect user region using browser's timezone
    const detectRegion = () => {
      try {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

        // Latin American timezones
        const latinTimezones = [
          'America/Mexico_City',
          'America/Buenos_Aires',
          'America/Bogota',
          'America/Lima',
          'America/Santiago',
          'America/Caracas',
          'America/Montevideo',
          'America/Asuncion',
          'America/La_Paz',
          'America/Tegucigalpa',
          'America/San_Salvador',
          'America/Managua',
          'America/Costa_Rica',
          'America/Panama',
          'America/Havana',
          'America/Santo_Domingo',
          'America/Guatemala',
          'America/Guayaquil',
        ]

        const isLatin = latinTimezones.some(tz => timezone.includes(tz.split('/')[1]))
        setIsLatinAmerica(isLatin)
      } catch (error) {
        // Default to Spanish if detection fails
        setIsLatinAmerica(true)
      } finally {
        setLoading(false)
      }
    }

    detectRegion()
  }, [])

  if (loading) {
    return <span className="text-terminal-muted">{t('greeting.welcome')}</span>
  }

  const greeting = isLatinAmerica ? '¡Hola' : 'Hello'
  const name = userName || 'Usuario'

  return (
    <span className="text-white">
      {greeting}, <span className="text-gold-500 font-semibold">{name}</span>!
    </span>
  )
}
