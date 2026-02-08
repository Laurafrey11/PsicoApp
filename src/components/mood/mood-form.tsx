'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { CheckCircle, Sparkles } from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { Slider } from '@/components/ui/slider';
import { EmotionSelector } from './emotion-selector';
import { saveMoodEntry, type MoodFormData } from '@/lib/actions/mood';
import type { EmotionType } from '@/types/database';

export function MoodForm() {
  const t = useTranslations();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [moodScore, setMoodScore] = useState(5);
  const [energyLevel, setEnergyLevel] = useState(5);
  const [anxietyLevel, setAnxietyLevel] = useState(5);
  const [sleepQuality, setSleepQuality] = useState(5);
  const [primaryEmotion, setPrimaryEmotion] = useState<EmotionType | null>(null);
  const [notes, setNotes] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const data: MoodFormData = {
      moodScore,
      energyLevel,
      anxietyLevel,
      sleepQuality,
      primaryEmotion,
      notes,
    };

    const result = await saveMoodEntry(data);

    if (result.error) {
      setError(result.error);
      setIsLoading(false);
    } else {
      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    }
  }

  if (success) {
    return (
      <Card className="max-w-2xl mx-auto text-center">
        <CardContent className="py-16">
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6 animate-pulse-glow">
            <CheckCircle className="w-10 h-10 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-semibold text-zinc-100 mb-2">
            {t('common.success')}
          </h2>
          <p className="text-zinc-400">
            Tu estado de ánimo ha sido registrado.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Mood Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-500" />
            {t('mood.moodScore')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Slider
            value={moodScore}
            onChange={setMoodScore}
            colorScale="mood"
          />
        </CardContent>
      </Card>

      {/* Primary Emotion */}
      <Card>
        <CardHeader>
          <CardTitle>{t('mood.primaryEmotion')}</CardTitle>
        </CardHeader>
        <CardContent>
          <EmotionSelector
            value={primaryEmotion}
            onChange={setPrimaryEmotion}
          />
        </CardContent>
      </Card>

      {/* Other Metrics */}
      <Card>
        <CardContent className="space-y-8 pt-6">
          <Slider
            value={energyLevel}
            onChange={setEnergyLevel}
            label={t('mood.energyLevel')}
            colorScale="energy"
          />

          <Slider
            value={anxietyLevel}
            onChange={setAnxietyLevel}
            label={t('mood.anxietyLevel')}
            colorScale="anxiety"
          />

          <Slider
            value={sleepQuality}
            onChange={setSleepQuality}
            label={t('mood.sleepQuality')}
            colorScale="sleep"
          />
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>{t('mood.notes')}</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t('mood.notesPlaceholder')}
            rows={4}
            className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
          />
        </CardContent>
      </Card>

      {/* Submit */}
      <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
        {t('mood.recordMood')}
      </Button>
    </form>
  );
}
