'use client';

import { useTranslations } from 'next-intl';
import { ShieldAlert, Mail, Clock, CalendarPlus } from 'lucide-react';
import { Button } from '@/components/ui';

interface ReferralBlockProps {
  blockedUntil: string | null;
}

export function ReferralBlock({ blockedUntil }: ReferralBlockProps) {
  const t = useTranslations('referral');

  const formattedDate = blockedUntil
    ? new Date(blockedUntil).toLocaleDateString('es-AR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  function handleEmail() {
    window.location.href = 'mailto:lalifreyre.lf@gmail.com';
  }

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/95 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="max-w-md w-full animate-fade-in">
        {/* Icono */}
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 rounded-full bg-amber-500/20 flex items-center justify-center">
            <ShieldAlert className="w-12 h-12 text-amber-500" />
          </div>
        </div>

        {/* Mensaje */}
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

        {/* Botón de email */}
        <Button
          onClick={handleEmail}
          size="lg"
          className="w-full bg-gradient-to-r from-cyan-500 to-teal-400 text-zinc-900 text-lg py-6 mb-4"
        >
          <Mail className="w-6 h-6" />
          {t('contactProfessional')}
        </Button>

        {/* Agendar turno */}
        {process.env.NEXT_PUBLIC_CALENDLY_URL && (
          <a
            href={process.env.NEXT_PUBLIC_CALENDLY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-semibold py-3 rounded-xl mb-4 transition-colors"
          >
            <CalendarPlus className="w-5 h-5" />
            {t('scheduleAppointment')}
          </a>
        )}

        {/* Email de la profesional */}
        <p className="text-center text-zinc-400 mb-4">
          {t('email')}: <span className="text-zinc-200 font-mono">lalifreyre.lf@gmail.com</span>
        </p>

        {/* Fecha de expiración del bloqueo */}
        {formattedDate && (
          <div className="flex items-center justify-center gap-2 text-zinc-500 text-sm">
            <Clock className="w-4 h-4" />
            <p>{t('availableAgain', { date: formattedDate })}</p>
          </div>
        )}
      </div>
    </div>
  );
}
