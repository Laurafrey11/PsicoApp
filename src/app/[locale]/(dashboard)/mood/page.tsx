import { getTranslations } from 'next-intl/server';
import { Heart } from 'lucide-react';
import { UnifiedEntryForm } from '@/components/mood';

export default async function MoodPage() {
  const t = await getTranslations();

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center mx-auto mb-4">
          <Heart className="w-8 h-8 text-cyan-500" />
        </div>
        <h1 className="text-3xl font-bold text-zinc-100">
          {t('mood.howAreYou')}
        </h1>
        <p className="text-zinc-400 mt-2">
          Registrá tu estado de ánimo y, si querés, un episodio de estrés.
        </p>
      </div>

      {/* Unified Form */}
      <UnifiedEntryForm />
    </div>
  );
}
