import { getTranslations } from 'next-intl/server';
import { Heart, FileText } from 'lucide-react';
import { UnifiedEntryForm } from '@/components/mood';
import { CsvUploadSection } from './csv-upload-section';

export default async function MoodPage() {
  const t = await getTranslations();

  return (
    <div className="space-y-10 animate-fade-in">
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

      {/* Divider */}
      <div className="max-w-2xl mx-auto flex items-center gap-4">
        <div className="flex-1 h-px bg-zinc-800" />
        <div className="flex items-center gap-2 text-zinc-500 text-sm">
          <FileText className="w-4 h-4" />
          o importá desde archivo
        </div>
        <div className="flex-1 h-px bg-zinc-800" />
      </div>

      {/* CSV Upload */}
      <CsvUploadSection />
    </div>
  );
}
