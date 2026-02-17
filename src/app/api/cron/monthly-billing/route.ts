import { createAdminClient } from '@/lib/supabase/admin';
import { calculateCost, generateInvoiceNumber, getBillingPeriod, isBillingAnniversary } from '@/lib/billing/calculations';
import { invoiceEmailHtml } from '@/lib/billing/email-templates';
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
  const today = new Date();
  const results: string[] = [];

  try {
    // Get all users
    const { data: usersResponse } = await supabase.auth.admin.listUsers({ perPage: 1000 });
    const users = usersResponse?.users || [];

    for (const user of users) {
      const createdAt = new Date(user.created_at);

      // Check if today is billing anniversary for this user
      if (!isBillingAnniversary(createdAt, today)) {
        continue;
      }

      const { start, end } = getBillingPeriod(createdAt, today);

      // Check if invoice already exists for this period
      const { data: existingInvoice } = await supabase
        .from('invoices')
        .select('id')
        .eq('user_id', user.id)
        .eq('period_start', start.toISOString())
        .limit(1)
        .single();

      if (existingInvoice) {
        continue; // Already billed
      }

      // Aggregate tokens from chat_messages for this period
      const { data: tokenData } = await supabase
        .from('chat_messages')
        .select('tokens_used')
        .eq('user_id', user.id)
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString())
        .not('tokens_used', 'is', null);

      const totalTokens = tokenData?.reduce((sum, row) => sum + (row.tokens_used || 0), 0) ?? 0;

      if (totalTokens === 0) {
        continue; // No usage, no invoice
      }

      const amountUsd = calculateCost(totalTokens);
      const invoiceNumber = generateInvoiceNumber(user.id, today);
      const dueDate = new Date(today);
      dueDate.setDate(dueDate.getDate() + 4);

      // Create token_usage_monthly record
      await supabase.from('token_usage_monthly').upsert({
        user_id: user.id,
        period_start: start.toISOString(),
        period_end: end.toISOString(),
        total_tokens: totalTokens,
        total_cost_usd: amountUsd,
      });

      // Create invoice
      const { data: invoice } = await supabase
        .from('invoices')
        .insert({
          user_id: user.id,
          invoice_number: invoiceNumber,
          period_start: start.toISOString(),
          period_end: end.toISOString(),
          total_tokens: totalTokens,
          amount_usd: amountUsd,
          status: 'sent',
          due_date: dueDate.toISOString(),
          sent_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      // Send invoice email
      if (user.email && invoice) {
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
            to: user.email,
            subject: `Factura mensual Ego-Core - ${invoiceNumber}`,
            html: invoiceEmailHtml({
              userName: user.user_metadata?.full_name || 'Usuario',
              invoiceNumber,
              periodStart: start.toISOString(),
              periodEnd: end.toISOString(),
              totalTokens,
              amountUsd,
              dueDate: dueDate.toISOString(),
              payUrl,
            }),
          });

          results.push(`Invoice ${invoiceNumber} sent to ${user.email}`);
        } catch (emailErr) {
          console.error(`Error sending invoice email to ${user.email}:`, emailErr);
          results.push(`Invoice ${invoiceNumber} created but email failed`);
        }
      }
    }

    return Response.json({
      success: true,
      processed: results.length,
      details: results,
    });
  } catch (error) {
    console.error('Monthly billing cron error:', error);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}
