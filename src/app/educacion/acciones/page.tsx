import { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Acciones - Mercado de Valores',
  description: 'Aprende qué son las acciones, cómo invertir en bolsa y los principales mercados de valores del mundo.',
}

export default function AccionesPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <div className="pt-28 pb-20 px-4">
        <div className="max-w-4xl mx-auto">

          <div className="mb-8">
            <Link href="/" className="text-gray-500 hover:text-[#c9a227] text-sm transition-colors">← Inicio</Link>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            <span className="text-[#c9a227]">Acciones</span> — Mercado de Valores
          </h1>
          <p className="text-gray-500 text-sm mb-10 uppercase tracking-widest">Educación · Renta Variable</p>

          <p className="text-gray-300 text-lg leading-relaxed mb-8">
            Las acciones representan una fracción de la propiedad de una empresa. Al comprarlas, te convertís en <strong className="text-white">accionista</strong>
            {' '}y participás de las ganancias (dividendos) y el crecimiento del negocio. También podés perder si el negocio va mal.
          </p>

          <h2 className="text-2xl font-bold text-[#c9a227] mb-4">Principales Mercados</h2>
          <div className="grid md:grid-cols-3 gap-4 mb-10">
            {[
              { flag: '🇺🇸', name: 'NYSE / NASDAQ', location: 'Estados Unidos', desc: 'Apple, Tesla, Amazon, Microsoft', color: 'border-blue-500/30' },
              { flag: '🇬🇧', name: 'London Stock Exchange', location: 'Reino Unido', desc: 'HSBC, Shell, Unilever', color: 'border-red-500/30' },
              { flag: '🇯🇵', name: 'Tokyo Stock Exchange', location: 'Japón', desc: 'Toyota, Sony, SoftBank', color: 'border-orange-500/30' },
              { flag: '🇩🇪', name: 'Frankfurt (DAX)', location: 'Alemania', desc: 'Volkswagen, SAP, Bayer', color: 'border-yellow-500/30' },
              { flag: '🇪🇺', name: 'Euronext', location: 'Europa', desc: 'LVMH, Airbus, Stellantis', color: 'border-green-500/30' },
              { flag: '🇨🇳', name: 'Shanghai / Shenzhen', location: 'China', desc: 'Alibaba, Tencent, BYD', color: 'border-red-600/30' },
            ].map(m => (
              <div key={m.name} className={`bg-[#1a1a2e] border ${m.color} rounded-xl p-4 text-center`}>
                <div className="text-3xl mb-2">{m.flag}</div>
                <h3 className="text-white font-bold text-sm">{m.name}</h3>
                <p className="text-gray-400 text-xs mt-1">{m.location}</p>
                <p className="text-gray-600 text-xs mt-2 italic">{m.desc}</p>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-bold text-[#c9a227] mb-4">Formas de invertir</h2>
          <div className="grid md:grid-cols-2 gap-6 mb-10">
            <div className="bg-[#1a1a2e] border border-gray-800 rounded-xl p-5">
              <h3 className="text-white font-bold mb-3">📊 Acciones individuales</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Comprás acciones de empresas específicas. Mayor potencial de rentabilidad pero también mayor riesgo y requiere investigación.</p>
            </div>
            <div className="bg-[#1a1a2e] border border-gray-800 rounded-xl p-5">
              <h3 className="text-white font-bold mb-3">📈 ETFs / Índices</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Fondos que replican un índice (S&P 500, NASDAQ 100). Diversificación automática con una sola inversión.</p>
            </div>
            <div className="bg-[#1a1a2e] border border-gray-800 rounded-xl p-5">
              <h3 className="text-white font-bold mb-3">💰 CFDs sobre acciones</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Especulás sobre el precio sin ser propietario. Permite apalancamiento y posiciones cortas (bajistas).</p>
            </div>
            <div className="bg-[#1a1a2e] border border-gray-800 rounded-xl p-5">
              <h3 className="text-white font-bold mb-3">🎯 Opciones</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Contratos que dan el derecho (pero no la obligación) de comprar/vender acciones a un precio determinado.</p>
            </div>
          </div>

          <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-6">
            <h3 className="text-red-400 font-bold mb-2">⚠️ Advertencia</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              La inversión en acciones implica riesgo de pérdida. El rendimiento pasado no garantiza resultados futuros. Esta página es solo educativa.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
