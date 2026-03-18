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
