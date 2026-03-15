import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import { generateColors } from '../utils/chartHelpers';

function BarChartComponent({ data = [], xKey = 'x', yKeys = ['y'], title, colors, height = 300, stacked = false }) {
  const chartColors = colors || generateColors(yKeys.length);

  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-500 text-sm">
        No data available
      </div>
    );
  }

  return (
    <div>
      {title && <h3 className="text-sm font-medium text-slate-300 mb-3">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis
            dataKey={xKey}
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: '#334155' }}
          />
          <YAxis
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            width={50}
          />
          <Tooltip
            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }}
            cursor={{ fill: 'rgba(59,130,246,0.08)' }}
          />
          {yKeys.length > 1 && <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />}
          {yKeys.map((key, i) => (
            <Bar
              key={key}
              dataKey={key}
              fill={chartColors[i]}
              radius={[3, 3, 0, 0]}
              stackId={stacked ? 'stack' : undefined}
            >
              {yKeys.length === 1 && data.map((_, idx) => (
                <Cell key={idx} fill={chartColors[idx % chartColors.length]} />
              ))}
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default BarChartComponent;
