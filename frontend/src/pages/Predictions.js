import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import TimeSeriesChartComponent from '../charts/TimeSeriesChartComponent';
import ClusterChartComponent from '../charts/ClusterChartComponent';
import ScatterPlotComponent from '../charts/ScatterPlotComponent';
import LineChartComponent from '../charts/LineChartComponent';
import { useData } from '../context/DataContext';
import analyticsService from '../services/analyticsService';
import { formatNumber } from '../utils/formatters';
import { TrendingUp, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

function Predictions() {
  const { datasets, currentDataset, setCurrentDataset } = useData();
  const [timeSeries, setTimeSeries] = useState(null);
  const [clusters, setClusters] = useState(null);
  const [anomalies, setAnomalies] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadPredictions = async (dataset) => {
    if (!dataset) return;
    setLoading(true);
    try {
      const [tsRes, clRes, anRes] = await Promise.allSettled([
        analyticsService.getTimeSeries(dataset.id),
        analyticsService.getClusters(dataset.id),
        analyticsService.getAnomalies(dataset.id)
      ]);
      if (tsRes.status === 'fulfilled') setTimeSeries(tsRes.value);
      if (clRes.status === 'fulfilled') setClusters(clRes.value);
      if (anRes.status === 'fulfilled') setAnomalies(anRes.value);
    } catch {
      toast.error('Failed to load prediction data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentDataset) loadPredictions(currentDataset);
  }, [currentDataset]);

  const anomalyCount = anomalies?.anomalies?.length || anomalies?.count || 0;

  return (
    <Layout title="Predictions">
      <div className="space-y-6">
        {/* Dataset selector */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <div className="flex flex-wrap items-center gap-4">
            <label className="text-sm font-medium text-slate-300">Dataset:</label>
            <select
              value={currentDataset?.id || ''}
              onChange={e => {
                const ds = datasets.find(d => String(d.id) === e.target.value);
                setCurrentDataset(ds || null);
              }}
              className="flex-1 max-w-xs bg-slate-700 border border-slate-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a dataset...</option>
              {datasets.map(ds => <option key={ds.id} value={ds.id}>{ds.name}</option>)}
            </select>
          </div>
        </div>

        {!currentDataset ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <TrendingUp className="w-16 h-16 mb-4 opacity-30" />
            <p className="text-lg font-medium text-slate-400">Select a dataset to view predictions</p>
          </div>
        ) : loading ? (
          <LoadingSpinner message="Computing predictions..." />
        ) : (
          <>
            {/* Anomaly summary */}
            {anomalies && (
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-red-900/30 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-white">Anomaly Detection</h2>
                    <p className="text-sm text-slate-400">
                      {anomalyCount} anomalies detected
                      {anomalies.total && ` out of ${formatNumber(anomalies.total, 0)} records`}
                    </p>
                  </div>
                </div>
                {anomalies.anomalies && anomalies.anomalies.length > 0 && (
                  <ScatterPlotComponent
                    data={anomalies.anomalies}
                    xKey={anomalies.x_key || 'x'}
                    yKey={anomalies.y_key || 'y'}
                    title="Anomaly Distribution"
                    color="#ef4444"
                    height={260}
                  />
                )}
              </div>
            )}

            {/* Time series forecast */}
            {timeSeries && (
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
                <h2 className="text-base font-semibold text-white mb-4">Time Series Forecast</h2>
                <TimeSeriesChartComponent
                  data={timeSeries.data || timeSeries}
                  xKey={timeSeries.x_key || 'date'}
                  historicalKey={timeSeries.historical_key || 'value'}
                  forecastKey={timeSeries.forecast_key || 'forecast'}
                  height={300}
                />
                {timeSeries.metrics && (
                  <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-700">
                    {Object.entries(timeSeries.metrics).slice(0, 3).map(([k, v]) => (
                      <div key={k} className="text-center">
                        <p className="text-xs text-slate-400 uppercase">{k.toUpperCase()}</p>
                        <p className="text-lg font-bold text-white mt-1">{formatNumber(v, 4)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Clusters */}
            {clusters && (
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
                <h2 className="text-base font-semibold text-white mb-4">Cluster Analysis</h2>
                <ClusterChartComponent
                  data={clusters.data || clusters}
                  xKey={clusters.x_key || 'x'}
                  yKey={clusters.y_key || 'y'}
                  clusterKey={clusters.cluster_key || 'cluster'}
                  height={340}
                />
                {clusters.summary && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-slate-700">
                    {Object.entries(clusters.summary).slice(0, 4).map(([k, v]) => (
                      <div key={k} className="text-center">
                        <p className="text-xs text-slate-400">{k}</p>
                        <p className="text-base font-semibold text-white mt-1">{String(v)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {!timeSeries && !clusters && !anomalies && (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                <AlertCircle className="w-12 h-12 mb-3 opacity-40" />
                <p className="text-slate-400">No prediction data available for this dataset.</p>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}

export default Predictions;
