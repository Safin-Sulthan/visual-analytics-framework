import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';

function HistogramComponent({ data = [], xKey = 'x', yKey = 'count', title, color = '#3b82f6', height = 280 }) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-500 text-sm">
        No data available
      </div>
    );
  }

  return (
    <div>
      {title && <h3 className="text-sm font-medium text-slate-300 mb-2">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }} barCategoryGap={1}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis
            dataKey={xKey}
            tick={{ fill: '#94a3b8', fontSize: 10 }}
            tickLine={false}
            axisLine={{ stroke: '#334155' }}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: '#94a3b8', fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            width={35}
          />
          <Tooltip
            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9', fontSize: 12 }}
            cursor={{ fill: 'rgba(59,130,246,0.1)' }}
            formatter={(value) => [value, 'Count']}
          />
          <Bar dataKey={yKey} fill={color} radius={0} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default HistogramComponent;
