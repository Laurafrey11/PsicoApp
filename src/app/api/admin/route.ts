import { createAdminClient } from '@/lib/supabase/admin';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'egocore-admin-2026';

export async function POST(req: Request) {
  try {
    const { password } = await req.json();

    if (password !== ADMIN_PASSWORD) {
      return Response.json({ error: 'Contraseña incorrecta' }, { status: 401 });
    }

    const supabase = createAdminClient();

    // Obtener todas las derivaciones
    const { data: referrals } = await supabase
      .from('ip_referrals')
      .select('*')
      .order('created_at', { ascending: false });

    // Stats
    const now = new Date();
    const totalReferrals = referrals?.length ?? 0;
    const activeBlocks = referrals?.filter((r: { blocked_until: string | null }) =>
      r.blocked_until && new Date(r.blocked_until) > now
    ).length ?? 0;
    const pendingReferrals = referrals?.filter((r: { blocked_until: string | null; referred_at: string }) =>
      !r.blocked_until && r.referred_at
    ).length ?? 0;

    return Response.json({
      referrals: referrals ?? [],
      stats: {
        totalReferrals,
        activeBlocks,
        pendingReferrals,
      },
    });
  } catch (error) {
    console.error('Admin API error:', error);
    return Response.json({ error: 'Error interno' }, { status: 500 });
  }
}
