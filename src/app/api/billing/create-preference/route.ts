import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getPreferenceClient } from '@/lib/mercadopago/client';

export async function POST(req: Request) {
  try {
    const { invoiceId } = await req.json();

    if (!invoiceId) {
      return Response.json({ error: 'invoice_id requerido' }, { status: 400 });
    }

    // Verify authenticated user
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: 'No autenticado' }, { status: 401 });
    }

    // Fetch invoice and verify ownership
    const adminSupabase = createAdminClient();
    const { data: invoice, error: invoiceError } = await adminSupabase
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .eq('user_id', user.id)
      .single();

    if (invoiceError || !invoice) {
      return Response.json({ error: 'Factura no encontrada' }, { status: 404 });
    }

    if (invoice.status === 'paid') {
      return Response.json({ error: 'Esta factura ya fue pagada' }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://psico-app-chi.vercel.app';

    const preference = getPreferenceClient();
    const result = await preference.create({
      body: {
        items: [
          {
            id: invoiceId,
            title: `Ego-Core - Factura ${invoice.invoice_number}`,
            description: `Consumo de ${invoice.total_tokens.toLocaleString()} tokens IA`,
            quantity: 1,
            unit_price: invoice.amount_usd,
            currency_id: 'USD',
          },
        ],
        back_urls: {
          success: `${appUrl}/es/dashboard?payment=success`,
          failure: `${appUrl}/es/payment-required?invoice_id=${invoiceId}`,
          pending: `${appUrl}/es/payment-required?invoice_id=${invoiceId}&status=pending`,
        },
        auto_return: 'approved',
        external_reference: invoiceId,
        notification_url: `${appUrl}/api/billing/webhook`,
        payer: {
          email: user.email || undefined,
        },
      },
    });

    return Response.json({ url: result.init_point });
  } catch (error) {
    console.error('Create preference error:', error);
    return Response.json({ error: 'Error al crear preferencia de pago' }, { status: 500 });
  }
}
