import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import SummaryCard from '../components/SummaryCard';
import InsightPanel from '../components/InsightPanel';
import AlertPanel from '../components/AlertPanel';
import LoadingSpinner from '../components/LoadingSpinner';
import LineChartComponent from '../charts/LineChartComponent';
import PieChartComponent from '../charts/PieChartComponent';
import { useData } from '../context/DataContext';
import { Database, Lightbulb, AlertTriangle, CheckCircle } from 'lucide-react';
import { formatDate } from '../utils/formatters';

function Dashboard() {
  const { datasets, insights, alerts, fetchDatasets, fetchInsights, fetchAlerts, datasetsLoading, insightsLoading } = useData();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      await Promise.all([fetchDatasets(), fetchInsights(), fetchAlerts()]);
      setLoading(false);
    };
    load();
  }, [fetchDatasets, fetchInsights, fetchAlerts]);

  // Build upload trend from dataset dates
  const uploadTrend = React.useMemo(() => {
    if (!datasets.length) return [];
    const counts = {};
    datasets.forEach(ds => {
      const day = formatDate(ds.created_at || ds.upload_date);
      counts[day] = (counts[day] || 0) + 1;
    });
    return Object.entries(counts)
      .sort(([a], [b]) => new Date(a) - new Date(b))
      .map(([date, count]) => ({ date, count }));
  }, [datasets]);

  // Dataset status distribution
  const statusData = React.useMemo(() => {
    const counts = {};
    datasets.forEach(ds => {
      const s = ds.status || 'unknown';
      counts[s] = (counts[s] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [datasets]);

  const activeAlerts = alerts.filter(a => !a.acknowledged);
  const topInsights = insights.slice(0, 4);

  if (loading) {
    return (
      <Layout title="Dashboard">
        <LoadingSpinner message="Loading dashboard..." />
      </Layout>
    );
  }

  return (
    <Layout title="Dashboard">
      <div className="space-y-6">
        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard
            icon={Database}
            title="Total Datasets"
            value={datasets.length}
            color="blue"
          />
          <SummaryCard
            icon={Lightbulb}
            title="AI Insights"
            value={insights.length}
            color="purple"
          />
          <SummaryCard
            icon={AlertTriangle}
            title="Active Alerts"
            value={activeAlerts.length}
            color={activeAlerts.length > 0 ? 'yellow' : 'green'}
          />
          <SummaryCard
            icon={CheckCircle}
            title="Processed"
            value={datasets.filter(d => d.status === 'processed' || d.status === 'ready').length}
            color="green"
          />
        </div>

        {/* Upload trend chart */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <h2 className="text-base font-semibold text-white mb-4">Dataset Upload Trend</h2>
          {uploadTrend.length > 0 ? (
            <LineChartComponent
              data={uploadTrend}
              xKey="date"
              yKeys={['count']}
              height={220}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-slate-500">
              <Database className="w-10 h-10 mb-2 opacity-40" />
              <p className="text-sm">No datasets uploaded yet</p>
            </div>
          )}
        </div>

        {/* Two column: insights + alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <InsightPanel
            insights={topInsights}
            loading={insightsLoading}
            title="Top Insights"
            viewAllHref="/insights"
            limit={4}
          />
          <AlertPanel
            alerts={activeAlerts}
            title="Recent Alerts"
            viewAllHref="/monitoring"
            limit={5}
          />
        </div>

        {/* Distribution charts */}
        {statusData.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
              <h2 className="text-base font-semibold text-white mb-4">Dataset Status Distribution</h2>
              <PieChartComponent data={statusData} dataKey="value" nameKey="name" height={260} />
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
              <h2 className="text-base font-semibold text-white mb-4">Quick Stats</h2>
              <div className="space-y-3 mt-6">
                {[
                  { label: 'Datasets Ready', value: datasets.filter(d => d.status === 'ready' || d.status === 'processed').length, color: 'bg-green-500' },
                  { label: 'Processing', value: datasets.filter(d => d.status === 'processing').length, color: 'bg-yellow-500' },
                  { label: 'Pending Upload', value: datasets.filter(d => d.status === 'pending').length, color: 'bg-blue-500' },
                  { label: 'With Errors', value: datasets.filter(d => d.status === 'error').length, color: 'bg-red-500' },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                    <span className="text-sm text-slate-300 flex-1">{item.label}</span>
                    <span className="text-sm font-medium text-white">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Dashboard;
