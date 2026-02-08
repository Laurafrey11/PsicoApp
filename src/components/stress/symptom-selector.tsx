'use client';

import { cn } from '@/lib/utils';

interface SymptomSelectorProps {
  selected: string[];
  onChange: (symptoms: string[]) => void;
}

const symptoms = [
  { id: 'headache', label: 'Dolor de cabeza', emoji: '🤕' },
  { id: 'chest_tightness', label: 'Opresión en el pecho', emoji: '💔' },
  { id: 'rapid_heartbeat', label: 'Taquicardia', emoji: '💓' },
  { id: 'sweating', label: 'Sudoración', emoji: '💧' },
  { id: 'trembling', label: 'Temblores', emoji: '😰' },
  { id: 'nausea', label: 'Náuseas', emoji: '🤢' },
  { id: 'muscle_tension', label: 'Tensión muscular', emoji: '💪' },
  { id: 'fatigue', label: 'Fatiga', emoji: '😴' },
  { id: 'difficulty_breathing', label: 'Dificultad para respirar', emoji: '😮‍💨' },
  { id: 'dizziness', label: 'Mareos', emoji: '😵' },
  { id: 'stomach_pain', label: 'Dolor de estómago', emoji: '🤮' },
  { id: 'insomnia', label: 'Insomnio', emoji: '🌙' },
];

export function SymptomSelector({ selected, onChange }: SymptomSelectorProps) {
  function toggleSymptom(symptomId: string) {
    if (selected.includes(symptomId)) {
      onChange(selected.filter(s => s !== symptomId));
    } else {
      onChange([...selected, symptomId]);
    }
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {symptoms.map((symptom) => (
        <button
          key={symptom.id}
          type="button"
          onClick={() => toggleSymptom(symptom.id)}
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-xl border text-left transition-all text-sm',
            selected.includes(symptom.id)
              ? 'bg-orange-500/20 border-orange-500 text-orange-300'
              : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-600'
          )}
        >
          <span>{symptom.emoji}</span>
          <span className="truncate">{symptom.label}</span>
        </button>
      ))}
    </div>
  );
}
