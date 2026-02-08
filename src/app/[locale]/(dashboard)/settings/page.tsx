import { getTranslations } from 'next-intl/server';
import { Settings, Shield } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { ProfileForm } from '@/components/settings';
import { getProfile } from '@/lib/actions/profile';

export default async function SettingsPage() {
  const t = await getTranslations();
  const profile = await getProfile();

  return (
    <div className="space-y-8 animate-fade-in max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-zinc-100 flex items-center gap-3">
          <Settings className="w-8 h-8 text-cyan-500" />
          {t('settings.title')}
        </h1>
        <p className="text-zinc-400 mt-1">
          Configura tu perfil y preferencias.
        </p>
      </div>

      {/* Profile Form */}
      <ProfileForm initialData={profile} />

      {/* Privacy Notice */}
      <Card className="border-zinc-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="w-5 h-5 text-emerald-400" />
            {t('settings.privacy')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-zinc-400">
            <li className="flex items-start gap-2">
              <span className="text-emerald-400">✓</span>
              Tus datos están encriptados y protegidos
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400">✓</span>
              La información personal se anonimiza antes de enviarla a la IA
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400">✓</span>
              Solo tú puedes ver tu información (Row Level Security)
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400">✓</span>
              Puedes eliminar tu cuenta y datos en cualquier momento
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
