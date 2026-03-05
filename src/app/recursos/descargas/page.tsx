import { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { prisma } from '@/lib/prisma'

export const metadata: Metadata = {
  title: 'Descargas',
  description: 'Recursos descargables gratuitos para traders: plantillas, guías, indicadores y más.',
}

export default async function DescargasPage() {
  const resources = await prisma.resource.findMany({
    where: { category: 'downloads', isActive: true },
    orderBy: { order: 'asc' },
  })

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <div className="pt-28 pb-20 px-4">
        <div className="max-w-6xl mx-auto">

          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              📥 <span className="text-[#c9a227]">Descargas</span>
            </h1>
            <p className="text-gray-400">Recursos descargables para mejorar tu trading</p>
          </div>

          {resources.length === 0 ? (
            <div className="text-center py-20">
              <span className="text-6xl block mb-6">📦</span>
              <h2 className="text-2xl font-bold text-white mb-3">Próximamente</h2>
              <p className="text-gray-400">Estamos preparando recursos de calidad para ti.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resources.map((r) => (
                <div key={r.id} className="bg-gradient-to-br from-[#1a1a2e] to-[#0d0d0d] border border-[#c9a227]/20 rounded-xl overflow-hidden">
                  {r.imageUrl && (
                    <div className="h-40 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={r.imageUrl} alt={r.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-white font-bold text-lg mb-2">{r.title}</h3>
                    {r.description && <p className="text-gray-400 text-sm mb-4">{r.description}</p>}
                    {r.downloadUrl && (
                      <a
                        href={r.downloadUrl}
                        download
                        className="flex items-center gap-2 bg-[#c9a227] hover:bg-[#d4af37] text-black font-bold px-4 py-2.5 rounded-lg transition-colors text-sm"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Descargar
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
