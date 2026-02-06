import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Pagopar envía los datos dentro de un array 'resultado'
    const resultado = body.resultado && body.resultado[0];
    
    if (!resultado) {
      return NextResponse.json({ error: 'No data received' }, { status: 400 });
    }

    const hashPedido = resultado.hash_pedido;
    const tokenRecibido = resultado.token;
    const pagado = resultado.pagado;

    // Validación crítica del token - sha1(PRIV_KEY + hash_pedido)
    const privateKey = process.env.PAGOPAR_PRIVATE_KEY;
    if (!privateKey) {
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
    }

    const hashValidacion = crypto.createHash('sha1').update(privateKey + hashPedido).digest('hex');

    if (hashValidacion !== tokenRecibido) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    if (pagado) {
      console.log(`Pago confirmado para pedido: ${resultado.numero_pedido}`);
      // Aquí el sistema ya sabe si es Pro o Whale por el número de pedido
    }

    // Pagopar requiere que devuelvas exactamente el mismo JSON que recibiste
    return NextResponse.json(body, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
