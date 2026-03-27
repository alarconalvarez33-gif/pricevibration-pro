import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

const CURSO = {
  productId: 'super-estrategia',
  name: 'Super Estrategia - Curso Exclusivo',
  pricePYG: 65000,
  priceUsd: 9,
}

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Debes iniciar sesión para comprar' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    const privateKey = (process.env.PAGOPAR_PRIVATE_KEY || '').trim()
    const publicKey  = (process.env.PAGOPAR_PUBLIC_KEY  || '').trim()

    if (!privateKey || !publicKey) {
      return NextResponse.json({ error: 'Pasarela de pago no configurada' }, { status: 500 })
    }

    const monto    = CURSO.pricePYG
    const orderId  = `PROD-${user.id.slice(-6)}-${Date.now()}`
    const montoStr = String(parseFloat(String(monto)))
    const token    = crypto.createHash('sha1').update(privateKey + orderId + montoStr).digest('hex')

    console.log('💰 Curso order:', { orderId, monto, token })

    const purchase = await prisma.productPurchase.create({
      data: {
        orderId,
        userId: user.id,
        productId: CURSO.productId,
        price: CURSO.priceUsd,
        status: 'pending',
      },
    })

    const fechaMaxima = new Date()
    fechaMaxima.setDate(fechaMaxima.getDate() + 7)
    const fechaMaximaStr = fechaMaxima.toISOString().slice(0, 19).replace('T', ' ')

    const pagoparBody = {
      token,
      public_key: publicKey,
      monto_total: monto,
      tipo_pedido: 'VENTA-COMERCIO',
      id_pedido_comercio: orderId,
      descripcion_resumen: CURSO.name,
      fecha_maxima_pago: fechaMaximaStr,
      forma_pago: 9,
      url_retorno: 'https://sacredlevels.com/curso',
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
      compras_items: [
        {
          ciudad: '1',
          nombre: CURSO.name,
          cantidad: 1,
          categoria: '909',
          public_key: publicKey,
          url_imagen: '',
          descripcion: CURSO.name,
          id_producto: 1,
          precio_total: monto,
          vendedor_telefono: '',
          vendedor_direccion: '',
          vendedor_direccion_referencia: '',
          vendedor_direccion_coordenadas: '',
        },
      ],
    }

    const response = await fetch('https://api.pagopar.com/api/comercios/2.0/iniciar-transaccion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pagoparBody),
    })

    const result = await response.json()
    console.log('📥 Pagopar response:', JSON.stringify(result))

    let pagoparHash: string | null = null
    if (result.respuesta === true && Array.isArray(result.resultado) && result.resultado[0]?.data) {
      pagoparHash = result.resultado[0].data
    } else if (result.resultado?.data) {
      pagoparHash = result.resultado.data
    } else if (result.data) {
      pagoparHash = result.data
    }

    if (!pagoparHash) {
      await prisma.productPurchase.update({ where: { id: purchase.id }, data: { status: 'failed' } })
      const errMsg = result.error || result.mensaje || result.message || JSON.stringify(result)
      return NextResponse.json({ error: 'No se pudo generar el pago', pagoparError: errMsg }, { status: 500 })
    }

    await prisma.productPurchase.update({ where: { id: purchase.id }, data: { pagoparHash } })

    return NextResponse.json({
      success: true,
      paymentUrl: `https://www.pagopar.com/pagos/${pagoparHash}`,
      orderId,
    })
  } catch (error) {
    console.error('Curso order error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
