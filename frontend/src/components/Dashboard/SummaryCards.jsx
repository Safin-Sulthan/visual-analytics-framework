import React from 'react';
import { Database, Lightbulb, Activity, AlertTriangle } from 'lucide-react';

const CARD_CONFIG = [
  {
    key: 'totalDatasets',
    label: 'Total Datasets',
    icon: Database,
    color: 'bg-indigo-50 text-indigo-600',
    border: 'border-indigo-100',
  },
  {
    key: 'totalInsights',
    label: 'Total Insights',
    icon: Lightbulb,
    color: 'bg-yellow-50 text-yellow-600',
    border: 'border-yellow-100',
  },
  {
    key: 'activeAnalyses',
    label: 'Active Analyses',
    icon: Activity,
    color: 'bg-green-50 text-green-600',
    border: 'border-green-100',
  },
  {
    key: 'alertsCount',
    label: 'Alerts',
    icon: AlertTriangle,
    color: 'bg-red-50 text-red-600',
    border: 'border-red-100',
  },
];

const SummaryCards = ({ stats = {} }) => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
    {CARD_CONFIG.map(({ key, label, icon: Icon, color, border }) => (
      <div
        key={key}
        className={`bg-white rounded-xl border ${border} shadow-sm p-5 flex items-center gap-4`}
      >
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={22} />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{stats[key] ?? 0}</p>
          <p className="text-sm text-gray-500">{label}</p>
        </div>
      </div>
    ))}
  </div>
);

export default SummaryCards;
