import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';

const courses = [
  {
    id: 'fisica-cuantica',
    title: 'Física Cuántica',
    description: 'Acceso completo a la calculadora de niveles cuánticos con todas las funciones avanzadas.',
    price: 'Gs. 650.000',
    duration: '2 meses',
    icon: '🔬',
    href: '/quantum',
    gradient: 'from-purple-600 to-blue-600',
    badge: 'Especial',
    badgeColor: 'bg-purple-500 text-white',
    inWhale: false,
  },
  {
    id: 'canal-paralelo',
    title: 'Canal Paralelo',
    description: 'Domina la técnica de canales para identificar tendencias y puntos de entrada precisos.',
    price: 'Gs. 320.000',
    icon: '📊',
    href: '/courses/canal-paralelo',
    gradient: 'from-[#c9a227] to-[#a8861f]',
    badge: 'Popular',
    badgeColor: 'bg-[#c9a227] text-black',
    inWhale: true,
  },
  {
    id: 'fibonacci',
    title: 'Fibonacci Avanzado',
    description: 'Aprende a usar retrocesos y extensiones de Fibonacci como un profesional.',
    price: 'Gs. 320.000',
    icon: '🌀',
    href: '/courses/fibonacci',
    gradient: 'from-green-600 to-emerald-600',
    badge: 'Nuevo',
    badgeColor: 'bg-green-500 text-white',
    inWhale: true,
  },
  {
    id: 'expansion-matematica',
    title: 'Expansión Matemática',
    description: 'Curso premium: Matemáticas avanzadas aplicadas al trading profesional.',
    price: 'Gs. 1.500.000',
    icon: '🧮',
    href: '/courses/expansion-matematica',
    gradient: 'from-rose-600 to-pink-600',
    badge: 'Premium',
    badgeColor: 'bg-rose-500 text-white',
    inWhale: false,
  },
];

const checkIcon = (
  <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
);

const xIcon = (
  <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#0a0a0a]">

        {/* ── HERO ─────────────────────────────────────────────── */}
        <section className="relative pt-28 pb-20 px-4 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-gradient-to-b from-[#c9a227]/10 via-purple-500/5 to-transparent rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-3xl" />
          </div>

          <div className="relative max-w-5xl mx-auto text-center">
            {/* Live badge */}
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-gradient-to-r from-[#c9a227]/20 to-purple-500/20 border border-[#c9a227]/30 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#c9a227] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#c9a227]" />
              </span>
              <span className="text-[#c9a227] text-sm font-medium">Física Cuántica aplicada al Trading</span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Predice Niveles de{' '}
              <span className="relative inline-block">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#c9a227] via-[#e5c349] to-[#c9a227]">
                  Alta Probabilidad
                </span>
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                  <path d="M2 10C50 4 100 4 150 7C200 10 250 6 298 2" stroke="url(#gold-gradient)" strokeWidth="3" strokeLinecap="round"/>
                  <defs>
                    <linearGradient id="gold-gradient" x1="0" y1="0" x2="300" y2="0">
                      <stop offset="0%" stopColor="#c9a227"/>
                      <stop offset="50%" stopColor="#e5c349"/>
                      <stop offset="100%" stopColor="#c9a227"/>
                    </linearGradient>
                  </defs>
                </svg>
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              Calcula niveles cuánticos donde el precio tiene mayor probabilidad de girar.
              Usado por traders en{' '}
              <span className="text-white">Forex</span>,{' '}
              <span className="text-[#c9a227]">Oro</span> y{' '}
              <span className="text-purple-400">Crypto</span>.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                href="/quantum"
                className="group relative bg-gradient-to-r from-[#c9a227] to-[#d4af37] hover:from-[#d4af37] hover:to-[#e5c349] text-black px-8 py-4 rounded-2xl text-lg font-bold transition-all transform hover:scale-105 shadow-xl shadow-[#c9a227]/25"
              >
                <span className="flex items-center justify-center gap-2">
                  Probar Calculadora Gratis
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Link>
              <Link
                href="/advanced"
                className="group border-2 border-gray-700 hover:border-[#c9a227]/50 text-white hover:text-[#c9a227] px-8 py-4 rounded-2xl text-lg font-bold transition-all hover:bg-[#c9a227]/5"
              >
                <span className="flex items-center justify-center gap-2">
                  Ver Resultados Reales
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </Link>
            </div>

            <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-gray-400">
              {['2 cálculos gratis', 'Sin tarjeta de crédito', 'Resultados instantáneos'].map((t) => (
                <span key={t} className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {t}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS + CALCULATOR PREVIEW ───────────────── */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="relative bg-gradient-to-br from-[#1a1a2e] via-[#1a1a2e] to-[#12121f] rounded-3xl p-8 md:p-12 border border-gray-800/50 overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#c9a227]/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <span className="inline-block px-3 py-1 bg-[#c9a227]/20 text-[#c9a227] text-sm font-medium rounded-full mb-4">
                    Simple y Efectivo
                  </span>
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">¿Cómo funciona?</h2>
                  <div className="space-y-6">
                    {[
                      { step: '1', title: 'Ingresa el rango', desc: 'Precio máximo y mínimo del período que analizas' },
                      { step: '2', title: 'Obtén los niveles', desc: '9 niveles cuánticos calculados con fórmula n²' },
                      { step: '3', title: 'Opera con ventaja', desc: 'Compra en zonas verdes (Q0-Q3), vende en rojas (Q6-Q8)' },
                    ].map((item) => (
                      <div key={item.step} className="flex gap-5 group">
                        <div className="w-14 h-14 bg-gradient-to-br from-[#c9a227] to-[#a8861f] rounded-2xl flex items-center justify-center text-black font-bold text-xl shrink-0 shadow-lg shadow-[#c9a227]/20 group-hover:scale-110 transition-transform">
                          {item.step}
                        </div>
                        <div>
                          <h3 className="text-white font-bold text-lg mb-1">{item.title}</h3>
                          <p className="text-gray-400">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Calculator preview */}
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#c9a227]/20 to-purple-500/20 rounded-3xl blur-xl" />
                  <div className="relative bg-[#0a0a0a] rounded-2xl p-6 border border-gray-800 shadow-2xl">
                    <div className="flex items-center justify-between mb-4">
                      <span className="px-3 py-1 bg-[#c9a227]/20 text-[#c9a227] text-sm font-bold rounded-full">XAU/USD</span>
                      <span className="text-gray-500 text-sm">Ejemplo en vivo</span>
                    </div>
                    <div className="space-y-1.5">
                      {[
                        { level: 'Q8', price: '2,700.00', type: 'sell', zone: 'Distribución' },
                        { level: 'Q7', price: '2,676.56', type: 'sell', zone: '' },
                        { level: 'Q6', price: '2,656.25', type: 'sell', zone: '' },
                        { level: 'Q5', price: '2,625.00', type: 'neutral', zone: 'Equilibrio' },
                        { level: 'Q4', price: '2,600.00', type: 'neutral', zone: '' },
                        { level: 'Q3', price: '2,556.25', type: 'buy', zone: '' },
                        { level: 'Q2', price: '2,525.00', type: 'buy', zone: '' },
                        { level: 'Q1', price: '2,506.25', type: 'buy', zone: 'Acumulación' },
                        { level: 'Q0', price: '2,500.00', type: 'buy', zone: '' },
                      ].map((item) => (
                        <div
                          key={item.level}
                          className={`flex items-center justify-between p-2.5 rounded-xl ${
                            item.type === 'sell'
                              ? 'bg-red-900/40 border-l-4 border-red-500'
                              : item.type === 'buy'
                              ? 'bg-green-900/40 border-l-4 border-green-500'
                              : 'bg-yellow-900/30 border-l-4 border-yellow-500'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-bold w-8 ${
                              item.type === 'sell' ? 'text-red-400' : item.type === 'buy' ? 'text-green-400' : 'text-yellow-400'
                            }`}>{item.level}</span>
                            {item.zone && (
                              <span className={`text-xs px-2 py-0.5 rounded-full hidden sm:inline ${
                                item.type === 'sell' ? 'bg-red-500/20 text-red-300' :
                                item.type === 'buy' ? 'bg-green-500/20 text-green-300' :
                                'bg-yellow-500/20 text-yellow-300'
                              }`}>{item.zone}</span>
                            )}
                          </div>
                          <span className="text-white font-mono text-sm">{item.price}</span>
                        </div>
                      ))}
                    </div>
                    <Link
                      href="/quantum"
                      className="block w-full mt-5 bg-gradient-to-r from-[#c9a227] to-[#d4af37] hover:from-[#d4af37] hover:to-[#e5c349] text-black py-4 rounded-xl text-center font-bold transition-all"
                    >
                      Calcular Mis Niveles →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── COURSES ──────────────────────────────────────────── */}
        <section className="py-20 px-4 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0d1117] to-transparent pointer-events-none" />

          <div className="relative max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full text-purple-400 text-sm font-medium mb-4">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
                </svg>
                Educación Premium
              </span>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                Cursos de Trading Profesional
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                Domina técnicas avanzadas de análisis técnico con nuestros cursos en video
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="group relative bg-gradient-to-br from-[#1a1a2e] to-[#12121f] rounded-2xl overflow-hidden border border-gray-800 hover:border-[#c9a227]/50 transition-all duration-500 hover:shadow-2xl"
                >
                  {/* Gradient header */}
                  <div className={`relative h-32 bg-gradient-to-br ${course.gradient} flex items-center justify-center`}>
                    <span className="text-5xl group-hover:scale-110 transition-transform duration-300">{course.icon}</span>
                    <div className="absolute top-3 left-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${course.badgeColor}`}>
                        {course.badge}
                      </span>
                    </div>
                    {course.inWhale && (
                      <div className="absolute top-3 right-3">
                        <span className="px-2 py-1 bg-blue-500/90 text-white text-xs rounded-full font-medium">🐋 Whale</span>
                      </div>
                    )}
                    {course.duration && (
                      <div className="absolute bottom-3 right-3">
                        <span className="px-2 py-1 bg-black/50 text-white text-xs rounded-full backdrop-blur-sm">{course.duration}</span>
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#c9a227] transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">{course.description}</p>
                    <p className="text-2xl font-bold text-white mb-4">{course.price}</p>
                    <Link
                      href={course.href}
                      className={`block w-full py-3 rounded-xl text-center font-bold transition-all ${
                        course.id === 'fisica-cuantica'
                          ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white'
                          : course.id === 'expansion-matematica'
                          ? 'bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white'
                          : 'bg-[#c9a227]/10 hover:bg-[#c9a227] text-[#c9a227] hover:text-black border border-[#c9a227]/50'
                      }`}
                    >
                      {course.id === 'fisica-cuantica' ? 'Acceder Ahora' : 'Ver Curso'}
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-10">
              <p className="text-gray-500 mb-3 text-sm">
                💡 <span className="text-[#c9a227]">Canal Paralelo</span> y{' '}
                <span className="text-[#c9a227]">Fibonacci</span> están incluidos en el plan{' '}
                <span className="text-blue-400">Whale</span>
              </p>
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 text-[#c9a227] hover:text-[#d4af37] font-bold group"
              >
                Ver todos los cursos
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* ── PRICING ──────────────────────────────────────────── */}
        <section className="py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-2 bg-[#c9a227]/10 border border-[#c9a227]/30 rounded-full text-[#c9a227] text-sm font-medium mb-4">
                💎 Precios transparentes
              </span>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Planes Simples</h2>
              <p className="text-gray-400 text-lg">Empieza gratis, mejora cuando quieras</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
              {/* Free */}
              <div className="relative bg-gradient-to-br from-[#1a1a2e] to-[#12121f] rounded-3xl p-8 border border-gray-800 hover:border-gray-700 transition-all">
                <h3 className="text-2xl font-bold text-white mb-2">Gratis</h3>
                <p className="text-gray-400 text-sm mb-6">Para probar la herramienta</p>
                <div className="text-5xl font-bold text-white mb-8">$0</div>
                <ul className="space-y-4 mb-8">
                  {[
                    { text: '2 cálculos por día', ok: true },
                    { text: '9 niveles cuánticos', ok: true },
                    { text: 'Subarmónicos', ok: false },
                    { text: 'Zonas Entelechy', ok: false },
                    { text: 'Cursos incluidos', ok: false },
                  ].map((item) => (
                    <li key={item.text} className={`flex items-center gap-3 ${item.ok ? 'text-gray-300' : 'text-gray-500'}`}>
                      <span className={item.ok ? 'text-green-500' : 'text-gray-600'}>{item.ok ? checkIcon : xIcon}</span>
                      {item.text}
                    </li>
                  ))}
                </ul>
                <Link href="/quantum" className="block w-full text-center border-2 border-gray-700 hover:border-gray-600 text-white py-4 rounded-2xl font-bold hover:bg-white/5 transition-all">
                  Empezar Gratis
                </Link>
              </div>

              {/* Pro */}
              <div className="relative bg-gradient-to-br from-[#1a1a2e] to-[#12121f] rounded-3xl p-8 border-2 border-[#c9a227]/50 hover:border-[#c9a227] transition-all overflow-hidden">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-[#c9a227] to-[#d4af37] text-black px-6 py-1.5 rounded-full text-sm font-bold shadow-lg">
                    POPULAR
                  </span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-[#c9a227]/10 to-transparent pointer-events-none" />
                <div className="relative">
                  <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
                  <p className="text-gray-400 text-sm mb-6">Para traders activos</p>
                  <div className="mb-2">
                    <span className="text-5xl font-bold text-white">$49</span>
                    <span className="text-gray-400 text-lg">/mes</span>
                  </div>
                  <p className="text-gray-500 text-sm mb-8">≈ Gs. 340.000</p>
                  <ul className="space-y-4 mb-8">
                    {[
                      { text: 'Cálculos ilimitados', ok: true },
                      { text: 'Subarmónicos', ok: true },
                      { text: 'Zonas Entelechy', ok: true },
                      { text: 'Soporte prioritario', ok: true },
                      { text: 'Cursos incluidos', ok: false },
                    ].map((item) => (
                      <li key={item.text} className={`flex items-center gap-3 ${item.ok ? 'text-gray-300' : 'text-gray-500'}`}>
                        <span className={item.ok ? 'text-[#c9a227]' : 'text-gray-600'}>{item.ok ? checkIcon : xIcon}</span>
                        {item.text}
                      </li>
                    ))}
                  </ul>
                  <Link href="/billing" className="block w-full text-center bg-gradient-to-r from-[#c9a227] to-[#d4af37] hover:from-[#d4af37] hover:to-[#e5c349] text-black py-4 rounded-2xl font-bold transition-all shadow-lg shadow-[#c9a227]/20">
                    Comenzar Ahora
                  </Link>
                </div>
              </div>

              {/* Whale */}
              <div className="relative bg-gradient-to-br from-[#1e1e3f] to-[#12121f] rounded-3xl p-8 border border-purple-500/30 hover:border-purple-500/50 transition-all overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
                <div className="relative">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-3xl">🐋</span>
                    <h3 className="text-2xl font-bold text-white">Whale</h3>
                  </div>
                  <p className="text-gray-400 text-sm mb-6">Todo incluido</p>
                  <div className="mb-2">
                    <span className="text-5xl font-bold text-white">$99</span>
                    <span className="text-gray-400 text-lg">/mes</span>
                  </div>
                  <p className="text-gray-500 text-sm mb-8">≈ Gs. 693.900</p>
                  <ul className="space-y-4 mb-8">
                    {[
                      { text: 'Todo de Pro incluido', color: 'text-purple-400' },
                      { text: 'Curso Canal Paralelo', color: 'text-purple-400', tag: true },
                      { text: 'Curso Fibonacci', color: 'text-purple-400', tag: true },
                      { text: 'Acceso anticipado', color: 'text-purple-400' },
                      { text: 'Comunidad VIP', color: 'text-purple-400' },
                    ].map((item) => (
                      <li key={item.text} className="flex items-center gap-3 text-gray-300">
                        <span className={item.color}>{checkIcon}</span>
                        {item.text}
                        {item.tag && (
                          <span className="text-xs bg-purple-500/30 text-purple-300 px-2 py-0.5 rounded-full ml-auto">Incluido</span>
                        )}
                      </li>
                    ))}
                  </ul>
                  <Link href="/billing" className="block w-full text-center bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-purple-500/20">
                    Ser Whale 🐋
                  </Link>
                </div>
              </div>
            </div>

            {/* Payment methods */}
            <div className="mt-12 text-center">
              <p className="text-gray-500 text-sm mb-4">Métodos de pago disponibles</p>
              <div className="flex items-center justify-center gap-8">
                <Image src="/familiar.png" alt="Banco Familiar" width={80} height={40} className="opacity-60 hover:opacity-100 transition-opacity" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/ueno.jpeg" alt="Ueno" width={80} height={40} className="opacity-60 hover:opacity-100 transition-opacity rounded object-contain" />
              </div>
              <p className="text-gray-600 text-xs mt-4">Pagos en guaraníes — sin comisiones ocultas</p>
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ─────────────────────────────────────────── */}
        <section className="py-20 px-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#c9a227]/10 via-purple-500/10 to-[#c9a227]/10 pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[#c9a227]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              ¿Listo para operar con{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#c9a227] to-purple-400">
                niveles cuánticos
              </span>?
            </h2>
            <p className="text-gray-400 text-lg mb-10">
              Únete a traders que ya usan física cuántica para encontrar puntos de giro
            </p>
            <Link
              href="/quantum"
              className="inline-flex items-center gap-3 bg-gradient-to-r from-[#c9a227] to-[#d4af37] hover:from-[#d4af37] hover:to-[#e5c349] text-black px-10 py-5 rounded-2xl text-lg font-bold transition-all transform hover:scale-105 shadow-xl shadow-[#c9a227]/30"
            >
              Probar Calculadora Gratis
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </section>

        {/* ── FOOTER ───────────────────────────────────────────── */}
        <footer className="border-t border-gray-800/50 py-12 px-4">
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
