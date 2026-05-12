'use client'

import { useState, useEffect, useCallback } from 'react'

const ACTIVITIES = [
  { icon: '⚡', title: 'SER analizó XAUUSD', detail: 'Nivel detectado · hace 2 min' },
  { icon: '📊', title: 'Un trader activó Quantum Access', detail: 'Asunción · hace 8 min' },
  { icon: '🎯', title: 'Signal Hub: EURUSD señal activa', detail: 'Confluencia H4 · hace 15 min' },
  { icon: '💎', title: 'SER procesó 47 consultas hoy', detail: 'XAUUSD más consultado' },
  { icon: '🧠', title: 'Análisis BTCUSD completado', detail: 'D1 · hace 22 min' },
  { icon: '📈', title: 'Nuevo trader se unió desde CDE', detail: 'Quantum Access · hace 4 min' },
  { icon: '⚡', title: 'Calculadora Quantum usada', detail: 'XAUUSD · hace 11 min' },
  { icon: '🔥', title: 'SER detectó confluencia fuerte', detail: 'GBPUSD H4 · hace 6 min' },
  { icon: '🇵🇾', title: 'Trader de San Lorenzo activó SER', detail: 'hace 19 min' },
  { icon: '📊', title: '3 señales activas en Signal Hub', detail: 'XAUUSD · EURUSD · BTCUSD' },
  { icon: '⚡', title: 'SER analizó NAS100', detail: 'Soporte clave · hace 7 min' },
  { icon: '💰', title: 'Trader renovó SER+ Pro', detail: 'Razonamiento profundo · hace 33 min' },
]

export function ActivityToast() {
  const [visible, setVisible] = useState(false)
  const [index, setIndex] = useState(0)
  const [dismissed, setDismissed] = useState(false)

  const showToast = useCallback(() => {
    if (dismissed) return
    setIndex(prev => (prev + 1) % ACTIVITIES.length)
    setVisible(true)
    setTimeout(() => setVisible(false), 5000)
  }, [dismissed])

  useEffect(() => {
    const firstTimer = setTimeout(showToast, 8000)
    const interval = setInterval(() => {
      showToast()
    }, 25000 + Math.random() * 15000)
    return () => {
      clearTimeout(firstTimer)
      clearInterval(interval)
    }
  }, [showToast])

  if (dismissed) return null

  const activity = ACTIVITIES[index]

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        left: 24,
        background: 'rgba(10,10,15,0.92)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(0,212,255,0.2)',
        borderRadius: 10,
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        zIndex: 1000,
        maxWidth: 360,
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
        transform: visible ? 'translateX(0)' : 'translateX(-120%)',
        opacity: visible ? 1 : 0,
        transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      <span style={{ fontSize: 20, flexShrink: 0 }}>{activity.icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 2, fontFamily: "'Inter', sans-serif" }}>
          {activity.title}
        </div>
        <div style={{ fontSize: 11, color: '#64748b', fontFamily: "'JetBrains Mono', monospace" }}>
          {activity.detail}
        </div>
      </div>
      <button
        onClick={() => { setVisible(false); setDismissed(true) }}
        style={{
          background: 'none',
          border: 'none',
          color: '#475569',
          cursor: 'pointer',
          fontSize: 14,
          padding: 4,
          flexShrink: 0,
          lineHeight: 1,
        }}
      >
        ✕
      </button>
    </div>
  )
}
