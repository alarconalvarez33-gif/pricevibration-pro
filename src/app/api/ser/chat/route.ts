import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Anthropic from '@anthropic-ai/sdk'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'

import { canUserAskQuestion, decrementQuota } from '@/lib/ser/quota'
import { validateInput, detectInjectionAttempt } from '@/lib/ser/validation'
import { checkIPRateLimit, isIPBlocked, hashIP, incrementSuspiciousAttempts } from '@/lib/ser/rateLimiting'
import { logAuditEvent, AuditEventType } from '@/lib/ser/audit'
import { SER_SYSTEM_PROMPT, SER_PLUS_SYSTEM_PROMPT } from '@/lib/ser/prompts'
import { getMarketContext } from '@/lib/ser/marketData'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

const ADMIN_EMAIL = 'raul@sacredlevels.com'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const headersList = headers()
  const ip = (headersList.get('x-forwarded-for') || 'unknown').split(',')[0].trim()
  const userAgent = headersList.get('user-agent') || 'unknown'
  const ipHash = hashIP(ip)

  try {
    // CAPA 1: IP bloqueada
    const ipBlocked = await isIPBlocked(ipHash)
    if (ipBlocked) {
      await logAuditEvent({ event: AuditEventType.BLOCKED_IP_ATTEMPT, severity: 'CRITICAL', ipAddressHash: ipHash, userAgent, endpoint: '/api/ser/chat' })
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    // CAPA 2: Rate limit por IP (30 req/min)
    const rateLimit = await checkIPRateLimit(ip, 30, 60)
    if (!rateLimit.allowed) {
      await logAuditEvent({ event: AuditEventType.RATE_LIMIT_HIT, severity: 'WARN', ipAddressHash: ipHash, endpoint: '/api/ser/chat', details: { resetIn: rateLimit.resetIn } })
      return NextResponse.json({ error: 'Demasiadas solicitudes. Intentá de nuevo en un momento.', retryAfter: rateLimit.resetIn }, { status: 429 })
    }

    // CAPA 3: Autenticación
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      await logAuditEvent({ event: AuditEventType.UNAUTHENTICATED_ATTEMPT, severity: 'INFO', ipAddressHash: ipHash, endpoint: '/api/ser/chat' })
      return NextResponse.json({ error: 'Debés iniciar sesión para usar SER', loginUrl: '/login' }, { status: 401 })
    }

    const userId = session.user.id
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } })
    const isAdmin = user?.email === ADMIN_EMAIL

    // CAPA 4: Autorización + Quota
    if (!isAdmin) {
      const quotaCheck = await canUserAskQuestion(userId)
      if (!quotaCheck.allowed) {
        await logAuditEvent({ event: AuditEventType.QUOTA_EXCEEDED, severity: 'INFO', userId, ipAddressHash: ipHash })
        return NextResponse.json({ error: quotaCheck.reason, upgradeUrl: quotaCheck.upgradeUrl, remaining: 0 }, { status: 403 })
      }
    }

    // CAPA 5: Parsear y validar body
    const body = await req.json()
    const { message, imageBase64, conversationId } = body

    if (!message && !imageBase64) {
      return NextResponse.json({ error: 'Debés enviar un mensaje o imagen' }, { status: 400 })
    }
    if (message && message.length > 2000) {
      return NextResponse.json({ error: 'Mensaje muy largo (máximo 2000 caracteres)' }, { status: 400 })
    }
    if (imageBase64 && imageBase64.length > 5_000_000) {
      return NextResponse.json({ error: 'Imagen muy grande (máximo 5MB)' }, { status: 400 })
    }

    // CAPA 6: Validación + anti-injection
    if (message) {
      const validation = validateInput(message)
      if (!validation.valid) {
        await logAuditEvent({ event: AuditEventType.INVALID_INPUT, severity: 'WARN', userId, ipAddressHash: ipHash, details: { reason: validation.reason } })
        return NextResponse.json({ error: validation.reason }, { status: 400 })
      }

      const injectionCheck = detectInjectionAttempt(message)
      if (injectionCheck.detected) {
        await logAuditEvent({ event: AuditEventType.INJECTION_ATTEMPT, severity: 'CRITICAL', userId, ipAddressHash: ipHash, details: { patterns: injectionCheck.matchedPatterns, preview: message.substring(0, 200) } })
        await incrementSuspiciousAttempts(ipHash)
        return NextResponse.json({ error: 'Lo siento, no puedo procesar esa solicitud.', response: 'Por favor reformulá tu pregunta de manera más simple.' }, { status: 400 })
      }
    }

    // CAPA 7: Determinar modelo y system prompt
    const subscription = await prisma.serSubscription.findUnique({ where: { userId } })
    const isPlus = subscription?.plan === 'SER_PLUS' || isAdmin

    const model = isAdmin ? 'claude-opus-4-7' : 'claude-sonnet-4-6'
    const systemPrompt = isPlus ? SER_PLUS_SYSTEM_PROMPT : SER_SYSTEM_PROMPT
    const maxTokens = isPlus ? 3000 : 2048

    // Contexto de mercado
    const marketContext = message ? await getMarketContext(message) : ''

    // Historial de conversación (últimos 10 turnos)
    const history = conversationId
      ? await prisma.serConversation.findMany({
          where: { conversationId, userId },
          orderBy: { createdAt: 'asc' },
          take: 10,
        })
      : []

    const messages: Anthropic.Messages.MessageParam[] = history.map(h => ({
      role: h.role as 'user' | 'assistant',
      content: h.content,
    }))

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

    // Llamada a la API con timeout
    const response = await Promise.race([
      anthropic.messages.create({ model, max_tokens: maxTokens, system: systemPrompt, messages }),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), 30000)),
    ]) as Anthropic.Messages.Message

    const aiResponse = response.content
      .filter(c => c.type === 'text')
      .map(c => (c as Anthropic.Messages.TextBlock).text)
      .join('\n')

    // CAPA 8: Persistir conversación y auditar
    const finalConversationId = conversationId || `ser-${Date.now()}-${userId.slice(0, 8)}`

    await prisma.serConversation.createMany({
      data: [
        {
          userId, conversationId: finalConversationId,
          role: 'user', content: message || '[Imagen subida]',
          hasImage: !!imageBase64,
          ipAddressHash: ipHash,
          userAgent: userAgent.substring(0, 200),
        },
        {
          userId, conversationId: finalConversationId,
          role: 'assistant', content: aiResponse,
          modelUsed: model,
          tokensInput: response.usage.input_tokens,
          tokensOutput: response.usage.output_tokens,
        },
      ],
    })

    if (!isAdmin) await decrementQuota(userId)

    await logAuditEvent({
      event: AuditEventType.QUERY_SUCCESS, severity: 'INFO', userId, ipAddressHash: ipHash,
      details: { model, tokensIn: response.usage.input_tokens, tokensOut: response.usage.output_tokens },
    })

    const quotaAfter = isAdmin ? { remaining: 999 } : await canUserAskQuestion(userId)

    return NextResponse.json({
      response: aiResponse,
      conversationId: finalConversationId,
      remaining: quotaAfter.remaining,
      model: isAdmin ? 'MENTOR ADMIN' : isPlus ? 'MENTOR+' : 'MENTOR',
    })

  } catch (error: any) {
    const isTimeout = error?.message === 'TIMEOUT'
    await logAuditEvent({
      event: isTimeout ? AuditEventType.API_TIMEOUT : AuditEventType.SERVER_ERROR,
      severity: 'CRITICAL',
      ipAddressHash: ipHash,
      details: { message: error?.message, endpoint: '/api/ser/chat' },
    })
    return NextResponse.json(
      { error: isTimeout ? 'La respuesta tardó demasiado. Intentá de nuevo.' : 'Hubo un problema procesando tu consulta. Intentá de nuevo.' },
      { status: isTimeout ? 504 : 500 }
    )
  }
}
