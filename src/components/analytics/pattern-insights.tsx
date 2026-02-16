'use client';

import { Lightbulb, Moon, Heart, AlertTriangle, Shield, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui';
import type { MoodDataPoint, EmotionCount, WeeklyStats } from '@/lib/actions/analytics';

interface DefenseData {
  mechanism: string;
  count: number;
}

interface PatternInsightsProps {
  moodHistory: MoodDataPoint[];
  weeklyStats: WeeklyStats | null;
  emotionData: EmotionCount[];
  defenseData: DefenseData[];
}

interface Insight {
  icon: React.ReactNode;
  title: string;
  description: string;
  type: 'positive' | 'neutral' | 'warning';
}

const emotionLabels: Record<string, string> = {
  joy: 'alegría',
  calm: 'calma',
  hope: 'esperanza',
  sadness: 'tristeza',
  anxiety: 'ansiedad',
  frustration: 'frustración',
  anger: 'ira',
  fear: 'miedo',
  surprise: 'sorpresa',
  disgust: 'desagrado',
};

const mechanismLabels: Record<string, string> = {
  denial: 'negación',
  projection: 'proyección',
  rationalization: 'racionalización',
  displacement: 'desplazamiento',
  sublimation: 'sublimación',
  repression: 'represión',
  regression: 'regresión',
  reaction_formation: 'formación reactiva',
};

const mechanismTips: Record<string, string> = {
  denial: 'Intentá permitirte sentir las emociones sin juzgarlas.',
  projection: 'Reflexioná sobre qué parte de la situación depende de vos.',
  rationalization: 'A veces está bien sentir sin buscar explicaciones.',
  displacement: 'Identificá la fuente real de tu frustración.',
  sublimation: 'Seguí cultivando estas salidas creativas y productivas.',
  repression: 'Explorá estos sentimientos gradualmente, a tu ritmo.',
  regression: 'Pedir ayuda es válido. Identificá qué necesitás específicamente.',
  reaction_formation: 'Intentá conectar con lo que realmente sentís.',
};

function computeCorrelation(a: number[], b: number[]): number {
  if (a.length < 3 || a.length !== b.length) return 0;
  const n = a.length;
  const meanA = a.reduce((s, v) => s + v, 0) / n;
  const meanB = b.reduce((s, v) => s + v, 0) / n;
  let num = 0, denA = 0, denB = 0;
  for (let i = 0; i < n; i++) {
    const da = a[i] - meanA;
    const db = b[i] - meanB;
    num += da * db;
    denA += da * da;
    denB += db * db;
  }
  const den = Math.sqrt(denA * denB);
  return den === 0 ? 0 : num / den;
}

function generateInsights(props: PatternInsightsProps): Insight[] {
  const { moodHistory, weeklyStats, emotionData, defenseData } = props;
  const insights: Insight[] = [];

  // 1. Mood-sleep correlation
  const withBoth = moodHistory.filter((d) => d.mood > 0 && d.sleep > 0);
  if (withBoth.length >= 5) {
    const corr = computeCorrelation(
      withBoth.map((d) => d.mood),
      withBoth.map((d) => d.sleep)
    );
    if (corr > 0.3) {
      insights.push({
        icon: <Moon className="w-5 h-5" />,
        title: 'Ánimo y sueño conectados',
        description: 'Tu ánimo tiende a mejorar los días que dormís mejor. Cuidar el descanso puede impactar positivamente en cómo te sentís.',
        type: 'positive',
      });
    } else if (corr < -0.3) {
      insights.push({
        icon: <Moon className="w-5 h-5" />,
        title: 'Patrón inusual sueño-ánimo',
        description: 'Tu ánimo no parece mejorar con mejor sueño. Puede haber otros factores influyendo. Comentalo con la profesional.',
        type: 'neutral',
      });
    }
  }

  // 2. Dominant emotion
  if (emotionData.length > 0) {
    const total = emotionData.reduce((s, e) => s + e.count, 0);
    const top = emotionData[0];
    const pct = Math.round((top.count / total) * 100);
    const label = emotionLabels[top.emotion] || top.emotion;

    const isPositive = ['joy', 'calm', 'hope'].includes(top.emotion);
    insights.push({
      icon: <Heart className="w-5 h-5" />,
      title: `Emoción predominante: ${label}`,
      description: isPositive
        ? `El ${pct}% de tus registros reflejan ${label}. Es una señal positiva de tu estado emocional.`
        : `El ${pct}% de tus registros reflejan ${label}. Observar este patrón es el primer paso para trabajarlo.`,
      type: isPositive ? 'positive' : 'neutral',
    });
  }

  // 3. Mood variability
  if (moodHistory.length >= 7) {
    const moods = moodHistory.map((d) => d.mood).filter((m) => m > 0);
    if (moods.length >= 5) {
      const mean = moods.reduce((s, v) => s + v, 0) / moods.length;
      const variance = moods.reduce((s, v) => s + (v - mean) ** 2, 0) / moods.length;
      const stdDev = Math.sqrt(variance);

      if (stdDev > 2.5) {
        insights.push({
          icon: <Lightbulb className="w-5 h-5" />,
          title: 'Ánimo variable',
          description: 'Tu ánimo varía bastante de un día a otro. Identificar qué situaciones o hábitos influyen puede ayudarte a encontrar más estabilidad.',
          type: 'warning',
        });
      } else if (stdDev < 1) {
        insights.push({
          icon: <Lightbulb className="w-5 h-5" />,
          title: 'Ánimo estable',
          description: 'Tu ánimo se mantiene bastante consistente. Esto indica una buena regulación emocional.',
          type: 'positive',
        });
      }
    }
  }

  // 4. High anxiety alert
  if (weeklyStats && weeklyStats.avgAnxiety > 6) {
    insights.push({
      icon: <AlertTriangle className="w-5 h-5" />,
      title: 'Ansiedad elevada',
      description: `Tu ansiedad promedio esta semana es ${weeklyStats.avgAnxiety}/10. Considerá hablar con la profesional o practicar técnicas de relajación.`,
      type: 'warning',
    });
  }

  // 5. Most used defense mechanism
  if (defenseData.length > 0) {
    const top = defenseData[0];
    const label = mechanismLabels[top.mechanism] || top.mechanism;
    const tip = mechanismTips[top.mechanism] || '';
    insights.push({
      icon: <Shield className="w-5 h-5" />,
      title: `Mecanismo frecuente: ${label}`,
      description: `Usaste ${label} ${top.count} veces en los últimos 30 días. ${tip}`,
      type: top.mechanism === 'sublimation' ? 'positive' : 'neutral',
    });
  }

  // 6. Low energy + low sleep
  if (weeklyStats && weeklyStats.avgEnergy < 5 && weeklyStats.avgSleep < 5) {
    insights.push({
      icon: <Zap className="w-5 h-5" />,
      title: 'Energía y sueño bajos',
      description: 'Tanto tu energía como tu calidad de sueño están por debajo de 5. Mejorar el descanso podría ayudar a recuperar energía.',
      type: 'warning',
    });
  }

  return insights.slice(0, 5);
}

const typeStyles = {
  positive: 'border-emerald-500/20 bg-emerald-500/5',
  neutral: 'border-cyan-500/20 bg-cyan-500/5',
  warning: 'border-orange-500/20 bg-orange-500/5',
};

const iconStyles = {
  positive: 'bg-emerald-500/10 text-emerald-400',
  neutral: 'bg-cyan-500/10 text-cyan-400',
  warning: 'bg-orange-500/10 text-orange-400',
};

export function PatternInsights(props: PatternInsightsProps) {
  const insights = generateInsights(props);

  if (insights.length === 0) {
    return (
      <div className="text-center py-8 text-zinc-500">
        Aún no hay suficientes datos para detectar patrones. Seguí registrando tu estado de ánimo.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {insights.map((insight, i) => (
        <Card key={i} className={typeStyles[insight.type]}>
          <CardContent className="py-4">
            <div className="flex gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconStyles[insight.type]}`}>
                {insight.icon}
              </div>
              <div>
                <h4 className="text-sm font-medium text-zinc-100 mb-1">{insight.title}</h4>
                <p className="text-sm text-zinc-400 leading-relaxed">{insight.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
