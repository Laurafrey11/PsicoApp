import { createAdminClient } from '@/lib/supabase/admin';
import { getPaymentClient, getPreApprovalClient } from '@/lib/mercadopago/client';
import { receiptEmailHtml } from '@/lib/billing/email-templates';
import nodemailer from 'nodemailer';

async function handlePaymentNotification(paymentId: number) {
  const paymentClient = getPaymentClient();
  const payment = await paymentClient.get({ id: paymentId });

  if (!payment || payment.status !== 'approved') {
    return;
  }

  const invoiceId = payment.external_reference;
  if (!invoiceId) {
    console.error('Payment without external_reference:', paymentId);
    return;
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
    return;
  }

  // Mark invoice as paid
  await supabase
    .from('invoices')
    .update({
      status: 'paid',
      paid_at: now,
      stripe_payment_intent_id: String(paymentId),
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
}

async function handleSubscriptionNotification(preapprovalId: string) {
  const preApprovalClient = getPreApprovalClient();
  const preapproval = await preApprovalClient.get({ id: preapprovalId });

  if (!preapproval) return;

  const supabase = createAdminClient();
  const now = new Date().toISOString();

  // Map MercadoPago status to our status
  const statusMap: Record<string, string> = {
    authorized: 'authorized',
    pending: 'pending',
    paused: 'paused',
    cancelled: 'cancelled',
  };

  const newStatus = statusMap[preapproval.status || ''] || 'pending';

  await supabase
    .from('subscriptions')
    .update({
      status: newStatus,
      updated_at: now,
      ...(newStatus === 'cancelled' ? { cancelled_at: now } : {}),
    })
    .eq('mp_preapproval_id', preapprovalId);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Handle subscription (preapproval) notifications
    if (body.type === 'subscription_preapproval' || body.action?.startsWith('subscription_preapproval')) {
      const preapprovalId = body.data?.id;
      if (preapprovalId) {
        await handleSubscriptionNotification(String(preapprovalId));
      }
      return Response.json({ received: true });
    }

    // Handle payment notifications
    if (body.type === 'payment' || body.action === 'payment.created' || body.action === 'payment.updated') {
      const paymentId = body.data?.id;
      if (paymentId) {
        await handlePaymentNotification(paymentId);
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return Response.json({ received: true }, { status: 200 });
  }
}
