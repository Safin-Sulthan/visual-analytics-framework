import React from 'react';
import { AlertTriangle, AlertCircle, Info, CheckCircle, X } from 'lucide-react';

const severityConfig = {
  critical: {
    icon: AlertCircle,
    classes: 'bg-red-900/40 border-red-700 text-red-300',
    iconClass: 'text-red-400'
  },
  high: {
    icon: AlertTriangle,
    classes: 'bg-orange-900/40 border-orange-700 text-orange-300',
    iconClass: 'text-orange-400'
  },
  medium: {
    icon: AlertTriangle,
    classes: 'bg-yellow-900/40 border-yellow-700 text-yellow-300',
    iconClass: 'text-yellow-400'
  },
  low: {
    icon: Info,
    classes: 'bg-blue-900/40 border-blue-700 text-blue-300',
    iconClass: 'text-blue-400'
  },
  info: {
    icon: Info,
    classes: 'bg-blue-900/40 border-blue-700 text-blue-300',
    iconClass: 'text-blue-400'
  },
  success: {
    icon: CheckCircle,
    classes: 'bg-green-900/40 border-green-700 text-green-300',
    iconClass: 'text-green-400'
  }
};

function AlertBanner({ alert, onDismiss }) {
  const severity = alert?.severity?.toLowerCase() || 'info';
  const config = severityConfig[severity] || severityConfig.info;
  const Icon = config.icon;

  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg border ${config.classes}`}>
      <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${config.iconClass}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium leading-tight">
            {alert?.title || alert?.message || 'Alert'}
          </p>
          {onDismiss && (
            <button
              onClick={() => onDismiss(alert?.id)}
              className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        {alert?.description && (
          <p className="text-xs mt-0.5 opacity-80">{alert.description}</p>
        )}
        {alert?.created_at && (
          <p className="text-xs mt-1 opacity-50">
            {new Date(alert.created_at).toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );
}

export default AlertBanner;
