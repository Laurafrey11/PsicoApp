'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { MoodDataPoint } from '@/lib/actions/analytics';

interface MoodChartProps {
  data: MoodDataPoint[];
  showEnergy?: boolean;
  showAnxiety?: boolean;
  showSleep?: boolean;
}

export function MoodChart({
  data,
  showEnergy = true,
  showAnxiety = true,
  showSleep = true,
}: MoodChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-zinc-500">
        No hay datos suficientes para mostrar el gráfico.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
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
          itemStyle={{ padding: '2px 0' }}
        />
        <Legend
          wrapperStyle={{ paddingTop: '20px' }}
          formatter={(value) => <span className="text-zinc-400 text-sm">{value}</span>}
        />

        <Line
          type="monotone"
          dataKey="mood"
          name="Ánimo"
          stroke="#06b6d4"
          strokeWidth={2}
          dot={{ fill: '#06b6d4', strokeWidth: 0, r: 4 }}
          activeDot={{ r: 6, fill: '#06b6d4' }}
        />

        {showEnergy && (
          <Line
            type="monotone"
            dataKey="energy"
            name="Energía"
            stroke="#2dd4bf"
            strokeWidth={2}
            dot={{ fill: '#2dd4bf', strokeWidth: 0, r: 3 }}
            activeDot={{ r: 5, fill: '#2dd4bf' }}
          />
        )}

        {showAnxiety && (
          <Line
            type="monotone"
            dataKey="anxiety"
            name="Ansiedad"
            stroke="#fb923c"
            strokeWidth={2}
            dot={{ fill: '#fb923c', strokeWidth: 0, r: 3 }}
            activeDot={{ r: 5, fill: '#fb923c' }}
          />
        )}

        {showSleep && (
          <Line
            type="monotone"
            dataKey="sleep"
            name="Sueño"
            stroke="#818cf8"
            strokeWidth={2}
            dot={{ fill: '#818cf8', strokeWidth: 0, r: 3 }}
            activeDot={{ r: 5, fill: '#818cf8' }}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}
