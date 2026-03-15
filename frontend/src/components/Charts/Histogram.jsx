import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { CHART_COLORS } from '../../utils/constants';

const Histogram = ({
  data = [],
  xKey = 'bin',
  yKey = 'count',
  title,
  height = 300,
  color = CHART_COLORS[2],
}) => (
  <div>
    {title && <h4 className="text-sm font-semibold text-gray-700 mb-3">{title}</h4>}
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} barCategoryGap="2%" margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
        <XAxis dataKey={xKey} tick={{ fontSize: 10 }} interval="preserveStartEnd" />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
          formatter={(v) => [v, 'Count']}
        />
        <Bar dataKey={yKey} fill={color} radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

export default Histogram;
