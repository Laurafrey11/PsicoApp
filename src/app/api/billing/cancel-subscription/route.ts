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

    // Find active subscription
    const { data: subscription } = await adminSupabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .in('status', ['pending', 'authorized'])
      .limit(1)
      .maybeSingle();

    if (!subscription) {
      return Response.json({ error: 'No tenés una suscripción activa' }, { status: 404 });
    }

    // Cancel in MercadoPago
    const preApproval = getPreApprovalClient();
    await preApproval.update({
      id: subscription.mp_preapproval_id,
      body: { status: 'cancelled' },
    });

    // Update local record
    await adminSupabase
      .from('subscriptions')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', subscription.id);

    return Response.json({ success: true });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    return Response.json({ error: 'Error al cancelar suscripción' }, { status: 500 });
  }
}
