import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import Script from 'next/script'

export default async function FrecuenciaAccesoPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    redirect('/login?callbackUrl=/dashboard/cursos/frecuencia')
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (!user) redirect('/login')

  const isAdmin = user.role === 'admin'

  // Verificar compra (admin siempre tiene acceso)
  const purchase = isAdmin ? true : await prisma.productPurchase.findFirst({
    where: { userId: user.id, productId: 'frecuencia', status: 'paid' },
  })

  if (!purchase) {
    redirect('/cursos/frecuencia')
  }

  const C = {
    bg:     '#0A0A0B',
    card:   '#141415',
    border: '#222222',
    cyan:   '#00E5FF',
    gold:   '#c9a227',
    muted:  '#555555',
  }

  return (
    <>
      <main style={{ backgroundColor: C.bg, minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>

        {/* Header */}
        <div style={{ borderBottom: `1px solid ${C.border}`, backgroundColor: '#0d0d0e' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Link href="/dashboard" style={{ color: C.muted, fontSize: '12px', textDecoration: 'none', fontFamily: "'Space Grotesk', sans-serif" }}>
                ← Dashboard
              </Link>
              <span style={{ color: '#333' }}>›</span>
              <span style={{ color: C.gold, fontSize: '12px', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}>
                Frecuencia
              </span>
            </div>
            {isAdmin && (
              <span style={{ fontSize: '10px', color: C.cyan, fontFamily: "'Space Grotesk', sans-serif", border: `1px solid ${C.cyan}30`, padding: '2px 8px' }}>
                ADMIN PREVIEW
              </span>
            )}
          </div>
        </div>

        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px' }}>

          {/* Título */}
          <div style={{ marginBottom: '32px' }}>
            <p style={{ color: C.cyan, fontSize: '10px', fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', fontFamily: "'Space Grotesk', sans-serif", marginBottom: '10px' }}>
              Nuevo Curso · Sacred Levels
            </p>
            <h1 style={{ color: '#fff', fontSize: '40px', fontWeight: 700, fontFamily: "'Playfair Display', serif", margin: '0 0 6px 0', lineHeight: 1.1 }}>
              Frecuencia
            </h1>
            <p style={{ color: C.gold, fontSize: '15px', fontStyle: 'italic', fontFamily: "'Playfair Display', serif", margin: 0 }}>
              Decodificá la estructura fractal del mercado
            </p>
          </div>

          {/* Video */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              paddingBottom: '56.25%',
              backgroundColor: '#000',
              borderRadius: '12px',
              overflow: 'hidden',
              border: `1px solid ${C.border}`,
              boxShadow: `0 0 60px ${C.gold}12`,
              marginBottom: '40px',
            }}
          >
            <iframe
              src="https://player.vimeo.com/video/1185309543?badge=0&autopause=0&player_id=0&app_id=58479"
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              title="Frecuencia — Curso Sacred Levels"
            />
          </div>

          {/* Descripción */}
          <div
            style={{
              borderLeft: `3px solid ${C.gold}`,
              paddingLeft: '20px',
              marginBottom: '40px',
            }}
          >
            <h2 style={{ color: '#fff', fontSize: '18px', fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", marginBottom: '12px' }}>
              Sobre este curso
            </h2>
            <p style={{ color: '#888', fontSize: '15px', lineHeight: 1.7, margin: 0 }}>
              Frecuencia es una herramienta de análisis técnico avanzado que decodifica la estructura fractal del
              mercado mediante la sincronización del tiempo y el precio. Anclando la matriz en los extremos estructurales
              más relevantes del activo, esta herramienta proyecta zonas geométricas exactas donde el ciclo del mercado
              tiende a revertir, acelerarse o consolidar.
            </p>
          </div>

          {/* Cards de apoyo */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '40px' }}>
            {[
              { icon: '📚', title: 'Acceso de por vida', sub: 'Sin restricciones de tiempo' },
              { icon: '💬', title: 'Soporte incluido', sub: 'Dudas por WhatsApp' },
              { icon: '🔄', title: 'Actualizaciones', sub: 'Contenido siempre actualizado' },
            ].map(({ icon, title, sub }) => (
              <div
                key={title}
                style={{
                  backgroundColor: C.card,
                  border: `1px solid ${C.border}`,
                  borderRadius: '10px',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                }}
              >
                <span style={{ fontSize: '20px' }}>{icon}</span>
                <div>
                  <p style={{ color: '#fff', fontSize: '13px', fontWeight: 600, margin: '0 0 4px 0', fontFamily: "'Space Grotesk', sans-serif" }}>{title}</p>
                  <p style={{ color: C.muted, fontSize: '12px', margin: 0 }}>{sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Soporte */}
          <div
            style={{
              backgroundColor: '#0a150a',
              border: '1px solid #1a3a1a',
              borderRadius: '10px',
              padding: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px',
            }}
          >
            <div>
              <p style={{ color: '#4a8a4a', fontSize: '13px', fontWeight: 600, margin: '0 0 4px 0' }}>¿Tenés alguna duda?</p>
              <p style={{ color: '#666', fontSize: '13px', margin: 0 }}>Nuestro equipo está disponible para ayudarte</p>
            </div>
            <a
              href={`https://wa.me/595981234128?text=${encodeURIComponent('Hola, tengo una consulta sobre el curso Frecuencia')}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#25D366',
                color: '#fff',
                padding: '10px 20px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '13px',
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '18px', height: '18px' }}>
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              Escribinos por WhatsApp
            </a>
          </div>

        </div>
      </main>
      <Script src="https://player.vimeo.com/api/player.js" strategy="lazyOnload" />
    </>
  )
}
