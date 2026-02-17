import { createAdminClient } from '@/lib/supabase/admin';
import { overdueEmailHtml } from '@/lib/billing/email-templates';
import nodemailer from 'nodemailer';

function verifyCronSecret(req: Request): boolean {
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return false;
  return authHeader === `Bearer ${cronSecret}`;
}

export async function GET(req: Request) {
  if (!verifyCronSecret(req)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();
  const now = new Date();
  const results: string[] = [];

  try {
    // Find invoices that are sent but past due date
    const { data: overdueInvoices } = await supabase
      .from('invoices')
      .select('*')
      .eq('status', 'sent')
      .lt('due_date', now.toISOString());

    if (!overdueInvoices || overdueInvoices.length === 0) {
      return Response.json({ success: true, processed: 0 });
    }

    for (const invoice of overdueInvoices) {
      // Mark as overdue
      await supabase
        .from('invoices')
        .update({ status: 'overdue', updated_at: now.toISOString() })
        .eq('id', invoice.id);

      // Check if billing block already exists
      const { data: existingBlock } = await supabase
        .from('billing_blocks')
        .select('id')
        .eq('invoice_id', invoice.id)
        .is('unblocked_at', null)
        .limit(1)
        .single();

      if (!existingBlock) {
        // Create billing block
        await supabase.from('billing_blocks').insert({
          user_id: invoice.user_id,
          invoice_id: invoice.id,
          blocked_at: now.toISOString(),
        });
      }

      // Send overdue email
      const { data: userData } = await supabase.auth.admin.getUserById(invoice.user_id);

      if (userData?.user?.email) {
        try {
          const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://psico-app-chi.vercel.app';
          const payUrl = `${appUrl}/es/payment-required?invoice_id=${invoice.id}`;

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
            subject: `Factura vencida - Acción requerida - ${invoice.invoice_number}`,
            html: overdueEmailHtml({
              userName: userData.user.user_metadata?.full_name || 'Usuario',
              invoiceNumber: invoice.invoice_number,
              amountUsd: invoice.amount_usd,
              dueDate: invoice.due_date,
              payUrl,
            }),
          });

          results.push(`Overdue notice sent for ${invoice.invoice_number}`);
        } catch (emailErr) {
          console.error(`Error sending overdue email for ${invoice.invoice_number}:`, emailErr);
          results.push(`Block created for ${invoice.invoice_number} but email failed`);
        }
      }
    }

    return Response.json({
      success: true,
      processed: results.length,
      details: results,
    });
  } catch (error) {
    console.error('Check overdue cron error:', error);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}
