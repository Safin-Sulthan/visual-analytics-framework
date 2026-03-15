import React from 'react';
import {
  ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from 'recharts';

function TimeSeriesChartComponent({
  data = [],
  xKey = 'date',
  historicalKey = 'value',
  forecastKey = 'forecast',
  confidenceHighKey,
  confidenceLowKey,
  title,
  height = 320
}) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-500 text-sm">
        No time series data available
      </div>
    );
  }

  const forecastStart = data.findIndex(d => d[forecastKey] !== null && d[forecastKey] !== undefined && d[historicalKey] === null);

  return (
    <div>
      {title && <h3 className="text-sm font-medium text-slate-300 mb-3">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis
            dataKey={xKey}
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: '#334155' }}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={50}
          />
          <Tooltip
            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }}
          />
          <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />

          {/* Confidence interval area */}
          {confidenceHighKey && confidenceLowKey && (
            <Area
              dataKey={confidenceHighKey}
              fill="url(#confidenceGradient)"
              stroke="none"
              legendType="none"
            />
          )}

          {/* Historical line */}
          <Line
            type="monotone"
            dataKey={historicalKey}
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
            name="Historical"
            connectNulls={false}
          />

          {/* Forecast line */}
          <Line
            type="monotone"
            dataKey={forecastKey}
            stroke="#22c55e"
            strokeWidth={2}
            strokeDasharray="5 3"
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
            name="Forecast"
            connectNulls={false}
          />

          {/* Forecast boundary marker */}
          {forecastStart > 0 && (
            <ReferenceLine
              x={data[forecastStart]?.[xKey]}
              stroke="#64748b"
              strokeDasharray="3 3"
              label={{ value: 'Forecast', fill: '#64748b', fontSize: 10, position: 'top' }}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

export default TimeSeriesChartComponent;
