import { Resend } from 'resend'

// Lazy init: si RESEND_API_KEY no está configurada no se lanza excepción al importar.
// Los emails se omiten silenciosamente hasta que la key sea provista.
const API_KEY = process.env.RESEND_API_KEY
const resend  = API_KEY ? new Resend(API_KEY) : null

const FROM  = process.env.RESEND_FROM  ?? 'Axendora <onboarding@resend.dev>'
const SITE  = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://axendora.com'
const YEAR  = new Date().getFullYear()

// ─── HTML primitives ─────────────────────────────────────────────────────────

function badge(text: string, color: string, bg: string) {
  return `<span style="display:inline-block;background-color:${bg};color:${color};font-size:11px;font-weight:700;padding:4px 12px;border-radius:20px;letter-spacing:0.6px;text-transform:uppercase;">${text}</span>`
}

function h1(text: string) {
  return `<h1 style="color:#FFFFFF;font-size:22px;font-weight:700;margin:20px 0 10px;line-height:1.35;">${text}</h1>`
}

function p(text: string, muted = false) {
  return `<p style="color:${muted ? '#A1A1AA' : '#D4D4D8'};font-size:14px;line-height:1.75;margin:0 0 14px;">${text}</p>`
}

function infoRow(label: string, value: string) {
  return `<tr>
    <td style="padding:10px 0;border-bottom:1px solid #27272A;">
      <span style="color:#71717A;font-size:12px;">${label}</span>
    </td>
    <td style="padding:10px 0;border-bottom:1px solid #27272A;text-align:right;">
      <span style="color:#E4E4E7;font-size:13px;font-weight:600;">${value}</span>
    </td>
  </tr>`
}

function cta(href: string, label: string) {
  return `<a href="${href}" style="display:inline-block;background-color:#1FA8B8;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;padding:13px 28px;border-radius:10px;margin-top:24px;letter-spacing:0.2px;">${label} →</a>`
}

function note(icon: string, text: string) {
  return `<div style="background-color:#111111;border:1px solid #27272A;border-radius:12px;padding:16px 20px;margin:20px 0;">
    <p style="color:#D4D4D8;font-size:13px;margin:0;line-height:1.65;">${icon} ${text}</p>
  </div>`
}

// ─── Shell ───────────────────────────────────────────────────────────────────

function layout(content: string) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>Axendora</title>
</head>
<body style="background-color:#000000;margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
    <tr><td align="center" style="padding:40px 16px;">
      <table width="100%" style="max-width:560px;" cellpadding="0" cellspacing="0" role="presentation">

        <!-- Header -->
        <tr><td style="background-color:#0A0A0A;border-radius:16px 16px 0 0;padding:28px 36px 24px;border-bottom:1px solid #27272A;">
          <span style="font-size:21px;font-weight:800;color:#1FA8B8;letter-spacing:-0.5px;">Axendora</span>
          <span style="font-size:11px;color:#52525B;margin-left:8px;letter-spacing:0.5px;text-transform:uppercase;">Agencia de Marketing Digital</span>
        </td></tr>

        <!-- Body -->
        <tr><td style="background-color:#0A0A0A;padding:32px 36px 24px;">
          ${content}
        </td></tr>

        <!-- Footer -->
        <tr><td style="background-color:#0A0A0A;border-radius:0 0 16px 16px;padding:20px 36px;border-top:1px solid #27272A;">
          <p style="color:#52525B;font-size:11px;margin:0;line-height:1.7;">
            © ${YEAR} Axendora · Agencia de Marketing Digital<br>
            Recibiste este correo porque tienes una cuenta en Axendora.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

// ─── Send helper ─────────────────────────────────────────────────────────────

async function send(options: { to: string; subject: string; html: string }) {
  if (!resend) {
    console.warn('[email] RESEND_API_KEY no configurada — email omitido:', options.subject)
    return
  }
  try {
    const { error } = await resend.emails.send({ from: FROM, ...options })
    if (error) console.error('[email] send error:', error)
  } catch (e) {
    console.error('[email] unexpected error:', e)
  }
}

// ─── Templates ───────────────────────────────────────────────────────────────

/** Admin aprobó la solicitud → campaña en configuración */
export async function sendSolicitudAprobada(params: {
  to: string
  nombre: string
  planNombre: string
  duracionDias: number | null
}) {
  const durText = params.duracionDias ? `${params.duracionDias} días` : 'por definir'

  const content = `
    ${badge('Solicitud aprobada', '#10B981', 'rgba(16,185,129,0.12)')}
    ${h1(`¡${params.nombre}, tu solicitud fue aprobada!`)}
    ${p(`El equipo de Axendora aceptó gestionar tu plan <strong style="color:#FFFFFF;">${params.planNombre}</strong>. Estamos preparando todo para que tu campaña arranque lo antes posible.`)}
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0 4px;">
      ${infoRow('Plan', params.planNombre)}
      ${infoRow('Duración acordada', durText)}
      ${infoRow('Estado', '⚙️ En configuración')}
    </table>
    ${note('📋', '<strong style="color:#FFFFFF;">¿Qué sigue?</strong><br>Estamos configurando tu campaña. Cuando todo esté listo recibirás otro correo y el <strong style="color:#1FA8B8;">countdown</strong> comenzará a correr en tu panel.')}
    ${cta(`${SITE}/cliente/campanas`, 'Ver estado de mi campaña')}
  `

  await send({
    to: params.to,
    subject: `¡Tu solicitud fue aprobada! · Axendora`,
    html: layout(content),
  })
}

/** Admin rechazó la solicitud */
export async function sendSolicitudRechazada(params: {
  to: string
  nombre: string
  planNombre: string
  motivo: string
}) {
  const content = `
    ${badge('Solicitud no aprobada', '#EF4444', 'rgba(239,68,68,0.12)')}
    ${h1(`Hola ${params.nombre}`)}
    ${p(`Revisamos tu solicitud para el plan <strong style="color:#FFFFFF;">${params.planNombre}</strong> y en esta ocasión no fue posible aprobarla.`)}
    <div style="background-color:#111111;border-left:3px solid #EF4444;border-radius:0 10px 10px 0;padding:16px 20px;margin:20px 0;">
      <p style="color:#A1A1AA;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.6px;margin:0 0 8px;">Motivo del rechazo</p>
      <p style="color:#E4E4E7;font-size:14px;margin:0;line-height:1.65;">${params.motivo}</p>
    </div>
    ${p('Puedes explorar otros planes disponibles o escribirnos directamente si tienes alguna pregunta.', true)}
    ${cta(`${SITE}/cliente/planes`, 'Explorar planes disponibles')}
  `

  await send({
    to: params.to,
    subject: `Actualización sobre tu solicitud · Axendora`,
    html: layout(content),
  })
}

/** Admin activó la campaña → countdown corriendo */
export async function sendCampanaIniciada(params: {
  to: string
  nombre: string
  planNombre: string
  duracionDias: number
  fechaInicio: string
  fechaFin: string
}) {
  const fmt = (iso: string) =>
    new Intl.DateTimeFormat('es', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso))

  const content = `
    ${badge('Campaña iniciada', '#10B981', 'rgba(16,185,129,0.12)')}
    ${h1(`¡${params.nombre}, tu campaña está activa! 🚀`)}
    ${p(`Tu plan <strong style="color:#FFFFFF;">${params.planNombre}</strong> ha sido iniciado. El countdown está corriendo ahora mismo — entra a tu panel para verlo en vivo.`)}
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0 4px;">
      ${infoRow('Plan', params.planNombre)}
      ${infoRow('Inicio', fmt(params.fechaInicio))}
      ${infoRow('Vencimiento', fmt(params.fechaFin))}
      ${infoRow('Duración', `${params.duracionDias} días`)}
    </table>
    <div style="background-color:#0D2B2E;border:1px solid #1FA8B8;border-radius:14px;padding:20px 24px;margin:24px 0;text-align:center;">
      <p style="color:#1FA8B8;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;margin:0 0 6px;">⏱ Countdown activo</p>
      <p style="color:#FFFFFF;font-size:32px;font-weight:800;margin:0;letter-spacing:-0.5px;">${params.duracionDias} días</p>
      <p style="color:#A1A1AA;font-size:12px;margin:6px 0 0;">hasta el ${fmt(params.fechaFin)}</p>
    </div>
    ${cta(`${SITE}/cliente/campanas`, 'Ver countdown en vivo')}
  `

  await send({
    to: params.to,
    subject: `¡Tu campaña "${params.planNombre}" está activa! · Axendora`,
    html: layout(content),
  })
}
