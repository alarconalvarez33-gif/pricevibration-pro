import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Anthropic from '@anthropic-ai/sdk'
import { SER_SYSTEM_PROMPT } from '@/lib/ser/prompts'
import { getMarketContext } from '@/lib/ser/marketData'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export const dynamic = 'force-dynamic'

// In-memory guest usage tracker: IP hash → { count, resetAt }
const guestUsage = new Map<string, { count: number; resetAt: number }>()
const GUEST_MAX = 4
const GUEST_WINDOW_MS = 24 * 60 * 60 * 1000 // 24h window

function getIpHash(ip: string): string {
  let hash = 0
  for (let i = 0; i < ip.length; i++) {
    hash = ((hash << 5) - hash) + ip.charCodeAt(i)
    hash |= 0
  }
  return 'g_' + Math.abs(hash).toString(36)
}

export async function POST(req: NextRequest) {
  const headersList = headers()
  const ip = (headersList.get('x-forwarded-for') || 'unknown').split(',')[0].trim()
  const ipHash = getIpHash(ip)
  const now = Date.now()

  // Clean stale entries periodically
  if (Math.random() < 0.05) {
    for (const [key, val] of Array.from(guestUsage.entries())) {
      if (val.resetAt < now) guestUsage.delete(key)
    }
  }

  // Check server-side guest quota
  const usage = guestUsage.get(ipHash)
  if (usage && usage.resetAt > now && usage.count >= GUEST_MAX) {
    return NextResponse.json(
      { error: 'Agotaste tus 4 preguntas gratuitas. Registrate para continuar.', guestLimitReached: true },
      { status: 403 }
    )
  }

  let body: any
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
          { type: 'image', source: { type: 'base64', media_type: mediaType as any, data: raw } },
          { type: 'text', text: (message || 'Analizá este gráfico aplicando la metodología SER.') + marketContext },
        ],
      })
    } else {
      messages.push({ role: 'user', content: message + marketContext })
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

    // Increment server-side counter
    const current = guestUsage.get(ipHash)
    if (!current || current.resetAt <= now) {
      guestUsage.set(ipHash, { count: 1, resetAt: now + GUEST_WINDOW_MS })
    } else {
      guestUsage.set(ipHash, { count: current.count + 1, resetAt: current.resetAt })
    }

    const newCount = guestUsage.get(ipHash)!.count
    const remaining = Math.max(0, GUEST_MAX - newCount)

    return NextResponse.json({
      response: aiResponse,
      remaining,
      guestMode: true,
      isLast: remaining === 0,
    })

  } catch (error: any) {
    const isTimeout = error?.message === 'TIMEOUT'
    return NextResponse.json(
      { error: isTimeout ? 'La respuesta tardó demasiado. Intentá de nuevo.' : 'Hubo un problema. Intentá de nuevo.' },
      { status: isTimeout ? 504 : 500 }
    )
  }
}
