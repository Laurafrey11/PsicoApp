import { getTranslations } from 'next-intl/server';
import { TrendingUp, Heart, Zap, Brain, Moon, Calendar, Smile } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { StatsCard, MoodChart, EmotionChart } from '@/components/analytics';
import {
  getMoodHistory,
  getEmotionDistribution,
  getWeeklyStats,
} from '@/lib/actions/analytics';

export default async function AnalyticsPage() {
  const t = await getTranslations();

  const [moodHistory, emotionData, weeklyStats] = await Promise.all([
    getMoodHistory(30),
    getEmotionDistribution(30),
    getWeeklyStats(),
  ]);

  const trendLabels = {
    up: 'Mejorando',
    down: 'Bajando',
    stable: 'Estable',
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-zinc-100 flex items-center gap-3">
          <TrendingUp className="w-8 h-8 text-cyan-500" />
          {t('analytics.title')}
        </h1>
        <p className="text-zinc-400 mt-1">
          Visualiza tus tendencias emocionales de los últimos 30 días.
        </p>
      </div>

      {/* Stats Grid */}
      {weeklyStats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Ánimo Promedio"
            value={weeklyStats.avgMood}
            trend={weeklyStats.moodTrend}
            trendLabel={trendLabels[weeklyStats.moodTrend]}
            icon={<Heart className="w-5 h-5" />}
            color="cyan"
          />
          <StatsCard
            title="Energía Promedio"
            value={weeklyStats.avgEnergy}
            subtitle="últimos 7 días"
            icon={<Zap className="w-5 h-5" />}
            color="teal"
          />
          <StatsCard
            title="Ansiedad Promedio"
            value={weeklyStats.avgAnxiety}
            subtitle="últimos 7 días"
            icon={<Brain className="w-5 h-5" />}
            color="orange"
          />
          <StatsCard
            title="Calidad de Sueño"
            value={weeklyStats.avgSleep}
            subtitle="últimos 7 días"
            icon={<Moon className="w-5 h-5" />}
            color="indigo"
          />
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-zinc-500">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Aún no hay suficientes datos esta semana.</p>
            <p className="text-sm mt-1">Registra tu estado de ánimo para ver estadísticas.</p>
          </CardContent>
        </Card>
      )}

      {/* Weekly Insights */}
      {weeklyStats && (weeklyStats.bestDay || weeklyStats.worstDay) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {weeklyStats.bestDay && (
            <Card className="border-emerald-500/20">
              <CardContent className="py-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <Smile className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm text-zinc-400">Mejor día</p>
                    <p className="text-xl font-semibold text-zinc-100 capitalize">
                      {weeklyStats.bestDay}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          {weeklyStats.worstDay && weeklyStats.worstDay !== weeklyStats.bestDay && (
            <Card className="border-orange-500/20">
              <CardContent className="py-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-orange-400" />
                  </div>
                  <div>
                    <p className="text-sm text-zinc-400">Día más difícil</p>
                    <p className="text-xl font-semibold text-zinc-100 capitalize">
                      {weeklyStats.worstDay}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mood Trend Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t('analytics.moodTrend')}</CardTitle>
          </CardHeader>
          <CardContent>
            <MoodChart data={moodHistory} />
          </CardContent>
        </Card>

        {/* Emotion Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Emociones</CardTitle>
          </CardHeader>
          <CardContent>
            <EmotionChart data={emotionData} />
          </CardContent>
        </Card>
      </div>

      {/* Summary */}
      {weeklyStats && (
        <Card>
          <CardHeader>
            <CardTitle>{t('analytics.weeklyReport')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-invert prose-sm max-w-none">
              <p className="text-zinc-300">
                Esta semana registraste <strong className="text-cyan-400">{weeklyStats.totalEntries} entradas</strong>.
                {' '}Tu ánimo promedio fue de <strong className="text-cyan-400">{weeklyStats.avgMood}/10</strong>
                {weeklyStats.moodTrend === 'up' && (
                  <span className="text-emerald-400"> y está mejorando comparado con la semana anterior.</span>
                )}
                {weeklyStats.moodTrend === 'down' && (
                  <span className="text-orange-400"> y ha disminuido comparado con la semana anterior.</span>
                )}
                {weeklyStats.moodTrend === 'stable' && (
                  <span className="text-zinc-400"> y se mantiene estable.</span>
                )}
              </p>
              {weeklyStats.avgAnxiety > 6 && (
                <p className="text-orange-400 mt-2">
                  Tu nivel de ansiedad promedio ({weeklyStats.avgAnxiety}/10) está elevado.
                  Considera hablar con el asistente o un profesional.
                </p>
              )}
              {weeklyStats.avgSleep < 5 && (
                <p className="text-indigo-400 mt-2">
                  Tu calidad de sueño ({weeklyStats.avgSleep}/10) podría mejorar.
                  El descanso es fundamental para el bienestar emocional.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
