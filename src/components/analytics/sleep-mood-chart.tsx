'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { MoodDataPoint } from '@/lib/actions/analytics';

interface SleepMoodChartProps {
  data: MoodDataPoint[];
}

export function SleepMoodChart({ data }: SleepMoodChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-zinc-500">
        No hay datos suficientes para mostrar la correlación.
      </div>
    );
  }

  // Only show entries that have both mood and sleep data
  const chartData = data
    .filter((d) => d.mood > 0 && d.sleep > 0)
    .slice(-14); // Last 14 data points for readability

  if (chartData.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-zinc-500">
        No hay datos de sueño registrados para comparar.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
        <XAxis
          dataKey="date"
          stroke="#71717a"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          domain={[0, 10]}
          stroke="#71717a"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          ticks={[0, 2, 4, 6, 8, 10]}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#18181b',
            border: '1px solid #27272a',
            borderRadius: '12px',
            padding: '12px',
          }}
          labelStyle={{ color: '#a1a1aa', marginBottom: '8px' }}
        />
        <Legend
          wrapperStyle={{ paddingTop: '20px' }}
          formatter={(value) => <span className="text-zinc-400 text-sm">{value}</span>}
        />
        <Bar
          dataKey="mood"
          name="Ánimo"
          fill="#06b6d4"
          radius={[4, 4, 0, 0]}
          barSize={16}
        />
        <Bar
          dataKey="sleep"
          name="Sueño"
          fill="#818cf8"
          radius={[4, 4, 0, 0]}
          barSize={16}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
