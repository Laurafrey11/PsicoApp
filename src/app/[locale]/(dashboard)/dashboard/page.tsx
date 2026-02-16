import { getTranslations } from 'next-intl/server';
import { DashboardCustomizer } from '@/components/dashboard/dashboard-customizer';

export default async function DashboardPage() {
  const t = await getTranslations();
  const firstName = 'Usuario';

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-zinc-100">
          {t('dashboard.welcome', { name: firstName })}
        </h1>
        <p className="text-zinc-400 mt-1">
          {t('dashboard.title')}
        </p>
      </div>

      {/* Customizable Widgets */}
      <DashboardCustomizer />
    </div>
  );
}
