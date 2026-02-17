-- ============================================================================
-- Ego-Core: Billing System Schema
-- Execute in Supabase SQL Editor
-- ============================================================================

-- Monthly token usage aggregation per user
CREATE TABLE public.token_usage_monthly (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    total_tokens INTEGER NOT NULL DEFAULT 0,
    total_cost_usd DECIMAL(10, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, period_start)
);

CREATE INDEX idx_token_usage_user_period ON public.token_usage_monthly(user_id, period_start DESC);

-- Invoices
CREATE TABLE public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    invoice_number TEXT NOT NULL UNIQUE,
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    total_tokens INTEGER NOT NULL,
    amount_usd DECIMAL(10, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'paid', 'overdue')),
    due_date TIMESTAMPTZ NOT NULL,
    stripe_session_id TEXT,
    stripe_payment_intent_id TEXT,
    sent_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invoices_user_id ON public.invoices(user_id);
CREATE INDEX idx_invoices_status ON public.invoices(status);
CREATE INDEX idx_invoices_due_date ON public.invoices(due_date);
CREATE INDEX idx_invoices_stripe_session ON public.invoices(stripe_session_id);

-- Billing blocks (when user exceeds grace period without paying)
CREATE TABLE public.billing_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    blocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    unblocked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_billing_blocks_user_id ON public.billing_blocks(user_id);
CREATE INDEX idx_billing_blocks_active ON public.billing_blocks(user_id) WHERE unblocked_at IS NULL;

-- RLS policies
ALTER TABLE public.token_usage_monthly ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own token usage"
    ON public.token_usage_monthly FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view own invoices"
    ON public.invoices FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view own billing blocks"
    ON public.billing_blocks FOR SELECT
    USING (auth.uid() = user_id);
