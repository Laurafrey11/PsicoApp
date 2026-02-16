'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Mail, Heart, AlertTriangle, X, Phone, CalendarPlus } from 'lucide-react';
import { Button } from '@/components/ui';

interface LockdownModeProps {
  onDismiss: () => void;
  professionalEmail?: string;
}

export function LockdownMode({
  onDismiss,
  professionalEmail = 'lalifreyre.lf@gmail.com',
}: LockdownModeProps) {
  const t = useTranslations('emergency');
  const [showConfirm, setShowConfirm] = useState(false);

  function handleEmail() {
    window.location.href = `mailto:${professionalEmail}`;
  }

  function handleDismissClick() {
    setShowConfirm(true);
  }

  function handleConfirmDismiss() {
    onDismiss();
  }

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/95 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="max-w-md w-full animate-fade-in">
        {/* Icono de alerta con pulso */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-red-500/20 flex items-center justify-center animate-emergency-pulse">
              <AlertTriangle className="w-12 h-12 text-red-500" />
            </div>
            <div className="absolute inset-0 rounded-full bg-red-500/10 animate-ping" />
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
          <div className="flex items-center justify-center gap-2 text-cyan-400">
            <Heart className="w-5 h-5" />
            <p className="font-medium">{t('notAlone')}</p>
          </div>
        </div>

        {/* Botón de contacto - prominente */}
        <Button
          onClick={handleEmail}
          size="lg"
          className="w-full bg-red-600 hover:bg-red-700 text-white text-xl py-6 mb-4 animate-pulse"
        >
          <Mail className="w-6 h-6" />
          {t('contactNow')}
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
        <p className="text-center text-zinc-400 mb-8">
          {t('callProfessional')}: <span className="text-zinc-200 font-mono">{professionalEmail}</span>
        </p>

        {/* Opción de dismiss */}
        {!showConfirm ? (
          <button
            onClick={handleDismissClick}
            className="w-full text-center text-zinc-500 hover:text-zinc-400 text-sm py-2 transition-colors"
          >
            {t('dismiss')}
          </button>
        ) : (
          <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800 space-y-4">
            <p className="text-zinc-300 text-center">
              {t('confirmDismiss')}
            </p>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setShowConfirm(false)}
              >
                <X className="w-4 h-4" />
                No
              </Button>
              <Button
                variant="ghost"
                className="flex-1 text-zinc-400"
                onClick={handleConfirmDismiss}
              >
                {t('imOkay')}
              </Button>
            </div>
          </div>
        )}

        {/* Línea de crisis como recurso secundario */}
        <div className="mt-8 pt-6 border-t border-zinc-800">
          <p className="text-center text-zinc-500 text-sm">
            {t('crisisLine')} 24/7:
          </p>
          <div className="flex justify-center gap-4 mt-2 text-sm">
            <a href="tel:135" className="text-cyan-500 hover:text-cyan-400 flex items-center gap-1">
              <Phone className="w-3 h-3" />
              Centro de Asistencia al Suicida: 135
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
