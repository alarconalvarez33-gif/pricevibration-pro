'use client'

import Image from 'next/image'
import { useDomain } from '@/hooks/useDomain'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export default function Logo({ size = 'md', className = '' }: LogoProps) {
  const { logoSrc } = useDomain()

  const heights: Record<string, string> = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-14',
    xl: 'h-20',
  }

  return (
    <div className={`flex items-center ${className}`}>
      <Image
        src={logoSrc}
        alt="Logo"
        width={200}
        height={60}
        className={`${heights[size]} w-auto object-contain`}
        priority
      />
    </div>
  )
}

// Logo solo icono para favicon (mantiene compatibilidad)
export function LogoIcon({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="faviconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f0b90b" />
          <stop offset="100%" stopColor="#d4a00a" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="46" stroke="#f0b90b" strokeWidth="3" fill="#0a0a0f" />
      <circle cx="50" cy="50" r="20" fill="url(#faviconGradient)" />
      <text x="50" y="56" textAnchor="middle" fill="#0a0a0f" fontSize="16" fontWeight="bold" fontFamily="monospace">
        TMT
      </text>
    </svg>
  )
}
