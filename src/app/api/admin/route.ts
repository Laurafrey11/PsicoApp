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

    // Obtener facturas
    const { data: invoices } = await supabase
      .from('invoices')
      .select('*')
      .order('created_at', { ascending: false });

    // Obtener métricas de tokens (últimos 30 días)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: recentTokens } = await supabase
      .from('chat_messages')
      .select('user_id, tokens_used, created_at')
      .not('tokens_used', 'is', null)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false });

    // Aggregate token usage per user
    const tokensByUser: Record<string, { total: number; count: number }> = {};
    let totalTokens30d = 0;
    let totalMessages30d = 0;

    for (const row of recentTokens || []) {
      const userId = row.user_id;
      if (!tokensByUser[userId]) {
        tokensByUser[userId] = { total: 0, count: 0 };
      }
      tokensByUser[userId].total += row.tokens_used || 0;
      tokensByUser[userId].count += 1;
      totalTokens30d += row.tokens_used || 0;
      totalMessages30d += 1;
    }

    // Get user emails for the token metrics
    const userIds = Object.keys(tokensByUser);
    const usersMap: Record<string, string> = {};
    for (const uid of userIds.slice(0, 50)) {
      const { data: u } = await supabase.auth.admin.getUserById(uid);
      if (u?.user?.email) usersMap[uid] = u.user.email;
    }

    const tokenMetrics = userIds.map((uid) => ({
      userId: uid,
      email: usersMap[uid] || uid.substring(0, 8),
      totalTokens: tokensByUser[uid].total,
      messageCount: tokensByUser[uid].count,
      estimatedCost: Math.round((tokensByUser[uid].total / 1_000_000) * 70 * 100) / 100,
    })).sort((a, b) => b.totalTokens - a.totalTokens);

    // Stats
    const now = new Date();
    const totalReferrals = referrals?.length ?? 0;
    const activeBlocks = referrals?.filter((r: { blocked_until: string | null }) =>
      r.blocked_until && new Date(r.blocked_until) > now
    ).length ?? 0;
    const pendingReferrals = referrals?.filter((r: { blocked_until: string | null; referred_at: string }) =>
      !r.blocked_until && r.referred_at
    ).length ?? 0;

    const unpaidInvoices = invoices?.filter((i: { status: string }) =>
      i.status === 'sent' || i.status === 'overdue'
    ).length ?? 0;

    return Response.json({
      referrals: referrals ?? [],
      invoices: invoices ?? [],
      tokenMetrics,
      stats: {
        totalReferrals,
        activeBlocks,
        pendingReferrals,
        unpaidInvoices,
        totalTokens30d,
        totalMessages30d,
        totalCost30d: Math.round((totalTokens30d / 1_000_000) * 70 * 100) / 100,
        activeUsers: userIds.length,
      },
    });
  } catch (error) {
    console.error('Admin API error:', error);
    return Response.json({ error: 'Error interno' }, { status: 500 });
  }
}
