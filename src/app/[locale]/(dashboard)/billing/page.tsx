import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { BillingHistory } from './billing-history';

export default async function BillingPage() {
  const t = await getTranslations('billing');

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/signin');
  }

  const adminSupabase = createAdminClient();

  const { data: invoices } = await adminSupabase
    .from('invoices')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  // Get current month token usage
  const { data: currentUsage } = await adminSupabase
    .from('chat_messages')
    .select('tokens_used')
    .eq('user_id', user.id)
    .not('tokens_used', 'is', null)
    .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());

  const currentTokens = currentUsage?.reduce((sum, row) => sum + (row.tokens_used || 0), 0) ?? 0;
  const estimatedCost = Math.round((currentTokens / 1_000_000) * 70 * 100) / 100;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <h1 className="text-3xl font-bold gradient-text">{t('title')}</h1>

      {/* Current usage card */}
      <div className="rounded-2xl bg-zinc-900/50 border border-zinc-800 p-6">
        <h2 className="text-lg font-semibold text-zinc-200 mb-4">{t('currentUsage')}</h2>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-zinc-500 text-sm">{t('tokensThisMonth')}</p>
            <p className="text-2xl font-bold text-zinc-100">{currentTokens.toLocaleString('es-AR')}</p>
          </div>
          <div>
            <p className="text-zinc-500 text-sm">{t('estimatedCost')}</p>
            <p className="text-2xl font-bold gradient-text">USD ${estimatedCost.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Invoice history */}
      <BillingHistory invoices={invoices || []} />
    </div>
  );
}
