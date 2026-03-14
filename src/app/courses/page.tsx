import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'Cursos de Trading | Sacred Levels',
  description: 'Aprende análisis técnico profesional: Canal Paralelo, Fibonacci, Expansión Matemática y Física Cuántica aplicada al trading.',
};

export default function CoursesPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#0a0a0a] pt-24 pb-20 px-4">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Cursos de Trading
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Aprende técnicas profesionales de análisis técnico con nuestros cursos en video
            </p>
          </div>

          {/* Courses Grid */}
          <div className="grid md:grid-cols-2 gap-8">

            {/* Física Cuántica */}
            <div className="bg-[#1a1a2e] rounded-2xl overflow-hidden border border-purple-500/30 hover:border-purple-500/60 transition-all">
              <div className="relative aspect-video overflow-hidden">
                <Image
                  src="/cuantico.png"
                  alt="Física Cuántica - Niveles Cuánticos"
                  fill
                  className="object-contain bg-black"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-bold">Especial</span>
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold text-white mb-3">Física Cuántica</h3>
                <p className="text-gray-400 mb-6">
                  Acceso completo a la calculadora de niveles cuánticos. Incluye todas las funciones avanzadas:
                  subarmónicos, zonas Entelechy, y más.
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-bold text-white">Gs. 650.000</span>
                    <p className="text-gray-500 text-sm">Pago único - 2 meses de acceso</p>
                  </div>
                  <Link
                    href="/billing"
                    className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-xl font-bold transition-all"
                  >
                    Acceder Ahora
                  </Link>
                </div>
              </div>
            </div>

            {/* Canal Paralelo */}
            <div className="bg-[#1a1a2e] rounded-2xl overflow-hidden border border-gray-800 hover:border-[#c9a227]/50 transition-all">
              <div className="relative aspect-video overflow-hidden">
                <Image
                  src="/canal1.png"
                  alt="Curso Canal Paralelo"
                  fill
                  className="object-contain bg-black"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="bg-[#c9a227] text-black px-4 py-2 rounded-lg text-sm font-bold">Popular</span>
                  <span className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold">Incluido en Whale</span>
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold text-white mb-3">Canal Paralelo</h3>
                <p className="text-gray-400 mb-6">
                  Aprende a identificar y operar canales de precio. Técnica fundamental para detectar
                  tendencias y puntos de entrada/salida precisos.
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-bold text-white">Gs. 320.000</span>
                    <p className="text-green-400 text-sm">O gratis con plan Whale</p>
                  </div>
                  <Link
                    href="/courses/canal-paralelo"
                    className="bg-[#c9a227] hover:bg-[#d4af37] text-black px-6 py-3 rounded-xl font-bold transition-all"
                  >
                    Ver Curso
                  </Link>
                </div>
              </div>
            </div>

            {/* Fibonacci */}
            <div className="bg-[#1a1a2e] rounded-2xl overflow-hidden border border-gray-800 hover:border-green-500/50 transition-all">
              <div className="relative aspect-video overflow-hidden">
                <Image
                  src="/desbloquea el poder de forex.png"
                  alt="Curso Fibonacci Avanzado"
                  fill
                  className="object-contain bg-black"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold">Nuevo</span>
                  <span className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold">Incluido en Whale</span>
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold text-white mb-3">Fibonacci Avanzado</h3>
                <p className="text-gray-400 mb-6">
                  Domina los retrocesos y extensiones de Fibonacci. Aprende a combinarlos con
                  niveles cuánticos para máxima precisión en tus entradas.
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-bold text-white">Gs. 320.000</span>
                    <p className="text-green-400 text-sm">O gratis con plan Whale</p>
                  </div>
                  <Link
                    href="/courses/fibonacci"
                    className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-xl font-bold transition-all"
                  >
                    Ver Curso
                  </Link>
                </div>
              </div>
            </div>

            {/* Expansión Matemática */}
            <div className="bg-[#1a1a2e] rounded-2xl overflow-hidden border border-rose-500/30 hover:border-rose-500/60 transition-all">
              <div className="relative aspect-video overflow-hidden">
                <Image
                  src="/expa.png"
                  alt="Curso Expansión Matemática"
                  fill
                  className="object-contain bg-black"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-rose-600 text-white px-4 py-2 rounded-lg text-sm font-bold">Premium</span>
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold text-white mb-3">Expansión Matemática</h3>
                <p className="text-gray-400 mb-6">
                  Curso premium avanzado. Matemáticas aplicadas al trading: geometría de mercado,
                  ciclos, y proyecciones avanzadas para traders expertos.
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-bold text-white">Gs. 1.500.000</span>
                    <p className="text-gray-500 text-sm">Curso premium exclusivo</p>
                  </div>
                  <Link
                    href="/courses/expansion-matematica"
                    className="bg-rose-600 hover:bg-rose-500 text-white px-6 py-3 rounded-xl font-bold transition-all"
                  >
                    Ver Curso
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Whale CTA */}
          <div className="mt-16 bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/30 rounded-2xl p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                  ¿Quieres Canal Paralelo y Fibonacci incluidos?
                </h2>
                <p className="text-gray-400 mb-6">
                  Con el plan Whale obtienes acceso a ambos cursos más todas las funciones Pro por solo $99/mes
                </p>
                <ul className="space-y-2 mb-6">
                  {[
                    'Calculadora ilimitada',
                    'Curso Canal Paralelo incluido',
                    'Curso Fibonacci incluido',
                    'Comunidad VIP',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-gray-300">
                      <span className="text-purple-400">✓</span>{item}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/billing"
                  className="inline-block bg-purple-600 hover:bg-purple-500 text-white px-8 py-4 rounded-xl font-bold transition-all"
                >
                  Ver Plan Whale
                </Link>
              </div>
              <div className="relative aspect-video">
                <Image src="/whale.png" alt="Plan Whale" fill className="object-contain" />
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="mt-12 bg-[#1a1a2e] rounded-2xl p-8 border border-gray-800">
            <h3 className="text-center text-white font-bold text-xl mb-6">Métodos de Pago</h3>
            <div className="flex flex-wrap items-center justify-center gap-8 mb-6">
              <Image src="/familiar.png" alt="Banco Familiar" width={140} height={70} className="rounded-lg" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/ueno.jpeg" alt="Ueno" width={140} height={70} className="rounded-lg object-contain" />
            </div>
            <div className="text-center">
              <p className="text-[#c9a227] font-bold text-lg mb-2">Hasta 12 cuotas sin interés</p>
              <p className="text-gray-400">Tarjetas de crédito y débito aceptadas</p>
            </div>
          </div>

        </div>
      </main>
    </>
  );
}
