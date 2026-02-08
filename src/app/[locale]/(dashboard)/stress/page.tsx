import { getTranslations } from 'next-intl/server';
import { Zap, History } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { StressForm, StressHistory } from '@/components/stress';
import { getRecentStressLogs } from '@/lib/actions/stress';

export default async function StressPage() {
  const t = await getTranslations();
  const recentLogs = await getRecentStressLogs(5);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center mx-auto mb-4">
          <Zap className="w-8 h-8 text-orange-500" />
        </div>
        <h1 className="text-3xl font-bold text-zinc-100">
          {t('stress.title')}
        </h1>
        <p className="text-zinc-400 mt-2">
          Registra episodios de estrés para identificar patrones y mecanismos de defensa.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form - 2 columns */}
        <div className="lg:col-span-2">
          <StressForm />
        </div>

        {/* History - 1 column */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5 text-zinc-400" />
                Historial reciente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <StressHistory logs={recentLogs as any} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
