import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Brain, BarChart3, Shield, Zap, Heart, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  const t = useTranslations('landing');

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-zinc-100">
      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center px-6 pt-32 pb-24 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-transparent pointer-events-none" />
        <div className="animate-fade-in relative z-10 max-w-3xl mx-auto">
          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-6">
            <span className="gradient-text">{t('heroTitle')}</span>
          </h1>
          <p className="text-lg sm:text-xl text-zinc-400 mb-4 max-w-2xl mx-auto">
            {t('heroSubtitle')}
          </p>
          <p className="text-sm text-zinc-500 mb-10">
            {t('heroByline')}
          </p>
          <Link href="/dashboard">
            <Button variant="primary" size="lg" className="text-lg px-10 py-5">
              {t('heroCta')}
            </Button>
          </Link>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="px-6 py-24 max-w-6xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4 gradient-text">
          {t('valueTitle')}
        </h2>
        <p className="text-zinc-400 text-center mb-16 max-w-2xl mx-auto">
          {t('valueSubtitle')}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <ValueCard
            icon={<Brain className="w-8 h-8 text-cyan-400" />}
            title={t('card1Title')}
            description={t('card1Description')}
          />
          <ValueCard
            icon={<BarChart3 className="w-8 h-8 text-teal-400" />}
            title={t('card2Title')}
            description={t('card2Description')}
          />
          <ValueCard
            icon={<Shield className="w-8 h-8 text-cyan-300" />}
            title={t('card3Title')}
            description={t('card3Description')}
          />
        </div>
      </section>

      {/* Pricing */}
      <section className="px-6 py-24 bg-zinc-950/50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 gradient-text">
            {t('pricingTitle')}
          </h2>
          <p className="text-zinc-400 mb-12 max-w-xl mx-auto">
            {t('pricingSubtitle')}
          </p>
          <div className="rounded-2xl bg-zinc-900/50 border border-zinc-800 p-8 sm:p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-teal-400/5 pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center justify-center gap-3 mb-6">
                <Coins className="w-10 h-10 text-cyan-400" />
                <Zap className="w-6 h-6 text-teal-400" />
              </div>
              <p className="text-4xl sm:text-5xl font-bold mb-2">
                <span className="gradient-text">USD $70</span>
              </p>
              <p className="text-zinc-400 text-lg mb-6">
                {t('pricingPerMillion')}
              </p>
              <div className="border-t border-zinc-800 pt-6 mt-6">
                <p className="text-zinc-400 text-sm leading-relaxed max-w-md mx-auto">
                  {t('pricingExplanation')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Therapeutic Bridge */}
      <section className="px-6 py-24 max-w-4xl mx-auto">
        <div className="rounded-2xl bg-zinc-900/50 border border-zinc-800 p-8 sm:p-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Heart className="w-10 h-10 text-cyan-400" />
            <Shield className="w-8 h-8 text-teal-400" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 gradient-text">
            {t('bridgeTitle')}
          </h2>
          <p className="text-zinc-400 text-lg mb-6 max-w-2xl mx-auto leading-relaxed">
            {t('bridgeDescription')}
          </p>
          <p className="text-zinc-500 text-sm mb-8 max-w-xl mx-auto">
            {t('bridgeSessions')}
          </p>
          <Link href="/dashboard">
            <Button variant="secondary" size="lg">
              {t('bridgeCta')}
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 border-t border-zinc-800/50">
        <div className="max-w-6xl mx-auto text-center">
          <p className="gradient-text text-xl font-bold mb-2">Ego-Core</p>
          <p className="text-zinc-500 text-sm">{t('footerTagline')}</p>
        </div>
      </footer>
    </main>
  );
}

function ValueCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl bg-zinc-900/50 border border-zinc-800 p-8 text-center hover:border-zinc-700 transition-colors">
      <div className="flex justify-center mb-5">{icon}</div>
      <h3 className="text-xl font-semibold mb-3 text-zinc-100">{title}</h3>
      <p className="text-zinc-400 leading-relaxed">{description}</p>
    </div>
  );
}
