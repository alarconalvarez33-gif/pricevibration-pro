import { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Fondeo vs Capital Propio',
  description: 'Compara cuentas de fondeo con trading con capital propio. Ventajas, desventajas y cuál elegir.',
}

export default function FondeoVsCapitalPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <div className="pt-28 pb-20 px-4">
        <div className="max-w-4xl mx-auto">

          <div className="mb-8">
            <Link href="/brokers" className="text-gray-500 hover:text-[#c9a227] text-sm transition-colors">← Brokers</Link>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Cuentas de <span className="text-[#c9a227]">Fondeo</span> vs <span className="text-green-400">Capital Propio</span>
          </h1>
          <p className="text-gray-500 text-sm mb-10 uppercase tracking-widest">Educación · Estrategia de Capital</p>

          <p className="text-gray-300 text-lg leading-relaxed mb-10">
            Una de las decisiones más importantes para un trader es cómo capitalizar su operativa.
            Cada opción tiene ventajas y desventajas que dependen de tu experiencia, capital disponible y tolerancia al riesgo.
          </p>

          <div className="grid md:grid-cols-2 gap-8 mb-10">
            {/* Fondeo */}
            <div className="bg-gradient-to-br from-[#1a1a2e] to-[#0d0d0d] border border-blue-500/30 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-blue-400 mb-5">💼 Cuentas de Fondeo</h2>
              <ul className="space-y-3 text-gray-300">
                {[
                  { ok: true,  text: 'No arriesgas tu propio capital' },
                  { ok: true,  text: 'Acceso a capital grande ($10k – $200k+)' },
                  { ok: true,  text: 'División de ganancias (70–90% para ti)' },
                  { ok: true,  text: 'Escalar sin necesidad de ahorros grandes' },
                  { ok: false, text: 'Debes pasar una evaluación' },
                  { ok: false, text: 'Reglas estrictas de drawdown y objetivo' },
                  { ok: false, text: 'Costo inicial de la evaluación' },
                  { ok: false, text: 'Pueden retirar el fondeo si rompes las reglas' },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className={item.ok ? 'text-green-400' : 'text-red-400'} style={{flexShrink:0}}>{item.ok ? '✅' : '❌'}</span>
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Capital Propio */}
            <div className="bg-gradient-to-br from-[#1a1a2e] to-[#0d0d0d] border border-green-500/30 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-green-400 mb-5">💰 Capital Propio</h2>
              <ul className="space-y-3 text-gray-300">
                {[
                  { ok: true,  text: '100% de las ganancias son tuyas' },
                  { ok: true,  text: 'Sin reglas de terceros' },
                  { ok: true,  text: 'Total libertad de estrategia y activos' },
                  { ok: true,  text: 'Sin evaluaciones ni restricciones' },
                  { ok: false, text: 'Arriesgas tu propio dinero' },
                  { ok: false, text: 'Capital inicial limitado' },
                  { ok: false, text: 'Mayor presión emocional en las pérdidas' },
                  { ok: false, text: 'Crecimiento más lento al inicio' },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className={item.ok ? 'text-green-400' : 'text-red-400'} style={{flexShrink:0}}>{item.ok ? '✅' : '❌'}</span>
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Comparativa rápida */}
          <div className="bg-[#111120] border border-gray-800 rounded-xl overflow-hidden mb-10">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="bg-[#1a1a2e] text-gray-400">
                  <th className="text-left px-2 sm:px-4 py-3">Criterio</th>
                  <th className="text-center px-2 sm:px-4 py-3 text-blue-400">Fondeo</th>
                  <th className="text-center px-2 sm:px-4 py-3 text-green-400">Capital Propio</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Riesgo personal', '⬇ Bajo', '⬆ Alto'],
                  ['Capital disponible', '⬆ Grande', '⬇ Limitado'],
                  ['Libertad de trading', '⬇ Restricciones', '⬆ Total'],
                  ['% de ganancias', '70–90%', '100%'],
                  ['Barrera de entrada', 'Evaluación', 'Capital inicial'],
                ].map(([crit, fondeo, propio], i) => (
                  <tr key={i} className="border-t border-gray-800">
                    <td className="px-2 sm:px-4 py-3 text-gray-300">{crit}</td>
                    <td className="px-2 sm:px-4 py-3 text-center text-blue-300">{fondeo}</td>
                    <td className="px-2 sm:px-4 py-3 text-center text-green-300">{propio}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-[#c9a227]/10 border border-[#c9a227]/30 rounded-xl p-6">
            <h3 className="text-[#c9a227] font-bold mb-2">💡 Recomendación de The Mentor</h3>
            <p className="text-gray-300 leading-relaxed">
              Si eres principiante, empezá con una cuenta demo hasta demostrar consistencia.
              Una vez consistente, las cuentas de fondeo son ideales para escalar sin arriesgar capital propio.
              Con experiencia y ahorros, combiná ambas: fondeo para escalar + capital propio para libertad total.
            </p>
          </div>

        </div>
      </div>
      <Footer />
    </main>
  )
}
