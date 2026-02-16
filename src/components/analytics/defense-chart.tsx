'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface DefenseData {
  mechanism: string;
  count: number;
}

interface DefenseChartProps {
  data: DefenseData[];
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

const mechanismColors: Record<string, string> = {
  denial: '#f87171',
  projection: '#fb923c',
  rationalization: '#fbbf24',
  displacement: '#a78bfa',
  sublimation: '#34d399',
  repression: '#60a5fa',
  regression: '#f472b6',
  reaction_formation: '#818cf8',
};

const mechanismDescriptions: Record<string, string> = {
  denial: 'Minimizar o negar el impacto emocional de una situación.',
  projection: 'Atribuir sentimientos propios a otras personas.',
  rationalization: 'Buscar explicaciones lógicas para justificar emociones.',
  displacement: 'Redirigir emociones hacia un objetivo más seguro.',
  sublimation: 'Canalizar emociones hacia actividades productivas.',
  repression: 'Bloquear pensamientos o recuerdos difíciles.',
  regression: 'Volver a comportamientos de etapas anteriores.',
  reaction_formation: 'Expresar lo opuesto de lo que se siente.',
};

export function DefenseChart({ data }: DefenseChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-[250px] flex items-center justify-center text-zinc-500">
        No hay datos de mecanismos de defensa registrados.
      </div>
    );
  }

  const chartData = data.slice(0, 6).map((item) => ({
    name: mechanismLabels[item.mechanism] || item.mechanism,
    value: item.count,
    color: mechanismColors[item.mechanism] || '#71717a',
    key: item.mechanism,
  }));

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
          <XAxis
            type="number"
            stroke="#71717a"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            stroke="#71717a"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            width={120}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#18181b',
              border: '1px solid #27272a',
              borderRadius: '12px',
              padding: '12px',
            }}
            formatter={(value) => [`${value} veces`, 'Frecuencia']}
          />
          <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={20}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Top mechanism description */}
      {data.length > 0 && mechanismDescriptions[data[0].mechanism] && (
        <div className="bg-zinc-800/50 rounded-lg p-3">
          <p className="text-xs text-zinc-500 mb-1">Más frecuente:</p>
          <p className="text-sm text-zinc-300">
            <strong className="text-zinc-100">{mechanismLabels[data[0].mechanism]}</strong>
            {' — '}
            {mechanismDescriptions[data[0].mechanism]}
          </p>
        </div>
      )}
    </div>
  );
}
