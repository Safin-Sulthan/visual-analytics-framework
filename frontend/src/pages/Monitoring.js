import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import AlertBanner from '../components/AlertBanner';
import LoadingSpinner from '../components/LoadingSpinner';
import LineChartComponent from '../charts/LineChartComponent';
import { useData } from '../context/DataContext';
import alertService from '../services/alertService';
import { formatDate, formatDateTime } from '../utils/formatters';
import { Activity, Clock, AlertTriangle, Bell } from 'lucide-react';
import toast from 'react-hot-toast';

function Monitoring() {
  const { datasets, currentDataset, setCurrentDataset, alerts, fetchAlerts } = useData();
  const [loading, setLoading] = useState(true);
  const [versionHistory, setVersionHistory] = useState([]);

  useEffect(() => {
    fetchAlerts().finally(() => setLoading(false));
  }, [fetchAlerts]);

  // Build mock version timeline from datasets
  const timeline = datasets
    .slice()
    .sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0))
    .map((ds, i) => ({
      date: formatDate(ds.created_at),
      datasets: i + 1,
      size: ds.rows || ds.num_rows || 0
    }));

  const handleDismissAlert = async (id) => {
    try {
      await alertService.dismissAlert(id);
      await fetchAlerts();
      toast.success('Alert dismissed');
    } catch {
      toast.error('Failed to dismiss alert');
    }
  };

  const handleAcknowledge = async (id) => {
    try {
      await alertService.acknowledgeAlert(id);
      await fetchAlerts();
      toast.success('Alert acknowledged');
    } catch {
      toast.error('Failed to acknowledge alert');
    }
  };

  const severityCounts = {
    critical: alerts.filter(a => a.severity === 'critical').length,
    high: alerts.filter(a => a.severity === 'high').length,
    medium: alerts.filter(a => a.severity === 'medium').length,
    low: alerts.filter(a => a.severity === 'low' || a.severity === 'info').length
  };

  return (
    <Layout title="Monitoring">
      <div className="space-y-6">
        {/* Dataset selector */}
        <div className="flex flex-wrap gap-3 items-center">
          <select
            value={currentDataset?.id || ''}
            onChange={e => {
              const ds = datasets.find(d => String(d.id) === e.target.value);
              setCurrentDataset(ds || null);
            }}
            className="bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All datasets</option>
            {datasets.map(ds => <option key={ds.id} value={ds.id}>{ds.name}</option>)}
          </select>
        </div>

        {/* Alert severity cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Critical', count: severityCounts.critical, color: 'text-red-400 bg-red-900/30' },
            { label: 'High', count: severityCounts.high, color: 'text-orange-400 bg-orange-900/30' },
            { label: 'Medium', count: severityCounts.medium, color: 'text-yellow-400 bg-yellow-900/30' },
            { label: 'Low / Info', count: severityCounts.low, color: 'text-blue-400 bg-blue-900/30' }
          ].map(item => (
            <div key={item.label} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
              <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium ${item.color} mb-3`}>
                <AlertTriangle className="w-3 h-3" />
                {item.label}
              </div>
              <p className="text-2xl font-bold text-white">{item.count}</p>
            </div>
          ))}
        </div>

        {/* Version timeline chart */}
        {timeline.length > 0 && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
            <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              Dataset Growth Timeline
            </h2>
            <LineChartComponent
              data={timeline}
              xKey="date"
              yKeys={['datasets']}
              height={220}
            />
          </div>
        )}

        {/* Version history table */}
        {datasets.length > 0 && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-700">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-400" />
                Version History
              </h2>
            </div>
            <div className="divide-y divide-slate-700/50">
              {datasets.slice().reverse().map((ds, i) => (
                <div key={ds.id} className="flex items-center gap-4 px-5 py-3 hover:bg-slate-700/20">
                  <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{ds.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {ds.rows || ds.num_rows || '?'} rows · {ds.columns || ds.num_columns || '?'} cols · {ds.status || 'pending'}
                    </p>
                  </div>
                  <span className="text-xs text-slate-500 flex-shrink-0">
                    {formatDateTime(ds.created_at || ds.upload_date)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Alerts panel */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-blue-400" />
              Active Alerts
            </h2>
            <span className="text-sm text-slate-400">{alerts.length} total</span>
          </div>

          {loading ? (
            <LoadingSpinner message="Loading alerts..." />
          ) : alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-500">
              <Bell className="w-10 h-10 mb-3 opacity-40" />
              <p className="text-slate-400">No alerts at this time</p>
            </div>
          ) : (
            <div className="space-y-2">
              {alerts.map((alert, i) => (
                <div key={alert.id || i} className="flex items-start gap-3">
                  <div className="flex-1">
                    <AlertBanner
                      alert={alert}
                      onDismiss={handleDismissAlert}
                    />
                  </div>
                  {!alert.acknowledged && (
                    <button
                      onClick={() => handleAcknowledge(alert.id)}
                      className="flex-shrink-0 mt-0.5 text-xs text-slate-400 hover:text-blue-400 transition-colors"
                    >
                      Ack
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default Monitoring;
