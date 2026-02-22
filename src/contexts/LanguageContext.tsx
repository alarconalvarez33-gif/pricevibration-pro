'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react'

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
    'nav.contact': 'Contact',
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
    'calc.calculating': 'Calculating...',
    'calc.resistance': 'Resistance Levels',
    'calc.support': 'Support Levels',
    'calc.export': 'Download Excel',
    'calc.legalWarning.title': 'Important Legal Warning',
    'calc.legalWarning.personal': 'for personal and educational use only',
    'calc.legalWarning.personalText': 'The levels calculated by this tool are for',
    'calc.legalWarning.prohibited': '🚫 Strictly Prohibited:',
    'calc.legalWarning.resell': 'Resell or commercialize calculated levels',
    'calc.legalWarning.shareSignals': 'Share levels in trading signals groups',
    'calc.legalWarning.distributeExports': 'Distribute Excel/PDF exports commercially',
    'calc.legalWarning.derivedServices': 'Create derived services using these calculations',
    'calc.legalWarning.protectionTitle': '✅ Legal Protection:',
    'calc.legalWarning.watermark': 'All calculations include watermark with your email',
    'calc.legalWarning.traceable': 'Exports are traceable to your account',
    'calc.legalWarning.suspension': 'Violations may result in permanent suspension',
    'calc.legalWarning.legalAction': 'We reserve the right to take legal action',
    'calc.legalWarning.confirmText': 'By continuing, you confirm that you have read and accept these terms.',
    'calc.legalWarning.accept': 'I Accept the Terms',

    // Trial
    'trial.remaining': 'Free trial:',
    'trial.usesRemaining': 'uses remaining',
    'trial.subscribe': 'Subscribe for unlimited calculations',
    'trial.expired': 'Free Trial Ended',
    'trial.expiredMessage': 'You\'ve used all your free trial calculations. Subscribe to continue using the Gann Calculator and unlock unlimited calculations.',
    'trial.viewPlans': 'View Plans & Subscribe',

    // Footer
    'footer.legal': 'Important Legal Disclaimer',
    'footer.disclaimer': 'Sacred Levels is an educational tool for technical analysis purposes only. It does not constitute financial advice, trading signals, or investment recommendations. Trading financial instruments involves substantial risk of loss. Past performance does not guarantee future results. You are solely responsible for your trading decisions.',

    // Contact
    'contact.title': 'Contact Us',
    'contact.subtitle': 'Have questions? We\'d love to hear from you. Send us a message and we\'ll respond as soon as possible.',
    'contact.name': 'Name',
    'contact.namePlaceholder': 'Your full name',
    'contact.email': 'Email',
    'contact.emailPlaceholder': 'your@email.com',
    'contact.subject': 'Subject',
    'contact.subjectPlaceholder': 'What is this about?',
    'contact.message': 'Message',
    'contact.messagePlaceholder': 'Write your message here...',
    'contact.send': 'Send Message',
    'contact.sending': 'Sending...',
    'contact.successTitle': 'Message Sent!',
    'contact.successMessage': 'Thank you for contacting us. We\'ll get back to you as soon as possible.',
    'contact.sendAnother': 'Send Another Message',
    'contact.error': 'Error sending message. Please try again.',
    'contact.otherWays': 'Other Ways to Reach Us',
    'contact.responseTime': 'Response Time',
    'contact.responseTimeText': 'We typically respond within 24-48 hours',

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
    'nav.contact': 'Contacto',
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
    'calc.calculating': 'Calculando...',
    'calc.resistance': 'Niveles de Resistencia',
    'calc.support': 'Niveles de Soporte',
    'calc.export': 'Descargar Excel',
    'calc.legalWarning.title': 'Advertencia Legal Importante',
    'calc.legalWarning.personal': 'para uso personal y educativo únicamente',
    'calc.legalWarning.personalText': 'Los niveles calculados por esta herramienta son para',
    'calc.legalWarning.prohibited': '🚫 Está Estrictamente Prohibido:',
    'calc.legalWarning.resell': 'Revender o comercializar los niveles calculados',
    'calc.legalWarning.shareSignals': 'Compartir los niveles en grupos de señales de trading',
    'calc.legalWarning.distributeExports': 'Distribuir las exportaciones Excel/PDF comercialmente',
    'calc.legalWarning.derivedServices': 'Crear servicios derivados usando estos cálculos',
    'calc.legalWarning.protectionTitle': '✅ Protección Legal:',
    'calc.legalWarning.watermark': 'Todos los cálculos incluyen marca de agua con tu email',
    'calc.legalWarning.traceable': 'Las exportaciones son rastreables a tu cuenta',
    'calc.legalWarning.suspension': 'Violaciones pueden resultar en suspensión permanente',
    'calc.legalWarning.legalAction': 'Nos reservamos el derecho de tomar acciones legales',
    'calc.legalWarning.confirmText': 'Al continuar, confirmas que has leído y aceptas estos términos.',
    'calc.legalWarning.accept': 'Acepto los Términos',

    // Trial
    'trial.remaining': 'Prueba gratuita:',
    'trial.usesRemaining': 'usos restantes',
    'trial.subscribe': 'Suscríbete para cálculos ilimitados',
    'trial.expired': 'Prueba Gratuita Finalizada',
    'trial.expiredMessage': 'Has usado todos tus cálculos de prueba gratuitos. Suscríbete para continuar usando la Calculadora Gann y desbloquear cálculos ilimitados.',
    'trial.viewPlans': 'Ver Planes y Suscribirse',

    // Footer
    'footer.legal': 'Advertencia Legal Importante',
    'footer.disclaimer': 'Sacred Levels es una herramienta educativa solo para análisis técnico. No constituye asesoramiento financiero, señales de trading ni recomendaciones de inversión. Operar instrumentos financieros implica un riesgo sustancial de pérdida. El rendimiento pasado no garantiza resultados futuros. Usted es el único responsable de sus decisiones de trading.',

    // Contact
    'contact.title': 'Contáctanos',
    'contact.subtitle': '¿Tienes preguntas? Nos encantaría saber de ti. Envíanos un mensaje y te responderemos lo antes posible.',
    'contact.name': 'Nombre',
    'contact.namePlaceholder': 'Tu nombre completo',
    'contact.email': 'Correo',
    'contact.emailPlaceholder': 'tu@correo.com',
    'contact.subject': 'Asunto',
    'contact.subjectPlaceholder': '¿De qué se trata?',
    'contact.message': 'Mensaje',
    'contact.messagePlaceholder': 'Escribe tu mensaje aquí...',
    'contact.send': 'Enviar Mensaje',
    'contact.sending': 'Enviando...',
    'contact.successTitle': '¡Mensaje Enviado!',
    'contact.successMessage': 'Gracias por contactarnos. Te responderemos lo antes posible.',
    'contact.sendAnother': 'Enviar Otro Mensaje',
    'contact.error': 'Error al enviar el mensaje. Por favor, inténtalo de nuevo.',
    'contact.otherWays': 'Otras Formas de Contactarnos',
    'contact.responseTime': 'Tiempo de Respuesta',
    'contact.responseTimeText': 'Normalmente respondemos en 24-48 horas',

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
  const [language, setLanguageState] = useState<Language>('es')

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

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang)
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', lang)
    }
  }, [])

  const t = useCallback((key: string): string => {
    return translations[language][key] || key
  }, [language])

  const value = useMemo(() => ({
    language,
    setLanguage,
    t
  }), [language, setLanguage, t])

  return (
    <LanguageContext.Provider value={value}>
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
