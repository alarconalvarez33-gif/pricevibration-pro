import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { plan, price } = await request.json();
    
    // 1. Datos del comercio (Usa las variables de Vercel)
    const publicKey = process.env.PAGOPAR_PUBLIC_KEY;
    const privateKey = process.env.PAGOPAR_PRIVATE_KEY;

    if (!publicKey || !privateKey) {
       throw new Error("Faltan las claves de Pagopar en Vercel");
    }

    // 2. Crear un ID de pedido único para la prueba
    const pedidoId = `ORDER-${Date.now()}`;
    
    // 3. Generar el Token de seguridad (Fórmula: sha1(private_key + pedidoId + monto))
    const monto = price.toString();
    const token = crypto.createHash('sha1').update(privateKey + pedidoId + monto).digest('hex');

    // 4. Preparar el JSON para Pagopar
    const pagoparData = {
      public_key: publicKey,
      operation: {
        token: token,
        shop_process_id: pedidoId,
        monto: monto,
        descripcion: `Plan ${plan} - Sacred Levels`,
        // Importante: Pagopar en Staging a veces requiere estos campos vacíos o fijos
        cuotas: "1",
        fecha_maxima_pago: "",
      }
    };

    const response = await fetch('https://api.pagopar.com/api/orders/1.1/init', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pagoparData)
    });

    const resultado = await response.json();

    if (resultado.respuesta === "error") {
      console.error("Error de Pagopar:", resultado.resultado);
      return NextResponse.json({ error: resultado.resultado }, { status: 400 });
    }

    // Devolvemos el hash para que el frontend redirija
    return NextResponse.json({ hash: resultado.resultado[0].data });

  } catch (error: any) {
    console.error("Error Interno:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
