'use client';

import { Heart, Battery, Moon, Activity } from 'lucide-react';
import { Card, CardContent } from '@/components/ui';

interface WellnessIndicator {
  label: string;
  value: number; // 0-100
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

function IndicatorBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-1000 ${color}`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

function getLabel(value: number): string {
  if (value >= 80) return 'Excelente';
  if (value >= 60) return 'Bueno';
  if (value >= 40) return 'Moderado';
  if (value >= 20) return 'Bajo';
  return 'Necesita atención';
}

export function WellnessIndicators() {
  // Valores de ejemplo - en producción vendrían de los mood_entries del usuario
  const indicators: WellnessIndicator[] = [
    {
      label: 'Estado emocional',
      value: 65,
      icon: <Heart className="w-5 h-5" />,
      color: 'bg-cyan-500',
      bgColor: 'bg-cyan-500/10 text-cyan-500',
    },
    {
      label: 'Energía',
      value: 55,
      icon: <Battery className="w-5 h-5" />,
      color: 'bg-emerald-500',
      bgColor: 'bg-emerald-500/10 text-emerald-500',
    },
    {
      label: 'Calidad de sueño',
      value: 70,
      icon: <Moon className="w-5 h-5" />,
      color: 'bg-indigo-500',
      bgColor: 'bg-indigo-500/10 text-indigo-500',
    },
    {
      label: 'Manejo del estrés',
      value: 45,
      icon: <Activity className="w-5 h-5" />,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-500/10 text-orange-500',
    },
  ];

  // Promedio general
  const overallScore = Math.round(
    indicators.reduce((sum, i) => sum + i.value, 0) / indicators.length
  );

  return (
    <div className="space-y-4">
      {/* Score general */}
      <Card className="border-cyan-500/20">
        <CardContent className="py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-zinc-100">Bienestar General</h3>
              <p className="text-sm text-zinc-500">{getLabel(overallScore)}</p>
            </div>
            <div className="text-4xl font-bold text-cyan-500">{overallScore}</div>
          </div>
          <IndicatorBar value={overallScore} color="bg-gradient-to-r from-cyan-500 to-teal-400" />
        </CardContent>
      </Card>

      {/* Indicadores individuales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {indicators.map((indicator) => (
          <Card key={indicator.label}>
            <CardContent className="py-4">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${indicator.bgColor}`}>
                  {indicator.icon}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-zinc-300">{indicator.label}</p>
                  <p className="text-xs text-zinc-500">{getLabel(indicator.value)}</p>
                </div>
                <span className="text-lg font-semibold text-zinc-200">{indicator.value}</span>
              </div>
              <IndicatorBar value={indicator.value} color={indicator.color} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
