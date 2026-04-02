import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: 'mail.trading.com.py',
  port: 465,
  secure: true,
  auth: {
    user: 'tradingcompy@trading.com.py',
    pass: process.env.SMTP_PASSWORD,
  },
})

export async function sendVerificationEmail(email: string, name: string, code: string) {
  await transporter.sendMail({
    from: '"Sacred Levels" <tradingcompy@trading.com.py>',
    to: email,
    subject: 'Verificá tu cuenta — Sacred Levels',
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0A0A0B;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:480px;margin:40px auto;background:#141415;border:1px solid #222;padding:40px 36px;">
    <div style="margin-bottom:28px;">
      <p style="color:#00E5FF;font-size:10px;font-weight:700;letter-spacing:0.3em;text-transform:uppercase;margin:0 0 10px;">
        Sacred Levels
      </p>
      <h1 style="color:#fff;font-size:22px;font-weight:700;margin:0;">
        Verificá tu email
      </h1>
    </div>

    <p style="color:#555;font-size:14px;line-height:1.6;margin:0 0 28px;">
      Hola ${name}, ingresá este código en la pantalla de verificación para activar tu cuenta:
    </p>

    <div style="background:#0A0A0B;border:1px solid #333;padding:24px;text-align:center;margin-bottom:28px;">
      <span style="color:#00E5FF;font-size:36px;font-weight:700;letter-spacing:0.3em;font-family:'Courier New',monospace;">
        ${code}
      </span>
    </div>

    <p style="color:#444;font-size:12px;line-height:1.6;margin:0 0 8px;">
      Este código expira en <strong style="color:#666;">24 horas</strong>.
    </p>
    <p style="color:#333;font-size:11px;margin:0;">
      Si no creaste una cuenta en Sacred Levels, ignorá este email.
    </p>

    <div style="margin-top:32px;padding-top:24px;border-top:1px solid #1e1e1f;">
      <p style="color:#333;font-size:10px;margin:0;text-transform:uppercase;letter-spacing:0.2em;">
        sacredlevels.com — Herramientas cuánticas de trading
      </p>
    </div>
  </div>
</body>
</html>
    `.trim(),
  })
}
