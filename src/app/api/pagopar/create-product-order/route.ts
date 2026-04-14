import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

const products: Record<string, { name: string; price: number; pricePYG: number; courseUrl: string }> = {
  'canal-paralelo': { name: 'Canal Paralelo - Video Curso', price: 48, pricePYG: 320000, courseUrl: '/courses/canal-paralelo' },
  'expansion-matematica': { name: 'Genesis', price: 77, pricePYG: 500000, courseUrl: '/courses/expansion-matematica' },
  'fisica-cuantica': { name: 'Física Cuántica - Niveles de Probabilidad', price: 100, pricePYG: 650000, courseUrl: '/quantum' },
  'fibonacci': { name: 'Curso de Fibonacci - Potencial Oculto', price: 75, pricePYG: 499000, courseUrl: '/courses/fibonacci' },
  'super-estrategia': { name: 'Super Estrategia - Curso Exclusivo', price: 10, pricePYG: 65000, courseUrl: '/curso' },
  'adx': { name: 'Estrategia ADX - Manual Completo', price: 30, pricePYG: 220000, courseUrl: '/courses/adx' },
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

    // Trim keys to avoid whitespace issues in env vars
    const privateKey = (process.env.PAGOPAR_PRIVATE_KEY || '').trim()
    const publicKey = (process.env.PAGOPAR_PUBLIC_KEY || '').trim()

    if (!privateKey || !publicKey) {
      console.error('Pagopar keys not configured')
      return NextResponse.json({ error: 'Pasarela de pago no configurada' }, { status: 500 })
    }

    const product = products[productId]
    const monto = Math.floor(product.pricePYG)

    const timestamp = Date.now()
    const orderId = `PROD-${user.id.slice(-6)}-${timestamp}`

    // Token: sha1(PRIVATE_KEY + id_pedido_comercio + strval(floatval(monto_total)))
    const montoStr = String(parseFloat(String(monto)))
    const tokenString = privateKey + orderId + montoStr
    const token = crypto.createHash('sha1').update(tokenString).digest('hex')

    console.log('🔑 Private key (primeros 8):', privateKey.substring(0, 8) + '...')
    console.log('🔑 Public key (primeros 8):', publicKey.substring(0, 8) + '...')

    console.log('💰 Monto:', monto)
    console.log('🆔 OrderId:', orderId)
    console.log('🔐 Token string:', tokenString)
    console.log('🔐 Token SHA1:', token)

    // Guardar registro antes de llamar a Pagopar
    const purchase = await prisma.productPurchase.create({
      data: {
        orderId,
        userId: user.id,
        productId,
        price: product.price,
        status: 'pending',
      },
    })

    // Fecha máxima: 7 días
    const fechaMaxima = new Date()
    fechaMaxima.setDate(fechaMaxima.getDate() + 7)
    const fechaMaximaStr = fechaMaxima.toISOString().slice(0, 19).replace('T', ' ')

    // url_retorno: Pagopar redirige aquí después del pago (siempre URL de producción)
    const pagoparBody = {
      token,
      url_retorno: `https://sacredlevels.com${product.courseUrl}`,
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
        direccion_referencia: '',
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
          vendedor_direccion_coordenadas: '',
        },
      ],
      fecha_maxima_pago: fechaMaximaStr,
      id_pedido_comercio: orderId,
      descripcion_resumen: product.name,
      forma_pago: 9,
    }

    console.log('📦 Pagopar body:', JSON.stringify(pagoparBody, null, 2))

    const response = await fetch('https://api.pagopar.com/api/comercios/2.0/iniciar-transaccion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pagoparBody),
    })

    const result = await response.json()
    console.log('📥 Pagopar response:', JSON.stringify(result, null, 2))

    // Extraer hash — mismo patrón que create-order
    let pagoparHash: string | null = null

    if (result.respuesta === true && Array.isArray(result.resultado) && result.resultado[0]?.data) {
      pagoparHash = result.resultado[0].data
    } else if (result.resultado?.data) {
      pagoparHash = result.resultado.data
    } else if (result.data) {
      pagoparHash = result.data
    }

    // Extraer mensaje de error de Pagopar desde cualquier campo posible
    const pagoparErrorMsg =
      result.error ||
      result.mensaje ||
      result.message ||
      (Array.isArray(result.resultado) && result.resultado[0]?.mensaje) ||
      (Array.isArray(result.resultado) && result.resultado[0]?.error) ||
      (typeof result.resultado === 'string' ? result.resultado : null) ||
      JSON.stringify(result)

    if (!pagoparHash) {
      console.error('❌ No se pudo extraer hash. Respuesta completa:', JSON.stringify(result))

      await prisma.productPurchase.update({
        where: { id: purchase.id },
        data: { status: 'failed' },
      })

      return NextResponse.json({
        error: 'No se pudo generar la sesión de pago',
        pagoparError: pagoparErrorMsg,
        fullResponse: result,
      }, { status: 500 })
    }

    await prisma.productPurchase.update({
      where: { id: purchase.id },
      data: { pagoparHash },
    })

    return NextResponse.json({
      success: true,
      hash: pagoparHash,
      paymentUrl: `https://www.pagopar.com/pagos/${pagoparHash}`,
      orderId,
      courseUrl: product.courseUrl,
    })
  } catch (error) {
    console.error('Create product order error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
