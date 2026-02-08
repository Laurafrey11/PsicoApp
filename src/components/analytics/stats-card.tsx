import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'stable';
  trendLabel?: string;
  icon?: React.ReactNode;
  color?: 'cyan' | 'teal' | 'orange' | 'indigo' | 'emerald' | 'red';
}

const colorClasses = {
  cyan: 'bg-cyan-500/10 text-cyan-500',
  teal: 'bg-teal-500/10 text-teal-400',
  orange: 'bg-orange-500/10 text-orange-400',
  indigo: 'bg-indigo-500/10 text-indigo-400',
  emerald: 'bg-emerald-500/10 text-emerald-400',
  red: 'bg-red-500/10 text-red-400',
};

export function StatsCard({
  title,
  value,
  subtitle,
  trend,
  trendLabel,
  icon,
  color = 'cyan',
}: StatsCardProps) {
  return (
    <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
      <div className="flex items-start justify-between mb-4">
        <p className="text-sm text-zinc-400">{title}</p>
        {icon && (
          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', colorClasses[color])}>
            {icon}
          </div>
        )}
      </div>

      <div className="space-y-1">
        <p className="text-3xl font-bold text-zinc-100">{value}</p>

        {(trend || subtitle) && (
          <div className="flex items-center gap-2">
            {trend && (
              <span
                className={cn(
                  'flex items-center gap-1 text-sm',
                  trend === 'up' && 'text-emerald-400',
                  trend === 'down' && 'text-red-400',
                  trend === 'stable' && 'text-zinc-500'
                )}
              >
                {trend === 'up' && <TrendingUp className="w-4 h-4" />}
                {trend === 'down' && <TrendingDown className="w-4 h-4" />}
                {trend === 'stable' && <Minus className="w-4 h-4" />}
                {trendLabel}
              </span>
            )}
            {subtitle && <span className="text-sm text-zinc-500">{subtitle}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
