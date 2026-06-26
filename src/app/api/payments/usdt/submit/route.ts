import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendAdminAlert } from '@/lib/email';

const PLAN = 'pro';
const PRICE_USDT = 30;
const NETWORK = 'TRC-20';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Iniciá sesión para enviar el comprobante' }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const txid: string = String(body.txid || '').trim();
  const sender: string = String(body.senderAddress || '').trim();
  const note: string  = String(body.note || '').trim().slice(0, 500);

  if (!txid || txid.length < 8) {
    return NextResponse.json({ error: 'El TXID es requerido (lo encontrás en Binance, sección historial de retiros).' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) {
    return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
  }

  // Reject duplicates: same txid already submitted (by anyone).
  const existing = await prisma.payment.findFirst({ where: { orderId: { contains: txid } } });
  if (existing) {
    return NextResponse.json({ error: 'Este TXID ya fue registrado.', alreadyExists: true }, { status: 409 });
  }

  // Use a Payment row with currency=USDT. orderId encodes the txid so the admin
  // panel can find it. Status stays pending until /api/admin/activar approves.
  const orderId = `USDT-${user.id.slice(-6)}-${Date.now()}-${txid.slice(-12)}`;

  await prisma.payment.create({
    data: {
      orderId,
      userId: user.id,
      planType: PLAN,
      billingPeriod: 'monthly',
      amount: PRICE_USDT,         // amount field as integer USDT units
      currency: 'USDT',
      amountUsd: PRICE_USDT,
      status: 'pending',
      pagoparHash: null,
    },
  });

  await prisma.subscriptionLog.create({
    data: {
      userId: user.id,
      event: 'usdt_receipt_submitted',
      plan: PLAN,
      note: `txid: ${txid} | sender: ${sender || '—'} | network: ${NETWORK} | note: ${note || '—'} | orderId: ${orderId}`,
    },
  });

  // Notify admin (fire-and-forget)
  sendAdminAlert(
    `[USDT] Comprobante de ${user.email}`,
    `<p><strong>Usuario:</strong> ${user.email}</p>
     <p><strong>TXID:</strong> <code>${txid}</code></p>
     <p><strong>Sender:</strong> ${sender || '—'}</p>
     <p><strong>Red:</strong> ${NETWORK}</p>
     <p><strong>Monto declarado:</strong> ${PRICE_USDT} USDT</p>
     <p><strong>Nota:</strong> ${note || '—'}</p>
     <p><strong>orderId:</strong> <code>${orderId}</code></p>
     <p>Activá la suscripción en <code>/admin/activar</code>.</p>`
  ).catch(e => console.error('[sendAdminAlert]', e));

  return NextResponse.json({
    success: true,
    orderId,
    message: 'Pago en revisión. Te enviamos un email apenas se active (suele tomar menos de 1 hora).',
  });
}
