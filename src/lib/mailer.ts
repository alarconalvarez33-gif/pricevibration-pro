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
  const base = process.env.NEXTAUTH_URL?.startsWith('http://localhost')
    ? 'https://sacredlevels.com'
    : (process.env.NEXTAUTH_URL || 'https://sacredlevels.com')

  const verifyUrl = `${base}/verify?email=${encodeURIComponent(email)}&code=${code}`

  await transporter.sendMail({
    from: '"Sacred Levels" <tradingcompy@trading.com.py>',
    to: email,
    subject: 'Activá tu cuenta en Sacred Levels',
    html: `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0A0A0B;font-family:'Helvetica Neue',Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0A0B;padding:40px 20px;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#141415;border:1px solid #222222;border-radius:4px;overflow:hidden;">

        <!-- Header -->
        <tr>
          <td style="background:#0d0d0e;padding:24px 36px;border-bottom:1px solid #1e1e1e;">
            <p style="margin:0;color:#00E5FF;font-size:11px;font-weight:700;letter-spacing:0.3em;text-transform:uppercase;">
              SACRED LEVELS
            </p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 36px 28px;">
            <h1 style="margin:0 0 8px;color:#ffffff;font-size:24px;font-weight:700;line-height:1.3;">
              Hola ${name.split(' ')[0]}, verificá tu cuenta
            </h1>
            <p style="margin:0 0 28px;color:#555555;font-size:14px;line-height:1.6;">
              Hacé click en el botón para activar tu cuenta y empezar a usar las herramientas cuánticas de Sacred Levels.
            </p>

            <!-- CTA Button -->
            <table cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
              <tr>
                <td style="background:#00E5FF;border-radius:4px;">
                  <a href="${verifyUrl}"
                     style="display:inline-block;padding:14px 32px;color:#000000;font-size:13px;font-weight:700;text-decoration:none;text-transform:uppercase;letter-spacing:0.1em;font-family:'Helvetica Neue',Arial,sans-serif;">
                    ✓ Activar mi cuenta
                  </a>
                </td>
              </tr>
            </table>

            <!-- Divider with code -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
              <tr>
                <td style="border-top:1px solid #1e1e1e;padding-top:24px;">
                  <p style="margin:0 0 12px;color:#444444;font-size:12px;">
                    O ingresá este código manualmente en la pantalla de verificación:
                  </p>
                  <div style="background:#0A0A0B;border:1px solid #333333;border-radius:4px;padding:20px;text-align:center;">
                    <span style="color:#00E5FF;font-size:34px;font-weight:700;letter-spacing:0.4em;font-family:'Courier New',Courier,monospace;">
                      ${code}
                    </span>
                  </div>
                </td>
              </tr>
            </table>

            <p style="margin:0;color:#333333;font-size:12px;line-height:1.6;">
              Este enlace expira en <strong style="color:#555555;">24 horas</strong>.
              Si no creaste una cuenta en Sacred Levels, ignorá este mensaje.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#0d0d0e;padding:20px 36px;border-top:1px solid #1e1e1e;">
            <p style="margin:0;color:#333333;font-size:10px;text-transform:uppercase;letter-spacing:0.2em;">
              sacredlevels.com — Herramientas cuánticas de trading profesional
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>

</body>
</html>
    `.trim(),
  })
}
