import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const plan = body.plan || 'Plan';
    const price = body.price || 0;
    
    const publicKey = process.env.PAGOPAR_PUBLIC_KEY?.trim();
    const privateKey = process.env.PAGOPAR_PRIVATE_KEY?.trim();

    if (!publicKey || !privateKey) {
      return NextResponse.json({ error: "Claves no configuradas" }, { status: 500 });
    }

    const pedidoId = `SL-${Date.now()}`;
    const monto = Math.floor(Number(price)).toString();
    
    // Generación del Hash SHA1
    const stringToHash = privateKey + pedidoId + monto;
    const token = crypto.createHash('sha1').update(stringToHash).digest('hex');

    const payload = {
      public_key: publicKey,
      operation: {
        token: token,
        shop_process_id: pedidoId,
        monto: monto,
        descripcion: `Plan ${plan} - Sacred Levels`,
        cuotas: 1,
        fecha_maxima_pago: ""
      }
    };

    const response = await fetch('https://api.pagopar.com/api/orders/1.1/init', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (data.respuesta === "error") {
      return NextResponse.json({ error: data.resultado }, { status: 400 });
    }

    return NextResponse.json({ hash: data.resultado[0].data });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error desconocido' }, { status: 500 });
  }
}
