import { createAdminClient } from '@/lib/supabase/admin';

interface BillingStatus {
  blocked: boolean;
  invoiceId?: string;
  amountUsd?: number;
  dueDate?: string;
}

export async function checkBillingStatus(userId: string): Promise<BillingStatus> {
  const supabase = createAdminClient();

  const { data: block } = await supabase
    .from('billing_blocks')
    .select('invoice_id')
    .eq('user_id', userId)
    .is('unblocked_at', null)
    .limit(1)
    .single();

  if (!block) {
    return { blocked: false };
  }

  const { data: invoice } = await supabase
    .from('invoices')
    .select('id, amount_usd, due_date')
    .eq('id', block.invoice_id)
    .single();

  return {
    blocked: true,
    invoiceId: invoice?.id,
    amountUsd: invoice?.amount_usd,
    dueDate: invoice?.due_date,
  };
}
