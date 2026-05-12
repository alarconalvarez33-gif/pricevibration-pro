'use client'

export function WhatsAppFloat() {
  return (
    <a
      href="https://wa.me/595981234128?text=Hola%2C%20me%20interesa%20SER%20IA"
      target="_blank"
      rel="noopener noreferrer"
      title="¿Dudas? Escribinos por WhatsApp"
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '50%',
        background: '#25D366',
        boxShadow: '0 4px 16px rgba(37,211,102,0.4)',
        zIndex: 999,
        fontSize: 28,
        textDecoration: 'none',
        transition: 'transform 0.2s',
      }}
      onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.1)')}
      onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
    >
      💬
    </a>
  )
}
