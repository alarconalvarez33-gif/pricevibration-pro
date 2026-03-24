import { NextResponse } from 'next/server'

const FORMSPREE_URL = 'https://formspree.io/f/xreapnkb'

export async function POST(request: Request) {
  try {
    const { name, email, message } = await request.json()

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    const res = await fetch(FORMSPREE_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, message }),
    })

    const data = await res.json()

    if (!res.ok) {
      const errMsg = data?.errors?.map((e: { message: string }) => e.message).join(', ') || 'Error al enviar'
      return NextResponse.json({ error: errMsg }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Contact API error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
