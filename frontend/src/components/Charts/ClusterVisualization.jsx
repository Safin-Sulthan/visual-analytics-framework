import React from 'react';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, Legend,
} from 'recharts';
import { CHART_COLORS } from '../../utils/constants';

const ClusterVisualization = ({
  data = [],
  xKey = 'x',
  yKey = 'y',
  clusterKey = 'cluster',
  title,
  height = 340,
}) => {
  const clusterIds = [...new Set(data.map((d) => d[clusterKey]))].sort();
  const colorMap = Object.fromEntries(
    clusterIds.map((id, i) => [id, CHART_COLORS[i % CHART_COLORS.length]])
  );

  // Group data by cluster for separate Scatter components (to show legend)
  const grouped = clusterIds.map((id) => ({
    id,
    color: colorMap[id],
    points: data.filter((d) => d[clusterKey] === id),
  }));

  return (
    <div>
      {title && <h4 className="text-sm font-semibold text-gray-700 mb-3">{title}</h4>}
      <ResponsiveContainer width="100%" height={height}>
        <ScatterChart margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis dataKey={xKey} name={xKey} tick={{ fontSize: 11 }} />
          <YAxis dataKey={yKey} name={yKey} tick={{ fontSize: 11 }} />
          <Tooltip
            cursor={{ strokeDasharray: '3 3' }}
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {grouped.map(({ id, color, points }) => (
            <Scatter
              key={id}
              name={`Cluster ${id}`}
              data={points}
              fill={color}
              fillOpacity={0.75}
            />
          ))}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ClusterVisualization;
