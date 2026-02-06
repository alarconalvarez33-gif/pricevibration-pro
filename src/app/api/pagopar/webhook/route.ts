import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Leemos lo que envía Pagopar
    const body = await request.json();
    console.log('Datos recibidos de Pagopar:', JSON.stringify(body));

    // Respondemos con éxito de inmediato para que Pagopar no de error
    // Pagopar requiere que devuelvas exactamente el resultado que ellos enviaron
    return NextResponse.json(body, { status: 200 });

  } catch (error) {
    console.error('Error en el Webhook:', error);
    // Aunque haya error, devolvemos 200 para que la pasarela no se bloquee
    return NextResponse.json({ status: 'ok' }, { status: 200 });
  }
}

// También añadimos GET por si Pagopar intenta validar la URL con una simple carga
export async function GET() {
  return NextResponse.json({ mensaje: "Webhook activo" }, { status: 200 });
}
