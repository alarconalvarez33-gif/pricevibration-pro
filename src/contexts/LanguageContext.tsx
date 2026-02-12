'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Language = 'en' | 'es'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// Translations
const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navbar
    'nav.home': 'Home',
    'nav.dashboard': 'Dashboard',
    'nav.pricing': 'Pricing',
    'nav.guide': 'Guide',
    'nav.login': 'Login',
    'nav.register': 'Sign Up',
    'nav.settings': 'Settings',
    'nav.logout': 'Logout',

    // Hero
    'hero.title1': 'Professional Trading Analysis',
    'hero.title2': 'Based on W.D. Gann Methodology',
    'hero.subtitle': 'Advanced mathematical calculations and planetary cycle analysis for institutional-grade market insights. Trusted by professional traders worldwide.',
    'hero.cta.start': 'Start Free Trial',
    'hero.cta.pricing': 'View Plans',
    'hero.secure': 'Secure Payments',
    'hero.educational': 'Educational Platform',
    'hero.countries': 'Countries',

    // Stats
    'stats.accuracy': 'Analysis Accuracy',
    'stats.users': 'Active Users',
    'stats.countries': 'Countries',

    // Greetings
    'greeting.hello': 'Hello',
    'greeting.welcome': 'Welcome back',

    // Dashboard
    'dashboard.title': 'TMT Dashboard',
    'dashboard.welcome': 'Welcome back',
    'dashboard.calculator': 'Gann Calculator',
    'dashboard.astro': 'Astro-Gann',
    'dashboard.chart': 'Live Chart',
    'dashboard.calendar': 'Calendar',

    // Calculator
    'calc.title': 'Gann Square Calculator',
    'calc.centerPrice': 'Center Price',
    'calc.placeholder': 'Enter the price of a minimum or maximum',
    'calc.increment': 'Increment Level',
    'calc.calculate': 'Calculate Levels',
    'calc.resistance': 'Resistance Levels',
    'calc.support': 'Support Levels',
    'calc.export': 'Download Excel',

    // Footer
    'footer.legal': 'Important Legal Disclaimer',
    'footer.disclaimer': 'Sacred Levels is an educational tool for technical analysis purposes only. It does not constitute financial advice, trading signals, or investment recommendations. Trading financial instruments involves substantial risk of loss. Past performance does not guarantee future results. You are solely responsible for your trading decisions.',

    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.close': 'Close',
    'common.accept': 'Accept',
    'common.cancel': 'Cancel',
  },
  es: {
    // Navbar
    'nav.home': 'Inicio',
    'nav.dashboard': 'Panel',
    'nav.pricing': 'Precios',
    'nav.guide': 'Guía',
    'nav.login': 'Iniciar Sesión',
    'nav.register': 'Registrarse',
    'nav.settings': 'Configuración',
    'nav.logout': 'Cerrar Sesión',

    // Hero
    'hero.title1': 'Análisis Profesional de Trading',
    'hero.title2': 'Basado en la Metodología de W.D. Gann',
    'hero.subtitle': 'Cálculos matemáticos avanzados y análisis de ciclos planetarios para insights de mercado de nivel institucional. Confiado por traders profesionales en todo el mundo.',
    'hero.cta.start': 'Comenzar Prueba Gratis',
    'hero.cta.pricing': 'Ver Planes',
    'hero.secure': 'Pagos Seguros',
    'hero.educational': 'Plataforma Educativa',
    'hero.countries': 'Países',

    // Stats
    'stats.accuracy': 'Precisión de Análisis',
    'stats.users': 'Usuarios Activos',
    'stats.countries': 'Países',

    // Greetings
    'greeting.hello': 'Hola',
    'greeting.welcome': 'Bienvenido de nuevo',

    // Dashboard
    'dashboard.title': 'Panel TMT',
    'dashboard.welcome': 'Bienvenido de nuevo',
    'dashboard.calculator': 'Calculadora Gann',
    'dashboard.astro': 'Astro-Gann',
    'dashboard.chart': 'Gráfico en Vivo',
    'dashboard.calendar': 'Calendario',

    // Calculator
    'calc.title': 'Calculadora Cuadrado de Gann',
    'calc.centerPrice': 'Precio Central',
    'calc.placeholder': 'Coloca aquí el precio de un mínimo o máximo',
    'calc.increment': 'Nivel de Incremento',
    'calc.calculate': 'Calcular Niveles',
    'calc.resistance': 'Niveles de Resistencia',
    'calc.support': 'Niveles de Soporte',
    'calc.export': 'Descargar Excel',

    // Footer
    'footer.legal': 'Advertencia Legal Importante',
    'footer.disclaimer': 'Sacred Levels es una herramienta educativa solo para análisis técnico. No constituye asesoramiento financiero, señales de trading ni recomendaciones de inversión. Operar instrumentos financieros implica un riesgo sustancial de pérdida. El rendimiento pasado no garantiza resultados futuros. Usted es el único responsable de sus decisiones de trading.',

    // Common
    'common.loading': 'Cargando...',
    'common.error': 'Error',
    'common.success': 'Éxito',
    'common.close': 'Cerrar',
    'common.accept': 'Aceptar',
    'common.cancel': 'Cancelar',
  },
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en')

  // Initialize language from localStorage or browser
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check localStorage first
      const saved = localStorage.getItem('language') as Language
      if (saved && (saved === 'en' || saved === 'es')) {
        setLanguageState(saved)
      } else {
        // Auto-detect from browser
        const browserLang = navigator.language.toLowerCase()
        if (browserLang.startsWith('es')) {
          setLanguageState('es')
        } else {
          setLanguageState('en')
        }
      }
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', lang)
    }
  }

  const t = (key: string): string => {
    return translations[language][key] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}
