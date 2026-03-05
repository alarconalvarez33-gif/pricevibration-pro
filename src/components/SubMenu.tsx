'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

const menuItems = [
  {
    title: 'Educación',
    submenu: [
      { name: '¿Qué es Forex?', href: '/educacion/que-es-forex' },
      { name: 'Acciones',       href: '/educacion/acciones' },
      { name: 'Commodities',    href: '/educacion/commodities' },
      { name: 'Divisas',        href: '/educacion/divisas' },
    ],
  },
  {
    title: 'Brokers',
    submenu: [
      { name: 'Brokers Confiables',      href: '/brokers' },
      { name: 'Fondeo vs Capital Propio', href: '/educacion/fondeo-vs-capital' },
    ],
  },
  {
    title: 'Recursos',
    submenu: [
      { name: 'Descargas',        href: '/recursos/descargas' },
      { name: 'Material Gratuito', href: '/recursos/material-gratuito' },
    ],
  },
]

export default function SubMenu() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  // Cerrar al hacer click afuera
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpenIndex(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="bg-[#080c14] border-b border-white/5" ref={ref}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-center gap-0.5 py-1 overflow-x-auto">
          {menuItems.map((item, i) => {
            const isOpen = openIndex === i
            return (
              <div key={item.title} className="relative">
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className={`flex items-center gap-1.5 px-5 py-2 text-xs font-semibold tracking-wide uppercase transition-all rounded-md whitespace-nowrap ${
                    isOpen
                      ? 'text-[#c9a227] bg-[#c9a227]/10'
                      : 'text-gray-500 hover:text-gray-200 hover:bg-white/5'
                  }`}
                >
                  {item.title}
                  <svg
                    className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#c9a227]' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown */}
                {isOpen && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 min-w-[190px] bg-[#0f1623] border border-white/10 rounded-xl shadow-2xl shadow-black/70 z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="py-1">
                      {item.submenu.map((sub) => (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          onClick={() => setOpenIndex(null)}
                          className="block px-4 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-[#c9a227]/10 transition-colors border-b border-white/5 last:border-0"
                        >
                          {sub.name}
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
