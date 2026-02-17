import { createAdminClient } from '@/lib/supabase/admin';
import { receiptEmailHtml } from '@/lib/billing/email-templates';
import nodemailer from 'nodemailer';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'egocore-admin-2026';

export async function POST(req: Request) {
  try {
    const { password, invoiceId } = await req.json();

    if (password !== ADMIN_PASSWORD) {
      return Response.json({ error: 'Contraseña incorrecta' }, { status: 401 });
    }

    if (!invoiceId) {
      return Response.json({ error: 'invoice_id requerido' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const now = new Date().toISOString();

    // Get invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .single();

    if (invoiceError || !invoice) {
      return Response.json({ error: 'Factura no encontrada' }, { status: 404 });
    }

    if (invoice.status === 'paid') {
      return Response.json({ error: 'Esta factura ya está pagada' }, { status: 400 });
    }

    // Mark as paid
    await supabase
      .from('invoices')
      .update({ status: 'paid', paid_at: now, updated_at: now })
      .eq('id', invoiceId);

    // Remove billing block
    await supabase
      .from('billing_blocks')
      .update({ unblocked_at: now })
      .eq('invoice_id', invoiceId)
      .is('unblocked_at', null);

    // Send receipt email
    const { data: userData } = await supabase.auth.admin.getUserById(invoice.user_id);

    if (userData?.user?.email) {
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD,
          },
        });

        await transporter.sendMail({
          from: `Ego-Core <${process.env.GMAIL_USER}>`,
          to: userData.user.email,
          subject: `Recibo de pago - ${invoice.invoice_number}`,
          html: receiptEmailHtml({
            userName: userData.user.user_metadata?.full_name || 'Usuario',
            invoiceNumber: invoice.invoice_number,
            amountUsd: invoice.amount_usd,
            paidAt: now,
          }),
        });
      } catch (emailErr) {
        console.error('Error sending receipt email:', emailErr);
      }
    }

    return Response.json({
      success: true,
      invoice: invoice.invoice_number,
      user: userData?.user?.email,
    });
  } catch (error) {
    console.error('Mark paid error:', error);
    return Response.json({ error: 'Error interno' }, { status: 500 });
  }
}
