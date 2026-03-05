import { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Divisas - Pares de Monedas Forex',
  description: 'Conoce los principales pares de divisas Forex: mayores, menores y exóticos. Sus características y horarios óptimos.',
}

export default function DivisasPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <div className="pt-28 pb-20 px-4">
        <div className="max-w-4xl mx-auto">

          <div className="mb-8">
            <Link href="/educacion/que-es-forex" className="text-gray-500 hover:text-[#c9a227] text-sm transition-colors">← ¿Qué es Forex?</Link>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            <span className="text-[#c9a227]">Divisas</span> — Pares de Monedas
          </h1>
          <p className="text-gray-500 text-sm mb-10 uppercase tracking-widest">Educación · Forex · Pares</p>

          <p className="text-gray-300 text-lg leading-relaxed mb-10">
            En Forex, las divisas se negocian en <strong className="text-white">pares</strong>.
            Cada par compara dos monedas: la <span className="text-[#c9a227]">moneda base</span> (primera) y la <span className="text-blue-400">moneda cotizada</span> (segunda).
            El precio indica cuánto de la segunda moneda necesitas para comprar una unidad de la primera.
          </p>

          <h2 className="text-2xl font-bold text-[#c9a227] mb-4">Pares Mayores</h2>
          <p className="text-gray-400 text-sm mb-4">Incluyen siempre al Dólar (USD). Son los más líquidos y de menor spread.</p>
          <div className="grid md:grid-cols-2 gap-4 mb-10">
            {[
              { pair: 'EUR/USD', flags: '💶💵', name: 'Euro / Dólar', desc: 'El más operado del mundo. Alta liquidez, spreads bajos.' },
              { pair: 'GBP/USD', flags: '💷💵', name: 'Libra / Dólar', desc: '"Cable". Alta volatilidad, ideal para day trading.' },
              { pair: 'USD/JPY', flags: '💵💴', name: 'Dólar / Yen', desc: 'Referencia de Asia. Movimientos suaves y tendenciales.' },
              { pair: 'USD/CHF', flags: '💵🇨🇭', name: 'Dólar / Franco', desc: 'Correlación inversa con EUR/USD. Activo refugio.' },
              { pair: 'AUD/USD', flags: '🇦🇺💵', name: 'Dólar Aus. / Dólar', desc: 'Correlación con commodities (hierro, carbón).' },
              { pair: 'USD/CAD', flags: '💵🇨🇦', name: 'Dólar / Canadiense', desc: '"Loonie". Correlación con el precio del petróleo.' },
            ].map(p => (
              <div key={p.pair} className="bg-[#1a1a2e] border border-gray-800 hover:border-[#c9a227]/30 rounded-xl p-4 flex items-start gap-4 transition-colors">
                <span className="text-3xl flex-shrink-0">{p.flags}</span>
                <div>
                  <h3 className="text-white font-bold font-mono">{p.pair}</h3>
                  <p className="text-gray-400 text-xs mt-0.5">{p.name}</p>
                  <p className="text-gray-500 text-xs mt-1">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-bold text-[#c9a227] mb-4">Pares Cruzados (Minors)</h2>
          <p className="text-gray-400 text-sm mb-4">No incluyen el Dólar. Mayor spread pero interesantes oportunidades.</p>
          <div className="grid md:grid-cols-3 gap-3 mb-10">
            {['EUR/GBP', 'EUR/JPY', 'GBP/JPY', 'EUR/AUD', 'AUD/JPY', 'GBP/CHF'].map(p => (
              <div key={p} className="bg-[#111120] border border-gray-800 rounded-lg p-3 text-center">
                <span className="text-white font-mono font-bold">{p}</span>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-bold text-[#c9a227] mb-4">Conceptos Clave</h2>
          <div className="grid md:grid-cols-3 gap-4 mb-10">
            {[
              { term: 'PIP', def: 'Mínima fluctuación del precio (0.0001 en EUR/USD).' },
              { term: 'Spread', def: 'Diferencia entre precio compra y venta. El costo de la operación.' },
              { term: 'Lote', def: '1 lote = 100,000 unidades. Mini lote = 10,000. Micro = 1,000.' },
            ].map(c => (
              <div key={c.term} className="bg-[#1a1a2e] border border-[#c9a227]/20 rounded-xl p-4">
                <h3 className="text-[#c9a227] font-bold mb-2">{c.term}</h3>
                <p className="text-gray-400 text-sm">{c.def}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/educacion/que-es-forex" className="border border-[#c9a227]/40 hover:border-[#c9a227] text-[#c9a227] font-bold px-6 py-3 rounded-lg transition-colors">
              ← ¿Qué es Forex?
            </Link>
            <Link href="/brokers" className="bg-[#c9a227] hover:bg-[#d4af37] text-black font-bold px-6 py-3 rounded-lg transition-colors">
              Ver Brokers Recomendados →
            </Link>
          </div>

        </div>
      </div>
      <Footer />
    </main>
  )
}
