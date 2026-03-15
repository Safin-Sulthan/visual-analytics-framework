import React, { useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { useAnalytics } from '../hooks/useAnalytics';
import Card from '../components/common/Card';
import TimeSeriesChart from '../components/Charts/TimeSeriesChart';
import AlertsPanel from '../components/Dashboard/AlertsPanel';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Monitoring = () => {
  const { currentDataset } = useAppContext();
  const { monitoring, loading, fetchMonitoring } = useAnalytics(currentDataset?._id);

  useEffect(() => {
    if (currentDataset?._id) fetchMonitoring();
  }, [currentDataset?._id]);

  if (!currentDataset) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-gray-500 font-medium">No dataset selected.</p>
      </div>
    );
  }

  if (loading) return <div className="flex justify-center py-16"><LoadingSpinner size="xl" /></div>;

  return (
    <div className="space-y-6 fade-in">
      <h2 className="text-xl font-bold text-gray-900">Monitoring — {currentDataset.name}</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {['trend_direction', 'growth_rate', 'seasonality'].map((key) => (
          <div key={key} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
              {key.replace('_', ' ')}
            </p>
            <p className="text-xl font-bold text-gray-900">
              {monitoring?.[key] ?? '—'}
            </p>
          </div>
        ))}
      </div>

      <Card title="Temporal Trends" subtitle="Value changes over time">
        <TimeSeriesChart
          data={monitoring?.trends ?? []}
          xKey="date"
          yKeys={['value', 'baseline']}
          height={280}
          areaFill
        />
      </Card>

      <AlertsPanel alerts={monitoring?.alerts ?? []} />
    </div>
  );
};

export default Monitoring;
