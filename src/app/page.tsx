import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#0a0a0a]">

        {/* ── HERO ─────────────────────────────────────────────── */}
        <section className="relative pt-28 pb-20 px-4 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#c9a227]/5 via-transparent to-transparent pointer-events-none" />
          <div className="relative max-w-5xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Predice Niveles de{' '}
              <span className="text-[#c9a227]">Alta Probabilidad</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
              Calcula niveles cuánticos donde el precio tiene mayor probabilidad de girar.
              Usado por traders profesionales en Forex, Oro y Crypto.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/quantum" className="bg-[#c9a227] hover:bg-[#d4af37] text-black px-8 py-4 rounded-xl text-lg font-bold transition-all">
                Probar Calculadora Gratis
              </Link>
              <Link href="/advanced" className="border-2 border-gray-700 hover:border-[#c9a227]/50 text-white hover:text-[#c9a227] px-8 py-4 rounded-xl text-lg font-bold transition-all">
                Ver Resultados Reales
              </Link>
            </div>
            <div className="flex flex-wrap justify-center gap-8 text-gray-400 text-sm">
              {['2 cálculos gratis', 'Sin tarjeta de crédito', 'Resultados instantáneos'].map((t) => (
                <span key={t} className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>{t}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ─────────────────────────────────────── */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="bg-[#1a1a2e] rounded-2xl p-8 md:p-12 border border-gray-800">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">¿Cómo funciona?</h2>
                  <div className="space-y-6">
                    {[
                      { n: '1', title: 'Ingresa el rango', desc: 'Precio máximo y mínimo del período que analizas' },
                      { n: '2', title: 'Obtén los niveles', desc: '9 niveles cuánticos calculados con fórmula n²' },
                      { n: '3', title: 'Opera con ventaja', desc: 'Compra en zonas verdes (Q0-Q3), vende en rojas (Q6-Q8)' },
                    ].map((item) => (
                      <div key={item.n} className="flex gap-5">
                        <div className="w-12 h-12 bg-[#c9a227] rounded-xl flex items-center justify-center text-black font-bold text-xl shrink-0">{item.n}</div>
                        <div>
                          <h3 className="text-white font-bold text-lg mb-1">{item.title}</h3>
                          <p className="text-gray-400">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Calculator preview */}
                <div className="bg-[#0a0a0a] rounded-xl p-6 border border-gray-800">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[#c9a227] text-sm font-bold">XAU/USD</span>
                    <span className="text-gray-500 text-sm">Ejemplo</span>
                  </div>
                  <div className="space-y-2">
                    {[
                      { level: 'Q8', price: '2,700.00', type: 'sell' },
                      { level: 'Q7', price: '2,676.56', type: 'sell' },
                      { level: 'Q6', price: '2,656.25', type: 'sell' },
                      { level: 'Q5', price: '2,625.00', type: 'neutral' },
                      { level: 'Q4', price: '2,600.00', type: 'neutral' },
                      { level: 'Q3', price: '2,556.25', type: 'buy' },
                      { level: 'Q2', price: '2,525.00', type: 'buy' },
                      { level: 'Q1', price: '2,506.25', type: 'buy' },
                    ].map((item) => (
                      <div
                        key={item.level}
                        className={`flex items-center justify-between p-2.5 rounded-lg ${
                          item.type === 'sell' ? 'bg-red-900/30 border-l-4 border-red-500' :
                          item.type === 'buy' ? 'bg-green-900/30 border-l-4 border-green-500' :
                          'bg-yellow-900/30 border-l-4 border-yellow-500'
                        }`}
                      >
                        <span className={`text-sm font-bold ${
                          item.type === 'sell' ? 'text-red-400' : item.type === 'buy' ? 'text-green-400' : 'text-yellow-400'
                        }`}>{item.level}</span>
                        <span className="text-white font-mono text-sm">{item.price}</span>
                      </div>
                    ))}
                  </div>
                  <Link href="/quantum" className="block w-full mt-6 bg-[#c9a227] hover:bg-[#d4af37] text-black py-4 rounded-xl text-center font-bold transition-all">
                    Calcular Mis Niveles
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── COURSES - FLYERS REALES COMPLETOS ────────────────── */}
        <section className="py-20 px-4 bg-gradient-to-b from-[#0a0a0a] via-[#0d1117] to-[#0a0a0a]">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Cursos de Trading</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Domina técnicas avanzadas de análisis técnico con nuestros cursos en video
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Física Cuántica */}
              <div className="bg-[#1a1a2e] rounded-2xl overflow-hidden border border-purple-500/30 hover:border-purple-500/60 transition-all group">
                <div className="relative h-72 bg-[#0a0a0a] overflow-hidden">
                  <Image src="/cuantico.png" alt="Física Cuántica" fill className="object-contain p-2 group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-3 left-3">
                    <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold">Especial</span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-white mb-2">Física Cuántica</h3>
                  <p className="text-gray-400 text-sm mb-4">Acceso completo a niveles cuánticos avanzados</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-lg font-bold text-white">Gs. 650.000</span>
                      <p className="text-gray-500 text-xs">2 meses de acceso</p>
                    </div>
                    <Link href="/billing" className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all">
                      Acceder
                    </Link>
                  </div>
                </div>
              </div>

              {/* Canal Paralelo */}
              <div className="bg-[#1a1a2e] rounded-2xl overflow-hidden border border-gray-800 hover:border-[#c9a227]/50 transition-all group">
                <div className="relative h-72 bg-[#0a0a0a] overflow-hidden">
                  <Image src="/canal1.png" alt="Canal Paralelo" fill className="object-contain p-2 group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-3 left-3">
                    <span className="bg-[#c9a227] text-black px-3 py-1 rounded-full text-xs font-bold">Popular</span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-bold">🐋 Whale</span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-white mb-2">Canal Paralelo</h3>
                  <p className="text-gray-400 text-sm mb-4">Domina la técnica de canales de precio</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-white">Gs. 320.000</span>
                    <Link href="/courses/canal-paralelo" className="bg-[#c9a227]/20 hover:bg-[#c9a227] text-[#c9a227] hover:text-black px-4 py-2 rounded-lg text-sm font-bold transition-all border border-[#c9a227]/50">
                      Ver Curso
                    </Link>
                  </div>
                </div>
              </div>

              {/* Fibonacci */}
              <div className="bg-[#1a1a2e] rounded-2xl overflow-hidden border border-gray-800 hover:border-green-500/50 transition-all group">
                <div className="relative h-72 bg-[#0a0a0a] overflow-hidden">
                  <Image src="/desbloquea el poder de forex.png" alt="Fibonacci Avanzado" fill className="object-contain p-2 group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-3 left-3">
                    <span className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold">Nuevo</span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-bold">🐋 Whale</span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-white mb-2">Fibonacci Avanzado</h3>
                  <p className="text-gray-400 text-sm mb-4">Retrocesos y extensiones profesionales</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-white">Gs. 320.000</span>
                    <Link href="/courses/fibonacci" className="bg-green-600/20 hover:bg-green-600 text-green-400 hover:text-white px-4 py-2 rounded-lg text-sm font-bold transition-all border border-green-600/50">
                      Ver Curso
                    </Link>
                  </div>
                </div>
              </div>

              {/* Expansión Matemática */}
              <div className="bg-[#1a1a2e] rounded-2xl overflow-hidden border border-rose-500/30 hover:border-rose-500/60 transition-all group">
                <div className="relative h-72 bg-[#0a0a0a] overflow-hidden">
                  <Image src="/expa.png" alt="Expansión Matemática" fill className="object-contain p-2 group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-3 left-3">
                    <span className="bg-rose-600 text-white px-3 py-1 rounded-full text-xs font-bold">Premium</span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-white mb-2">Expansión Matemática</h3>
                  <p className="text-gray-400 text-sm mb-4">Matemáticas avanzadas para trading</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-white">Gs. 1.500.000</span>
                    <Link href="/courses/expansion-matematica" className="bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all">
                      Ver Curso
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center mt-10">
              <p className="text-gray-500 mb-3 text-sm">
                <span className="text-[#c9a227]">Canal Paralelo</span> y{' '}
                <span className="text-[#c9a227]">Fibonacci</span> están incluidos en el plan{' '}
                <span className="text-blue-400">Whale</span>
              </p>
              <Link href="/courses" className="text-[#c9a227] hover:text-[#d4af37] font-bold">
                Ver todos los cursos →
              </Link>
            </div>
          </div>
        </section>

        {/* ── PRICING - FLYERS DE PLANES COMPLETOS ─────────────── */}
        <section className="py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Planes Simples</h2>
              <p className="text-gray-400">Empieza gratis, mejora cuando quieras</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Free - sin imagen (gratis.png no existe) */}
              <div className="bg-[#1a1a2e] rounded-2xl overflow-hidden border border-gray-800">
                <div className="h-48 bg-gradient-to-br from-gray-800 to-gray-900 flex flex-col items-center justify-center">
                  <span className="text-5xl mb-2">🆓</span>
                  <span className="text-gray-300 font-bold text-lg">Plan Gratuito</span>
                </div>
                <div className="p-8 pt-5">
                  <h3 className="text-2xl font-bold text-white mb-2">Gratis</h3>
                  <p className="text-gray-400 text-sm mb-4">Para probar la herramienta</p>
                  <div className="text-4xl font-bold text-white mb-6">$0</div>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center gap-3 text-gray-300"><span className="text-green-500">✓</span>2 cálculos por día</li>
                    <li className="flex items-center gap-3 text-gray-300"><span className="text-green-500">✓</span>9 niveles cuánticos</li>
                    <li className="flex items-center gap-3 text-gray-500"><span className="text-gray-600">✗</span>Sin subarmónicos</li>
                    <li className="flex items-center gap-3 text-gray-500"><span className="text-gray-600">✗</span>Sin cursos</li>
                  </ul>
                  <Link href="/quantum" className="block w-full text-center border-2 border-gray-700 text-white py-3 rounded-xl font-bold hover:bg-white/5 transition-all">
                    Empezar Gratis
                  </Link>
                </div>
              </div>

              {/* Pro - con imagen planpro.png */}
              <div className="bg-[#1a1a2e] rounded-2xl overflow-hidden border-2 border-[#c9a227]/50 relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                  <span className="bg-[#c9a227] text-black px-4 py-1 rounded-full text-sm font-bold shadow-lg">POPULAR</span>
                </div>
                <div className="relative h-48 bg-[#0a0a0a] overflow-hidden">
                  <Image src="/planpro.png" alt="Plan Pro" fill className="object-contain p-2" />
                </div>
                <div className="p-8 pt-5">
                  <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
                  <p className="text-gray-400 text-sm mb-4">Para traders activos</p>
                  <div className="mb-1">
                    <span className="text-4xl font-bold text-white">$49</span>
                    <span className="text-gray-400">/mes</span>
                  </div>
                  <p className="text-gray-500 text-sm mb-6">≈ Gs. 340.000</p>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center gap-3 text-gray-300"><span className="text-[#c9a227]">✓</span>Cálculos ilimitados</li>
                    <li className="flex items-center gap-3 text-gray-300"><span className="text-[#c9a227]">✓</span>Subarmónicos incluidos</li>
                    <li className="flex items-center gap-3 text-gray-300"><span className="text-[#c9a227]">✓</span>Zonas Entelechy</li>
                    <li className="flex items-center gap-3 text-gray-500"><span className="text-gray-600">✗</span>Sin cursos incluidos</li>
                  </ul>
                  <Link href="/billing" className="block w-full text-center bg-[#c9a227] hover:bg-[#d4af37] text-black py-3 rounded-xl font-bold transition-all">
                    Comenzar Ahora
                  </Link>
                </div>
              </div>

              {/* Whale - con imagen PLAN.png */}
              <div className="bg-[#1a1a2e] rounded-2xl overflow-hidden border border-purple-500/30">
                <div className="relative h-48 bg-[#0a0a0a] overflow-hidden">
                  <Image src="/PLAN.png" alt="Plan Whale" fill className="object-contain p-2" />
                </div>
                <div className="p-8 pt-5">
                  <h3 className="text-2xl font-bold text-white mb-2">Whale 🐋</h3>
                  <p className="text-gray-400 text-sm mb-4">Todo incluido</p>
                  <div className="mb-1">
                    <span className="text-4xl font-bold text-white">$99</span>
                    <span className="text-gray-400">/mes</span>
                  </div>
                  <p className="text-gray-500 text-sm mb-6">≈ Gs. 693.900</p>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center gap-3 text-gray-300"><span className="text-purple-400">✓</span>Todo de Pro incluido</li>
                    <li className="flex items-center gap-3 text-purple-300"><span className="text-purple-400">✓</span>Curso Canal Paralelo</li>
                    <li className="flex items-center gap-3 text-purple-300"><span className="text-purple-400">✓</span>Curso Fibonacci</li>
                    <li className="flex items-center gap-3 text-gray-300"><span className="text-purple-400">✓</span>Comunidad VIP</li>
                  </ul>
                  <Link href="/billing" className="block w-full text-center bg-purple-600 hover:bg-purple-500 text-white py-3 rounded-xl font-bold transition-all">
                    Ser Whale
                  </Link>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="mt-12 bg-[#1a1a2e] rounded-2xl p-8 border border-gray-800">
              <h3 className="text-center text-white font-bold text-lg mb-6">Métodos de Pago</h3>
              <div className="flex flex-wrap items-center justify-center gap-8 mb-6">
                <Image src="/familiar.png" alt="Banco Familiar" width={120} height={60} className="rounded-lg" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/ueno.jpeg" alt="Ueno" width={120} height={60} className="rounded-lg object-contain" />
              </div>
              <div className="text-center mb-6">
                <p className="text-[#c9a227] font-bold">Hasta 12 cuotas sin interés</p>
                <p className="text-gray-400 text-sm">Tarjetas de crédito y débito aceptadas</p>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-[#0a0a0a] rounded-xl p-4 border border-gray-800">
                  <p className="text-white font-bold">3 cuotas</p>
                  <p className="text-green-400 text-sm">Sin interés</p>
                </div>
                <div className="bg-[#0a0a0a] rounded-xl p-4 border border-gray-800">
                  <p className="text-white font-bold">6 cuotas</p>
                  <p className="text-green-400 text-sm">Sin interés</p>
                </div>
                <div className="bg-[#0a0a0a] rounded-xl p-4 border border-[#c9a227]/50">
                  <p className="text-white font-bold">12 cuotas</p>
                  <p className="text-[#c9a227] text-sm">Sin interés</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ─────────────────────────────────────────── */}
        <section className="py-20 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              ¿Listo para operar con niveles cuánticos?
            </h2>
            <p className="text-gray-400 text-lg mb-10">
              Únete a traders que ya usan física cuántica para encontrar puntos de giro
            </p>
            <Link href="/quantum" className="inline-block bg-[#c9a227] hover:bg-[#d4af37] text-black px-10 py-4 rounded-xl text-lg font-bold transition-all">
              Probar Calculadora Gratis
            </Link>
          </div>
        </section>

        {/* ── FOOTER ───────────────────────────────────────────── */}
        <footer className="border-t border-gray-800 py-12 px-4">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <Image src="/logosacred.png" alt="Sacred Levels" width={36} height={36} className="rounded-lg" />
              <div>
                <span className="text-white font-bold">Sacred Levels</span>
                <p className="text-gray-500 text-sm">© 2025 Todos los derechos reservados</p>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-gray-400 text-sm">
              <Link href="/quantum" className="hover:text-[#c9a227] transition-colors">Calculadora</Link>
              <Link href="/courses" className="hover:text-[#c9a227] transition-colors">Cursos</Link>
              <Link href="/billing" className="hover:text-[#c9a227] transition-colors">Planes</Link>
              <Link href="/advanced" className="hover:text-[#c9a227] transition-colors">Resultados</Link>
              <a href="mailto:soporte@sacredlevels.com" className="hover:text-[#c9a227] transition-colors">Contacto</a>
            </div>
          </div>
        </footer>

      </main>
    </>
  );
}
