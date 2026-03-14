import Link from 'next/link';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'Cursos de Trading | Sacred Levels',
  description: 'Aprende análisis técnico profesional: Canal Paralelo, Fibonacci, Expansión Matemática y Física Cuántica aplicada al trading.',
};

const courses = [
  {
    id: 'fisica-cuantica',
    title: 'Física Cuántica',
    description: 'Acceso completo a la calculadora de niveles cuánticos. Incluye todas las funciones avanzadas: subarmónicos, zonas Entelechy, y más.',
    price: 'Gs. 650.000',
    duration: '2 meses de acceso',
    icon: '🔬',
    href: '/quantum',
    gradient: 'from-purple-600 to-blue-600',
    badge: 'Especial',
    badgeColor: 'bg-purple-500 text-white',
    features: ['Cálculos ilimitados', 'Subarmónicos', 'Zonas Entelechy', 'Soporte incluido'],
  },
  {
    id: 'canal-paralelo',
    title: 'Canal Paralelo',
    description: 'Aprende a identificar y operar canales de precio. Técnica fundamental para detectar tendencias y puntos de entrada/salida precisos.',
    price: 'Gs. 320.000',
    icon: '📊',
    href: '/courses/canal-paralelo',
    gradient: 'from-[#c9a227] to-[#a8861f]',
    badge: 'Popular',
    badgeColor: 'bg-[#c9a227] text-black',
    features: ['Videos HD', 'Ejemplos reales', 'Estrategias probadas', 'Incluido en Whale'],
    inWhale: true,
  },
  {
    id: 'fibonacci',
    title: 'Fibonacci Avanzado',
    description: 'Domina los retrocesos y extensiones de Fibonacci. Aprende a combinarlos con niveles cuánticos para máxima precisión.',
    price: 'Gs. 320.000',
    icon: '🌀',
    href: '/courses/fibonacci',
    gradient: 'from-green-600 to-emerald-600',
    badge: 'Nuevo',
    badgeColor: 'bg-green-500 text-white',
    features: ['Retrocesos', 'Extensiones', 'Confluencias', 'Incluido en Whale'],
    inWhale: true,
  },
  {
    id: 'expansion-matematica',
    title: 'Expansión Matemática',
    description: 'Curso premium avanzado. Matemáticas aplicadas al trading: geometría de mercado, ciclos, y proyecciones avanzadas.',
    price: 'Gs. 1.500.000',
    icon: '🧮',
    href: '/courses/expansion-matematica',
    gradient: 'from-rose-600 to-pink-600',
    badge: 'Premium',
    badgeColor: 'bg-rose-500 text-white',
    features: ['Contenido exclusivo', 'Matemáticas avanzadas', 'Proyecciones', 'Soporte VIP'],
    premium: true,
  },
];

export default function CoursesPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#0a0a0a] pt-24 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full text-purple-400 text-sm font-medium mb-4">
              📚 Educación Premium
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Cursos de Trading
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Aprende técnicas profesionales de análisis técnico con nuestros cursos en video
            </p>
          </div>

          {/* Courses Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            {courses.map((course) => (
              <div
                key={course.id}
                className={`group relative bg-gradient-to-br from-[#1a1a2e] to-[#12121f] rounded-3xl overflow-hidden border transition-all duration-500 hover:shadow-2xl ${
                  course.premium
                    ? 'border-rose-500/30 hover:border-rose-500/50'
                    : 'border-gray-800 hover:border-[#c9a227]/50'
                }`}
              >
                {/* Gradient header */}
                <div className={`relative h-40 bg-gradient-to-br ${course.gradient} flex items-center justify-center overflow-hidden`}>
                  <div className="absolute inset-0 bg-black/20" />
                  <span className="relative text-7xl group-hover:scale-110 transition-transform duration-500">{course.icon}</span>
                  <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${course.badgeColor}`}>
                      {course.badge}
                    </span>
                  </div>
                  {course.inWhale && (
                    <div className="absolute top-4 right-4">
                      <span className="px-2 py-1 bg-blue-500/90 text-white text-xs rounded-full font-medium">🐋 Whale</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-white mb-3">{course.title}</h3>
                  <p className="text-gray-400 mb-6">{course.description}</p>

                  {/* Features */}
                  <div className="grid grid-cols-2 gap-2 mb-6">
                    {course.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-2 text-sm text-gray-300">
                        <svg className="w-4 h-4 text-green-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {feature}
                      </div>
                    ))}
                  </div>

                  {/* Price + CTA */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-3xl font-bold text-white">{course.price}</span>
                      {course.duration && (
                        <p className="text-gray-500 text-sm mt-0.5">{course.duration}</p>
                      )}
                    </div>
                    <Link
                      href={course.href}
                      className={`px-6 py-3 rounded-xl font-bold transition-all ${
                        course.id === 'fisica-cuantica'
                          ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg shadow-purple-500/20'
                          : course.premium
                          ? 'bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white'
                          : 'bg-gradient-to-r from-[#c9a227] to-[#d4af37] hover:from-[#d4af37] hover:to-[#e5c349] text-black'
                      }`}
                    >
                      Ver Curso
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Whale CTA */}
          <div className="mt-16 bg-gradient-to-r from-purple-900/30 via-blue-900/30 to-purple-900/30 border border-purple-500/30 rounded-3xl p-8 md:p-12 text-center">
            <span className="text-5xl mb-4 block">🐋</span>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              ¿Quieres Canal Paralelo y Fibonacci incluidos?
            </h2>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto">
              Con el plan Whale obtienes acceso a ambos cursos más todas las funciones Pro por solo $99/mes
            </p>
            <Link
              href="/billing"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-purple-500/20"
            >
              Ver Plan Whale
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
