'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Mail, Lock, User, UserPlus, CheckCircle } from 'lucide-react';
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui';
import { signUp } from '@/lib/actions/auth';

export function SignUpForm() {
  const t = useTranslations();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    // Validar que las contraseñas coincidan
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      setIsLoading(false);
      return;
    }

    const result = await signUp(formData);

    if (result.error) {
      setError(result.error);
    } else if (result.success) {
      setSuccess(true);
    }

    setIsLoading(false);
  }

  if (success) {
    return (
      <Card className="w-full max-w-md mx-auto text-center">
        <CardContent className="py-12">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-semibold text-zinc-100 mb-2">
            Revisa tu email
          </h2>
          <p className="text-zinc-400 mb-6">
            Te enviamos un enlace de confirmación. Revisa tu bandeja de entrada.
          </p>
          <Link href="/signin">
            <Button variant="secondary">{t('auth.signIn')}</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{t('auth.createAccount')}</CardTitle>
        <CardDescription>{t('onboarding.step1Description')}</CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent>
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <Input
              id="fullName"
              name="fullName"
              type="text"
              placeholder="Nombre completo"
              className="pl-12"
              autoComplete="name"
            />
          </div>

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
              minLength={6}
              autoComplete="new-password"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder={t('auth.confirmPassword')}
              className="pl-12"
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>

          <p className="text-xs text-zinc-500">
            {t('auth.termsAgreement')}
          </p>

          <Button type="submit" className="w-full" isLoading={isLoading}>
            <UserPlus className="w-5 h-5" />
            {t('auth.signUp')}
          </Button>
        </CardContent>
      </form>

      <CardFooter>
        <p className="text-center text-zinc-400 w-full">
          {t('auth.hasAccount')}{' '}
          <Link
            href="/signin"
            className="text-cyan-500 hover:text-cyan-400 font-medium transition-colors"
          >
            {t('auth.signIn')}
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
