import type { SupabaseClient } from '@supabase/supabase-js';

const BLOCK_DURATION_DAYS = 90; // 3 meses
const REFERRAL_GRACE_PERIOD_DAYS = 2;

export interface IPStatus {
  blocked: boolean;
  referred: boolean;
  blockedUntil: Date | null;
  referralId: string | null;
}

interface IPReferralRow {
  id: string;
  ip_address: string;
  referred_at: string;
  blocked_at: string | null;
  blocked_until: string | null;
  attempts_after_referral: number;
  last_attempt_at: string | null;
  reason: string | null;
  created_at: string;
}

/**
 * Extrae la IP del cliente desde los headers del request.
 * En Vercel, x-forwarded-for es seteado por la plataforma.
 */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP.trim();
  }

  return '0.0.0.0';
}

/**
 * Verifica el estado actual de una IP.
 * Retorna si está bloqueada, derivada, y cuándo expira el bloqueo.
 */
export async function checkIPStatus(
  supabase: SupabaseClient,
  ip: string
): Promise<IPStatus> {
  const { data, error } = await supabase
    .from('ip_referrals')
    .select('*')
    .eq('ip_address', ip)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const referral = data as IPReferralRow | null;

  if (error || !referral) {
    return { blocked: false, referred: false, blockedUntil: null, referralId: null };
  }

  // Verificar si está actualmente bloqueada
  if (referral.blocked_until) {
    const blockedUntil = new Date(referral.blocked_until);
    if (blockedUntil > new Date()) {
      return {
        blocked: true,
        referred: true,
        blockedUntil,
        referralId: referral.id,
      };
    }
    // El bloqueo expiró - IP libre
    return { blocked: false, referred: false, blockedUntil: null, referralId: null };
  }

  // Derivada pero no bloqueada aún
  if (referral.referred_at) {
    return {
      blocked: false,
      referred: true,
      blockedUntil: null,
      referralId: referral.id,
    };
  }

  return { blocked: false, referred: false, blockedUntil: null, referralId: null };
}

/**
 * Verifica si pasó el período de gracia (2 días) desde la derivación.
 */
export function isGracePeriodExpired(referredAt: string): boolean {
  const referredDate = new Date(referredAt);
  const gracePeriodEnd = new Date(referredDate);
  gracePeriodEnd.setDate(gracePeriodEnd.getDate() + REFERRAL_GRACE_PERIOD_DAYS);
  return new Date() > gracePeriodEnd;
}

/**
 * Crea un registro de derivación para una IP.
 * Se llama cuando la IA incluye el marcador [DERIVAR_PROFESIONAL].
 */
export async function createReferral(
  supabase: SupabaseClient,
  ip: string,
  reason: string
): Promise<void> {
  // Verificar si ya existe una derivación activa para esta IP
  const { data } = await supabase
    .from('ip_referrals')
    .select('id, blocked_until')
    .eq('ip_address', ip)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const existing = data as { id: string; blocked_until: string | null } | null;

  if (existing) {
    if (!existing.blocked_until || new Date(existing.blocked_until) > new Date()) {
      return; // Ya tiene derivación o bloqueo activo
    }
  }

  await supabase.from('ip_referrals').insert({
    ip_address: ip,
    referred_at: new Date().toISOString(),
    reason,
    attempts_after_referral: 0,
    blocked_at: null,
    blocked_until: null,
    last_attempt_at: null,
  });
}

/**
 * Bloquea una IP por 3 meses.
 * Se llama cuando un usuario derivado sigue chateando después del período de gracia.
 */
export async function blockIP(
  supabase: SupabaseClient,
  referralId: string
): Promise<Date> {
  const now = new Date();
  const blockedUntil = new Date(now);
  blockedUntil.setDate(blockedUntil.getDate() + BLOCK_DURATION_DAYS);

  await supabase
    .from('ip_referrals')
    .update({
      blocked_at: now.toISOString(),
      blocked_until: blockedUntil.toISOString(),
    })
    .eq('id', referralId);

  return blockedUntil;
}

/**
 * Incrementa el contador de intentos post-derivación.
 */
export async function recordAttempt(
  supabase: SupabaseClient,
  referralId: string
): Promise<void> {
  const { data } = await supabase
    .from('ip_referrals')
    .select('attempts_after_referral')
    .eq('id', referralId)
    .single();

  const row = data as { attempts_after_referral: number } | null;
  const currentAttempts = row?.attempts_after_referral ?? 0;

  await supabase
    .from('ip_referrals')
    .update({
      attempts_after_referral: currentAttempts + 1,
      last_attempt_at: new Date().toISOString(),
    })
    .eq('id', referralId);
}
