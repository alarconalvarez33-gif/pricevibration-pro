import { NextResponse } from 'next/server'
import crypto from 'crypto'

const PRIVATE_KEY = (process.env.PAGOPAR_PRIVATE_KEY || '').trim()
const PUBLIC_KEY  = (process.env.PAGOPAR_PUBLIC_KEY  || '').trim()
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
    const concatenacion = PRIVATE_KEY + 'CONSULTA'
    const token = crypto
      .createHash('sha1')
      .update(concatenacion)
      .digest('hex')

    const requestBody = {
      hash_pedido,
      token,
      token_publico: PUBLIC_KEY,
    }

    console.log('=' .repeat(70))
    console.log('🔍 PASO 3 PAGOPAR - CONSULTANDO PEDIDO')
    console.log('=' .repeat(70))
    console.log('📍 URL:', PAGOPAR_CHECK_ORDER_URL)
    console.log('🔑 PRIVATE_KEY:', PRIVATE_KEY)
    console.log('🔐 Concatenación:', concatenacion)
    console.log('🎫 Token generado:', token)
    console.log('📝 Request Body:', JSON.stringify(requestBody, null, 2))
    console.log('=' .repeat(70))

    // POST a Pagopar para consultar el estado del pedido
    const pagoparResponse = await fetch(PAGOPAR_CHECK_ORDER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    console.log('📡 Fetch realizado a Pagopar')

    const pagoparData = await pagoparResponse.json()

    console.log('=' .repeat(70))
    console.log('📦 RESPUESTA DE PAGOPAR')
    console.log('=' .repeat(70))
    console.log('✅ Status:', pagoparResponse.status, pagoparResponse.statusText)
    console.log('📄 Headers:', Object.fromEntries(pagoparResponse.headers.entries()))
    console.log('📋 Data:', JSON.stringify(pagoparData, null, 2))
    console.log('=' .repeat(70))

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
