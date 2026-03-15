import React from 'react';
import AlertBanner from './AlertBanner';
import { CheckCircle } from 'lucide-react';

/**
 * AlertPanel — reusable panel that renders a list of alerts.
 *
 * Props:
 *   alerts      – array of alert objects
 *   onDismiss   – optional callback (alertId) => void, passed to each AlertBanner
 *   title       – panel heading (default: "Recent Alerts")
 *   viewAllHref – href for the "View all" link (pass null to hide)
 *   limit       – max number of alerts to show (default: 5)
 */
function AlertPanel({
  alerts = [],
  onDismiss,
  title = 'Recent Alerts',
  viewAllHref = '/monitoring',
  limit = 5,
}) {
  const displayed = alerts.slice(0, limit);

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-white">{title}</h2>
        {viewAllHref && (
          <a href={viewAllHref} className="text-xs text-blue-400 hover:text-blue-300">
            View all →
          </a>
        )}
      </div>

      {displayed.length > 0 ? (
        <div className="space-y-2">
          {displayed.map((alert, i) => (
            <AlertBanner
              key={alert.id || alert._id || i}
              alert={alert}
              onDismiss={onDismiss}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-40 text-slate-500">
          <CheckCircle className="w-10 h-10 mb-2 opacity-40" />
          <p className="text-sm">No active alerts. All systems normal.</p>
        </div>
      )}
    </div>
  );
}

export default AlertPanel;
