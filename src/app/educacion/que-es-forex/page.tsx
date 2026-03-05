import { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: '¿Qué es Forex?',
  description: 'Aprende qué es el mercado Forex, cómo funciona y sus ventajas para traders.',
}

export default function QueEsForexPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <div className="pt-28 pb-20 px-4">
        <div className="max-w-4xl mx-auto">

          <div className="mb-8">
            <Link href="/" className="text-gray-500 hover:text-[#c9a227] text-sm transition-colors">← Inicio</Link>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            ¿Qué es <span className="text-[#c9a227]">Forex</span>?
          </h1>
          <p className="text-gray-500 text-sm mb-10 uppercase tracking-widest">Educación · Mercado de Divisas</p>

          <p className="text-gray-300 text-lg leading-relaxed mb-8">
            Forex (Foreign Exchange) es el mercado global de divisas donde se intercambian monedas de diferentes países.
            Es el mercado financiero más grande del mundo, con un volumen diario de más de <span className="text-[#c9a227] font-semibold">$7 trillones de dólares</span>.
            Opera 24 horas al día, 5 días a la semana, abarcando las principales sesiones de Sidney, Tokio, Londres y Nueva York.
          </p>

          <h2 className="text-2xl font-bold text-[#c9a227] mb-4">¿Cómo funciona?</h2>
          <p className="text-gray-300 mb-4 leading-relaxed">
            Las divisas se negocian siempre en <strong className="text-white">pares</strong>. Cada par compara el valor de una moneda frente a otra.
            Por ejemplo, <span className="text-[#c9a227] font-mono font-bold">EUR/USD = 1.08</span> significa que 1 Euro vale 1.08 Dólares.
          </p>
          <p className="text-gray-300 mb-8 leading-relaxed">
            Cuando <em>compras</em> EUR/USD, estás apostando a que el Euro subirá frente al Dólar.
            Cuando <em>vendes</em>, apostás a que el Euro bajará.
          </p>

          <h2 className="text-2xl font-bold text-[#c9a227] mb-4">Sesiones de trading</h2>
          <div className="grid md:grid-cols-4 gap-4 mb-10">
            {[
              { city: 'Sidney', flag: '🇦🇺', hours: '22:00 – 07:00 UTC', color: 'border-blue-500/30 text-blue-400' },
              { city: 'Tokio', flag: '🇯🇵', hours: '00:00 – 09:00 UTC', color: 'border-red-500/30 text-red-400' },
              { city: 'Londres', flag: '🇬🇧', hours: '08:00 – 17:00 UTC', color: 'border-green-500/30 text-green-400' },
              { city: 'Nueva York', flag: '🇺🇸', hours: '13:00 – 22:00 UTC', color: 'border-purple-500/30 text-purple-400' },
            ].map(s => (
              <div key={s.city} className={`bg-[#1a1a2e] border ${s.color} rounded-xl p-4 text-center`}>
                <div className="text-3xl mb-2">{s.flag}</div>
                <div className={`font-bold ${s.color.split(' ')[1]}`}>{s.city}</div>
                <div className="text-gray-500 text-xs mt-1">{s.hours}</div>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-bold text-[#c9a227] mb-4">Ventajas del Forex</h2>
          <ul className="text-gray-300 space-y-3 mb-10">
            {[
              'Mercado 24 horas, 5 días a la semana',
              'Altísima liquidez — siempre hay compradores y vendedores',
              'Bajo costo de transacción (spread)',
              'Apalancamiento disponible para amplificar posiciones',
              'Puedes ganar tanto en mercados alcistas como bajistas',
              'Acceso desde cualquier dispositivo con internet',
            ].map(v => (
              <li key={v} className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5 flex-shrink-0">✅</span>
                <span>{v}</span>
              </li>
            ))}
          </ul>

          <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-6">
            <h3 className="text-red-400 font-bold mb-2">⚠️ Advertencia de Riesgo</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              El trading de Forex implica un alto riesgo de pérdida. El apalancamiento puede amplificar tanto las ganancias como las pérdidas.
              Nunca inviertas dinero que no puedas permitirte perder. Esta página es solo para fines educativos.
            </p>
          </div>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link href="/educacion/divisas" className="bg-[#c9a227] hover:bg-[#d4af37] text-black font-bold px-6 py-3 rounded-lg transition-colors">
              Ver Pares de Divisas →
            </Link>
            <Link href="/dashboard" className="border border-[#c9a227]/40 hover:border-[#c9a227] text-[#c9a227] font-bold px-6 py-3 rounded-lg transition-colors">
              Calcular Niveles Gann →
            </Link>
          </div>

        </div>
      </div>
      <Footer />
    </main>
  )
}
