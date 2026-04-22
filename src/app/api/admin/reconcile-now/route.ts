import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { reconcilePendingPayments } from '@/lib/services/payment-reconciliation'

const ADMIN_EMAILS = ['raul@sacredlevels.com', 'alarconalvarez33@gmail.com']

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  const email = session?.user?.email

  if (!email || !ADMIN_EMAILS.includes(email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const results = await reconcilePendingPayments('manual_admin')
    return NextResponse.json({ ok: true, ...results })
  } catch (err) {
    console.error('[admin/reconcile-now]', err)
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
