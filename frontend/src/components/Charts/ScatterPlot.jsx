import React from 'react';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ZAxis,
} from 'recharts';
import { CHART_COLORS } from '../../utils/constants';

const ScatterPlot = ({
  data = [],
  xKey = 'x',
  yKey = 'y',
  title,
  height = 300,
  color = CHART_COLORS[0],
}) => (
  <div>
    {title && <h4 className="text-sm font-semibold text-gray-700 mb-3">{title}</h4>}
    <ResponsiveContainer width="100%" height={height}>
      <ScatterChart margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
        <XAxis dataKey={xKey} name={xKey} tick={{ fontSize: 11 }} />
        <YAxis dataKey={yKey} name={yKey} tick={{ fontSize: 11 }} />
        <ZAxis range={[40, 40]} />
        <Tooltip
          cursor={{ strokeDasharray: '3 3' }}
          contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
          formatter={(value, name) => [Number(value).toFixed(3), name]}
        />
        <Scatter data={data} fill={color} fillOpacity={0.7} />
      </ScatterChart>
    </ResponsiveContainer>
  </div>
);

export default ScatterPlot;
