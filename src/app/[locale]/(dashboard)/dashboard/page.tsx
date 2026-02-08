import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { Brain, Heart, TrendingUp, MessageCircle, Smile, Frown, Meh, Moon, Zap, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import Link from 'next/link';
import { getTodayMood } from '@/lib/actions/mood';
import { getWeeklyStats } from '@/lib/actions/analytics';

const emotionEmojis: Record<string, string> = {
  joy: '😊',
  calm: '😌',
  hope: '🌟',
  sadness: '😢',
  anxiety: '😰',
  frustration: '😤',
  anger: '😠',
  fear: '😨',
  surprise: '😲',
  disgust: '🤢',
};

export default async function DashboardPage() {
  const t = await getTranslations();
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  // Get data in parallel
  const [todayMood, weeklyStats] = await Promise.all([
    getTodayMood(),
    getWeeklyStats(),
  ]);

  // Get user's first name
  let firstName = 'Usuario';
  if (user?.user_metadata?.full_name) {
    firstName = String(user.user_metadata.full_name).split(' ')[0];
  } else if (user?.email) {
    firstName = user.email.split('@')[0];
  }

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

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/mood">
          <Card className="group cursor-pointer transition-all hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/5">
            <CardContent className="flex items-center gap-4 py-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors">
                <Heart className="w-6 h-6 text-cyan-500" />
              </div>
              <div>
                <h3 className="font-medium text-zinc-100">{t('mood.recordMood')}</h3>
                <p className="text-sm text-zinc-500">{t('mood.howAreYou')}</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/chat">
          <Card className="group cursor-pointer transition-all hover:border-teal-500/30 hover:shadow-lg hover:shadow-teal-500/5">
            <CardContent className="flex items-center gap-4 py-4">
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center group-hover:bg-teal-500/20 transition-colors">
                <MessageCircle className="w-6 h-6 text-teal-400" />
              </div>
              <div>
                <h3 className="font-medium text-zinc-100">{t('chat.title')}</h3>
                <p className="text-sm text-zinc-500">{t('chat.placeholder')}</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/analytics">
          <Card className="group cursor-pointer transition-all hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5">
            <CardContent className="flex items-center gap-4 py-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                <TrendingUp className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-medium text-zinc-100">{t('analytics.title')}</h3>
                <p className="text-sm text-zinc-500">{t('analytics.trends')}</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/stress">
          <Card className="group cursor-pointer transition-all hover:border-orange-500/30 hover:shadow-lg hover:shadow-orange-500/5">
            <CardContent className="flex items-center gap-4 py-4">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center group-hover:bg-orange-500/20 transition-colors">
                <Brain className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <h3 className="font-medium text-zinc-100">{t('stress.title')}</h3>
                <p className="text-sm text-zinc-500">{t('stress.logStress')}</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Today's Mood & Weekly Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Mood */}
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.todayMood')}</CardTitle>
          </CardHeader>
          <CardContent>
            {todayMood ? (
              <div className="space-y-4">
                {/* Mood Score */}
                <div className="flex items-center gap-4">
                  <div className="text-5xl">
                    {todayMood.mood_score >= 7 ? '😊' : todayMood.mood_score >= 4 ? '😐' : '😔'}
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-zinc-100">{todayMood.mood_score}/10</p>
                    <p className="text-sm text-zinc-500">Estado de ánimo</p>
                  </div>
                </div>

                {/* Emotion */}
                {todayMood.primary_emotion && (
                  <div className="flex items-center gap-2 text-zinc-300">
                    <span className="text-xl">{emotionEmojis[todayMood.primary_emotion] || '❓'}</span>
                    <span className="capitalize">{todayMood.primary_emotion}</span>
                  </div>
                )}

                {/* Other metrics */}
                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div className="text-center p-3 rounded-xl bg-zinc-800/50">
                    <Zap className="w-4 h-4 text-teal-400 mx-auto mb-1" />
                    <p className="text-lg font-semibold text-zinc-100">{todayMood.energy_level || '-'}</p>
                    <p className="text-xs text-zinc-500">Energía</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-zinc-800/50">
                    <Brain className="w-4 h-4 text-orange-400 mx-auto mb-1" />
                    <p className="text-lg font-semibold text-zinc-100">{todayMood.anxiety_level || '-'}</p>
                    <p className="text-xs text-zinc-500">Ansiedad</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-zinc-800/50">
                    <Moon className="w-4 h-4 text-indigo-400 mx-auto mb-1" />
                    <p className="text-lg font-semibold text-zinc-100">{todayMood.sleep_quality || '-'}</p>
                    <p className="text-xs text-zinc-500">Sueño</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Meh className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                <p className="text-zinc-500 mb-4">{t('dashboard.noDataYet')}</p>
                <Link href="/mood" className="inline-flex items-center gap-2 text-cyan-500 hover:text-cyan-400 transition-colors">
                  Registrar ahora
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Weekly Overview */}
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.weeklyOverview')}</CardTitle>
          </CardHeader>
          <CardContent>
            {weeklyStats ? (
              <div className="space-y-4">
                {/* Main stat */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-500/20 to-teal-500/20 flex items-center justify-center">
                    {weeklyStats.moodTrend === 'up' && <Smile className="w-8 h-8 text-emerald-400" />}
                    {weeklyStats.moodTrend === 'down' && <Frown className="w-8 h-8 text-orange-400" />}
                    {weeklyStats.moodTrend === 'stable' && <Meh className="w-8 h-8 text-cyan-400" />}
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-zinc-100">{weeklyStats.avgMood}/10</p>
                    <p className="text-sm text-zinc-500">Promedio semanal</p>
                  </div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-zinc-800/50">
                    <p className="text-sm text-zinc-500">Registros</p>
                    <p className="text-xl font-semibold text-zinc-100">{weeklyStats.totalEntries}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-800/50">
                    <p className="text-sm text-zinc-500">Tendencia</p>
                    <p className={`text-xl font-semibold ${
                      weeklyStats.moodTrend === 'up' ? 'text-emerald-400' :
                      weeklyStats.moodTrend === 'down' ? 'text-orange-400' : 'text-zinc-300'
                    }`}>
                      {weeklyStats.moodTrend === 'up' ? '↑ Mejorando' :
                       weeklyStats.moodTrend === 'down' ? '↓ Bajando' : '→ Estable'}
                    </p>
                  </div>
                </div>

                {/* Best day */}
                {weeklyStats.bestDay && (
                  <p className="text-sm text-zinc-400">
                    Mejor día: <span className="text-emerald-400 capitalize">{weeklyStats.bestDay}</span>
                  </p>
                )}

                <Link href="/analytics" className="inline-flex items-center gap-2 text-cyan-500 hover:text-cyan-400 transition-colors text-sm">
                  Ver análisis completo
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="text-center py-8">
                <TrendingUp className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                <p className="text-zinc-500 mb-4">{t('dashboard.noDataYet')}</p>
                <Link href="/mood" className="inline-flex items-center gap-2 text-cyan-500 hover:text-cyan-400 transition-colors">
                  Comenzar a registrar
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
