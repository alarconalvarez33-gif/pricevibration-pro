import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

const products: Record<string, { name: string; price: number; pricePYG: number }> = {
  'canal-paralelo': { name: 'Canal Paralelo - Video Course', price: 49, pricePYG: 343000 },
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Debes iniciar sesión' }, { status: 401 })
    }

    const body = await request.json()
    const { productId } = body

    if (!productId || !products[productId]) {
      return NextResponse.json({ error: 'Producto inválido' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    const privateKey = process.env.PAGOPAR_PRIVATE_KEY
    const publicKey = process.env.PAGOPAR_PUBLIC_KEY

    if (!privateKey || !publicKey) {
      console.error('Pagopar keys not configured')
      return NextResponse.json({ error: 'Pasarela de pago no configurada' }, { status: 500 })
    }

    const product = products[productId]
    const monto = product.pricePYG

    const timestamp = Date.now()
    const orderId = `PROD-CANALPARALELO-${user.id.slice(-6)}-${timestamp}`

    console.log('💰 Monto calculado:', monto, 'PYG')
    console.log('🆔 Order ID generado:', orderId)

    // Token: sha1(PRIVATE_KEY + id_pedido_comercio + strval(floatval(monto_total)))
    const tokenString = privateKey + orderId + String(parseFloat(String(monto)))
    const token = crypto.createHash('sha1').update(tokenString).digest('hex')

    console.log('🔐 Token string:', tokenString)
    console.log('🔐 Token SHA1:', token)

    // Save product purchase record before calling Pagopar
    const purchase = await prisma.productPurchase.create({
      data: {
        orderId,
        userId: user.id,
        productId,
        price: product.price,
        status: 'pending',
      },
    })

    // Fecha máxima de pago: 7 días desde ahora
    const fechaMaxima = new Date()
    fechaMaxima.setDate(fechaMaxima.getDate() + 7)
    const fechaMaximaStr = fechaMaxima.toISOString().slice(0, 19).replace('T', ' ')

    const pagoparBody = {
      token: token,
      comprador: {
        ruc: '',
        email: user.email,
        ciudad: '1',
        nombre: user.name || user.email,
        telefono: '0971000000',
        direccion: '',
        documento: '1000000',
        coordenadas: '',
        razon_social: '',
        tipo_documento: 'CI',
        direccion_referencia: ''
      },
      public_key: publicKey,
      monto_total: monto,
      tipo_pedido: 'VENTA-COMERCIO',
      compras_items: [
        {
          ciudad: '1',
          nombre: product.name,
          cantidad: 1,
          categoria: '909',
          public_key: publicKey,
          url_imagen: '',
          descripcion: product.name,
          id_producto: 1,
          precio_total: monto,
          vendedor_telefono: '',
          vendedor_direccion: '',
          vendedor_direccion_referencia: '',
          vendedor_direccion_coordenadas: ''
        }
      ],
      fecha_maxima_pago: fechaMaximaStr,
      id_pedido_comercio: orderId,
      descripcion_resumen: product.name,
      forma_pago: 9,
      url_retorno: `${process.env.NEXTAUTH_URL || 'https://sacredlevels.com'}/courses/canal-paralelo`
    }

    console.log('\n' + '='.repeat(80))
    console.log('🔵 PAGOPAR API REQUEST (PRODUCT)')
    console.log('='.repeat(80))
    console.log(JSON.stringify(pagoparBody, null, 2))
    console.log('='.repeat(80) + '\n')

    const response = await fetch('https://api.pagopar.com/api/comercios/2.0/iniciar-transaccion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pagoparBody),
    })

    const result = await response.json()

    console.log('\n' + '='.repeat(80))
    console.log('📥 PAGOPAR API RESPONSE (PRODUCT)')
    console.log('='.repeat(80))
    console.log(JSON.stringify(result, null, 2))
    console.log('='.repeat(80) + '\n')

    let pagoparHash: string | null = null

    if (result.respuesta === true && result.resultado && Array.isArray(result.resultado) && result.resultado[0]?.data) {
      pagoparHash = result.resultado[0].data
    } else if (result.resultado?.data) {
      pagoparHash = result.resultado.data
    } else if (result.data) {
      pagoparHash = result.data
    }

    if (!pagoparHash) {
      console.error('❌ ERROR: No se pudo extraer el hash de Pagopar')
      console.error('❌ Respuesta:', JSON.stringify(result, null, 2))

      await prisma.productPurchase.update({
        where: { id: purchase.id },
        data: { status: 'failed' },
      })

      return NextResponse.json({
        error: 'No se pudo generar la sesión de pago',
        pagoparError: result.error || result.mensaje || result.message || 'Error desconocido de Pagopar',
        details: result,
      }, { status: 500 })
    }

    // Update purchase with Pagopar hash
    await prisma.productPurchase.update({
      where: { id: purchase.id },
      data: { pagoparHash },
    })

    return NextResponse.json({
      success: true,
      hash: pagoparHash,
      paymentUrl: `https://www.pagopar.com/pagos/${pagoparHash}`,
      orderId,
    })
  } catch (error) {
    console.error('Create product order error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
