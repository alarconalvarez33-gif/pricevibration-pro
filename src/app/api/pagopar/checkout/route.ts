import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { plan, price } = await request.json();
    const publicKey = process.env.PAGOPAR_PUBLIC_KEY;
    const privateKey = process.env.PAGOPAR_PRIVATE_KEY;

    if (!publicKey || !privateKey) {
      return NextResponse.json({ error: "Faltan claves API en Vercel" }, { status: 500 });
    }

    // ID de pedido único (Sacred Levels + marca de tiempo)
    const pedidoId = `SL-${Date.now()}`;
    const monto = price.toString();
    
    // TOKEN CRÍTICO: sha1(private_key + pedido_id + monto)
    const token = crypto.createHash('sha1').update(privateKey + pedidoId + monto).digest('hex');

    const payload = {
      public_key: publicKey,
      operation: {
        token: token,
        shop_process_id: pedidoId,
        monto: monto,
        descripcion: `Plan ${plan} - Sacred Levels`,
        cuotas: "1",
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
      // Esto nos dirá si el error es "Token inválido" o "Comercio no habilitado"
      return NextResponse.json({ error: data.resultado }, { status: 400 });
    }

    return NextResponse.json({ hash: data.resultado[0].data });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
