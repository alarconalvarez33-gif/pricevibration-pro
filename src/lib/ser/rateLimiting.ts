import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

const ipRequestCounts = new Map<string, { count: number; resetAt: number }>()

export function hashIP(ip: string): string {
  const secret = process.env.SER_ENCRYPTION_KEY || 'ser-fallback-secret'
  return crypto.createHmac('sha256', secret).update(ip).digest('hex')
}

export async function checkIPRateLimit(
  ip: string,
  maxRequests = 30,
  windowSeconds = 60
): Promise<{ allowed: boolean; remaining: number; resetIn: number }> {
  const now = Date.now()
  const windowMs = windowSeconds * 1000
  const current = ipRequestCounts.get(ip)

  if (!current || now > current.resetAt) {
    ipRequestCounts.set(ip, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: maxRequests - 1, resetIn: windowSeconds }
  }

  if (current.count >= maxRequests) {
    const resetIn = Math.ceil((current.resetAt - now) / 1000)
    return { allowed: false, remaining: 0, resetIn }
  }

  current.count++
  return {
    allowed: true,
    remaining: maxRequests - current.count,
    resetIn: Math.ceil((current.resetAt - now) / 1000),
  }
}

export async function isIPBlocked(ipHash: string): Promise<boolean> {
  try {
    const blocked = await prisma.blockedIP.findUnique({ where: { ipAddressHash: ipHash } })
    if (!blocked) return false
    if (!blocked.blockedUntil) return true
    if (blocked.blockedUntil > new Date()) return true
    await prisma.blockedIP.delete({ where: { ipAddressHash: ipHash } })
    return false
  } catch { return false }
}

export async function incrementSuspiciousAttempts(ipHash: string): Promise<void> {
  try {
    const blocked = await prisma.blockedIP.upsert({
      where: { ipAddressHash: ipHash },
      update: { attempts: { increment: 1 }, lastAttempt: new Date() },
      create: { ipAddressHash: ipHash, reason: 'INJECTION', attempts: 1 },
    })
    if (blocked.attempts >= 5 && !blocked.blockedUntil) {
      await prisma.blockedIP.update({
        where: { ipAddressHash: ipHash },
        data: { blockedUntil: new Date(Date.now() + 24 * 60 * 60 * 1000) },
      })
    }
  } catch { /* noop */ }
}

// Clean expired entries every 5 min
setInterval(() => {
  const now = Date.now()
  for (const [ip, data] of Array.from(ipRequestCounts.entries())) {
    if (now > data.resetAt) ipRequestCounts.delete(ip)
  }
}, 5 * 60 * 1000)
