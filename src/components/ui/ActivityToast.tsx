'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

// Plantillas base — sin tiempo hardcodeado
const BASE_EVENTS = [
  // SER IA
  { icon: '⚡', title: 'SER analizó XAUUSD', detail: 'Nivel de soporte detectado' },
  { icon: '🧠', title: 'SER detectó confluencia fuerte', detail: 'GBPUSD H4' },
  { icon: '🎯', title: 'SER respondió análisis de gráfico', detail: 'D1 XAUUSD' },
  { icon: '⚡', title: 'SER analizó NAS100', detail: 'Soporte clave identificado' },
  { icon: '🔥', title: 'SER detectó nivel de reversión', detail: 'EURUSD H4' },
  { icon: '📊', title: 'SER procesó consulta multi-timeframe', detail: 'XAUUSD M15·H1·H4' },
  { icon: '🧠', title: 'SER respondió sobre BTCUSD', detail: 'Resistencia en D1' },
  { icon: '⚡', title: 'SER identificó zona de demanda', detail: 'XAUUSD H1' },
  // Señales suscripciones
  { icon: '📈', title: 'Trader activó Señales', detail: 'Asunción, Paraguay' },
  { icon: '💎', title: 'Trader renovó Señales', detail: 'Pago confirmado' },
  { icon: '💰', title: 'Nuevo miembro con Señales', detail: 'Luque, Paraguay' },
  { icon: '📈', title: 'Trader de Lambaré activó Señales', detail: 'Pago confirmado' },
  { icon: '🇧🇷', title: 'Trader de Brasil activó Señales', detail: 'Suscripción mensual' },
  { icon: '💎', title: 'Trader renovó Señales', detail: 'Tercer mes consecutivo' },
  // Cursos
  { icon: '🎓', title: 'Compró el curso Génesis', detail: 'Método W.D. Gann' },
  { icon: '📚', title: 'Compró Super Estrategia', detail: 'Pago único confirmado' },
  { icon: '🔮', title: 'Accedió al curso Frecuencia', detail: 'Estructura fractal del mercado' },
  { icon: '⭐', title: 'Completó el curso Super Estrategia', detail: 'Acceso de por vida activado' },
  { icon: '🎓', title: 'Compró Génesis desde Brasil', detail: 'Método W.D. Gann' },
  { icon: '📚', title: 'Compró Super Estrategia desde Chile', detail: 'Pago único confirmado' },
  { icon: '🔮', title: 'Nuevo acceso al curso Frecuencia', detail: 'Zonas geométricas de reversión' },
  // Señales
  { icon: '🎯', title: 'Señales: EURUSD señal activa', detail: 'Confluencia H4' },
  { icon: '📊', title: 'Señales: 3 señales activas', detail: 'XAUUSD · EURUSD · BTC' },
  { icon: '⚡', title: 'Señales: XAUUSD nivel clave', detail: 'Confluencia D1' },
  { icon: '🎯', title: 'Señales: GBPUSD en zona crítica', detail: 'H4 + D1 confluencia' },
]

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

type Event = typeof BASE_EVENTS[0] & { happenedAt: number }

function buildQueue(): Event[] {
  return shuffle(BASE_EVENTS).map(e => ({
    ...e,
    // Cada evento "ocurrió" entre 1 y 20 minutos antes de que el usuario cargara la página
    happenedAt: Date.now() - (Math.floor(Math.random() * 19) + 1) * 60_000,
  }))
}

function formatMinutes(ms: number): string {
  const min = Math.floor(ms / 60_000)
  if (min < 1)  return 'hace un momento'
  if (min < 60) return `hace ${min} min`
  const h = Math.floor(min / 60)
  return `hace ${h}h`
}

export function ActivityToast() {
  const [visible,   setVisible]   = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [event,     setEvent]     = useState<Event | null>(null)

  const queueRef = useRef<Event[]>([])
  const idxRef   = useRef(0)

  const showNext = useCallback(() => {
    if (dismissed) return

    // Reshuffliar cuando se acaba la cola
    if (idxRef.current >= queueRef.current.length) {
      queueRef.current = buildQueue()
      idxRef.current   = 0
    }

    const next = queueRef.current[idxRef.current++]
    setEvent(next)
    setVisible(true)
    setTimeout(() => setVisible(false), 5000)
  }, [dismissed])

  // Inicializar cola en el cliente (evita hydration mismatch)
  useEffect(() => {
    queueRef.current = buildQueue()
  }, [])

  useEffect(() => {
    if (dismissed) return

    // Primer toast: entre 7 y 12 segundos después de cargar
    const delay = 7000 + Math.random() * 5000
    const first = setTimeout(showNext, delay)

    // Siguientes: cada 22-42 segundos (aleatorio, no periódico)
    let timer: ReturnType<typeof setTimeout>
    const schedule = () => {
      timer = setTimeout(() => {
        showNext()
        schedule()
      }, 22_000 + Math.random() * 20_000)
    }
    const kickoff = setTimeout(schedule, delay + 6000)

    return () => {
      clearTimeout(first)
      clearTimeout(kickoff)
      clearTimeout(timer)
    }
  }, [showNext, dismissed])

  if (dismissed || !event) return null

  const elapsed = Date.now() - event.happenedAt
  const timeLabel = formatMinutes(elapsed)

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        left: 24,
        background: 'rgba(10,10,15,0.93)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(0,212,255,0.2)',
        borderRadius: 10,
        padding: '13px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 11,
        zIndex: 1000,
        maxWidth: 340,
        boxShadow: '0 16px 40px rgba(0,0,0,0.55)',
        transform: visible ? 'translateX(0)' : 'translateX(-130%)',
        opacity: visible ? 1 : 0,
        transition: 'transform 0.45s cubic-bezier(0.16,1,0.3,1), opacity 0.45s ease',
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      <span style={{ fontSize: 19, flexShrink: 0 }}>{event.icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 12,
          fontWeight: 600,
          color: '#e2e8f0',
          marginBottom: 3,
          fontFamily: "'Inter', sans-serif",
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {event.title}
        </div>
        <div style={{ fontSize: 10, color: '#475569', fontFamily: "'JetBrains Mono', monospace" }}>
          {event.detail} · {timeLabel}
        </div>
      </div>
      <button
        onClick={() => { setVisible(false); setDismissed(true) }}
        style={{
          background: 'none',
          border: 'none',
          color: '#334155',
          cursor: 'pointer',
          fontSize: 13,
          padding: '2px 4px',
          flexShrink: 0,
          lineHeight: 1,
        }}
        aria-label="Cerrar"
      >
        ✕
      </button>
    </div>
  )
}
