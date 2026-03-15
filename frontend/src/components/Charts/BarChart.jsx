import React from 'react';
import {
  BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { CHART_COLORS } from '../../utils/constants';

const BarChart = ({
  data = [],
  xKey = 'x',
  yKeys = ['y'],
  title,
  height = 300,
  colors = CHART_COLORS,
  layout = 'horizontal',
}) => (
  <div>
    {title && <h4 className="text-sm font-semibold text-gray-700 mb-3">{title}</h4>}
    <ResponsiveContainer width="100%" height={height}>
      <ReBarChart data={data} layout={layout} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
        {layout === 'horizontal' ? (
          <>
            <XAxis dataKey={xKey} tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
          </>
        ) : (
          <>
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis dataKey={xKey} type="category" tick={{ fontSize: 11 }} width={80} />
          </>
        )}
        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }} />
        {yKeys.length > 1 && <Legend wrapperStyle={{ fontSize: 12 }} />}
        {yKeys.map((key, i) => (
          <Bar key={key} dataKey={key} fill={colors[i % colors.length]} radius={[4, 4, 0, 0]} />
        ))}
      </ReBarChart>
    </ResponsiveContainer>
  </div>
);

export default BarChart;
