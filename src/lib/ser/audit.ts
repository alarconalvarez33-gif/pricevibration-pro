import { prisma } from '@/lib/prisma'

export enum AuditEventType {
  QUERY_SUCCESS           = 'QUERY_SUCCESS',
  UNAUTHENTICATED_ATTEMPT = 'UNAUTHENTICATED_ATTEMPT',
  UNAUTHORIZED_ATTEMPT    = 'UNAUTHORIZED_ATTEMPT',
  INJECTION_ATTEMPT       = 'INJECTION_ATTEMPT',
  RATE_LIMIT_HIT          = 'RATE_LIMIT_HIT',
  BLOCKED_IP_ATTEMPT      = 'BLOCKED_IP_ATTEMPT',
  INVALID_INPUT           = 'INVALID_INPUT',
  QUOTA_EXCEEDED          = 'QUOTA_EXCEEDED',
  PACK_PURCHASED          = 'PACK_PURCHASED',
  SERVER_ERROR            = 'SERVER_ERROR',
  API_TIMEOUT             = 'API_TIMEOUT',
  SUBSCRIPTION_CREATED    = 'SUBSCRIPTION_CREATED',
  PLAN_UPGRADED           = 'PLAN_UPGRADED',
}

interface AuditEvent {
  event: AuditEventType
  severity: 'INFO' | 'WARN' | 'CRITICAL'
  userId?: string
  ipAddressHash?: string
  userAgent?: string
  endpoint?: string
  details?: unknown
}

export async function logAuditEvent(event: AuditEvent): Promise<void> {
  try {
    await prisma.serAuditLog.create({
      data: {
        userId:       event.userId,
        event:        event.event,
        severity:     event.severity,
        ipAddressHash: event.ipAddressHash,
        userAgent:    event.userAgent?.substring(0, 200),
        endpoint:     event.endpoint,
        details:      event.details ? (event.details as object) : undefined,
      },
    })
    if (event.severity === 'CRITICAL') console.error('🚨 SER CRITICAL:', event.event, event.details)
  } catch (e) {
    console.error('Audit log failed:', e)
  }
}
