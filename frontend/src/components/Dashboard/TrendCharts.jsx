import React from 'react';
import Card from '../common/Card';
import TimeSeriesChart from '../Charts/TimeSeriesChart';

const TrendCharts = ({ data = [] }) => {
  // Placeholder trend data when no real data is available
  const placeholderData = Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value: Math.floor(Math.random() * 60 + 40),
    baseline: 50,
  }));

  const chartData = data.length ? data : placeholderData;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card title="Dataset Activity (30 days)" subtitle="Upload and analysis trends">
        <TimeSeriesChart
          data={chartData}
          xKey="date"
          yKeys={['value']}
          height={220}
        />
      </Card>

      <Card title="Insight Score Trends" subtitle="Average insight quality over time">
        <TimeSeriesChart
          data={chartData.map((d) => ({ ...d, score: Math.min(1, d.value / 100) }))}
          xKey="date"
          yKeys={['score']}
          height={220}
          colors={['#22c55e']}
        />
      </Card>
    </div>
  );
};

export default TrendCharts;
