import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#0d1421]">

        {/* ── HERO ─────────────────────────────────────────────── */}
        <section className="relative pt-28 pb-20 px-4 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#c9a227]/4 via-transparent to-transparent pointer-events-none" />
          <div className="relative max-w-5xl mx-auto text-center">
            <p className="text-[#c9a227] text-[10px] uppercase tracking-widest mb-4 font-sans">
              Sacred Levels — Quantum Trading Platform
            </p>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Predice Niveles de{' '}
              <span className="text-[#c9a227]">Alta Probabilidad</span>
            </h1>
            <p className="text-lg md:text-xl text-[#8a9bb3] mb-10 max-w-2xl mx-auto">
              Calcula niveles cuánticos donde el precio tiene mayor probabilidad de girar.
              Usado por traders profesionales en Forex, Oro y Crypto.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/quantum" className="bg-[#c9a227] hover:bg-[#d4af37] text-black px-8 py-4 rounded-lg text-lg font-bold transition-colors">
                Probar Calculadora Gratis
              </Link>
              <Link href="/advanced" className="border border-[#1e2a3a] hover:border-[#c9a227] text-white hover:text-[#c9a227] px-8 py-4 rounded-lg text-lg font-bold transition-colors">
                Ver Resultados Reales
              </Link>
            </div>
            <div className="flex flex-wrap justify-center gap-8 text-[#8a9bb3] text-sm">
              {['2 cálculos gratis', 'Sin tarjeta de crédito', 'Resultados instantáneos'].map((t) => (
                <span key={t} className="flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 text-[#00d26a] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  {t}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ─────────────────────────────────────── */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="bg-[#131c2e] rounded-lg p-8 md:p-12 border border-[#1e2a3a]">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <p className="text-[#c9a227] text-[10px] uppercase tracking-widest mb-3">Metodología</p>
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">¿Cómo funciona?</h2>
                  <div className="space-y-6">
                    {[
                      { n: '1', title: 'Ingresa el rango', desc: 'Precio máximo y mínimo del período que analizas' },
                      { n: '2', title: 'Obtén los niveles', desc: '9 niveles cuánticos calculados con fórmula n²' },
                      { n: '3', title: 'Opera con ventaja', desc: 'Compra en zonas verdes (Q0-Q3), vende en rojas (Q6-Q8)' },
                    ].map((item) => (
                      <div key={item.n} className="flex gap-5">
                        <div className="w-10 h-10 bg-[#c9a227] rounded-lg flex items-center justify-center text-black font-bold text-base shrink-0">{item.n}</div>
                        <div>
                          <h3 className="text-white font-bold text-base mb-1">{item.title}</h3>
                          <p className="text-[#8a9bb3] text-sm">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Calculator preview — terminal style */}
                <div className="bg-[#0d1421] rounded-lg p-5 border border-[#1e2a3a]">
                  <div className="flex items-center justify-between mb-1 pb-3 border-b border-[#1e2a3a]">
                    <span className="text-[#c9a227] text-xs font-mono font-bold tracking-widest">XAU/USD</span>
                    <span className="text-[#8a9bb3] text-[10px] uppercase tracking-widest">Ejemplo</span>
                  </div>
                  <div className="space-y-1 mt-3">
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
                        className={`flex items-center justify-between px-3 py-2 rounded border-l-2 ${
                          item.type === 'sell'
                            ? 'bg-[#ff4757]/8 border-[#ff4757]'
                            : item.type === 'buy'
                            ? 'bg-[#00d26a]/8 border-[#00d26a]'
                            : 'bg-[#c9a227]/8 border-[#c9a227]'
                        }`}
                      >
                        <span className={`text-xs font-mono font-bold ${
                          item.type === 'sell' ? 'text-[#ff4757]' : item.type === 'buy' ? 'text-[#00d26a]' : 'text-[#c9a227]'
                        }`}>{item.level}</span>
                        <span className="text-white font-mono text-xs">{item.price}</span>
                        <span className={`text-[9px] uppercase tracking-widest ${
                          item.type === 'sell' ? 'text-[#ff4757]' : item.type === 'buy' ? 'text-[#00d26a]' : 'text-[#c9a227]'
                        }`}>
                          {item.type === 'sell' ? 'DIST' : item.type === 'buy' ? 'ACCUM' : 'EQ'}
                        </span>
                      </div>
                    ))}
                  </div>
                  <Link href="/quantum" className="block w-full mt-5 bg-[#c9a227] hover:bg-[#d4af37] text-black py-3 rounded-lg text-center font-bold text-sm transition-colors">
                    Calcular Mis Niveles
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── COURSES ───────────────────────────────────────────── */}
        <section className="py-20 px-4 bg-[#0d1421]">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-[#c9a227] text-[10px] uppercase tracking-widest mb-3">Formación</p>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Cursos de Trading</h2>
              <p className="text-[#8a9bb3] max-w-2xl mx-auto text-sm">
                Domina técnicas avanzadas de análisis técnico con nuestros cursos en video
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Física Cuántica */}
              <div className="bg-[#131c2e] rounded-lg overflow-hidden border border-[#1e2a3a] hover:border-[#8a9bb3] transition-colors group">
                <div className="relative h-72 bg-[#0d1421] overflow-hidden">
                  <Image src="/cuantico.png" alt="Física Cuántica" fill className="object-contain p-2 group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-3 left-3">
                    <span className="bg-[#4a9eff] text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest">Especial</span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-sm font-bold text-white mb-1 uppercase tracking-wide">Física Cuántica</h3>
                  <p className="text-[#8a9bb3] text-xs mb-4">Acceso completo a niveles cuánticos avanzados</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-base font-mono font-bold text-white">Gs. 650.000</span>
                      <p className="text-[#8a9bb3] text-[10px] mt-0.5">2 meses de acceso</p>
                    </div>
                    <Link href="/billing" className="bg-[#4a9eff] hover:bg-[#5aafff] text-white px-3 py-1.5 rounded text-xs font-bold transition-colors">
                      Acceder
                    </Link>
                  </div>
                </div>
              </div>

              {/* Canal Paralelo */}
              <div className="bg-[#131c2e] rounded-lg overflow-hidden border border-[#1e2a3a] hover:border-[#c9a227] transition-colors group">
                <div className="relative h-72 bg-[#0d1421] overflow-hidden">
                  <Image src="/canal1.png" alt="Canal Paralelo" fill className="object-contain p-2 group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-3 left-3">
                    <span className="bg-[#c9a227] text-black px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest">Popular</span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="bg-[#131c2e] border border-[#1e2a3a] text-[#8a9bb3] px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest">Whale</span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-sm font-bold text-white mb-1 uppercase tracking-wide">Canal Paralelo</h3>
                  <p className="text-[#8a9bb3] text-xs mb-4">Domina la técnica de canales de precio</p>
                  <div className="flex items-center justify-between">
                    <span className="text-base font-mono font-bold text-white">Gs. 320.000</span>
                    <Link href="/courses/canal-paralelo" className="border border-[#c9a227] hover:bg-[#c9a227] text-[#c9a227] hover:text-black px-3 py-1.5 rounded text-xs font-bold transition-colors">
                      Ver Curso
                    </Link>
                  </div>
                </div>
              </div>

              {/* Fibonacci */}
              <div className="bg-[#131c2e] rounded-lg overflow-hidden border border-[#1e2a3a] hover:border-[#00d26a] transition-colors group">
                <div className="relative h-72 bg-[#0d1421] overflow-hidden">
                  <Image src="/desbloquea el poder de forex.png" alt="Fibonacci Avanzado" fill className="object-contain p-2 group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-3 left-3">
                    <span className="bg-[#00d26a] text-black px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest">Nuevo</span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="bg-[#131c2e] border border-[#1e2a3a] text-[#8a9bb3] px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest">Whale</span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-sm font-bold text-white mb-1 uppercase tracking-wide">Fibonacci Avanzado</h3>
                  <p className="text-[#8a9bb3] text-xs mb-4">Retrocesos y extensiones profesionales</p>
                  <div className="flex items-center justify-between">
                    <span className="text-base font-mono font-bold text-white">Gs. 320.000</span>
                    <Link href="/courses/fibonacci" className="border border-[#00d26a] hover:bg-[#00d26a] text-[#00d26a] hover:text-black px-3 py-1.5 rounded text-xs font-bold transition-colors">
                      Ver Curso
                    </Link>
                  </div>
                </div>
              </div>

              {/* Expansión Matemática */}
              <div className="bg-[#131c2e] rounded-lg overflow-hidden border border-[#1e2a3a] hover:border-[#ff4757] transition-colors group">
                <div className="relative h-72 bg-[#0d1421] overflow-hidden">
                  <Image src="/expa.png" alt="Expansión Matemática" fill className="object-contain p-2 group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-3 left-3">
                    <span className="bg-[#ff4757] text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest">Premium</span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-sm font-bold text-white mb-1 uppercase tracking-wide">Expansión Matemática</h3>
                  <p className="text-[#8a9bb3] text-xs mb-4">Matemáticas avanzadas para trading</p>
                  <div className="flex items-center justify-between">
                    <span className="text-base font-mono font-bold text-white">Gs. 1.500.000</span>
                    <Link href="/courses/expansion-matematica" className="bg-[#ff4757] hover:bg-[#ff5f6e] text-white px-3 py-1.5 rounded text-xs font-bold transition-colors">
                      Ver Curso
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center mt-10">
              <p className="text-[#8a9bb3] mb-3 text-xs">
                <span className="text-[#c9a227]">Canal Paralelo</span> y{' '}
                <span className="text-[#c9a227]">Fibonacci</span> están incluidos en el plan{' '}
                <span className="text-[#4a9eff]">Whale</span>
              </p>
              <Link href="/courses" className="text-[#c9a227] hover:text-[#d4af37] text-sm font-bold transition-colors">
                Ver todos los cursos →
              </Link>
            </div>
          </div>
        </section>

        {/* ── PRICING ───────────────────────────────────────────── */}
        <section className="py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-[#c9a227] text-[10px] uppercase tracking-widest mb-3">Suscripciones</p>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Planes Simples</h2>
              <p className="text-[#8a9bb3] text-sm">Empieza gratis, mejora cuando quieras</p>
            </div>

            <div className="grid md:grid-cols-3 gap-5">
              {/* Free */}
              <div className="bg-[#131c2e] rounded-lg overflow-hidden border border-[#1e2a3a]">
                <div className="h-48 bg-[#0d1421] border-b border-[#1e2a3a] flex flex-col items-center justify-center gap-2">
                  <div className="w-12 h-12 border border-[#1e2a3a] rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-[#8a9bb3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-[#8a9bb3] font-bold text-sm uppercase tracking-widest">Plan Gratuito</span>
                </div>
                <div className="p-7 pt-5">
                  <h3 className="text-xl font-bold text-white mb-1">Gratis</h3>
                  <p className="text-[#8a9bb3] text-xs mb-4 uppercase tracking-wide">Para probar la herramienta</p>
                  <div className="text-3xl font-mono font-bold text-white mb-6">$0</div>
                  <ul className="space-y-2.5 mb-8">
                    <li className="flex items-center gap-3 text-[#8a9bb3] text-sm">
                      <svg className="w-3.5 h-3.5 text-[#00d26a] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                      2 cálculos por día
                    </li>
                    <li className="flex items-center gap-3 text-[#8a9bb3] text-sm">
                      <svg className="w-3.5 h-3.5 text-[#00d26a] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                      9 niveles cuánticos
                    </li>
                    <li className="flex items-center gap-3 text-[#8a9bb3]/50 text-sm">
                      <svg className="w-3.5 h-3.5 text-[#1e2a3a] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      Sin subarmónicos
                    </li>
                    <li className="flex items-center gap-3 text-[#8a9bb3]/50 text-sm">
                      <svg className="w-3.5 h-3.5 text-[#1e2a3a] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      Sin cursos
                    </li>
                  </ul>
                  <Link href="/quantum" className="block w-full text-center border border-[#1e2a3a] hover:border-[#8a9bb3] text-white py-3 rounded-lg font-bold text-sm hover:bg-white/5 transition-colors">
                    Empezar Gratis
                  </Link>
                </div>
              </div>

              {/* Pro */}
              <div className="bg-[#131c2e] rounded-lg overflow-hidden border border-[#c9a227] relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                  <span className="bg-[#c9a227] text-black px-4 py-1 rounded text-xs font-bold uppercase tracking-widest">Popular</span>
                </div>
                <div className="relative h-48 bg-[#0d1421] border-b border-[#1e2a3a] overflow-hidden">
                  <Image src="/planpro.png" alt="Plan Pro" fill className="object-contain p-2" />
                </div>
                <div className="p-7 pt-5">
                  <h3 className="text-xl font-bold text-white mb-1">Pro</h3>
                  <p className="text-[#8a9bb3] text-xs mb-4 uppercase tracking-wide">Para traders activos</p>
                  <div className="mb-1">
                    <span className="text-3xl font-mono font-bold text-white">$84</span>
                    <span className="text-[#8a9bb3] text-sm">/mes</span>
                  </div>
                  <p className="text-[#8a9bb3] text-xs mb-6 font-mono">Gs. 550.000</p>
                  <ul className="space-y-2.5 mb-8">
                    <li className="flex items-center gap-3 text-[#8a9bb3] text-sm">
                      <svg className="w-3.5 h-3.5 text-[#c9a227] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                      Cálculos ilimitados
                    </li>
                    <li className="flex items-center gap-3 text-[#8a9bb3] text-sm">
                      <svg className="w-3.5 h-3.5 text-[#c9a227] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                      Subarmónicos incluidos
                    </li>
                    <li className="flex items-center gap-3 text-[#8a9bb3] text-sm">
                      <svg className="w-3.5 h-3.5 text-[#c9a227] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                      Zonas Entelechy
                    </li>
                    <li className="flex items-center gap-3 text-[#8a9bb3]/50 text-sm">
                      <svg className="w-3.5 h-3.5 text-[#1e2a3a] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      Sin cursos incluidos
                    </li>
                  </ul>
                  <Link href="/billing" className="block w-full text-center bg-[#c9a227] hover:bg-[#d4af37] text-black py-3 rounded-lg font-bold text-sm transition-colors">
                    Comenzar Ahora
                  </Link>
                </div>
              </div>

              {/* Whale */}
              <div className="bg-[#131c2e] rounded-lg overflow-hidden border border-[#1e2a3a] hover:border-[#4a9eff] transition-colors">
                <div className="relative h-48 bg-[#0d1421] border-b border-[#1e2a3a] overflow-hidden">
                  <Image src="/PLAN.png" alt="Plan Whale" fill className="object-contain p-2" />
                </div>
                <div className="p-7 pt-5">
                  <h3 className="text-xl font-bold text-white mb-1">Whale</h3>
                  <p className="text-[#8a9bb3] text-xs mb-4 uppercase tracking-wide">Todo incluido</p>
                  <div className="mb-1">
                    <span className="text-3xl font-mono font-bold text-white">$99</span>
                    <span className="text-[#8a9bb3] text-sm">/mes</span>
                  </div>
                  <p className="text-[#8a9bb3] text-xs mb-6 font-mono">Gs. 693.900</p>
                  <ul className="space-y-2.5 mb-8">
                    <li className="flex items-center gap-3 text-[#8a9bb3] text-sm">
                      <svg className="w-3.5 h-3.5 text-[#4a9eff] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                      Todo de Pro incluido
                    </li>
                    <li className="flex items-center gap-3 text-[#8a9bb3] text-sm">
                      <svg className="w-3.5 h-3.5 text-[#4a9eff] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                      Curso Canal Paralelo
                    </li>
                    <li className="flex items-center gap-3 text-[#8a9bb3] text-sm">
                      <svg className="w-3.5 h-3.5 text-[#4a9eff] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                      Curso Fibonacci
                    </li>
                    <li className="flex items-center gap-3 text-[#8a9bb3] text-sm">
                      <svg className="w-3.5 h-3.5 text-[#4a9eff] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                      Comunidad VIP
                    </li>
                  </ul>
                  <Link href="/billing" className="block w-full text-center border border-[#4a9eff] hover:bg-[#4a9eff] text-[#4a9eff] hover:text-black py-3 rounded-lg font-bold text-sm transition-colors">
                    Ser Whale
                  </Link>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="mt-10 bg-[#131c2e] rounded-lg p-7 border border-[#1e2a3a]">
              <p className="text-[#8a9bb3] text-[10px] uppercase tracking-widest text-center mb-6">Métodos de Pago</p>
              <div className="flex flex-wrap items-center justify-center gap-8 mb-6">
                <Image src="/familiar.png" alt="Banco Familiar" width={120} height={60} className="rounded-lg" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/ueno.jpeg" alt="Ueno" width={120} height={60} className="rounded-lg object-contain" />
              </div>
              <div className="text-center mb-5">
                <p className="text-[#c9a227] font-bold text-sm">Hasta 12 cuotas sin interés</p>
                <p className="text-[#8a9bb3] text-xs mt-1">Tarjetas de crédito y débito aceptadas</p>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-[#0d1421] rounded-lg p-4 border border-[#1e2a3a]">
                  <p className="text-white font-mono font-bold text-sm">3 cuotas</p>
                  <p className="text-[#00d26a] text-xs mt-1">Sin interés</p>
                </div>
                <div className="bg-[#0d1421] rounded-lg p-4 border border-[#1e2a3a]">
                  <p className="text-white font-mono font-bold text-sm">6 cuotas</p>
                  <p className="text-[#00d26a] text-xs mt-1">Sin interés</p>
                </div>
                <div className="bg-[#0d1421] rounded-lg p-4 border border-[#c9a227]">
                  <p className="text-white font-mono font-bold text-sm">12 cuotas</p>
                  <p className="text-[#c9a227] text-xs mt-1">Sin interés</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ─────────────────────────────────────────── */}
        <section className="py-20 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-[#c9a227] text-[10px] uppercase tracking-widest mb-4">Acceso Inmediato</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Listo para operar con niveles cuánticos
            </h2>
            <p className="text-[#8a9bb3] text-base mb-10">
              Únete a traders que ya usan física cuántica para encontrar puntos de giro
            </p>
            <Link href="/quantum" className="inline-block bg-[#c9a227] hover:bg-[#d4af37] text-black px-10 py-4 rounded-lg text-base font-bold transition-colors">
              Probar Calculadora Gratis
            </Link>
          </div>
        </section>

        {/* ── FOOTER ───────────────────────────────────────────── */}
        <footer className="border-t border-[#1e2a3a] py-10 px-4">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <Image src="/logosacred.png" alt="Sacred Levels" width={32} height={32} className="rounded-lg" />
              <div>
                <span className="text-white font-bold text-sm">Sacred Levels</span>
                <p className="text-[#8a9bb3] text-xs mt-0.5">© 2025 Todos los derechos reservados</p>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-[#8a9bb3] text-xs uppercase tracking-widest">
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
