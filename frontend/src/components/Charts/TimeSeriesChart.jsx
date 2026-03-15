import React, { useState } from 'react';
import {
  ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceArea, Brush,
} from 'recharts';
import { CHART_COLORS } from '../../utils/constants';

const TimeSeriesChart = ({
  data = [],
  xKey = 'date',
  yKeys = ['value'],
  title,
  height = 300,
  colors = CHART_COLORS,
  showBrush = true,
  areaFill = false,
}) => (
  <div>
    {title && <h4 className="text-sm font-semibold text-gray-700 mb-3">{title}</h4>}
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: showBrush ? 30 : 5 }}>
        <defs>
          {yKeys.map((key, i) => (
            <linearGradient key={key} id={`grad-${key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={colors[i % colors.length]} stopOpacity={0.15} />
              <stop offset="95%" stopColor={colors[i % colors.length]} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
        <XAxis
          dataKey={xKey}
          tick={{ fontSize: 10 }}
          interval="preserveStartEnd"
        />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
        />
        {yKeys.length > 1 && <Legend wrapperStyle={{ fontSize: 12 }} />}
        {yKeys.map((key, i) => (
          <React.Fragment key={key}>
            {areaFill && (
              <Area
                type="monotone"
                dataKey={key}
                stroke="none"
                fill={`url(#grad-${key})`}
              />
            )}
            <Line
              type="monotone"
              dataKey={key}
              stroke={colors[i % colors.length]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </React.Fragment>
        ))}
        {showBrush && data.length > 30 && (
          <Brush dataKey={xKey} height={20} stroke="#e5e7eb" travellerWidth={6} />
        )}
      </ComposedChart>
    </ResponsiveContainer>
  </div>
);

export default TimeSeriesChart;
