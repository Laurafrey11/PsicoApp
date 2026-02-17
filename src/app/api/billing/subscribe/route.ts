import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getPreApprovalClient } from '@/lib/mercadopago/client';

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: 'No autenticado' }, { status: 401 });
    }

    const adminSupabase = createAdminClient();

    // Check if user already has an active subscription
    const { data: existing } = await adminSupabase
      .from('subscriptions')
      .select('id, status')
      .eq('user_id', user.id)
      .in('status', ['pending', 'authorized'])
      .limit(1)
      .maybeSingle();

    if (existing) {
      return Response.json({ error: 'Ya tenés una suscripción activa' }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://psico-app-chi.vercel.app';

    const preApproval = getPreApprovalClient();
    const result = await preApproval.create({
      body: {
        reason: 'Ego-Core - Débito automático mensual por uso de IA',
        external_reference: user.id,
        payer_email: user.email || '',
        auto_recurring: {
          frequency: 1,
          frequency_type: 'months',
          transaction_amount: 50, // Max amount per charge (USD)
          currency_id: 'ARS',
        },
        back_url: `${appUrl}/es/dashboard/billing?subscription=success`,
        status: 'pending',
      },
    });

    if (!result.id) {
      return Response.json({ error: 'Error al crear suscripción' }, { status: 500 });
    }

    // Save subscription record
    await adminSupabase.from('subscriptions').insert({
      user_id: user.id,
      mp_preapproval_id: String(result.id),
      status: 'pending',
    });

    return Response.json({ url: result.init_point });
  } catch (error) {
    console.error('Subscribe error:', error);
    return Response.json({ error: 'Error al crear suscripción' }, { status: 500 });
  }
}
