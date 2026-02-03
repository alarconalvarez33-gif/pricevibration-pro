'use client'

import { useEffect, useRef, useCallback } from 'react'

interface Particle {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  opacity: number
  twinkleSpeed: number
  twinkleDirection: number
}

interface ParticleBackgroundProps {
  particleCount?: number
  className?: string
}

export default function ParticleBackground({
  particleCount = 100,
  className = ''
}: ParticleBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animationRef = useRef<number>()
  const mouseRef = useRef({ x: 0, y: 0 })

  const initParticles = useCallback((width: number, height: number) => {
    const particles: Particle[] = []
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2 + 0.5,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.8 + 0.2,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        twinkleDirection: Math.random() > 0.5 ? 1 : -1
      })
    }
    particlesRef.current = particles
  }, [particleCount])

  const drawParticle = useCallback((
    ctx: CanvasRenderingContext2D,
    particle: Particle
  ) => {
    // Gold color with varying opacity
    const gradient = ctx.createRadialGradient(
      particle.x, particle.y, 0,
      particle.x, particle.y, particle.size * 2
    )
    gradient.addColorStop(0, `rgba(251, 191, 36, ${particle.opacity})`)
    gradient.addColorStop(0.5, `rgba(251, 191, 36, ${particle.opacity * 0.5})`)
    gradient.addColorStop(1, 'rgba(251, 191, 36, 0)')

    ctx.beginPath()
    ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2)
    ctx.fillStyle = gradient
    ctx.fill()

    // Core of the star
    ctx.beginPath()
    ctx.arc(particle.x, particle.y, particle.size * 0.5, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`
    ctx.fill()
  }, [])

  const connectParticles = useCallback((
    ctx: CanvasRenderingContext2D,
    particles: Particle[]
  ) => {
    const maxDistance = 120
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x
        const dy = particles[i].y - particles[j].y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < maxDistance) {
          const opacity = (1 - distance / maxDistance) * 0.15
          ctx.beginPath()
          ctx.strokeStyle = `rgba(251, 191, 36, ${opacity})`
          ctx.lineWidth = 0.5
          ctx.moveTo(particles[i].x, particles[i].y)
          ctx.lineTo(particles[j].x, particles[j].y)
          ctx.stroke()
        }
      }
    }
  }, [])

  const animate = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Update and draw particles
    particlesRef.current.forEach(particle => {
      // Update position
      particle.x += particle.speedX
      particle.y += particle.speedY

      // Twinkle effect
      particle.opacity += particle.twinkleSpeed * particle.twinkleDirection
      if (particle.opacity >= 1) {
        particle.opacity = 1
        particle.twinkleDirection = -1
      } else if (particle.opacity <= 0.2) {
        particle.opacity = 0.2
        particle.twinkleDirection = 1
      }

      // Mouse interaction - subtle push away
      const dx = particle.x - mouseRef.current.x
      const dy = particle.y - mouseRef.current.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      if (distance < 100) {
        const force = (100 - distance) / 100
        particle.x += (dx / distance) * force * 0.5
        particle.y += (dy / distance) * force * 0.5
      }

      // Wrap around edges
      if (particle.x < 0) particle.x = width
      if (particle.x > width) particle.x = 0
      if (particle.y < 0) particle.y = height
      if (particle.y > height) particle.y = 0

      drawParticle(ctx, particle)
    })

    // Draw connections
    connectParticles(ctx, particlesRef.current)

    animationRef.current = requestAnimationFrame(animate)
  }, [drawParticle, connectParticles])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      initParticles(canvas.width, canvas.height)
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    window.addEventListener('mousemove', handleMouseMove)

    animate()

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [animate, initParticles])

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none ${className}`}
      style={{ zIndex: 0 }}
    />
  )
}
