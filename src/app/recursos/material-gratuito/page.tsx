import { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { prisma } from '@/lib/prisma'

export const metadata: Metadata = {
  title: 'Material Gratuito',
  description: 'Material educativo gratuito de Sacred Levels para empezar en el trading.',
}

export default async function MaterialGratuitoPage() {
  let resources: Awaited<ReturnType<typeof prisma.resource.findMany>> = []
  try {
    resources = await prisma.resource.findMany({
      where: { category: 'free_material', isActive: true },
      orderBy: { order: 'asc' },
    })
  } catch (e) {
    console.error('recursos/material-gratuito: DB error', e)
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <div className="pt-28 pb-20 px-4">
        <div className="max-w-6xl mx-auto">

          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              🎁 Material <span className="text-[#c9a227]">Gratuito</span>
            </h1>
            <p className="text-gray-400">Recursos gratuitos para comenzar tu camino en el trading</p>
          </div>

          {resources.length === 0 ? (
            <div className="text-center py-20">
              <span className="text-6xl block mb-6">🎁</span>
              <h2 className="text-2xl font-bold text-white mb-3">Próximamente</h2>
              <p className="text-gray-400 mb-8">Estamos preparando material educativo exclusivo.</p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link href="/educacion/que-es-forex" className="bg-[#c9a227] hover:bg-[#d4af37] text-black font-bold px-6 py-3 rounded-lg transition-colors">
                  Leer sobre Forex →
                </Link>
                <Link href="/register" className="border border-[#c9a227]/40 hover:border-[#c9a227] text-[#c9a227] font-bold px-6 py-3 rounded-lg transition-colors">
                  Registrarse Gratis →
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {resources.map((r) => (
                <div key={r.id} className="bg-gradient-to-br from-[#1a1a2e] to-[#0d0d0d] border border-green-500/30 rounded-xl overflow-hidden">
                  {r.imageUrl ? (
                    <div className="h-48 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={r.imageUrl} alt={r.title} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-green-900/30 to-green-900/10 flex items-center justify-center">
                      <span className="text-6xl">📚</span>
                    </div>
                  )}
                  <div className="p-6">
                    <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full font-bold">GRATIS</span>
                    <h3 className="text-xl font-bold text-white mt-3 mb-2">{r.title}</h3>
                    {r.description && <p className="text-gray-400 text-sm mb-4">{r.description}</p>}
                    {r.downloadUrl && (
                      <a href={r.downloadUrl} download className="text-[#c9a227] hover:underline text-sm font-medium">
                        Descargar gratis →
                      </a>
                    )}
                    {r.externalUrl && !r.downloadUrl && (
                      <a href={r.externalUrl} target="_blank" rel="noopener noreferrer" className="text-[#c9a227] hover:underline text-sm font-medium">
                        Ver recurso →
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
      <Footer />
    </main>
  )
}
