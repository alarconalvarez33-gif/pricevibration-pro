import { NextResponse } from 'next/server'

const RESEND_API_KEY = process.env.RESEND_API_KEY
const ADMIN_EMAIL = 'alarconalvarez33@gmail.com'

export async function POST(request: Request) {
  try {
    const { name, email, message } = await request.json()

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    console.log('📩 Contacto recibido:', { name, email, message: message.slice(0, 100) })

    if (RESEND_API_KEY) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Sacred Levels <onboarding@resend.dev>',
          to: ADMIN_EMAIL,
          reply_to: email,
          subject: `Contacto: ${name} — Sacred Levels`,
          html: `
            <div style="font-family:Arial,sans-serif;background:#0d1421;color:#e2e8f0;max-width:560px;margin:0 auto;padding:32px 24px;">
              <div style="margin-bottom:24px;">
                <span style="font-size:18px;font-weight:bold;color:#00E5FF;letter-spacing:2px;">SACRED LEVELS</span>
                <span style="font-size:12px;color:#555;margin-left:8px;">— Formulario de Contacto</span>
              </div>
              <table style="width:100%;border-collapse:collapse;">
                <tr><td style="padding:8px 0;color:#888;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Nombre</td></tr>
                <tr><td style="padding:0 0 16px;color:#fff;font-size:16px;">${name}</td></tr>
                <tr><td style="padding:8px 0;color:#888;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Email</td></tr>
                <tr><td style="padding:0 0 16px;"><a href="mailto:${email}" style="color:#00E5FF;">${email}</a></td></tr>
                <tr><td style="padding:8px 0;color:#888;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Mensaje</td></tr>
                <tr><td style="padding:0;color:#ccc;line-height:1.6;white-space:pre-wrap;">${message}</td></tr>
              </table>
              <div style="margin-top:32px;padding-top:16px;border-top:1px solid #1e2a3a;font-size:11px;color:#4a5a6a;">
                Enviado desde sacredlevels.com
              </div>
            </div>
          `,
        }),
      })

      if (!res.ok) {
        const err = await res.text()
        console.error('Resend error:', err)
        // Aún así retornamos success para no bloquear al usuario
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Contact API error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
