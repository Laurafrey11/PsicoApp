'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { CreditCard, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui';

interface Invoice {
  id: string;
  invoice_number: string;
  period_start: string;
  period_end: string;
  total_tokens: number;
  amount_usd: number;
  status: string;
  due_date: string;
  paid_at: string | null;
}

interface BillingHistoryProps {
  invoices: Invoice[];
}

const statusColors: Record<string, string> = {
  paid: 'text-green-400 bg-green-400/10',
  sent: 'text-cyan-400 bg-cyan-400/10',
  pending: 'text-zinc-400 bg-zinc-400/10',
  overdue: 'text-red-400 bg-red-400/10',
};

export function BillingHistory({ invoices }: BillingHistoryProps) {
  const t = useTranslations('billing');
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handlePay(invoiceId: string) {
    setLoadingId(invoiceId);
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
      console.error('Error creating payment');
    } finally {
      setLoadingId(null);
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  if (invoices.length === 0) {
    return (
      <div className="rounded-2xl bg-zinc-900/50 border border-zinc-800 p-8 text-center">
        <CreditCard className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
        <p className="text-zinc-500">{t('noInvoices')}</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-zinc-900/50 border border-zinc-800 overflow-hidden">
      <div className="p-4 border-b border-zinc-800">
        <h2 className="text-lg font-semibold text-zinc-200">{t('history')}</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-500 text-sm">
              <th className="text-left p-4">{t('invoiceNumber')}</th>
              <th className="text-left p-4">{t('period')}</th>
              <th className="text-right p-4">{t('tokens')}</th>
              <th className="text-right p-4">{t('amount')}</th>
              <th className="text-center p-4">{t('status')}</th>
              <th className="text-right p-4"></th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20">
                <td className="p-4 text-zinc-200 font-mono text-sm">{invoice.invoice_number}</td>
                <td className="p-4 text-zinc-400 text-sm">
                  {formatDate(invoice.period_start)} - {formatDate(invoice.period_end)}
                </td>
                <td className="p-4 text-right text-zinc-300">
                  {invoice.total_tokens.toLocaleString('es-AR')}
                </td>
                <td className="p-4 text-right text-zinc-200 font-semibold">
                  ${invoice.amount_usd.toFixed(2)}
                </td>
                <td className="p-4 text-center">
                  <span className={`text-xs px-2 py-1 rounded-full inline-flex items-center gap-1 ${statusColors[invoice.status] || ''}`}>
                    {invoice.status === 'paid' && <CheckCircle className="w-3 h-3" />}
                    {invoice.status === 'overdue' && <Clock className="w-3 h-3" />}
                    {t(invoice.status)}
                  </span>
                </td>
                <td className="p-4 text-right">
                  {(invoice.status === 'sent' || invoice.status === 'overdue') && (
                    <Button
                      variant="primary"
                      size="sm"
                      isLoading={loadingId === invoice.id}
                      onClick={() => handlePay(invoice.id)}
                    >
                      {t('payNow')}
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
