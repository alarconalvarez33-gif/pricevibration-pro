'use client'

import Link from 'next/link'

const menuItems = [
  {
    title: '📚 Educación',
    submenu: [
      { name: '¿Qué es Forex?', href: '/educacion/que-es-forex' },
      { name: 'Acciones', href: '/educacion/acciones' },
      { name: 'Commodities', href: '/educacion/commodities' },
      { name: 'Divisas', href: '/educacion/divisas' },
    ],
  },
  {
    title: '💼 Brokers',
    submenu: [
      { name: 'Brokers Confiables', href: '/brokers' },
      { name: 'Fondeo vs Capital Propio', href: '/educacion/fondeo-vs-capital' },
    ],
  },
  {
    title: '📥 Recursos',
    submenu: [
      { name: 'Descargas', href: '/recursos/descargas' },
      { name: 'Material Gratuito', href: '/recursos/material-gratuito' },
    ],
  },
]

export default function SubMenu() {
  return (
    <div className="bg-[#0d1117]/90 border-b border-gray-800/60 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-center gap-1 py-1.5 overflow-x-auto scrollbar-hide">
          {menuItems.map((item) => (
            <div key={item.title} className="relative group">
              <button className="flex items-center gap-1 px-4 py-1.5 text-gray-400 hover:text-[#c9a227] text-xs font-medium transition-colors whitespace-nowrap rounded-lg hover:bg-white/5">
                {item.title}
                <svg className="w-3 h-3 transition-transform group-hover:rotate-180 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown */}
              <div className="absolute top-full left-0 mt-1 w-52 bg-[#1a1a2e] border border-[#c9a227]/20 rounded-xl shadow-2xl shadow-black/60 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
                <div className="py-1.5">
                  {item.submenu.map((sub) => (
                    <Link
                      key={sub.href}
                      href={sub.href}
                      className="block px-4 py-2 text-gray-300 hover:bg-[#c9a227]/10 hover:text-[#c9a227] text-sm transition-colors"
                    >
                      {sub.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
