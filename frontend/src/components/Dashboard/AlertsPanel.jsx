import React from 'react';
import { AlertTriangle, Bell } from 'lucide-react';
import Card from '../common/Card';
import { SEVERITY_COLORS } from '../../utils/constants';
import { formatDate } from '../../utils/helpers';

const AlertsPanel = ({ alerts = [] }) => (
  <Card
    title="Anomaly Alerts"
    subtitle="Detected anomalies requiring attention"
    headerAction={
      alerts.length > 0 && (
        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-600">
          {alerts.length}
        </span>
      )
    }
  >
    {!alerts.length ? (
      <div className="flex flex-col items-center py-8 text-center">
        <Bell size={32} className="text-gray-300 mb-2" />
        <p className="text-sm text-gray-500">No active alerts. All systems normal.</p>
      </div>
    ) : (
      <ul className="space-y-2">
        {alerts.map((alert, i) => (
          <li key={alert._id || i} className="flex items-start gap-3 p-3 rounded-lg border border-gray-100">
            <AlertTriangle
              size={16}
              className={`flex-shrink-0 mt-0.5 ${
                alert.severity === 'critical' ? 'text-red-500' :
                alert.severity === 'high'     ? 'text-orange-500' :
                alert.severity === 'medium'   ? 'text-yellow-500' : 'text-green-500'
              }`}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${SEVERITY_COLORS[alert.severity]}`}>
                  {alert.severity}
                </span>
                <span className="text-xs text-gray-400">{formatDate(alert.detectedAt)}</span>
              </div>
              <p className="text-sm text-gray-700">{alert.description}</p>
            </div>
          </li>
        ))}
      </ul>
    )}
  </Card>
);

export default AlertsPanel;
