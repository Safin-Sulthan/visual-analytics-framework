export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
export const AI_ENGINE_URL = process.env.REACT_APP_AI_ENGINE_URL || 'http://localhost:8000';

export const CHART_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
  '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#06b6d4', '#3b82f6',
];

export const INSIGHT_CATEGORIES = [
  'statistical',
  'trend',
  'anomaly',
  'correlation',
  'distribution',
  'business',
];

export const SIDEBAR_ITEMS = [
  { label: 'Dashboard',   path: '/',            icon: 'LayoutDashboard' },
  { label: 'Datasets',    path: '/datasets',    icon: 'Database' },
  { label: 'Analytics',   path: '/analytics',   icon: 'BarChart2' },
  { label: 'Insights',    path: '/insights',    icon: 'Lightbulb' },
  { label: 'Monitoring',  path: '/monitoring',  icon: 'Activity' },
  { label: 'Predictions', path: '/predictions', icon: 'TrendingUp' },
  { label: 'Reports',     path: '/reports',     icon: 'FileText' },
  { label: 'Settings',    path: '/settings',    icon: 'Settings' },
];

export const SEVERITY_COLORS = {
  low:      'text-green-600 bg-green-50',
  medium:   'text-yellow-600 bg-yellow-50',
  high:     'text-orange-600 bg-orange-50',
  critical: 'text-red-600 bg-red-50',
};

export const DATASET_STATUS = {
  pending:    { label: 'Pending',    color: 'text-gray-500' },
  processing: { label: 'Processing', color: 'text-blue-500' },
  completed:  { label: 'Completed',  color: 'text-green-500' },
  failed:     { label: 'Failed',     color: 'text-red-500' },
};

export const MAX_FILE_SIZE_MB = 50;
export const ALLOWED_FILE_TYPES = ['.csv', 'text/csv'];
export const PREVIEW_ROW_LIMIT = 20;
