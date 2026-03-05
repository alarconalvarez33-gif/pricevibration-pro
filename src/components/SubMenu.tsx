'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

const menuItems = [
  {
    id: 'educacion',
    title: 'EDUCACIÓN',
    icon: '📚',
    submenu: [
      { name: '¿Qué es Forex?',    href: '/educacion/que-es-forex',       icon: '💱' },
      { name: 'Acciones',           href: '/educacion/acciones',           icon: '📈' },
      { name: 'Commodities',        href: '/educacion/commodities',        icon: '🥇' },
      { name: 'Divisas',            href: '/educacion/divisas',            icon: '💵' },
      { name: 'Fondeo vs Capital',  href: '/educacion/fondeo-vs-capital',  icon: '💼' },
    ],
  },
  {
    id: 'brokers',
    title: 'BROKERS',
    icon: '🏦',
    submenu: [
      { name: 'Brokers Confiables', href: '/brokers', icon: '✅' },
    ],
  },
  {
    id: 'recursos',
    title: 'RECURSOS',
    icon: '📥',
    submenu: [
      { name: 'Descargas',        href: '/recursos/descargas',        icon: '⬇️' },
      { name: 'Material Gratuito', href: '/recursos/material-gratuito', icon: '🎁' },
    ],
  },
]

export default function SubMenu() {
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div
      ref={menuRef}
      className="bg-gradient-to-r from-[#0d1117] via-[#0a0a0a] to-[#0d1117] border-b border-[#c9a227]/10"
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-center gap-2 py-3">
          {menuItems.map((item) => {
            const isOpen = openMenu === item.id
            return (
              <div key={item.id} className="relative">
                <button
                  onClick={() => setOpenMenu(isOpen ? null : item.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    isOpen
                      ? 'bg-[#c9a227] text-black shadow-lg shadow-[#c9a227]/20'
                      : 'bg-[#1a1a2e]/50 text-gray-300 hover:bg-[#1a1a2e] hover:text-[#c9a227] border border-transparent hover:border-[#c9a227]/30'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.title}</span>
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isOpen && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 bg-gradient-to-br from-[#1a1a2e] to-[#0d0d0d] border border-[#c9a227]/30 rounded-xl shadow-2xl shadow-black/50 z-50 overflow-hidden animate-submenu">
                    <div className="py-2">
                      {item.submenu.map((sub) => (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          onClick={() => setOpenMenu(null)}
                          className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-[#c9a227]/10 hover:text-[#c9a227] transition-colors border-b border-gray-800/50 last:border-0"
                        >
                          <span className="text-lg w-6 text-center">{sub.icon}</span>
                          <span className="font-medium text-sm">{sub.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
