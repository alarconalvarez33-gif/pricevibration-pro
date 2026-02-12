'use client'

import { useLanguage } from '@/contexts/LanguageContext'

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage()

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setLanguage('en')}
        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
          language === 'en'
            ? 'bg-gold-500 text-black'
            : 'text-terminal-muted hover:text-gold-500'
        }`}
        title="English"
      >
        🇬🇧 EN
      </button>
      <button
        onClick={() => setLanguage('es')}
        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
          language === 'es'
            ? 'bg-gold-500 text-black'
            : 'text-terminal-muted hover:text-gold-500'
        }`}
        title="Español"
      >
        🇪🇸 ES
      </button>
    </div>
  )
}
