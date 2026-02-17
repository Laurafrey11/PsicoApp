'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { CreditCard, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Button } from '@/components/ui';

interface SubscriptionCardProps {
  isSubscribed: boolean;
  isPending: boolean;
}

export function SubscriptionCard({ isSubscribed, isPending }: SubscriptionCardProps) {
  const t = useTranslations('billing.subscription');
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  async function handleSubscribe() {
    setLoading(true);
    try {
      const response = await fetch('/api/billing/subscribe', {
        method: 'POST',
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      console.error('Error subscribing');
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel() {
    if (!confirm(t('confirmCancel'))) return;

    setCancelLoading(true);
    try {
      const response = await fetch('/api/billing/cancel-subscription', {
        method: 'POST',
      });
      if (response.ok) {
        router.refresh();
      }
    } catch {
      console.error('Error cancelling subscription');
    } finally {
      setCancelLoading(false);
    }
  }

  return (
    <div className="rounded-2xl bg-zinc-900/50 border border-zinc-800 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-zinc-200 flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          {t('title')}
        </h2>
        {isSubscribed && (
          <span className="text-xs px-2 py-1 rounded-full bg-green-400/10 text-green-400 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            {t('active')}
          </span>
        )}
        {isPending && (
          <span className="text-xs px-2 py-1 rounded-full bg-cyan-400/10 text-cyan-400 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {t('pending')}
          </span>
        )}
      </div>

      <p className="text-zinc-400 text-sm mb-4">
        {isSubscribed ? t('activeDescription') : t('description')}
      </p>

      {isSubscribed ? (
        <Button
          variant="danger"
          size="sm"
          isLoading={cancelLoading}
          onClick={handleCancel}
        >
          <XCircle className="w-4 h-4" />
          {t('cancel')}
        </Button>
      ) : isPending ? (
        <p className="text-cyan-400 text-sm">{t('pendingMessage')}</p>
      ) : (
        <Button
          variant="primary"
          isLoading={loading}
          onClick={handleSubscribe}
        >
          <CreditCard className="w-4 h-4" />
          {t('subscribe')}
        </Button>
      )}
    </div>
  );
}
