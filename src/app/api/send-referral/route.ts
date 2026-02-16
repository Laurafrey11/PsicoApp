import nodemailer from 'nodemailer';
import { createAdminClient } from '@/lib/supabase/admin';
import { getClientIP, createReferral } from '@/lib/utils/ip-manager';

const PROFESSIONAL_EMAIL = 'lalifreyre.lf@gmail.com';

function createTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
}

export async function POST(req: Request) {
  try {
    const { nombre, apellido, telefono, email, contexto } = await req.json();

    // Validación básica
    if (!nombre || !apellido || !telefono || !email) {
      return Response.json(
        { error: 'Todos los campos son obligatorios' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const clientIP = getClientIP(req);

    // Enviar email a la profesional
    const transporter = createTransporter();

    await transporter.sendMail({
      from: `Ego-Core <${process.env.GMAIL_USER}>`,
      to: PROFESSIONAL_EMAIL,
      subject: `Nueva derivación - ${nombre} ${apellido}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #0891b2; border-bottom: 2px solid #0891b2; padding-bottom: 10px;">
            Nueva Derivación - Ego-Core
          </h2>

          <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #334155;">Datos del paciente</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #64748b; width: 120px;">Nombre:</td>
                <td style="padding: 8px 0; font-weight: bold;">${nombre} ${apellido}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;">Teléfono:</td>
                <td style="padding: 8px 0; font-weight: bold;">${telefono}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;">Email:</td>
                <td style="padding: 8px 0; font-weight: bold;">
                  <a href="mailto:${email}">${email}</a>
                </td>
              </tr>
            </table>
          </div>

          ${contexto ? `
          <div style="background: #fef3c7; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #92400e;">Contexto de la derivación</h3>
            <p style="color: #78350f; line-height: 1.6;">${contexto}</p>
          </div>
          ` : ''}

          <div style="background: #f0fdf4; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #166534; font-size: 14px;">
              <strong>Fecha:</strong> ${new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })}
            </p>
          </div>

          <p style="color: #94a3b8; font-size: 12px; margin-top: 30px; text-align: center;">
            Este email fue generado automáticamente por Ego-Core.
            El paciente ha sido informado de contactarte directamente.
          </p>
        </div>
      `,
    });

    // Crear registro de derivación (inicia el contador de 2 días)
    const reason = contexto
      ? `Derivación con datos: ${nombre} ${apellido}. Contexto: ${contexto}`
      : `Derivación con datos: ${nombre} ${apellido}`;

    await createReferral(supabase, clientIP, reason);

    return Response.json({ success: true });
  } catch (error) {
    console.error('Send referral error:', error);
    return Response.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
