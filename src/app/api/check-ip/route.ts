import { createAdminClient } from '@/lib/supabase/admin';
import { getClientIP, checkIPStatus } from '@/lib/utils/ip-manager';

export async function GET(req: Request) {
  try {
    const supabase = createAdminClient();
    const clientIP = getClientIP(req);
    const status = await checkIPStatus(supabase, clientIP);

    return Response.json({
      blocked: status.blocked,
      referred: status.referred,
      blockedUntil: status.blockedUntil?.toISOString() ?? null,
    });
  } catch (error) {
    console.error('Check IP error:', error);
    return Response.json({ blocked: false, referred: false, blockedUntil: null });
  }
}
