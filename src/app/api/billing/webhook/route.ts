import { createAdminClient } from '@/lib/supabase/admin';
import { getPaymentClient } from '@/lib/mercadopago/client';
import { receiptEmailHtml } from '@/lib/billing/email-templates';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // MercadoPago sends different notification types
    // We only care about payment notifications
    if (body.type !== 'payment' && body.action !== 'payment.created' && body.action !== 'payment.updated') {
      return Response.json({ received: true });
    }

    const paymentId = body.data?.id;
    if (!paymentId) {
      return Response.json({ received: true });
    }

    // Get payment details from MercadoPago
    const paymentClient = getPaymentClient();
    const payment = await paymentClient.get({ id: paymentId });

    if (!payment || payment.status !== 'approved') {
      return Response.json({ received: true });
    }

    const invoiceId = payment.external_reference;
    if (!invoiceId) {
      console.error('Payment without external_reference:', paymentId);
      return Response.json({ received: true });
    }

    const supabase = createAdminClient();
    const now = new Date().toISOString();

    // Check if invoice exists and isn't already paid
    const { data: invoice } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .single();

    if (!invoice || invoice.status === 'paid') {
      return Response.json({ received: true });
    }

    // Mark invoice as paid
    await supabase
      .from('invoices')
      .update({
        status: 'paid',
        paid_at: now,
        stripe_payment_intent_id: String(paymentId), // reusing column for MP payment ID
        updated_at: now,
      })
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

    return Response.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return Response.json({ received: true }, { status: 200 });
  }
}
