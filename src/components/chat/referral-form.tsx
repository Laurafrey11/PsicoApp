'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Send, Heart, Loader2, CalendarPlus } from 'lucide-react';
import { Button, Input } from '@/components/ui';

interface ReferralFormProps {
  contexto: string;
  onComplete: () => void;
}

export function ReferralForm({ contexto, onComplete }: ReferralFormProps) {
  const t = useTranslations('referralForm');
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    email: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function handleChange(field: string, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/send-referral', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          contexto,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al enviar');
      }

      setSuccess(true);
      setTimeout(() => {
        onComplete();
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar los datos');
    } finally {
      setIsSubmitting(false);
    }
  }

  const isValid =
    formData.nombre.trim() &&
    formData.apellido.trim() &&
    formData.telefono.trim() &&
    formData.email.trim();

  if (success) {
    return (
      <div className="fixed inset-0 z-50 bg-zinc-950/95 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="max-w-md w-full animate-fade-in text-center">
          <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
            <Heart className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-100 mb-4">
            {t('successTitle')}
          </h2>
          <p className="text-zinc-400 mb-6">
            {t('successMessage')}
          </p>
          {process.env.NEXT_PUBLIC_CALENDLY_URL && (
            <a
              href={process.env.NEXT_PUBLIC_CALENDLY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-teal-400 text-zinc-900 font-semibold px-6 py-3 rounded-xl transition-opacity hover:opacity-90"
            >
              <CalendarPlus className="w-5 h-5" />
              {t('scheduleAppointment')}
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/95 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="max-w-md w-full animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-cyan-500/20 flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-cyan-500" />
          </div>
          <h2 className="text-xl font-bold text-zinc-100 mb-2">
            {t('title')}
          </h2>
          <p className="text-zinc-400 text-sm">
            {t('description')}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">
                {t('nombre')}
              </label>
              <Input
                type="text"
                value={formData.nombre}
                onChange={(e) => handleChange('nombre', e.target.value)}
                placeholder={t('nombrePlaceholder')}
                required
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">
                {t('apellido')}
              </label>
              <Input
                type="text"
                value={formData.apellido}
                onChange={(e) => handleChange('apellido', e.target.value)}
                placeholder={t('apellidoPlaceholder')}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-1">
              {t('telefono')}
            </label>
            <Input
              type="tel"
              value={formData.telefono}
              onChange={(e) => handleChange('telefono', e.target.value)}
              placeholder={t('telefonoPlaceholder')}
              required
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-1">
              {t('email')}
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder={t('emailPlaceholder')}
              required
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            disabled={!isValid || isSubmitting}
            className="w-full bg-gradient-to-r from-cyan-500 to-teal-400 text-zinc-900 py-5"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
            {isSubmitting ? t('sending') : t('submit')}
          </Button>

          <p className="text-xs text-zinc-500 text-center">
            {t('privacy')}
          </p>
        </form>
      </div>
    </div>
  );
}
