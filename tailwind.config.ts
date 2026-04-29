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
        // ── Existing palettes (preserved for dashboard/admin) ──
        gold: {
          50: '#fef9e7',
          100: '#fcf0c3',
          200: '#f9e08a',
          300: '#e8c84a',
          400: '#d4af37',
          500: '#c9a227',
          600: '#a88820',
          700: '#86691a',
          800: '#6b5215',
          900: '#503d10',
        },
        navy: {
          50: '#e8eef5',
          100: '#c8d6e8',
          200: '#99b3d6',
          300: '#6a90c4',
          400: '#4e7ab8',
          500: '#4778b4',
          600: '#3a5f8f',
          700: '#2d4a6e',
          800: '#1e3a5f',
          900: '#142840',
        },
        terminal: {
          bg: '#0f1419',
          card: '#2d3748',
          border: '#4a5568',
          text: '#ffffff',
          muted: '#a0aec0',
        },
        gann: {
          support: '#10b981',
          resistance: '#ef4444',
          neutral: '#c9a227',
        },
        accent: {
          blue: '#1a73e8',
          gold: '#c9a227',
        },
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
        },

        // ── New Corporate Fintech/EdTech design system ──
        'bg-dark': '#000000',
        'bg-dark-blue': '#0F172A',
        'bg-dark-blue-2': '#1A2845',
        'bg-light': '#F5F7FA',
        'accent-cyan': '#00D4FF',
        'accent-cyan-hover': '#00B8E6',
        'accent-cyan-dark': '#0EA5E9',
        'accent-blue-deep': '#1E40AF',
        'accent-orange': '#F58220',
        'accent-gold-bright': '#FFD700',
        'text-light-secondary': '#CBD5E1',
        'text-dark': '#0F172A',
        'text-dark-secondary': '#475569',
        'text-muted-slate': '#64748B',
      },
      fontFamily: {
        // Existing (preserved for dashboard/admin)
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        display: ['Outfit', 'Inter', 'sans-serif'],
        cursive: ['Playfair Display', 'Cormorant Garamond', 'Georgia', 'serif'],
        // New fonts
        montserrat: ['Montserrat', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-dark': 'linear-gradient(180deg, #0F172A 0%, #1A2845 100%)',
        'gradient-cyan': 'linear-gradient(135deg, #00D4FF, #0EA5E9)',
        'gradient-hero': 'linear-gradient(135deg, #0F172A 0%, #1A2845 50%, #0F172A 100%)',
      },
      boxShadow: {
        'cyan-glow': '0 8px 24px rgba(0, 212, 255, 0.4)',
        'card-hover': '0 20px 40px rgba(0, 0, 0, 0.15)',
        'card-light': '0 4px 20px rgba(0, 0, 0, 0.08)',
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
        'fade-up': 'fade-up 0.6s ease-out forwards',
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
        'fade-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
export default config
