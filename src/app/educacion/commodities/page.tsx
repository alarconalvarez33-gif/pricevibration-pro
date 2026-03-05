import { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Commodities - Materias Primas',
  description: 'Aprende sobre el mercado de commodities: metales preciosos, energía, materias agrícolas e industriales.',
}

export default function CommoditiesPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <div className="pt-28 pb-20 px-4">
        <div className="max-w-4xl mx-auto">

          <div className="mb-8">
            <Link href="/" className="text-gray-500 hover:text-[#c9a227] text-sm transition-colors">← Inicio</Link>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            <span className="text-[#c9a227]">Commodities</span> — Materias Primas
          </h1>
          <p className="text-gray-500 text-sm mb-10 uppercase tracking-widest">Educación · Mercados de Materias Primas</p>

          <p className="text-gray-300 text-lg leading-relaxed mb-10">
            Los commodities son materias primas que se negocian en mercados globales estandarizados.
            A diferencia de las acciones, su precio depende principalmente de la <strong className="text-white">oferta y demanda física</strong> mundial,
            factores geopolíticos, clima y políticas de producción.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-10">
            <div className="bg-gradient-to-br from-[#1a1a2e] to-[#0d0d0d] border border-[#c9a227]/30 rounded-xl p-6">
              <h3 className="text-[#c9a227] font-bold text-xl mb-4">🥇 Metales Preciosos</h3>
              <ul className="text-gray-300 space-y-2">
                <li className="flex items-center gap-3"><span className="text-[#c9a227]">🥇</span> <span><strong className="text-white">Oro (XAU/USD)</strong> — Activo refugio #1</span></li>
                <li className="flex items-center gap-3"><span className="text-gray-300">🥈</span> <span><strong className="text-white">Plata (XAG/USD)</strong> — Industrial y refugio</span></li>
                <li className="flex items-center gap-3"><span>⚪</span> <span>Platino — Alta demanda automotriz</span></li>
                <li className="flex items-center gap-3"><span>🔘</span> <span>Paladio — Catalizadores automotrices</span></li>
              </ul>
              <p className="text-gray-500 text-xs mt-4">El Oro es el commodity más operado en Sacred Levels.</p>
            </div>

            <div className="bg-gradient-to-br from-[#1a1a2e] to-[#0d0d0d] border border-blue-500/30 rounded-xl p-6">
              <h3 className="text-blue-400 font-bold text-xl mb-4">⛽ Energía</h3>
              <ul className="text-gray-300 space-y-2">
                <li className="flex items-center gap-3"><span>🛢️</span> <span><strong className="text-white">Petróleo WTI</strong> — Referencia USA</span></li>
                <li className="flex items-center gap-3"><span>🛢️</span> <span><strong className="text-white">Petróleo Brent</strong> — Referencia Global</span></li>
                <li className="flex items-center gap-3"><span>🔥</span> <span>Gas Natural</span></li>
                <li className="flex items-center gap-3"><span>⚡</span> <span>Electricidad (mercados específicos)</span></li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-[#1a1a2e] to-[#0d0d0d] border border-green-500/30 rounded-xl p-6">
              <h3 className="text-green-400 font-bold text-xl mb-4">🌾 Agrícolas</h3>
              <ul className="text-gray-300 space-y-2">
                <li className="flex items-center gap-3"><span>🌾</span> <span>Trigo</span></li>
                <li className="flex items-center gap-3"><span>🌽</span> <span>Maíz</span></li>
                <li className="flex items-center gap-3"><span>🫘</span> <span>Soja</span></li>
                <li className="flex items-center gap-3"><span>☕</span> <span>Café</span></li>
                <li className="flex items-center gap-3"><span>🍫</span> <span>Cacao</span></li>
                <li className="flex items-center gap-3"><span>🍬</span> <span>Azúcar</span></li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-[#1a1a2e] to-[#0d0d0d] border border-orange-500/30 rounded-xl p-6">
              <h3 className="text-orange-400 font-bold text-xl mb-4">🏭 Metales Industriales</h3>
              <ul className="text-gray-300 space-y-2">
                <li className="flex items-center gap-3"><span>🟤</span> <span><strong className="text-white">Cobre</strong> — Barómetro económico</span></li>
                <li className="flex items-center gap-3"><span>⬜</span> <span>Aluminio</span></li>
                <li className="flex items-center gap-3"><span>⬜</span> <span>Zinc</span></li>
                <li className="flex items-center gap-3"><span>⬜</span> <span>Níquel — Baterías EV</span></li>
              </ul>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-[#c9a227] mb-4">¿Por qué el Oro?</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            El Oro (XAU/USD) es el activo principal en Sacred Levels. Su comportamiento responde perfectamente a la metodología de
            <strong className="text-[#c9a227]"> W.D. Gann</strong> — los niveles matemáticos y ciclos temporales generan señales de alta precisión en este mercado.
          </p>
          <Link href="/dashboard" className="inline-block bg-[#c9a227] hover:bg-[#d4af37] text-black font-bold px-6 py-3 rounded-lg transition-colors">
            Calcular Niveles en Oro →
          </Link>

        </div>
      </div>
      <Footer />
    </main>
  )
}
