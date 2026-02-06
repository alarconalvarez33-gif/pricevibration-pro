import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { plan, price } = await request.json();
    
    const publicKey = process.env.PAGOPAR_PUBLIC_KEY;
    const privateKey = process.env.PAGOPAR_PRIVATE_KEY;

    if (!publicKey || !privateKey) {
      return NextResponse.json({ error: "Faltan claves en el servidor" }, { status: 500 });
    }

    // 1. ID de pedido único
    const pedidoId = `SL-${Date.now()}`;
    
    // 2. MONTO: Pagopar exige que sea un STRING sin decimales para PYG
    const monto = Math.floor(price).toString();
    
    // 3. TOKEN: sha1(privateKey + pedidoId + monto)
    const token = crypto.createHash('sha1').update(privateKey + pedidoId + monto).digest('hex');

    const payload = {
      public_key: publicKey,
      operation: {
        token: token,
        shop_process_id: pedidoId,
        monto: monto,
        descripcion: `Plan ${plan} - Sacred Levels`,
        cuotas: 1, // Importante: Número, no string
        fecha_maxima_pago: ""
      }
    };

    const response = await fetch('https://api.pagopar.com/api/orders/1.1/init', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    // Si Pagopar responde con error, lo enviamos al alert para saber QUÉ PASA
    if (data.respuesta === "error") {
      return NextResponse.json({ error: data.resultado }, { status: 400 });
    }

    // Si todo sale bien, devolvemos el hash
    return NextResponse.json({ hash: data.resultado[0].data });

  } catch (error: any) {
    return NextResponse.json({ error: "Error interno: " + error.message }, { status: 500 });
  }
}
