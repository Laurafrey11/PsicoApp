'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import type { EmotionType } from '@/types/database';

interface EmotionSelectorProps {
  value: EmotionType | null;
  onChange: (emotion: EmotionType) => void;
}

const emotions: { type: EmotionType; emoji: string; color: string }[] = [
  { type: 'joy', emoji: '😊', color: 'hover:bg-yellow-500/20 data-[selected=true]:bg-yellow-500/20 data-[selected=true]:border-yellow-500' },
  { type: 'calm', emoji: '😌', color: 'hover:bg-emerald-500/20 data-[selected=true]:bg-emerald-500/20 data-[selected=true]:border-emerald-500' },
  { type: 'hope', emoji: '🌟', color: 'hover:bg-cyan-500/20 data-[selected=true]:bg-cyan-500/20 data-[selected=true]:border-cyan-500' },
  { type: 'sadness', emoji: '😢', color: 'hover:bg-blue-500/20 data-[selected=true]:bg-blue-500/20 data-[selected=true]:border-blue-500' },
  { type: 'anxiety', emoji: '😰', color: 'hover:bg-orange-500/20 data-[selected=true]:bg-orange-500/20 data-[selected=true]:border-orange-500' },
  { type: 'frustration', emoji: '😤', color: 'hover:bg-red-400/20 data-[selected=true]:bg-red-400/20 data-[selected=true]:border-red-400' },
  { type: 'anger', emoji: '😠', color: 'hover:bg-red-500/20 data-[selected=true]:bg-red-500/20 data-[selected=true]:border-red-500' },
  { type: 'fear', emoji: '😨', color: 'hover:bg-purple-500/20 data-[selected=true]:bg-purple-500/20 data-[selected=true]:border-purple-500' },
  { type: 'surprise', emoji: '😲', color: 'hover:bg-pink-500/20 data-[selected=true]:bg-pink-500/20 data-[selected=true]:border-pink-500' },
  { type: 'disgust', emoji: '🤢', color: 'hover:bg-green-600/20 data-[selected=true]:bg-green-600/20 data-[selected=true]:border-green-600' },
];

export function EmotionSelector({ value, onChange }: EmotionSelectorProps) {
  const t = useTranslations('mood.emotions');

  return (
    <div className="grid grid-cols-5 gap-3">
      {emotions.map((emotion) => (
        <button
          key={emotion.type}
          type="button"
          data-selected={value === emotion.type}
          onClick={() => onChange(emotion.type)}
          className={cn(
            'flex flex-col items-center gap-2 p-4 rounded-xl border border-zinc-700 transition-all',
            emotion.color
          )}
        >
          <span className="text-3xl">{emotion.emoji}</span>
          <span className="text-xs text-zinc-400">{t(emotion.type)}</span>
        </button>
      ))}
    </div>
  );
}
