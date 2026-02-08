'use client';

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import type { EmotionCount } from '@/lib/actions/analytics';

interface EmotionChartProps {
  data: EmotionCount[];
}

const emotionColors: Record<string, string> = {
  joy: '#fbbf24',
  calm: '#34d399',
  hope: '#06b6d4',
  sadness: '#60a5fa',
  anxiety: '#fb923c',
  frustration: '#f87171',
  anger: '#ef4444',
  fear: '#a78bfa',
  surprise: '#ec4899',
  disgust: '#22c55e',
};

const emotionLabels: Record<string, string> = {
  joy: 'Alegría',
  calm: 'Calma',
  hope: 'Esperanza',
  sadness: 'Tristeza',
  anxiety: 'Ansiedad',
  frustration: 'Frustración',
  anger: 'Ira',
  fear: 'Miedo',
  surprise: 'Sorpresa',
  disgust: 'Desagrado',
};

export function EmotionChart({ data }: EmotionChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-[250px] flex items-center justify-center text-zinc-500">
        No hay datos de emociones registradas.
      </div>
    );
  }

  const chartData = data.map((item) => ({
    name: emotionLabels[item.emotion] || item.emotion,
    value: item.count,
    color: emotionColors[item.emotion] || '#71717a',
  }));

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={80}
          paddingAngle={2}
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: '#18181b',
            border: '1px solid #27272a',
            borderRadius: '12px',
            padding: '12px',
          }}
          formatter={(value) => [`${value} registros`, '']}
        />
        <Legend
          layout="vertical"
          align="right"
          verticalAlign="middle"
          formatter={(value) => <span className="text-zinc-400 text-sm">{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
