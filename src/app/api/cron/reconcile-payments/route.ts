import { NextResponse } from 'next/server'
import { reconcilePendingPayments } from '@/lib/services/payment-reconciliation'

export async function GET(request: Request) {
  // Verify Vercel cron secret
  const auth = request.headers.get('authorization')
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    const results = await reconcilePendingPayments('cron')
    return NextResponse.json({ ok: true, ...results })
  } catch (err) {
    console.error('[cron/reconcile-payments]', err)
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
