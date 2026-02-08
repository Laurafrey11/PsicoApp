'use client';

import { cn } from '@/lib/utils';

interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  showValue?: boolean;
  colorScale?: 'mood' | 'energy' | 'anxiety' | 'sleep';
  className?: string;
}

const colorScales = {
  mood: {
    gradient: 'from-red-500 via-yellow-500 to-emerald-500',
    thumb: (v: number) =>
      v <= 3 ? 'bg-red-500' : v <= 6 ? 'bg-yellow-500' : 'bg-emerald-500',
  },
  energy: {
    gradient: 'from-slate-500 via-cyan-500 to-cyan-400',
    thumb: (v: number) =>
      v <= 3 ? 'bg-slate-500' : v <= 6 ? 'bg-cyan-600' : 'bg-cyan-400',
  },
  anxiety: {
    gradient: 'from-emerald-500 via-orange-500 to-red-500',
    thumb: (v: number) =>
      v <= 3 ? 'bg-emerald-500' : v <= 6 ? 'bg-orange-500' : 'bg-red-500',
  },
  sleep: {
    gradient: 'from-red-500 via-blue-500 to-indigo-400',
    thumb: (v: number) =>
      v <= 3 ? 'bg-red-500' : v <= 6 ? 'bg-blue-500' : 'bg-indigo-400',
  },
};

export function Slider({
  value,
  onChange,
  min = 1,
  max = 10,
  step = 1,
  label,
  showValue = true,
  colorScale = 'mood',
  className,
}: SliderProps) {
  const scale = colorScales[colorScale];
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={cn('space-y-3', className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between">
          {label && (
            <label className="text-sm font-medium text-zinc-300">{label}</label>
          )}
          {showValue && (
            <span
              className={cn(
                'text-2xl font-bold tabular-nums',
                scale.thumb(value).replace('bg-', 'text-')
              )}
            >
              {value}
            </span>
          )}
        </div>
      )}

      <div className="relative h-3">
        {/* Track background */}
        <div
          className={cn(
            'absolute inset-0 rounded-full bg-gradient-to-r opacity-30',
            scale.gradient
          )}
        />

        {/* Track filled */}
        <div
          className={cn(
            'absolute inset-y-0 left-0 rounded-full bg-gradient-to-r',
            scale.gradient
          )}
          style={{ width: `${percentage}%` }}
        />

        {/* Input range */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        {/* Thumb */}
        <div
          className={cn(
            'absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full shadow-lg border-2 border-white transition-all',
            scale.thumb(value)
          )}
          style={{ left: `calc(${percentage}% - 12px)` }}
        />
      </div>

      {/* Scale labels */}
      <div className="flex justify-between text-xs text-zinc-500">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
