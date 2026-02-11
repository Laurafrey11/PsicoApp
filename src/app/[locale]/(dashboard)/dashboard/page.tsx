import { getTranslations } from 'next-intl/server';
import { Brain, Heart, TrendingUp, MessageCircle, Meh, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import Link from 'next/link';

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
            <div className="text-center py-8">
              <Meh className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
              <p className="text-zinc-500 mb-4">{t('dashboard.noDataYet')}</p>
              <Link href="/mood" className="inline-flex items-center gap-2 text-cyan-500 hover:text-cyan-400 transition-colors">
                Registrar ahora
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Overview */}
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.weeklyOverview')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <TrendingUp className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
              <p className="text-zinc-500 mb-4">{t('dashboard.noDataYet')}</p>
              <Link href="/mood" className="inline-flex items-center gap-2 text-cyan-500 hover:text-cyan-400 transition-colors">
                Comenzar a registrar
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
