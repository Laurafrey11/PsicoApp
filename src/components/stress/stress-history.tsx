'use client';

import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { AlertTriangle, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StressLog {
  id: string;
  intensity: number;
  situation: string;
  defense_mechanism: string | null;
  occurred_at: string;
}

interface StressHistoryProps {
  logs: StressLog[];
}

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

function getIntensityColor(intensity: number) {
  if (intensity <= 3) return 'bg-emerald-500';
  if (intensity <= 6) return 'bg-yellow-500';
  return 'bg-red-500';
}

export function StressHistory({ logs }: StressHistoryProps) {
  if (logs.length === 0) {
    return (
      <div className="text-center py-12 text-zinc-500">
        <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No hay episodios registrados.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {logs.map((log) => (
        <div
          key={log.id}
          className="flex items-center gap-4 p-4 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors"
        >
          {/* Intensity indicator */}
          <div
            className={cn(
              'w-3 h-3 rounded-full flex-shrink-0',
              getIntensityColor(log.intensity)
            )}
          />

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-zinc-200 truncate">{log.situation}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-zinc-500">
                {formatDistanceToNow(new Date(log.occurred_at), {
                  addSuffix: true,
                  locale: es,
                })}
              </span>
              {log.defense_mechanism && (
                <>
                  <span className="text-zinc-700">•</span>
                  <span className="text-xs text-orange-400">
                    {mechanismLabels[log.defense_mechanism] || log.defense_mechanism}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Intensity badge */}
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'text-sm font-medium px-2 py-1 rounded-lg',
                log.intensity <= 3 && 'bg-emerald-500/10 text-emerald-400',
                log.intensity > 3 && log.intensity <= 6 && 'bg-yellow-500/10 text-yellow-400',
                log.intensity > 6 && 'bg-red-500/10 text-red-400'
              )}
            >
              {log.intensity}/10
            </span>
            <ChevronRight className="w-4 h-4 text-zinc-600" />
          </div>
        </div>
      ))}
    </div>
  );
}
