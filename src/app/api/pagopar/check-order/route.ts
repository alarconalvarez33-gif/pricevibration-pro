import { NextResponse } from 'next/server'
import crypto from 'crypto'

const PRIVATE_KEY = '85ece630fff92520e3943f1f2a8d3c60'
const PUBLIC_KEY = '8ca1a050e7f2f5d2e0d1f4de644ae562'
const PAGOPAR_CHECK_ORDER_URL = 'https://api.pagopar.com/api/pedidos/1.1/traer'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { hash_pedido } = body

    if (!hash_pedido) {
      return NextResponse.json(
        { error: 'hash_pedido es requerido' },
        { status: 400 }
      )
    }

    // Generar token según documentación: sha1(PRIVATE_KEY + "CONSULTA")
    const token = crypto
      .createHash('sha1')
      .update(PRIVATE_KEY + 'CONSULTA')
      .digest('hex')

    console.log('🔍 Consultando estado de pedido en Pagopar:', {
      hash_pedido,
      token_generado: token,
      public_key: PUBLIC_KEY,
    })

    // Hacer POST a Pagopar para consultar el pedido
    const pagoparResponse = await fetch(PAGOPAR_CHECK_ORDER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        hash_pedido,
        token,
        token_publico: PUBLIC_KEY,
      }),
    })

    const pagoparData = await pagoparResponse.json()

    console.log('📦 Respuesta de Pagopar:', {
      status: pagoparResponse.status,
      data: JSON.stringify(pagoparData, null, 2),
    })

    if (!pagoparResponse.ok) {
      console.error('❌ Error de Pagopar:', pagoparData)
      return NextResponse.json(
        {
          error: 'Error al consultar Pagopar',
          pagoparError: pagoparData,
        },
        { status: pagoparResponse.status }
      )
    }

    // Pagopar retorna el estado del pedido
    // Estructura esperada: { success: true, data: {...} }
    return NextResponse.json(
      {
        success: true,
        data: pagoparData,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('❌ Error al consultar estado del pedido:', error)
    return NextResponse.json(
      {
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// GET para testing
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const hash_pedido = searchParams.get('hash_pedido')

  if (!hash_pedido) {
    return NextResponse.json(
      { error: 'hash_pedido es requerido como query parameter' },
      { status: 400 }
    )
  }

  // Redirigir al método POST
  return POST(
    new Request(request.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hash_pedido }),
    })
  )
}
