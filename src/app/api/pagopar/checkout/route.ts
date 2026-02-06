import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { plan, price } = body;
    
    const publicKey = process.env.PAGOPAR_PUBLIC_KEY;
    const privateKey = process.env.PAGOPAR_PRIVATE_KEY;

    // Si falta una clave, esto nos dirá cuál es en lugar de dar error 500
    if (!publicKey) return NextResponse.json({ error: "Falta PAGOPAR_PUBLIC_KEY en Vercel" }, { status: 200 });
    if (!privateKey) return NextResponse.json({ error: "Falta PAGOPAR_PRIVATE_KEY en Vercel" }, { status: 200 });

    // Esto es solo para probar la comunicación básica
    return NextResponse.json({ 
      mensaje: "Las claves se leen bien", 
      plan_recibido: plan,
      monto: price 
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: "Error en el JSON enviado: " + error.message }, { status: 200 });
  }
}
