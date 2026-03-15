import React from 'react';
import InsightCard from './InsightCard';
import LoadingSpinner from './LoadingSpinner';
import { Lightbulb } from 'lucide-react';

/**
 * InsightPanel — reusable panel that renders a ranked list of insights.
 *
 * Props:
 *   insights     – array of insight objects (pre-sorted, highest score first)
 *   loading      – boolean, show spinner while fetching
 *   title        – panel heading (default: "Top Insights")
 *   viewAllHref  – href for the "View all" link (pass null to hide)
 *   limit        – max number of insights to show (default: 5)
 */
function InsightPanel({
  insights = [],
  loading = false,
  title = 'Top Insights',
  viewAllHref = '/insights',
  limit = 5,
}) {
  const displayed = insights.slice(0, limit);

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

      {loading ? (
        <LoadingSpinner size="sm" message="Loading insights..." />
      ) : displayed.length > 0 ? (
        <div className="space-y-3">
          {displayed.map((insight, i) => (
            <InsightCard key={insight.id || insight._id || i} insight={insight} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-40 text-slate-500">
          <Lightbulb className="w-10 h-10 mb-2 opacity-40" />
          <p className="text-sm">No insights yet. Upload a dataset to get started.</p>
        </div>
      )}
    </div>
  );
}

export default InsightPanel;
