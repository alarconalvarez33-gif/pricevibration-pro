import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#0a0a0a]">
        {/* Hero Section */}
        <section className="pt-32 pb-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Predice Niveles de <span className="text-[#c9a227]">Alta Probabilidad</span>
            </h1>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Calcula niveles cuánticos donde el precio tiene mayor probabilidad de girar.
              Usado por traders profesionales en Forex, Oro y Crypto.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                href="/quantum"
                className="bg-[#c9a227] hover:bg-[#d4af37] text-black px-8 py-4 rounded-xl text-lg font-bold transition-all transform hover:scale-105"
              >
                Probar Calculadora Gratis
              </Link>
              <Link
                href="/advanced"
                className="border border-[#c9a227] text-[#c9a227] hover:bg-[#c9a227]/10 px-8 py-4 rounded-xl text-lg font-bold transition-all"
              >
                Ver Resultados Reales
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-8 text-gray-500 text-sm">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>2 cálculos gratis</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Sin tarjeta de crédito</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Resultados instantáneos</span>
              </div>
            </div>
          </div>
        </section>

        {/* How it works + Mini Calculator */}
        <section className="py-16 px-4 bg-gradient-to-b from-[#0a0a0a] to-[#0d1117]">
          <div className="max-w-6xl mx-auto">
            <div className="bg-[#1a1a2e] rounded-2xl p-6 md:p-10 border border-[#c9a227]/30">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                    ¿Cómo funciona?
                  </h2>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 bg-[#c9a227] rounded-full flex items-center justify-center text-black font-bold shrink-0">1</div>
                      <div>
                        <h3 className="text-white font-bold">Ingresa el rango</h3>
                        <p className="text-gray-400 text-sm">Precio máximo y mínimo del período</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-10 h-10 bg-[#c9a227] rounded-full flex items-center justify-center text-black font-bold shrink-0">2</div>
                      <div>
                        <h3 className="text-white font-bold">Obtén los niveles</h3>
                        <p className="text-gray-400 text-sm">9 niveles cuánticos calculados con fórmula n²</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-10 h-10 bg-[#c9a227] rounded-full flex items-center justify-center text-black font-bold shrink-0">3</div>
                      <div>
                        <h3 className="text-white font-bold">Opera con ventaja</h3>
                        <p className="text-gray-400 text-sm">Compra en zonas verdes, vende en zonas rojas</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mini Calculator Preview */}
                <div className="bg-[#0a0a0a] rounded-xl p-6 border border-gray-800">
                  <div className="text-center mb-4">
                    <span className="text-[#c9a227] text-sm font-bold">EJEMPLO: XAU/USD</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 rounded bg-red-900/30">
                      <span className="text-red-400 text-sm font-bold">Q8</span>
                      <span className="text-white font-mono text-sm">2,700.00</span>
                      <span className="text-red-400 text-xs">VENTA</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded bg-red-900/20">
                      <span className="text-red-400 text-sm">Q7</span>
                      <span className="text-white font-mono text-sm">2,676.56</span>
                      <span className="text-red-400 text-xs">VENTA</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded bg-red-900/10">
                      <span className="text-red-400 text-sm">Q6</span>
                      <span className="text-white font-mono text-sm">2,656.25</span>
                      <span className="text-gray-500 text-xs">-</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded bg-yellow-900/20">
                      <span className="text-yellow-400 text-sm">Q4-Q5</span>
                      <span className="text-white font-mono text-sm">2,600.00</span>
                      <span className="text-yellow-400 text-xs">EQUILIBRIO</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded bg-green-900/10">
                      <span className="text-green-400 text-sm">Q3</span>
                      <span className="text-white font-mono text-sm">2,540.62</span>
                      <span className="text-gray-500 text-xs">-</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded bg-green-900/20">
                      <span className="text-green-400 text-sm">Q2</span>
                      <span className="text-white font-mono text-sm">2,506.25</span>
                      <span className="text-green-400 text-xs">COMPRA</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded bg-green-900/30">
                      <span className="text-green-400 text-sm font-bold">Q1</span>
                      <span className="text-white font-mono text-sm">2,501.56</span>
                      <span className="text-green-400 text-xs">COMPRA</span>
                    </div>
                  </div>
                  <Link
                    href="/quantum"
                    className="block w-full mt-4 bg-[#c9a227] hover:bg-[#d4af37] text-black py-3 rounded-lg text-center font-bold transition-colors"
                  >
                    Calcular Mis Niveles
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof - Resultados */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">Resultados Reales</h2>
              <p className="text-gray-400">El precio respeta los niveles cuánticos una y otra vez</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-[#1a1a2e] rounded-xl p-6 border border-gray-800 hover:border-[#c9a227]/50 transition-colors">
                <div className="aspect-video bg-gray-800 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-gray-500 text-sm">Screenshot de resultado</span>
                </div>
                <h3 className="text-white font-bold mb-1">XAU/USD - Rebote en Q2</h3>
                <p className="text-gray-400 text-sm">Precio rebotó exactamente en nivel cuántico</p>
              </div>
              <div className="bg-[#1a1a2e] rounded-xl p-6 border border-gray-800 hover:border-[#c9a227]/50 transition-colors">
                <div className="aspect-video bg-gray-800 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-gray-500 text-sm">Screenshot de resultado</span>
                </div>
                <h3 className="text-white font-bold mb-1">EUR/USD - Rechazo en Q7</h3>
                <p className="text-gray-400 text-sm">Zona de distribución funcionó perfectamente</p>
              </div>
              <div className="bg-[#1a1a2e] rounded-xl p-6 border border-gray-800 hover:border-[#c9a227]/50 transition-colors">
                <div className="aspect-video bg-gray-800 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-gray-500 text-sm">Screenshot de resultado</span>
                </div>
                <h3 className="text-white font-bold mb-1">BTC/USD - Triple confluencia</h3>
                <p className="text-gray-400 text-sm">Entelechy detectada, giro confirmado</p>
              </div>
            </div>

            <div className="text-center mt-8">
              <Link
                href="/advanced"
                className="text-[#c9a227] hover:text-[#d4af37] font-bold"
              >
                Ver todos los resultados →
              </Link>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-16 px-4 bg-[#0d1117]">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">Planes Simples</h2>
              <p className="text-gray-400">Empieza gratis, mejora cuando quieras</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Free */}
              <div className="bg-[#1a1a2e] rounded-2xl p-8 border border-gray-800">
                <h3 className="text-xl font-bold text-white mb-2">Gratis</h3>
                <p className="text-gray-400 text-sm mb-6">Para probar la herramienta</p>
                <div className="text-4xl font-bold text-white mb-6">$0</div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2 text-gray-300">
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    2 cálculos por día
                  </li>
                  <li className="flex items-center gap-2 text-gray-300">
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    9 niveles cuánticos
                  </li>
                  <li className="flex items-center gap-2 text-gray-500">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Sin subarmónicos
                  </li>
                </ul>
                <Link
                  href="/quantum"
                  className="block w-full text-center border border-gray-600 text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors"
                >
                  Empezar Gratis
                </Link>
              </div>

              {/* Pro */}
              <div className="bg-gradient-to-b from-[#c9a227]/20 to-[#1a1a2e] rounded-2xl p-8 border-2 border-[#c9a227] relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#c9a227] text-black px-4 py-1 rounded-full text-sm font-bold">
                  POPULAR
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Pro</h3>
                <p className="text-gray-400 text-sm mb-6">Para traders serios</p>
                <div className="text-4xl font-bold text-white mb-1">
                  $49<span className="text-lg text-gray-400">/mes</span>
                </div>
                <p className="text-gray-500 text-sm mb-6">≈ Gs. 340.000</p>
                <ul className="space-y-3 mb-8">
                  {['Cálculos ilimitados', 'Subarmónicos incluidos', 'Zonas Entelechy', 'Señales diarias'].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-gray-300">
                      <svg className="w-5 h-5 text-[#c9a227]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/billing"
                  className="block w-full text-center bg-[#c9a227] hover:bg-[#d4af37] text-black py-3 rounded-xl font-bold transition-colors"
                >
                  Comenzar Ahora
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              ¿Listo para operar con niveles de alta probabilidad?
            </h2>
            <p className="text-gray-400 mb-8">
              Únete a traders que ya usan física cuántica para encontrar puntos de giro
            </p>
            <Link
              href="/quantum"
              className="inline-block bg-[#c9a227] hover:bg-[#d4af37] text-black px-10 py-4 rounded-xl text-lg font-bold transition-all transform hover:scale-105"
            >
              Probar Calculadora Gratis
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-800 py-8 px-4">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Image src="/logosacred.png" alt="Sacred Levels" width={32} height={32} className="rounded" />
              <span className="text-gray-400 text-sm">© 2025 Sacred Levels</span>
            </div>
            <div className="flex gap-6 text-gray-400 text-sm">
              <Link href="/billing" className="hover:text-white">Planes</Link>
              <Link href="/quantum" className="hover:text-white">Calculadora</Link>
              <a href="mailto:soporte@sacredlevels.com" className="hover:text-white">Contacto</a>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
