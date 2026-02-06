import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Intentamos leer el cuerpo para ver si el botón envía los datos
    const body = await request.json().catch(() => ({}));
    
    // Verificamos las variables de entorno sin que el código explote
    const pub = process.env.PAGOPAR_PUBLIC_KEY ? "Configurada" : "FALTA";
    const priv = process.env.PAGOPAR_PRIVATE_KEY ? "Configurada" : "FALTA";

    return NextResponse.json({
      status: "Servidor activo",
      diagnostico: {
        public_key: pub,
        private_key: priv,
        plan_recibido: body.plan || "Ninguno"
      }
    });
  } catch (error: any) {
    return NextResponse.json({ 
      error: "Error crítico de ejecución",
      detalle: error.message 
    }, { status: 500 });
  }
}
