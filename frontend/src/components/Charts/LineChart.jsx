import React from 'react';
import {
  LineChart as ReLineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { CHART_COLORS } from '../../utils/constants';

const LineChart = ({
  data = [],
  xKey = 'x',
  yKeys = ['y'],
  title,
  height = 300,
  colors = CHART_COLORS,
}) => (
  <div>
    {title && <h4 className="text-sm font-semibold text-gray-700 mb-3">{title}</h4>}
    <ResponsiveContainer width="100%" height={height}>
      <ReLineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
        <XAxis dataKey={xKey} tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
        />
        {yKeys.length > 1 && <Legend wrapperStyle={{ fontSize: 12 }} />}
        {yKeys.map((key, i) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            stroke={colors[i % colors.length]}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        ))}
      </ReLineChart>
    </ResponsiveContainer>
  </div>
);

export default LineChart;
