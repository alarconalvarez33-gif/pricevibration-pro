'use client'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showText?: boolean
  className?: string
}

export default function Logo({ size = 'md', showText = true, className = '' }: LogoProps) {
  const sizes = {
    sm: { icon: 32, text: 'text-lg' },
    md: { icon: 40, text: 'text-xl' },
    lg: { icon: 56, text: 'text-2xl' },
    xl: { icon: 80, text: 'text-4xl' },
  }

  const { icon, text } = sizes[size]

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Logo SVG - TMT con elementos planetarios y trading */}
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        {/* Fondo circular con gradiente */}
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f0b90b" />
            <stop offset="50%" stopColor="#d4a00a" />
            <stop offset="100%" stopColor="#f0b90b" />
          </linearGradient>
          <linearGradient id="orbitGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00ff88" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#f0b90b" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#ff3e3e" stopOpacity="0.8" />
          </linearGradient>
        </defs>

        {/* Círculo exterior - órbita planetaria */}
        <circle
          cx="50"
          cy="50"
          r="46"
          stroke="url(#orbitGradient)"
          strokeWidth="2"
          fill="none"
        />

        {/* Órbitas internas */}
        <circle
          cx="50"
          cy="50"
          r="35"
          stroke="#f0b90b"
          strokeWidth="1"
          strokeOpacity="0.3"
          fill="none"
          strokeDasharray="4 4"
        />
        <circle
          cx="50"
          cy="50"
          r="24"
          stroke="#f0b90b"
          strokeWidth="1"
          strokeOpacity="0.2"
          fill="none"
        />

        {/* Cruz de Gann - ángulos cardinales */}
        <line x1="50" y1="8" x2="50" y2="92" stroke="#f0b90b" strokeWidth="1" strokeOpacity="0.3" />
        <line x1="8" y1="50" x2="92" y2="50" stroke="#f0b90b" strokeWidth="1" strokeOpacity="0.3" />

        {/* Diagonales de Gann */}
        <line x1="17" y1="17" x2="83" y2="83" stroke="#f0b90b" strokeWidth="1" strokeOpacity="0.2" />
        <line x1="83" y1="17" x2="17" y2="83" stroke="#f0b90b" strokeWidth="1" strokeOpacity="0.2" />

        {/* Planetas en órbita */}
        <circle cx="50" cy="8" r="4" fill="#00ff88" /> {/* Norte - soporte */}
        <circle cx="92" cy="50" r="4" fill="#f0b90b" /> {/* Este */}
        <circle cx="50" cy="92" r="4" fill="#ff3e3e" /> {/* Sur - resistencia */}
        <circle cx="8" cy="50" r="4" fill="#f0b90b" /> {/* Oeste */}

        {/* Centro - Sol */}
        <circle cx="50" cy="50" r="12" fill="url(#logoGradient)" />

        {/* TMT en el centro */}
        <text
          x="50"
          y="54"
          textAnchor="middle"
          fill="#0a0a0f"
          fontSize="10"
          fontWeight="bold"
          fontFamily="monospace"
        >
          TMT
        </text>

        {/* Candlestick estilizado pequeño */}
        <rect x="70" y="25" width="4" height="15" fill="#00ff88" rx="1" />
        <line x1="72" y1="22" x2="72" y2="43" stroke="#00ff88" strokeWidth="1" />

        <rect x="26" y="60" width="4" height="15" fill="#ff3e3e" rx="1" />
        <line x1="28" y1="57" x2="28" y2="78" stroke="#ff3e3e" strokeWidth="1" />
      </svg>

      {showText && (
        <div className="flex flex-col">
          <span className={`font-bold ${text} leading-tight`}>
            <span className="text-[#f0b90b]">The</span>
            <span className="text-white">Mentor</span>
            <span className="text-[#f0b90b]">Trading</span>
          </span>
          <span className="text-[10px] text-terminal-muted tracking-widest uppercase">
            PriceVibration Pro • Planetary Intelligence
          </span>
        </div>
      )}
    </div>
  )
}

// Logo solo icono para favicon
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
