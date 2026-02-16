import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Crea un cliente Supabase admin usando la service role key.
 * Bypasea Row Level Security - usar solo en código server-side.
 * Necesario para operaciones sin usuario autenticado (app pública).
 */
export function createAdminClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase environment variables for admin client');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
