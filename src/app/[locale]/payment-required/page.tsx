import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { redirect } from 'next/navigation';
import { BillingBlock } from '@/components/billing/billing-block';

interface PaymentRequiredPageProps {
  searchParams: Promise<{ invoice_id?: string }>;
}

export default async function PaymentRequiredPage({ searchParams }: PaymentRequiredPageProps) {
  const { invoice_id } = await searchParams;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/signin');
  }

  const adminSupabase = createAdminClient();

  // If specific invoice requested, use that
  // Otherwise find the latest overdue invoice for this user
  let invoice;

  if (invoice_id) {
    const { data } = await adminSupabase
      .from('invoices')
      .select('*')
      .eq('id', invoice_id)
      .eq('user_id', user.id)
      .single();
    invoice = data;
  } else {
    const { data } = await adminSupabase
      .from('invoices')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'overdue')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    invoice = data;
  }

  if (!invoice || invoice.status === 'paid') {
    redirect('/dashboard');
  }

  return (
    <BillingBlock
      invoiceId={invoice.id}
      amountUsd={invoice.amount_usd}
      dueDate={invoice.due_date}
    />
  );
}
