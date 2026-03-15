import React from 'react';
import {
  PieChart as RePieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { CHART_COLORS } from '../../utils/constants';

const RADIAN = Math.PI / 180;
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.05) return null;
  const r = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const PieChart = ({
  data = [],
  nameKey = 'name',
  valueKey = 'value',
  title,
  height = 300,
  colors = CHART_COLORS,
}) => (
  <div>
    {title && <h4 className="text-sm font-semibold text-gray-700 mb-3">{title}</h4>}
    <ResponsiveContainer width="100%" height={height}>
      <RePieChart>
        <Pie
          data={data}
          dataKey={valueKey}
          nameKey={nameKey}
          cx="50%"
          cy="50%"
          outerRadius={100}
          labelLine={false}
          label={renderCustomLabel}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={colors[i % colors.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value, name) => [value.toLocaleString(), name]}
          contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
      </RePieChart>
    </ResponsiveContainer>
  </div>
);

export default PieChart;
