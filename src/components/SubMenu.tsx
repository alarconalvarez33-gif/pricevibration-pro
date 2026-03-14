'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const menuItems = [
  { href: '/quantum',  label: 'Calculadora' },
  { href: '/billing',  label: 'Planes' },
  { href: '/advanced', label: 'Resultados' },
  { href: '/cursos',   label: 'Cursos' },
]

export default function SubMenu() {
  const pathname = usePathname()

  return (
    <div className="bg-gradient-to-r from-[#0d1117] via-[#0a0a0a] to-[#0d1117] border-b border-[#c9a227]/10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-center gap-2 py-2 overflow-x-auto">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-5 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                pathname === item.href
                  ? 'bg-[#c9a227] text-black shadow-lg shadow-[#c9a227]/20'
                  : 'bg-[#1a1a2e]/50 text-gray-300 hover:bg-[#1a1a2e] hover:text-[#c9a227] border border-transparent hover:border-[#c9a227]/30'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
