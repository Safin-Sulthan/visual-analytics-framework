import React, { useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { useAnalytics } from '../hooks/useAnalytics';
import SummaryCards from '../components/Dashboard/SummaryCards';
import TrendCharts from '../components/Dashboard/TrendCharts';
import InsightsPanel from '../components/Dashboard/InsightsPanel';
import AlertsPanel from '../components/Dashboard/AlertsPanel';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Dashboard = () => {
  const { datasets, currentDataset } = useAppContext();
  const { insights, monitoring, fetchInsights, fetchMonitoring, loading } = useAnalytics(
    currentDataset?._id
  );

  useEffect(() => {
    if (currentDataset?._id) {
      fetchInsights();
      fetchMonitoring();
    }
  }, [currentDataset?._id]);

  const stats = {
    totalDatasets:  datasets.length,
    totalInsights:  insights.length,
    activeAnalyses: datasets.filter((d) => d.status === 'processing').length,
    alertsCount:    monitoring?.alerts?.length ?? 0,
  };

  return (
    <div className="space-y-6 fade-in">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Welcome back 👋</h2>
        <p className="text-sm text-gray-500 mt-1">
          Here's a summary of your analytics platform.
        </p>
      </div>

      <SummaryCards stats={stats} />

      <TrendCharts data={monitoring?.trends ?? []} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InsightsPanel insights={insights} />
        <AlertsPanel alerts={monitoring?.alerts ?? []} />
      </div>
    </div>
  );
};

export default Dashboard;
