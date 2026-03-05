import { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Brokers Confiables',
  description: 'Brokers regulados y confiables recomendados por The Mentor. Abre tu cuenta con seguridad.',
}

const brokers = [
  {
    name: 'Exness',
    emoji: '⚡',
    description: 'Broker regulado con spreads ultrabatos y ejecución instantánea. Uno de los más usados globalmente.',
    affiliateUrl: 'https://one.exnessonelink.com/intl/es/a/xwx0gc598n',
    features: ['Spreads desde 0.0 pips', 'Apalancamiento ilimitado (pro)', 'Retiros instantáneos 24/7', 'Regulado por FCA, CySEC, FSCA'],
    badge: 'Recomendado',
    badgeColor: 'bg-green-600',
  },
]

export default function BrokersPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <div className="pt-28 pb-20 px-4">
        <div className="max-w-6xl mx-auto">

          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Brokers <span className="text-[#c9a227]">Confiables</span>
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Brokers que The Mentor usa y recomienda. Todos regulados, con spreads competitivos y soporte en español.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {brokers.map((broker) => (
              <div key={broker.name} className="bg-gradient-to-br from-[#1a1a2e] to-[#0d0d0d] border border-[#c9a227]/30 rounded-xl overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-[#111120] p-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{broker.emoji}</span>
                    <h3 className="text-2xl font-bold text-white">{broker.name}</h3>
                  </div>
                  {broker.badge && (
                    <span className={`${broker.badgeColor} text-white text-xs font-bold px-2 py-1 rounded-full`}>
                      {broker.badge}
                    </span>
                  )}
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <p className="text-gray-400 text-sm mb-5 leading-relaxed">{broker.description}</p>

                  <ul className="space-y-2 mb-6 flex-1">
                    {broker.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-gray-300 text-sm">
                        <span className="text-green-400 flex-shrink-0">✓</span> {f}
                      </li>
                    ))}
                  </ul>

                  <a
                    href={broker.affiliateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-[#c9a227] hover:bg-[#d4af37] text-black font-bold py-3 rounded-xl text-center transition-all hover:scale-[1.02]"
                  >
                    Abrir Cuenta Gratis →
                  </a>
                </div>
              </div>
            ))}

            {/* Coming soon */}
            <div className="bg-[#111120] border border-gray-800 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center min-h-[280px]">
              <span className="text-4xl mb-4">🔜</span>
              <h3 className="text-gray-500 font-bold mb-2">Más brokers próximamente</h3>
              <p className="text-gray-600 text-sm">Estamos evaluando más opciones para recomendarte.</p>
            </div>
          </div>

          {/* Comparativa rápida */}
          <div className="bg-[#111120] border border-gray-800 rounded-xl p-6 mb-10">
            <h2 className="text-xl font-bold text-[#c9a227] mb-4">📊 Fondeo vs Capital Propio</h2>
            <p className="text-gray-400 text-sm mb-4">¿No sabés si usar una cuenta de fondeo o tu propio capital?</p>
            <Link href="/educacion/fondeo-vs-capital" className="text-[#c9a227] hover:underline text-sm font-medium">
              Ver comparativa completa →
            </Link>
          </div>

          {/* Disclaimer */}
          <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-5">
            <p className="text-yellow-400 text-sm leading-relaxed">
              ⚠️ <strong>Aviso de afiliados:</strong> Los enlaces de brokers son enlaces de afiliado.
              Recibimos una comisión si abrís una cuenta — esto <strong>no tiene costo adicional para vos</strong> ni afecta tu experiencia.
              Solo recomendamos brokers que usamos y en los que confiamos.
            </p>
          </div>

        </div>
      </div>
      <Footer />
    </main>
  )
}
