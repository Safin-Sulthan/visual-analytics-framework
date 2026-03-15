import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { useAnalytics } from '../hooks/useAnalytics';
import Card from '../components/common/Card';
import CorrelationMatrix from '../components/Charts/CorrelationMatrix';
import Histogram from '../components/Charts/Histogram';
import BarChart from '../components/Charts/BarChart';
import ClusterVisualization from '../components/Charts/ClusterVisualization';
import ScatterPlot from '../components/Charts/ScatterPlot';
import LoadingSpinner from '../components/common/LoadingSpinner';

const TABS = ['EDA', 'ML Analytics'];

const Analytics = () => {
  const { currentDataset } = useAppContext();
  const { analytics, loading, fetchAnalytics } = useAnalytics(currentDataset?._id);
  const [activeTab, setActiveTab] = useState('EDA');

  useEffect(() => {
    if (currentDataset?._id) fetchAnalytics();
  }, [currentDataset?._id]);

  if (!currentDataset) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-gray-500 font-medium">No dataset selected.</p>
        <p className="text-sm text-gray-400 mt-1">Go to Datasets and view a dataset to analyse it.</p>
      </div>
    );
  }

  if (loading) return <div className="flex justify-center py-16"><LoadingSpinner size="xl" /></div>;

  const eda = analytics?.eda || {};
  const ml  = analytics?.ml  || {};

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Analytics — {currentDataset.name}</h2>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-lg w-fit">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'EDA' && (
        <div className="space-y-6">
          <Card title="Correlation Matrix" subtitle="Pearson correlation between numeric columns">
            <CorrelationMatrix correlations={eda.correlations || {}} />
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Missing Values" subtitle="Null counts per column">
              <BarChart
                data={Object.entries(eda.missing_values || {}).map(([col, count]) => ({ col, count }))}
                xKey="col"
                yKeys={['count']}
                height={260}
              />
            </Card>
            <Card title="Column Distributions" subtitle="Distribution of numeric columns">
              <Histogram
                data={eda.distributions?.buckets || []}
                xKey="bin"
                yKey="count"
                height={260}
              />
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'ML Analytics' && (
        <div className="space-y-6">
          <Card title="Clustering" subtitle="KMeans cluster assignments">
            <ClusterVisualization
              data={ml.clusters?.points || []}
              xKey="x"
              yKey="y"
              clusterKey="cluster"
              height={340}
            />
          </Card>
          <Card title="Anomaly Detection" subtitle="Isolation Forest — anomalies highlighted">
            <ScatterPlot
              data={ml.anomalies?.points || []}
              xKey="x"
              yKey="y"
              height={300}
            />
          </Card>
        </div>
      )}
    </div>
  );
};

export default Analytics;
