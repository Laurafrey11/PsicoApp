'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Shield, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui';

interface ConsentScreenProps {
  onAccept: () => void;
}

export function ConsentScreen({ onAccept }: ConsentScreenProps) {
  const t = useTranslations('consent');
  const [accepted, setAccepted] = useState(false);

  function handleAccept() {
    localStorage.setItem('ego-core-consent', 'true');
    onAccept();
  }

  return (
    <div className="flex items-center justify-center h-[calc(100vh-8rem)] p-4">
      <div className="max-w-lg w-full animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-cyan-500/20 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-cyan-500" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-100 mb-2">
            {t('title')}
          </h2>
          <p className="text-zinc-400">
            {t('subtitle')}
          </p>
        </div>

        {/* Terms */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6 max-h-64 overflow-y-auto space-y-4 text-sm text-zinc-300">
          <p><strong className="text-zinc-100">{t('section1Title')}</strong></p>
          <p>{t('section1')}</p>

          <p><strong className="text-zinc-100">{t('section2Title')}</strong></p>
          <p>{t('section2')}</p>

          <p><strong className="text-zinc-100">{t('section3Title')}</strong></p>
          <p>{t('section3')}</p>

          <p><strong className="text-zinc-100">{t('section4Title')}</strong></p>
          <p>{t('section4')}</p>
        </div>

        {/* Checkbox */}
        <label className="flex items-start gap-3 mb-6 cursor-pointer group">
          <div
            className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
              accepted
                ? 'bg-cyan-500 border-cyan-500'
                : 'border-zinc-600 group-hover:border-zinc-400'
            }`}
            onClick={() => setAccepted(!accepted)}
          >
            {accepted && <CheckCircle2 className="w-4 h-4 text-zinc-900" />}
          </div>
          <span
            className="text-sm text-zinc-300"
            onClick={() => setAccepted(!accepted)}
          >
            {t('acceptTerms')}
          </span>
        </label>

        {/* Accept Button */}
        <Button
          onClick={handleAccept}
          disabled={!accepted}
          size="lg"
          className="w-full bg-gradient-to-r from-cyan-500 to-teal-400 text-zinc-900 py-5 disabled:opacity-40"
        >
          {t('continue')}
        </Button>
      </div>
    </div>
  );
}
