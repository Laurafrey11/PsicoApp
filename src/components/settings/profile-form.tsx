'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { User, Stethoscope, Globe, Check } from 'lucide-react';
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { updateProfile, type ProfileFormData } from '@/lib/actions/profile';

interface ProfileFormProps {
  initialData: {
    full_name: string | null;
    therapist_name: string | null;
    locale: string;
    timezone: string;
    email: string | null;
  } | null;
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  const t = useTranslations();

  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [fullName, setFullName] = useState(initialData?.full_name || '');
  const [therapistName, setTherapistName] = useState(initialData?.therapist_name || '');
  const [locale, setLocale] = useState(initialData?.locale || 'es');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    const data: ProfileFormData = {
      fullName,
      therapistName,
      locale,
    };

    const result = await updateProfile(data);

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }

    setIsLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2">
          <Check className="w-4 h-4" />
          Perfil actualizado correctamente
        </div>
      )}

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-cyan-500" />
            {t('settings.profile')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-2">Email</label>
            <Input
              value={initialData?.email || ''}
              disabled
              className="bg-zinc-800 opacity-60"
            />
          </div>
          <Input
            label="Nombre completo"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Tu nombre"
          />
        </CardContent>
      </Card>

      {/* Therapist */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-teal-400" />
            {t('settings.therapistInfo')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            label="Nombre del terapeuta (opcional)"
            value={therapistName}
            onChange={(e) => setTherapistName(e.target.value)}
            placeholder="Dr./Dra. nombre"
          />
          <p className="text-xs text-zinc-500 mt-2">
            Esta información es privada y no se comparte.
          </p>
        </CardContent>
      </Card>

      {/* Language */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-indigo-400" />
            {t('settings.language')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setLocale('es')}
              className={`flex-1 p-4 rounded-xl border transition-all ${
                locale === 'es'
                  ? 'border-cyan-500 bg-cyan-500/10'
                  : 'border-zinc-700 hover:border-zinc-600'
              }`}
            >
              <span className="text-2xl mb-1">🇪🇸</span>
              <p className="text-sm text-zinc-300">Español</p>
            </button>
            <button
              type="button"
              onClick={() => setLocale('en')}
              className={`flex-1 p-4 rounded-xl border transition-all ${
                locale === 'en'
                  ? 'border-cyan-500 bg-cyan-500/10'
                  : 'border-zinc-700 hover:border-zinc-600'
              }`}
            >
              <span className="text-2xl mb-1">🇺🇸</span>
              <p className="text-sm text-zinc-300">English</p>
            </button>
          </div>
        </CardContent>
      </Card>

      <Button type="submit" className="w-full" isLoading={isLoading}>
        {t('common.save')}
      </Button>
    </form>
  );
}
