'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, LogIn } from 'lucide-react';
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui';
import { signIn } from '@/lib/actions/auth';

export function SignInForm() {
  const t = useTranslations();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await signIn(formData);

    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    }
    // Si no hay error, signIn hace redirect automáticamente
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{t('auth.welcomeBack')}</CardTitle>
        <CardDescription>{t('auth.signIn')}</CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent>
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <Input
              id="email"
              name="email"
              type="email"
              placeholder={t('auth.email')}
              className="pl-12"
              required
              autoComplete="email"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <Input
              id="password"
              name="password"
              type="password"
              placeholder={t('auth.password')}
              className="pl-12"
              required
              autoComplete="current-password"
            />
          </div>

          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-sm text-cyan-500 hover:text-cyan-400 transition-colors"
            >
              {t('auth.forgotPassword')}
            </Link>
          </div>

          <Button type="submit" className="w-full" isLoading={isLoading}>
            <LogIn className="w-5 h-5" />
            {t('auth.signIn')}
          </Button>
        </CardContent>
      </form>

      <CardFooter>
        <p className="text-center text-zinc-400 w-full">
          {t('auth.noAccount')}{' '}
          <Link
            href="/signup"
            className="text-cyan-500 hover:text-cyan-400 font-medium transition-colors"
          >
            {t('auth.signUp')}
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
