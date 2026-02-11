import { NextResponse } from 'next/server'
import crypto from 'crypto'

const PRIVATE_KEY = '85ece630fff92520e3943f1f2a8d3c60'
const PUBLIC_KEY = '8ca1a050e7f2f5d2e0d1f4de644ae562'
const PAGOPAR_CHECK_ORDER_URL = 'https://api.pagopar.com/api/pedidos/1.1/traer'

export async function GET(
  request: Request,
  { params }: { params: { hash: string } }
) {
  try {
    const hash_pedido = params.hash

    if (!hash_pedido) {
      return NextResponse.json(
        { error: 'Hash de pedido no proporcionado' },
        { status: 400 }
      )
    }

    // Generar token: sha1(PRIVATE_KEY + "CONSULTA")
    const token = crypto
      .createHash('sha1')
      .update(PRIVATE_KEY + 'CONSULTA')
      .digest('hex')

    console.log('🔍 Paso 3 Pagopar - Consultando pedido:', {
      hash_pedido,
      token_generado: token,
      url: PAGOPAR_CHECK_ORDER_URL,
    })

    // POST a Pagopar para consultar el estado del pedido
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
      statusText: pagoparResponse.statusText,
      data: JSON.stringify(pagoparData, null, 2),
    })

    if (!pagoparResponse.ok) {
      console.error('❌ Error de Pagopar:', pagoparData)
      return NextResponse.json(
        {
          error: 'Error al consultar el estado del pedido en Pagopar',
          pagoparError: pagoparData,
          status: pagoparResponse.status,
        },
        { status: pagoparResponse.status }
      )
    }

    // Retornar el JSON completo de Pagopar
    return NextResponse.json(pagoparData, { status: 200 })
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
