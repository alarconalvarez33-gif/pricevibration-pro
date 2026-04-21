import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * Cron job: deletes duplicate webhook logs older than 7 days.
 * Runs daily at 03:00 UTC via vercel.json schedule.
 * Protected by CRON_SECRET env var (set in Vercel dashboard).
 */
export async function GET(request: Request) {
  // Verify cron secret to prevent unauthorized calls
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  try {
    const deleted = await prisma.webhookLog.deleteMany({
      where: {
        status: 'duplicate',
        createdAt: { lt: cutoff },
      },
    })

    console.log(`🧹 [cleanup-webhook-logs] Deleted ${deleted.count} duplicate logs older than 7 days`)

    return NextResponse.json({
      success: true,
      deleted:  deleted.count,
      cutoff:   cutoff.toISOString(),
      ts:       new Date().toISOString(),
    })
  } catch (error) {
    console.error('[cleanup-webhook-logs] Error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
