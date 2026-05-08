import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Anthropic from '@anthropic-ai/sdk'
import { prisma } from '@/lib/prisma'
import { SER_SYSTEM_PROMPT } from '@/lib/ser/prompts'
import { getMarketContext } from '@/lib/ser/marketData'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export const dynamic = 'force-dynamic'

const GUEST_MAX = 5

function getIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  )
}

// fingerprint = ip hash used as DB key (no in-memory — survives restarts)
function hashIp(ip: string): string {
  let h = 0
  for (let i = 0; i < ip.length; i++) {
    h = ((h << 5) - h) + ip.charCodeAt(i)
    h |= 0
  }
  return 'g_' + Math.abs(h).toString(36)
}

async function checkAndIncrementGuest(ip: string): Promise<{ allowed: boolean; remaining: number }> {
  const fp = hashIp(ip)
  const feature = 'ser'

  try {
    const existing = await prisma.freeUsage.findUnique({
      where: { fingerprint_feature: { fingerprint: fp, feature } },
    })

    if (existing && existing.usageCount >= GUEST_MAX) {
      return { allowed: false, remaining: 0 }
    }

    // Also check by raw IP (covers IP changes for same device)
    if (!existing && ip !== 'unknown') {
      const byIp = await prisma.freeUsage.findFirst({
        where: { ip, feature },
        orderBy: { usageCount: 'desc' },
      })
      if (byIp && byIp.usageCount >= GUEST_MAX) {
        return { allowed: false, remaining: 0 }
      }
    }

    if (!existing) {
      await prisma.freeUsage.create({ data: { fingerprint: fp, ip, feature, usageCount: 1 } })
      return { allowed: true, remaining: GUEST_MAX - 1 }
    }

    const newCount = existing.usageCount + 1
    await prisma.freeUsage.update({
      where: { fingerprint_feature: { fingerprint: fp, feature } },
      data: { usageCount: newCount, lastUsedAt: new Date() },
    })
    return { allowed: true, remaining: Math.max(0, GUEST_MAX - newCount) }
  } catch {
    return { allowed: true, remaining: 1 }
  }
}

export async function POST(req: NextRequest) {
  const ip = getIp(req)

  // Pre-check quota before calling AI (avoid wasting tokens)
  const fp = hashIp(ip)
  const feature = 'ser'
  const preCheck = await prisma.freeUsage.findUnique({
    where: { fingerprint_feature: { fingerprint: fp, feature } },
  }).catch(() => null)

  if (preCheck && preCheck.usageCount >= GUEST_MAX) {
    return NextResponse.json(
      { error: 'Agotaste tus 5 preguntas gratuitas. Registrate para continuar.', guestLimitReached: true },
      { status: 403 }
    )
  }

  let body: { message?: string; imageBase64?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Solicitud inválida' }, { status: 400 })
  }

  const { message, imageBase64 } = body

  if (!message && !imageBase64) {
    return NextResponse.json({ error: 'Debés enviar un mensaje o imagen' }, { status: 400 })
  }
  if (message && message.length > 1000) {
    return NextResponse.json({ error: 'Mensaje muy largo (máximo 1000 caracteres)' }, { status: 400 })
  }

  try {
    const marketContext = message ? await getMarketContext(message) : ''

    const messages: Anthropic.Messages.MessageParam[] = []

    if (imageBase64) {
      const raw = imageBase64.replace(/^data:image\/\w+;base64,/, '')
      const mediaType = imageBase64.startsWith('data:image/png') ? 'image/png' : 'image/jpeg'
      messages.push({
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mediaType as 'image/png' | 'image/jpeg', data: raw } },
          { type: 'text', text: (message || 'Analizá este gráfico aplicando la metodología SER.') + marketContext },
        ],
      })
    } else {
      messages.push({ role: 'user', content: (message ?? '') + marketContext })
    }

    const response = await Promise.race([
      anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: SER_SYSTEM_PROMPT,
        messages,
      }),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), 25000)),
    ]) as Anthropic.Messages.Message

    const aiResponse = response.content
      .filter(c => c.type === 'text')
      .map(c => (c as Anthropic.Messages.TextBlock).text)
      .join('\n')

    // Increment counter AFTER successful response
    const { remaining } = await checkAndIncrementGuest(ip)

    return NextResponse.json({
      response: aiResponse,
      remaining,
      guestMode: true,
      isLast: remaining === 0,
    })
  } catch (error: unknown) {
    const isTimeout = (error as Error)?.message === 'TIMEOUT'
    return NextResponse.json(
      { error: isTimeout ? 'La respuesta tardó demasiado. Intentá de nuevo.' : 'Hubo un problema. Intentá de nuevo.' },
      { status: isTimeout ? 504 : 500 }
    )
  }
}
