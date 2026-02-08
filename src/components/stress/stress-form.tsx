'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { AlertTriangle, Lightbulb, ArrowRight, RotateCcw } from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { Slider } from '@/components/ui/slider';
import { SymptomSelector } from './symptom-selector';
import { saveStressLog, type StressFormData, type StressResult } from '@/lib/actions/stress';

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

export function StressForm() {
  const t = useTranslations();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<StressResult | null>(null);

  const [intensity, setIntensity] = useState(5);
  const [situation, setSituation] = useState('');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [thoughts, setThoughts] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!situation.trim()) {
      setError('Describe la situación');
      setIsLoading(false);
      return;
    }

    const data: StressFormData = {
      intensity,
      situation: situation.trim(),
      physicalSymptoms: symptoms,
      thoughts: thoughts.trim(),
    };

    const res = await saveStressLog(data);

    if (res.error) {
      setError(res.error);
    } else {
      setResult(res);
    }

    setIsLoading(false);
  }

  function handleReset() {
    setResult(null);
    setIntensity(5);
    setSituation('');
    setSymptoms([]);
    setThoughts('');
  }

  // Show analysis result
  if (result?.success && result.analysis) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <Card className="border-cyan-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-cyan-400">
              <Lightbulb className="w-5 h-5" />
              Análisis de tu episodio
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {result.analysis.defenseMechanism && (
              <div className="p-4 rounded-xl bg-zinc-800/50">
                <p className="text-sm text-zinc-400 mb-1">Mecanismo de defensa detectado</p>
                <p className="text-lg font-semibold text-zinc-100">
                  {mechanismLabels[result.analysis.defenseMechanism] || result.analysis.defenseMechanism}
                </p>
              </div>
            )}

            <div>
              <p className="text-zinc-300 leading-relaxed">
                {result.analysis.explanation}
              </p>
            </div>

            <div>
              <p className="text-sm text-zinc-400 mb-3">Sugerencias:</p>
              <ul className="space-y-2">
                {result.analysis.suggestions.map((suggestion, i) => (
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
            Registrar otro episodio
          </Button>
          <Button onClick={() => window.location.href = '/chat'} className="flex-1">
            Hablar con el asistente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Intensity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            {t('stress.intensity')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Slider
            value={intensity}
            onChange={setIntensity}
            colorScale="anxiety"
          />
        </CardContent>
      </Card>

      {/* Situation */}
      <Card>
        <CardHeader>
          <CardTitle>{t('stress.situation')}</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            value={situation}
            onChange={(e) => setSituation(e.target.value)}
            placeholder={t('stress.situationPlaceholder')}
            rows={4}
            className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
            required
          />
        </CardContent>
      </Card>

      {/* Physical Symptoms */}
      <Card>
        <CardHeader>
          <CardTitle>{t('stress.symptoms')}</CardTitle>
        </CardHeader>
        <CardContent>
          <SymptomSelector selected={symptoms} onChange={setSymptoms} />
        </CardContent>
      </Card>

      {/* Thoughts */}
      <Card>
        <CardHeader>
          <CardTitle>{t('stress.thoughts')}</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            value={thoughts}
            onChange={(e) => setThoughts(e.target.value)}
            placeholder={t('stress.thoughtsPlaceholder')}
            rows={4}
            className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
          />
        </CardContent>
      </Card>

      {/* Submit */}
      <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
        {t('stress.logStress')}
      </Button>
    </form>
  );
}
