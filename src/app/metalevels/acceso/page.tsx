import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import fs from 'fs'
import path from 'path'
import Navbar from '@/components/Navbar'
import AccesoClient from './AccesoClient'

export default async function MetaLevelsAccesoPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    redirect('/login?redirect=/metalevels/acceso')
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (!user) {
    redirect('/login')
  }

  const isAdmin = user.role === 'admin'

  // Check for active MetaLevels license (admins bypass this check)
  const license = isAdmin
    ? null
    : await prisma.license.findFirst({
        where: {
          userId: user.id,
          productType: 'metalevels',
          status: 'active',
        },
        orderBy: { issuedAt: 'desc' },
      })

  if (!isAdmin && !license) {
    // No license — show purchase prompt
    return (
      <>
        <Navbar />
        <main
          className="min-h-screen flex items-center justify-center px-6"
          style={{
            backgroundColor: '#0A0A0B',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          <div className="max-w-md text-center">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ backgroundColor: '#c9a22715', border: '1px solid #c9a22730' }}
            >
              <svg className="w-7 h-7" fill="none" stroke="#c9a227" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1
              className="text-3xl font-bold text-white mb-3"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Acceso no disponible
            </h1>
            <p className="text-sm mb-8 leading-relaxed" style={{ color: '#555' }}>
              No tenés una licencia activa de MetaLevels. Adquirí el indicador para obtener
              acceso al código Pine Script y tu clave personal de activación.
            </p>
            <a
              href="/metalevels"
              className="inline-flex items-center gap-2 px-8 py-3.5 font-bold text-sm uppercase tracking-[0.12em] text-black transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#00E5FF', fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Ver MetaLevels
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        </main>
      </>
    )
  }

  // Read Pine Script server-side
  const scriptPath = path.join(process.cwd(), 'src', 'lib', 'pine-scripts', 'metalevels.pine')
  let pineScript = ''
  try {
    pineScript = fs.readFileSync(scriptPath, 'utf-8')
  } catch {
    pineScript = '// Error al cargar el script. Contactá soporte.'
  }

  // Admins see the script with a placeholder code for testing
  const displayCode = license?.code ?? 'ADMIN-PREVIEW'

  return (
    <>
      <Navbar />
      {isAdmin && (
        <div
          className="text-center py-2 text-xs font-semibold uppercase tracking-widest"
          style={{ backgroundColor: '#c9a22715', color: '#c9a227', borderBottom: '1px solid #c9a22730' }}
        >
          Vista Admin — el código de activación real se genera al momento del pago
        </div>
      )}
      <AccesoClient
        pineScript={pineScript}
        licenseCode={displayCode}
        userEmail={session.user.email}
      />
    </>
  )
}
