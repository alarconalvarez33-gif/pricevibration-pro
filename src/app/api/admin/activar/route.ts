import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { activateProSubscription } from '@/lib/services/activate-subscription';

const ADMIN_EMAIL = 'raul@sacredlevels.com';

async function isAdmin(): Promise<{ ok: boolean; email?: string }> {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) return { ok: false };
  if (email === ADMIN_EMAIL) return { ok: true, email };
  const u = await prisma.user.findUnique({ where: { email }, select: { role: true } });
  return { ok: u?.role === 'admin', email };
}

/** POST { email, days? } → activates the user. */
export async function POST(req: NextRequest) {
  const auth = await isAdmin();
  if (!auth.ok) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const email: string = String(body.email || '').trim().toLowerCase();
  const days = Math.max(1, Math.min(366, parseInt(body.days || '30', 10) || 30));
  const orderId: string | undefined = body.orderId ? String(body.orderId) : undefined;
  const note: string = String(body.note || '').trim().slice(0, 300);

  if (!email) return NextResponse.json({ error: 'email requerido' }, { status: 400 });

  const result = await activateProSubscription({
    email, days,
    triggeredBy: auth.email || 'admin',
    source: 'admin_manual',
    note: orderId ? `orderId: ${orderId} ${note ? '| ' + note : ''}` : note || undefined,
  });

  if (!result.success) return NextResponse.json({ error: result.errorMsg }, { status: 400 });

  // If an orderId was provided, mark the Payment row as paid (idempotent).
  if (orderId) {
    await prisma.payment.updateMany({
      where: { orderId, status: 'pending' },
      data:  { status: 'paid', paidAt: new Date() },
    }).catch(() => null);
  }

  return NextResponse.json({
    success: true,
    email: result.userEmail,
    premiumUntil: result.premiumUntil,
  });
}

/** GET → list recent USDT submissions awaiting activation. */
export async function GET() {
  const auth = await isAdmin();
  if (!auth.ok) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const pending = await prisma.payment.findMany({
    where: { status: 'pending', currency: 'USDT' },
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: { user: { select: { email: true, name: true } } },
  });

  return NextResponse.json({
    pending: pending.map(p => ({
      orderId: p.orderId,
      email: p.user.email,
      name: p.user.name,
      amount: p.amount,
      currency: p.currency,
      createdAt: p.createdAt.toISOString(),
    })),
  });
}
