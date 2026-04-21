/**
 * Email helper using Resend REST API (no package install needed).
 * Set RESEND_API_KEY in env to enable. If not set, emails are logged only.
 * Set EMAIL_FROM to your verified sender, e.g. "Sacred Levels <noreply@sacredlevels.com>"
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY
const EMAIL_FROM = process.env.EMAIL_FROM || 'Sacred Levels <noreply@sacredlevels.com>'

async function sendEmail(to: string, subject: string, html: string) {
  if (!RESEND_API_KEY) {
    console.log(`[EMAIL SKIP — no RESEND_API_KEY] To: ${to} | Subject: ${subject}`)
    return
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: EMAIL_FROM, to, subject, html }),
  })
  if (!res.ok) {
    const err = await res.text()
    console.error(`[EMAIL FAILED] ${res.status} — ${err}`)
  }
}

function baseTemplate(body: string) {
  return `
    <div style="font-family:Arial,sans-serif;background:#0d1421;color:#e2e8f0;max-width:560px;margin:0 auto;padding:32px 24px;border-radius:8px;">
      <div style="margin-bottom:24px;">
        <span style="font-size:18px;font-weight:bold;color:#c9a227;letter-spacing:2px;">SACRED LEVELS</span>
      </div>
      ${body}
      <div style="margin-top:32px;padding-top:24px;border-top:1px solid #1e2a3a;font-size:11px;color:#4a5a6a;">
        Sacred Levels · Herramientas profesionales de trading<br/>
        Este email fue enviado a tu cuenta registrada.
      </div>
    </div>
  `
}

function fmtDate(d: Date) {
  return d.toLocaleDateString('es-PY', { day: '2-digit', month: 'long', year: 'numeric' })
}

// ── Email templates ───────────────────────────────────────────────────────────

export async function sendCancellationEmail(email: string, name: string, premiumUntil: Date) {
  const displayName = name || email
  const accessDate = fmtDate(premiumUntil)
  await sendEmail(
    email,
    'Tu suscripción fue cancelada — Sacred Levels',
    baseTemplate(`
      <h2 style="color:#fff;font-size:20px;margin-bottom:8px;">Suscripción cancelada</h2>
      <p style="color:#8a9bb3;margin-bottom:16px;">Hola ${displayName},</p>
      <p style="color:#8a9bb3;">Tu suscripción fue cancelada exitosamente. Seguís teniendo acceso completo hasta:</p>
      <div style="background:#131c2e;border-left:3px solid #c9a227;padding:16px;margin:20px 0;font-size:18px;font-weight:bold;color:#c9a227;">
        ${accessDate}
      </div>
      <p style="color:#8a9bb3;">Podés reactivar tu suscripción en cualquier momento desde tu cuenta antes de esa fecha.</p>
      <a href="https://sacredlevels.com/account/subscription" style="display:inline-block;background:#c9a227;color:#000;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;margin-top:16px;">
        Reactivar suscripción
      </a>
    `)
  )
}

export async function sendRenewalReminderEmail(email: string, name: string, premiumUntil: Date) {
  const displayName = name || email
  const renewDate = fmtDate(premiumUntil)
  await sendEmail(
    email,
    'Tu suscripción vence pronto — Sacred Levels',
    baseTemplate(`
      <h2 style="color:#fff;font-size:20px;margin-bottom:8px;">Recordatorio de renovación</h2>
      <p style="color:#8a9bb3;margin-bottom:16px;">Hola ${displayName},</p>
      <p style="color:#8a9bb3;">Tu suscripción a Sacred Levels vence el <strong style="color:#fff;">${renewDate}</strong>.</p>
      <p style="color:#8a9bb3;">Para continuar con acceso ininterrumpido, renová antes de esa fecha.</p>
      <a href="https://sacredlevels.com/billing" style="display:inline-block;background:#c9a227;color:#000;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;margin-top:16px;">
        Renovar ahora
      </a>
    `)
  )
}

export async function sendExpiryEmail(email: string, name: string) {
  const displayName = name || email
  await sendEmail(
    email,
    'Tu suscripción expiró — Sacred Levels',
    baseTemplate(`
      <h2 style="color:#ff4757;font-size:20px;margin-bottom:8px;">Suscripción expirada</h2>
      <p style="color:#8a9bb3;margin-bottom:16px;">Hola ${displayName},</p>
      <p style="color:#8a9bb3;">Tu suscripción a Sacred Levels expiró. Tu cuenta fue cambiada al plan gratuito.</p>
      <p style="color:#8a9bb3;">Podés volver a suscribirte en cualquier momento para recuperar el acceso completo.</p>
      <a href="https://sacredlevels.com/billing" style="display:inline-block;background:#c9a227;color:#000;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;margin-top:16px;">
        Volver a suscribirme
      </a>
    `)
  )
}

export async function sendWelcomeEmail(
  email: string,
  name: string,
  product: string,
  premiumUntil: Date | null
) {
  const displayName = name || email
  const isSubscription = product === 'quantum'
  const productNames: Record<string, string> = {
    'quantum':               'Quantum Access',
    'expansion-matematica':  'Genesis',
    'canal-paralelo':        'Canal Paralelo',
    'fibonacci':             'Fibonacci Avanzado',
    'super-estrategia':      'Super Estrategia',
    'adx':                   'Estrategia ADX',
    'metalevels':            'MetaLevels',
    'frecuencia':            'Frecuencia',
  }
  const productLabel = productNames[product] ?? product

  const pcWarningCard = `
    <div style="background:#1a1505;border:1px solid #c9a227;border-radius:8px;padding:20px;margin:20px 0;">
      <p style="color:#c9a227;font-weight:bold;font-size:14px;margin:0 0 12px 0;">⚠️ Importante: Instalación desde PC</p>
      <p style="color:#aaa;font-size:14px;line-height:1.6;margin:0 0 10px 0;">
        Para instalar MetaLevels por primera vez, necesitás una <strong style="color:#fff;">computadora (PC o Mac)</strong>.
        El editor móvil de TradingView tiene limitaciones técnicas que causan errores al pegar el código.
      </p>
      <p style="color:#aaa;font-size:14px;line-height:1.6;margin:0 0 16px 0;">
        Una vez instalado desde PC, vas a poder usar el indicador desde cualquier dispositivo, incluyendo tu celular.
      </p>
      <table cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="background:#25D366;border-radius:6px;">
            <a href="https://wa.me/595981234128?text=${encodeURIComponent('Hola, tengo dudas sobre la instalación de MetaLevels')}"
               style="display:inline-block;padding:12px 20px;color:#ffffff;text-decoration:none;font-weight:500;font-size:14px;">
              <img src="https://sacredlevels.com/icons/whatsapp-white.svg" width="18" height="18" alt="WhatsApp" style="vertical-align:middle;margin-right:8px;">
              Pedir ayuda por WhatsApp
            </a>
          </td>
        </tr>
      </table>
    </div>
  `

  const body = isSubscription && premiumUntil
    ? `
      <h2 style="color:#00d26a;font-size:20px;margin-bottom:8px;">¡Tu acceso está activo!</h2>
      <p style="color:#8a9bb3;margin-bottom:16px;">Hola ${displayName},</p>
      <p style="color:#8a9bb3;">Tu suscripción <strong style="color:#c9a227;">${productLabel}</strong> fue activada exitosamente.</p>
      <div style="background:#131c2e;border-left:3px solid #00d26a;padding:16px;margin:20px 0;font-size:15px;color:#fff;">
        Acceso activo hasta: <strong>${fmtDate(premiumUntil)}</strong>
      </div>
      <p style="color:#8a9bb3;">Podés acceder a todas las herramientas desde tu dashboard.</p>
      <a href="https://sacredlevels.com/dashboard" style="display:inline-block;background:#c9a227;color:#000;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;margin-top:16px;">
        Ir al Dashboard
      </a>
    `
    : product === 'frecuencia'
    ? `
      <h2 style="color:#00d26a;font-size:20px;margin-bottom:8px;">🎓 Bienvenido al curso Frecuencia</h2>
      <p style="color:#8a9bb3;margin-bottom:16px;">Hola ${displayName},</p>
      <p style="color:#8a9bb3;">Tu pago fue confirmado. Ya tenés <strong style="color:#fff;">acceso completo al curso Frecuencia</strong>.</p>
      <div style="background:#0e0e0f;border:1px solid #222;border-radius:8px;overflow:hidden;margin:20px 0;">
        <div style="background:#141415;padding:16px 20px;border-bottom:1px solid #222;">
          <p style="color:#00e5ff;font-size:11px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;margin:0 0 6px 0;">Nuevo Curso · Sacred Levels</p>
          <p style="color:#fff;font-size:20px;font-weight:bold;margin:0;font-family:Georgia,serif;">Frecuencia</p>
          <p style="color:#666;font-size:13px;margin:6px 0 0 0;">Decodificá la estructura fractal del mercado</p>
        </div>
        <div style="padding:16px 20px;">
          <p style="color:#8a9bb3;font-size:14px;line-height:1.6;margin:0 0 16px 0;">
            Podés acceder las veces que quieras desde tu cuenta en sacredlevels.com.
          </p>
          <table cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="background:#00e5ff;border-radius:4px;">
                <a href="https://sacredlevels.com/cursos/frecuencia"
                   style="display:inline-block;padding:12px 24px;color:#000;text-decoration:none;font-weight:bold;font-size:14px;letter-spacing:1px;text-transform:uppercase;">
                  Acceder al Curso →
                </a>
              </td>
            </tr>
          </table>
        </div>
      </div>
      <div style="background:#0a1a0a;border:1px solid #1a3a1a;border-radius:8px;padding:16px 20px;margin:16px 0;">
        <p style="color:#4a8a4a;font-size:13px;margin:0 0 8px 0;font-weight:bold;">✅ Tu compra incluye:</p>
        <p style="color:#8a9bb3;font-size:13px;margin:0;line-height:1.8;">
          · Material descargable + videos<br/>
          · Acceso de por vida<br/>
          · Soporte por WhatsApp
        </p>
      </div>
      <p style="color:#4a5a6a;font-size:13px;margin-top:20px;">
        ¿Necesitás ayuda?
        <a href="https://wa.me/595981234128" style="color:#25D366;text-decoration:none;font-weight:bold;">Escribinos por WhatsApp</a>
      </p>
    `
    : product === 'metalevels'
    ? `
      <h2 style="color:#00d26a;font-size:20px;margin-bottom:8px;">¡Tu MetaLevels está listo!</h2>
      <p style="color:#8a9bb3;margin-bottom:16px;">Hola ${displayName},</p>
      <p style="color:#8a9bb3;">Tu licencia de <strong style="color:#c9a227;">MetaLevels</strong> fue activada. Ya podés acceder al código Pine Script y tu clave personal desde el siguiente enlace:</p>
      <a href="https://sacredlevels.com/metalevels/acceso" style="display:inline-block;background:#c9a227;color:#000;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;margin-top:8px;margin-bottom:4px;">
        Ver mi indicador →
      </a>
      ${pcWarningCard}
    `
    : `
      <h2 style="color:#00d26a;font-size:20px;margin-bottom:8px;">¡Tu compra está lista!</h2>
      <p style="color:#8a9bb3;margin-bottom:16px;">Hola ${displayName},</p>
      <p style="color:#8a9bb3;">Tu acceso a <strong style="color:#c9a227;">${productLabel}</strong> fue activado exitosamente.</p>
      <p style="color:#8a9bb3;">Podés acceder al contenido desde la sección Cursos en tu cuenta.</p>
      <a href="https://sacredlevels.com/courses" style="display:inline-block;background:#c9a227;color:#000;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;margin-top:16px;">
        Ver mis cursos
      </a>
    `

  const subject = isSubscription
    ? '¡Tu acceso Quantum está activo! — Sacred Levels'
    : product === 'frecuencia'
    ? '🎓 Bienvenido al curso Frecuencia — Acceso activado'
    : `¡Tu acceso a ${productLabel} está listo! — Sacred Levels`

  await sendEmail(email, subject, baseTemplate(body))
}

export async function sendReactivationEmail(email: string, name: string, plan: string, premiumUntil: Date) {
  const displayName = name || email
  const renewDate = fmtDate(premiumUntil)
  const planLabel = plan.charAt(0).toUpperCase() + plan.slice(1)
  await sendEmail(
    email,
    'Suscripción reactivada — Sacred Levels',
    baseTemplate(`
      <h2 style="color:#00d26a;font-size:20px;margin-bottom:8px;">Suscripción reactivada</h2>
      <p style="color:#8a9bb3;margin-bottom:16px;">Hola ${displayName},</p>
      <p style="color:#8a9bb3;">Tu suscripción <strong style="color:#c9a227;">Plan ${planLabel}</strong> fue reactivada exitosamente.</p>
      <p style="color:#8a9bb3;">Tu acceso está activo hasta el <strong style="color:#fff;">${renewDate}</strong>.</p>
      <a href="https://sacredlevels.com/dashboard" style="display:inline-block;background:#c9a227;color:#000;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;margin-top:16px;">
        Ir al Dashboard
      </a>
    `)
  )
}
