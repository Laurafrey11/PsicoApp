'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { CheckCircle, Sparkles, ChevronDown, AlertTriangle, Lightbulb, ArrowRight, RotateCcw } from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { Slider } from '@/components/ui/slider';
import { EmotionSelector } from './emotion-selector';
import { SymptomSelector } from '@/components/stress/symptom-selector';
import { saveMoodEntry, type MoodFormData } from '@/lib/actions/mood';
import { saveStressLog, type StressFormData, type StressResult } from '@/lib/actions/stress';
import type { EmotionType } from '@/types/database';
import { cn } from '@/lib/utils';

const mechanismLabels: Record<string, string> = {
  denial: 'Negación',
  projection: 'Proyección',
  rationalization: 'Racionalización',
  displacement: 'Desplazamiento',
  sublimation: 'Sublimación',
  repression: 'Represión',
  regression: 'Regresión',
  reaction_formation: 'Formación reactiva',
};

export function UnifiedEntryForm() {
  const t = useTranslations();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [stressResult, setStressResult] = useState<StressResult | null>(null);

  // Mood fields
  const [moodScore, setMoodScore] = useState(5);
  const [energyLevel, setEnergyLevel] = useState(5);
  const [anxietyLevel, setAnxietyLevel] = useState(5);
  const [sleepQuality, setSleepQuality] = useState(5);
  const [primaryEmotion, setPrimaryEmotion] = useState<EmotionType | null>(null);
  const [notes, setNotes] = useState('');

  // Stress fields (optional section)
  const [showStress, setShowStress] = useState(false);
  const [stressIntensity, setStressIntensity] = useState(5);
  const [situation, setSituation] = useState('');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [thoughts, setThoughts] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Save mood entry
    const moodData: MoodFormData = {
      moodScore,
      energyLevel,
      anxietyLevel,
      sleepQuality,
      primaryEmotion,
      notes,
    };

    const moodResult = await saveMoodEntry(moodData);

    if (moodResult.error) {
      setError(moodResult.error);
      setIsLoading(false);
      return;
    }

    // If stress section is open and has content, save stress too
    if (showStress && situation.trim()) {
      const stressData: StressFormData = {
        intensity: stressIntensity,
        situation: situation.trim(),
        physicalSymptoms: symptoms,
        thoughts: thoughts.trim(),
      };

      const sResult = await saveStressLog(stressData);
      if (sResult.error) {
        setError(sResult.error);
        setIsLoading(false);
        return;
      }

      if (sResult.success && sResult.analysis) {
        setStressResult(sResult);
        setIsLoading(false);
        return;
      }
    }

    setSuccess(true);
    setIsLoading(false);
    setTimeout(() => {
      router.push('/dashboard');
    }, 2000);
  }

  function handleReset() {
    setStressResult(null);
    setSuccess(false);
    setMoodScore(5);
    setEnergyLevel(5);
    setAnxietyLevel(5);
    setSleepQuality(5);
    setPrimaryEmotion(null);
    setNotes('');
    setShowStress(false);
    setStressIntensity(5);
    setSituation('');
    setSymptoms([]);
    setThoughts('');
  }

  // Show stress analysis result
  if (stressResult?.success && stressResult.analysis) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        {/* Success message for mood */}
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <p className="text-emerald-400 text-sm">Estado de ánimo registrado correctamente</p>
        </div>

        <Card className="border-cyan-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-cyan-400">
              <Lightbulb className="w-5 h-5" />
              Análisis de tu episodio de estrés
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {stressResult.analysis.defenseMechanism && (
              <div className="p-4 rounded-xl bg-zinc-800/50">
                <p className="text-sm text-zinc-400 mb-1">Mecanismo de defensa detectado</p>
                <p className="text-lg font-semibold text-zinc-100">
                  {mechanismLabels[stressResult.analysis.defenseMechanism] || stressResult.analysis.defenseMechanism}
                </p>
              </div>
            )}

            <p className="text-zinc-300 leading-relaxed">
              {stressResult.analysis.explanation}
            </p>

            <div>
              <p className="text-sm text-zinc-400 mb-3">Sugerencias:</p>
              <ul className="space-y-2">
                {stressResult.analysis.suggestions.map((suggestion, i) => (
                  <li key={i} className="flex items-start gap-2 text-zinc-300">
                    <ArrowRight className="w-4 h-4 text-cyan-500 mt-1 flex-shrink-0" />
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button variant="secondary" onClick={handleReset} className="flex-1">
            <RotateCcw className="w-4 h-4" />
            Nuevo registro
          </Button>
          <Button onClick={() => router.push('/dashboard')} className="flex-1">
            Ir al panel
          </Button>
        </div>
      </div>
    );
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
            Tu registro ha sido guardado correctamente.
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
            rows={3}
            className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
          />
        </CardContent>
      </Card>

      {/* Stress Section (collapsible) */}
      <div className="rounded-2xl border border-zinc-800 overflow-hidden transition-all">
        <button
          type="button"
          onClick={() => setShowStress(!showStress)}
          className={cn(
            'w-full flex items-center justify-between p-5 transition-colors',
            showStress ? 'bg-orange-500/5 border-b border-zinc-800' : 'bg-zinc-900/30 hover:bg-zinc-900/50'
          )}
        >
          <div className="flex items-center gap-3">
            <div className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center transition-colors',
              showStress ? 'bg-orange-500/20' : 'bg-zinc-800'
            )}>
              <AlertTriangle className={cn('w-5 h-5', showStress ? 'text-orange-500' : 'text-zinc-500')} />
            </div>
            <div className="text-left">
              <p className={cn('font-medium', showStress ? 'text-orange-300' : 'text-zinc-300')}>
                ¿Tuviste un episodio de estrés?
              </p>
              <p className="text-xs text-zinc-500">Opcional — registrá la situación para analizar patrones</p>
            </div>
          </div>
          <ChevronDown className={cn(
            'w-5 h-5 text-zinc-500 transition-transform',
            showStress && 'rotate-180'
          )} />
        </button>

        {showStress && (
          <div className="p-5 space-y-6 bg-zinc-950/30 animate-fade-in">
            {/* Stress Intensity */}
            <div>
              <label className="text-sm font-medium text-zinc-300 mb-3 block">
                {t('stress.intensity')}
              </label>
              <Slider
                value={stressIntensity}
                onChange={setStressIntensity}
                colorScale="anxiety"
              />
            </div>

            {/* Situation */}
            <div>
              <label className="text-sm font-medium text-zinc-300 mb-2 block">
                {t('stress.situation')}
              </label>
              <textarea
                value={situation}
                onChange={(e) => setSituation(e.target.value)}
                placeholder={t('stress.situationPlaceholder')}
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Physical Symptoms */}
            <div>
              <label className="text-sm font-medium text-zinc-300 mb-2 block">
                {t('stress.symptoms')}
              </label>
              <SymptomSelector selected={symptoms} onChange={setSymptoms} />
            </div>

            {/* Thoughts */}
            <div>
              <label className="text-sm font-medium text-zinc-300 mb-2 block">
                {t('stress.thoughts')}
              </label>
              <textarea
                value={thoughts}
                onChange={(e) => setThoughts(e.target.value)}
                placeholder={t('stress.thoughtsPlaceholder')}
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Submit */}
      <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
        {showStress && situation.trim()
          ? 'Registrar estado y episodio de estrés'
          : t('mood.recordMood')
        }
      </Button>
    </form>
  );
}
