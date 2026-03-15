import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import SummaryCard from '../components/SummaryCard';
import LoadingSpinner from '../components/LoadingSpinner';
import HeatmapComponent from '../charts/HeatmapComponent';
import HistogramComponent from '../charts/HistogramComponent';
import BarChartComponent from '../charts/BarChartComponent';
import { useData } from '../context/DataContext';
import analyticsService from '../services/analyticsService';
import { formatNumber, formatPercent, formatColumnName } from '../utils/formatters';
import { BarChart2, Hash, Percent, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

function Analytics() {
  const { datasets, currentDataset, setCurrentDataset } = useData();
  const [eda, setEda] = useState(null);
  const [correlation, setCorrelation] = useState(null);
  const [distributions, setDistributions] = useState(null);
  const [categorical, setCategorical] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadAnalytics = async (dataset) => {
    if (!dataset) return;
    setLoading(true);
    try {
      const [edaData, corrData, distData, catData] = await Promise.allSettled([
        analyticsService.getEDA(dataset.id),
        analyticsService.getCorrelation(dataset.id),
        analyticsService.getDistributions(dataset.id),
        analyticsService.getCategoricalStats(dataset.id)
      ]);
      if (edaData.status === 'fulfilled') setEda(edaData.value);
      if (corrData.status === 'fulfilled') setCorrelation(corrData.value);
      if (distData.status === 'fulfilled') setDistributions(distData.value);
      if (catData.status === 'fulfilled') setCategorical(catData.value);
    } catch {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentDataset) loadAnalytics(currentDataset);
  }, [currentDataset]);

  const edaColumns = eda ? Object.keys(eda) : [];
  const numericColumns = edaColumns.filter(c => eda[c]?.dtype !== 'object' && eda[c]?.mean !== undefined);

  return (
    <Layout title="Analytics">
      <div className="space-y-6">
        {/* Dataset Selector */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <div className="flex flex-wrap items-center gap-4">
            <label className="text-sm font-medium text-slate-300">Analyze Dataset:</label>
            <select
              value={currentDataset?.id || ''}
              onChange={e => {
                const ds = datasets.find(d => String(d.id) === e.target.value);
                setCurrentDataset(ds || null);
              }}
              className="flex-1 max-w-xs bg-slate-700 border border-slate-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a dataset...</option>
              {datasets.map(ds => (
                <option key={ds.id} value={ds.id}>{ds.name}</option>
              ))}
            </select>
          </div>
        </div>

        {!currentDataset ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <BarChart2 className="w-16 h-16 mb-4 opacity-30" />
            <p className="text-lg font-medium text-slate-400">Select a dataset to analyze</p>
            <p className="text-sm mt-1">Choose from your uploaded datasets above</p>
          </div>
        ) : loading ? (
          <LoadingSpinner message="Running analysis..." />
        ) : (
          <>
            {/* EDA Stats */}
            {eda && numericColumns.length > 0 && (
              <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-700">
                  <h2 className="text-base font-semibold text-white">Exploratory Data Analysis</h2>
                  <p className="text-sm text-slate-400 mt-0.5">{numericColumns.length} numeric columns</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-700">
                        {['Column', 'Mean', 'Median', 'Std Dev', 'Min', 'Max', 'Missing'].map(h => (
                          <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                      {numericColumns.map(col => {
                        const s = eda[col];
                        const missingPct = s.missing_pct || (s.missing && currentDataset?.rows ? (s.missing / currentDataset.rows * 100) : 0);
                        return (
                          <tr key={col} className="hover:bg-slate-700/30">
                            <td className="px-4 py-2.5 font-medium text-white">{formatColumnName(col)}</td>
                            <td className="px-4 py-2.5 text-slate-300">{formatNumber(s.mean)}</td>
                            <td className="px-4 py-2.5 text-slate-300">{formatNumber(s.median || s['50%'])}</td>
                            <td className="px-4 py-2.5 text-slate-300">{formatNumber(s.std)}</td>
                            <td className="px-4 py-2.5 text-slate-300">{formatNumber(s.min)}</td>
                            <td className="px-4 py-2.5 text-slate-300">{formatNumber(s.max)}</td>
                            <td className="px-4 py-2.5">
                              <span className={`text-xs ${(s.missing || 0) > 0 ? 'text-yellow-400' : 'text-slate-400'}`}>
                                {s.missing || 0} ({formatPercent(missingPct, 1)})
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Correlation Heatmap */}
            {correlation && (
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
                <h2 className="text-base font-semibold text-white mb-4">Correlation Heatmap</h2>
                <HeatmapComponent
                  data={correlation.matrix || correlation}
                  columns={correlation.columns || Object.keys(correlation.matrix || correlation)}
                  title=""
                />
              </div>
            )}

            {/* Distributions */}
            {distributions && Object.keys(distributions).length > 0 && (
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
                <h2 className="text-base font-semibold text-white mb-4">Distributions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {Object.entries(distributions).slice(0, 6).map(([col, distData]) => (
                    <div key={col} className="bg-slate-700/40 rounded-lg p-4">
                      <HistogramComponent
                        data={distData}
                        xKey="bin"
                        yKey="count"
                        title={formatColumnName(col)}
                        height={200}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Categorical stats */}
            {categorical && Object.keys(categorical).length > 0 && (
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
                <h2 className="text-base font-semibold text-white mb-4">Categorical Columns</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {Object.entries(categorical).slice(0, 4).map(([col, counts]) => {
                    const barData = Object.entries(counts)
                      .slice(0, 10)
                      .map(([name, value]) => ({ name, value }));
                    return (
                      <div key={col} className="bg-slate-700/40 rounded-lg p-4">
                        <BarChartComponent
                          data={barData}
                          xKey="name"
                          yKeys={['value']}
                          title={formatColumnName(col)}
                          height={220}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {!eda && !correlation && !distributions && !categorical && (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                <AlertCircle className="w-12 h-12 mb-3 opacity-40" />
                <p className="text-slate-400">No analytics data available for this dataset yet.</p>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}

export default Analytics;
