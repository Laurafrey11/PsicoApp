'use client';

import { useTranslations } from 'next-intl';
import { Brain, Heart, Shield, Sparkles, ArrowRight } from 'lucide-react';

export default function HomePage() {
  const t = useTranslations();

  return (
    <main className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Logo/Brand */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative">
              <Brain className="w-12 h-12 text-cyan-500" />
              <div className="absolute inset-0 blur-xl bg-cyan-500/30" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold gradient-text">
              {t('common.appName')}
            </h1>
          </div>

          {/* Tagline */}
          <p className="text-xl md:text-2xl text-zinc-400 font-light">
            {t('common.tagline')}
          </p>

          {/* Description */}
          <p className="text-lg text-zinc-500 max-w-2xl mx-auto leading-relaxed">
            {t('onboarding.step1Description')}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <a
              href="/auth/signup"
              className="group flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-teal-400 rounded-xl text-zinc-900 font-semibold transition-all hover:shadow-lg hover:shadow-cyan-500/25 hover:scale-105"
            >
              {t('onboarding.getStarted')}
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </a>
            <a
              href="/auth/signin"
              className="flex items-center gap-2 px-8 py-4 border border-zinc-700 rounded-xl text-zinc-300 font-medium transition-all hover:bg-zinc-800 hover:border-zinc-600"
            >
              {t('auth.signIn')}
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-20 bg-zinc-900/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-semibold text-center mb-16 text-zinc-200">
            {t('onboarding.welcome')}
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group p-8 rounded-2xl bg-zinc-900/80 border border-zinc-800 transition-all hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/5">
              <div className="w-14 h-14 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-6 group-hover:bg-cyan-500/20 transition-colors">
                <Heart className="w-7 h-7 text-cyan-500" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-zinc-100">
                {t('onboarding.step2Title')}
              </h3>
              <p className="text-zinc-400 leading-relaxed">
                {t('onboarding.step2Description')}
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group p-8 rounded-2xl bg-zinc-900/80 border border-zinc-800 transition-all hover:border-teal-500/30 hover:shadow-lg hover:shadow-teal-500/5">
              <div className="w-14 h-14 rounded-xl bg-teal-500/10 flex items-center justify-center mb-6 group-hover:bg-teal-500/20 transition-colors">
                <Sparkles className="w-7 h-7 text-teal-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-zinc-100">
                {t('onboarding.step3Title')}
              </h3>
              <p className="text-zinc-400 leading-relaxed">
                {t('onboarding.step3Description')}
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group p-8 rounded-2xl bg-zinc-900/80 border border-zinc-800 transition-all hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5">
              <div className="w-14 h-14 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-6 group-hover:bg-emerald-500/20 transition-colors">
                <Shield className="w-7 h-7 text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-zinc-100">
                {t('onboarding.step4Title')}
              </h3>
              <p className="text-zinc-400 leading-relaxed">
                {t('onboarding.step4Description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-zinc-800">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-zinc-500">
            <Brain className="w-5 h-5" />
            <span className="font-medium">Ego-Core</span>
          </div>
          <p className="text-sm text-zinc-600">
            {t('chat.disclaimer')}
          </p>
        </div>
      </footer>
    </main>
  );
}
