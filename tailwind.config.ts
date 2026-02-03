import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // New Professional Gold Palette
        gold: {
          50: '#fef9e7',
          100: '#fcf0c3',
          200: '#f9e08a',
          300: '#e8c84a',
          400: '#d4af37',
          500: '#c9a227', // Primary elegant gold
          600: '#a88820',
          700: '#86691a',
          800: '#6b5215',
          900: '#503d10',
        },
        // Professional Dark Theme (GitHub style)
        terminal: {
          bg: '#0d1117',      // Main background
          card: '#161b22',    // Card background
          border: '#30363d',  // Subtle border
          text: '#e6edf3',    // Soft white text
          muted: '#8b949e',   // Muted text
        },
        // Trading Colors
        gann: {
          support: '#10b981',    // Emerald green
          resistance: '#ef4444', // Classic red
          neutral: '#c9a227',    // Elegant gold
        },
        // Professional accent
        accent: {
          blue: '#1a73e8',    // Professional blue
          gold: '#c9a227',    // Elegant gold
        },
        // Planet colors
        planet: {
          sun: '#FFD700',
          moon: '#C0C0C0',
          mercury: '#B5B5B5',
          venus: '#FFC0CB',
          mars: '#FF4500',
          jupiter: '#FFA500',
          saturn: '#DAA520',
          uranus: '#40E0D0',
          neptune: '#4169E1',
          pluto: '#8B4513',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        display: ['Outfit', 'Inter', 'sans-serif'],
        cursive: ['Playfair Display', 'Cormorant Garamond', 'Georgia', 'serif'],
      },
      animation: {
        'pulse-gold': 'pulse-gold 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'glow-green': 'glow-green 2s ease-in-out infinite alternate',
        'glow-red': 'glow-red 2s ease-in-out infinite alternate',
        'spin-slow': 'spin 20s linear infinite',
        'gradient-x': 'gradient-x 3s ease infinite',
        'blur-reveal': 'blur-reveal 4s ease-in-out infinite',
        'slide-in': 'slide-in 0.5s ease-out',
        'notification': 'notification 0.5s ease-out',
      },
      keyframes: {
        'pulse-gold': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'glow': {
          '0%': { boxShadow: '0 0 5px rgba(201, 162, 39, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(201, 162, 39, 0.8)' },
        },
        'glow-green': {
          '0%': { boxShadow: '0 0 5px rgba(16, 185, 129, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(16, 185, 129, 0.8)' },
        },
        'glow-red': {
          '0%': { boxShadow: '0 0 5px rgba(239, 68, 68, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(239, 68, 68, 0.8)' },
        },
        'gradient-x': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'blur-reveal': {
          '0%, 100%': { filter: 'blur(8px)', opacity: '0.5' },
          '50%': { filter: 'blur(0px)', opacity: '1' },
        },
        'slide-in': {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'notification': {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '10%': { transform: 'translateX(0)', opacity: '1' },
          '90%': { transform: 'translateX(0)', opacity: '1' },
          '100%': { transform: 'translateX(100%)', opacity: '0' },
        },
      }
    },
  },
  plugins: [],
}
export default config
