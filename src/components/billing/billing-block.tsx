'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { CreditCard, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui';

interface BillingBlockProps {
  invoiceId: string;
  amountUsd: number;
  dueDate?: string | null;
}

export function BillingBlock({ invoiceId, amountUsd, dueDate }: BillingBlockProps) {
  const t = useTranslations('billing.blocked');
  const [loading, setLoading] = useState(false);

  const formattedDate = dueDate
    ? new Date(dueDate).toLocaleDateString('es-AR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  async function handlePay() {
    setLoading(true);
    try {
      const response = await fetch('/api/billing/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      console.error('Error creating payment preference');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/95 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="max-w-md w-full animate-fade-in my-8">
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 rounded-full bg-amber-500/20 flex items-center justify-center">
            <CreditCard className="w-12 h-12 text-amber-500" />
          </div>
        </div>

        <div className="text-center space-y-4 mb-8">
          <h1 className="text-2xl font-bold text-zinc-100">
            {t('title')}
          </h1>
          <p className="text-zinc-300 text-lg">
            {t('message')}
          </p>
          <p className="text-zinc-400">
            {t('explanation')}
          </p>
        </div>

        {/* Amount owed */}
        <div className="rounded-2xl bg-zinc-900/50 border border-amber-500/30 p-6 mb-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <span className="text-zinc-400">{t('amountOwed')}</span>
          </div>
          <p className="text-3xl font-bold gradient-text">
            USD ${amountUsd.toFixed(2)}
          </p>
          {formattedDate && (
            <p className="text-zinc-500 text-sm mt-2">
              {t('dueLabel')} {formattedDate}
            </p>
          )}
        </div>

        <Button
          onClick={handlePay}
          isLoading={loading}
          size="lg"
          className="w-full text-lg py-6"
        >
          <CreditCard className="w-6 h-6" />
          {t('payButton')}
        </Button>

        <p className="text-zinc-500 text-xs text-center mt-4">
          {t('payNote')}
        </p>
      </div>
    </div>
  );
}
