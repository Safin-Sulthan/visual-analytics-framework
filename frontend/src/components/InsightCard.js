import React from 'react';
import { Lightbulb, TrendingUp, AlertTriangle, Info } from 'lucide-react';
import { truncateText } from '../utils/formatters';

const typeConfig = {
  trend: { icon: TrendingUp, color: 'text-blue-400', bg: 'bg-blue-900/30', badge: 'bg-blue-900/50 text-blue-300' },
  anomaly: { icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-900/30', badge: 'bg-yellow-900/50 text-yellow-300' },
  correlation: { icon: Info, color: 'text-purple-400', bg: 'bg-purple-900/30', badge: 'bg-purple-900/50 text-purple-300' },
  recommendation: { icon: Lightbulb, color: 'text-green-400', bg: 'bg-green-900/30', badge: 'bg-green-900/50 text-green-300' },
  default: { icon: Lightbulb, color: 'text-slate-400', bg: 'bg-slate-700/50', badge: 'bg-slate-700 text-slate-300' }
};

function InsightCard({ insight }) {
  const config = typeConfig[insight?.type?.toLowerCase()] || typeConfig.default;
  const Icon = config.icon;
  const score = insight?.score ?? insight?.confidence;
  const scoreDisplay = score !== null && score !== undefined
    ? `${(score * (score <= 1 ? 100 : 1)).toFixed(0)}%`
    : null;

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 hover:border-slate-600 transition-colors">
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg flex-shrink-0 ${config.bg}`}>
          <Icon className={`w-4 h-4 ${config.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${config.badge}`}>
              {insight?.type || 'insight'}
            </span>
            {scoreDisplay && (
              <span className="text-xs text-slate-500">Score: {scoreDisplay}</span>
            )}
          </div>
          <h4 className="text-sm font-medium text-white mt-1.5">
            {truncateText(insight?.title || insight?.summary || 'Insight', 80)}
          </h4>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            {truncateText(insight?.description || insight?.detail || '', 150)}
          </p>
          {insight?.column && (
            <span className="inline-block mt-2 text-xs text-slate-500 bg-slate-700/50 px-2 py-0.5 rounded">
              {insight.column}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default InsightCard;
