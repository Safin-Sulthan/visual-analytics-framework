import React from 'react';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ZAxis, Legend, Cell
} from 'recharts';
import { generateColors } from '../utils/chartHelpers';

function ClusterChartComponent({ data = [], xKey = 'x', yKey = 'y', clusterKey = 'cluster', title, height = 350 }) {
  const clusters = [...new Set(data.map(d => d[clusterKey]))].sort();
  const colors = generateColors(clusters.length);
  const colorMap = Object.fromEntries(clusters.map((c, i) => [c, colors[i]]));

  const clusterData = clusters.map(c => ({
    name: `Cluster ${c}`,
    data: data.filter(d => d[clusterKey] === c)
  }));

  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-500 text-sm">
        No cluster data available
      </div>
    );
  }

  return (
    <div>
      {title && <h3 className="text-sm font-medium text-slate-300 mb-3">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <ScatterChart margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis
            dataKey={xKey}
            type="number"
            name={xKey}
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: '#334155' }}
          />
          <YAxis
            dataKey={yKey}
            type="number"
            name={yKey}
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            width={50}
          />
          <ZAxis range={[25, 25]} />
          <Tooltip
            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }}
            cursor={{ strokeDasharray: '3 3', stroke: '#334155' }}
          />
          <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
          {clusterData.map(({ name, data: cData }, i) => (
            <Scatter
              key={name}
              name={name}
              data={cData}
              fill={colors[i]}
              fillOpacity={0.75}
            />
          ))}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ClusterChartComponent;
