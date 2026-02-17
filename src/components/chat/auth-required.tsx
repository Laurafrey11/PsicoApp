'use client';

import { useTranslations } from 'next-intl';
import { LogIn, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui';
import Link from 'next/link';

export function AuthRequired() {
  const t = useTranslations('billing.chatAuthRequired');

  return (
    <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
      <div className="max-w-md w-full animate-fade-in text-center px-4">
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 rounded-full bg-cyan-500/10 flex items-center justify-center">
            <LogIn className="w-12 h-12 text-cyan-500" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-zinc-100 mb-3">
          {t('title')}
        </h1>
        <p className="text-zinc-400 mb-2">
          {t('message')}
        </p>
        <p className="text-zinc-500 text-sm mb-8">
          {t('explanation')}
        </p>

        <div className="flex flex-col gap-3">
          <Link href="/signin">
            <Button variant="primary" size="lg" className="w-full">
              <LogIn className="w-5 h-5" />
              {t('signIn')}
            </Button>
          </Link>
          <Link href="/signup">
            <Button variant="secondary" size="lg" className="w-full">
              <UserPlus className="w-5 h-5" />
              {t('signUp')}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
