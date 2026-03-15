import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

function SummaryCard({ icon: Icon, title, value, change, changeLabel, color = 'blue', loading = false }) {
  const colorMap = {
    blue: 'text-blue-400 bg-blue-900/30',
    green: 'text-green-400 bg-green-900/30',
    yellow: 'text-yellow-400 bg-yellow-900/30',
    red: 'text-red-400 bg-red-900/30',
    purple: 'text-purple-400 bg-purple-900/30',
    cyan: 'text-cyan-400 bg-cyan-900/30'
  };

  const getChangeIcon = () => {
    if (change > 0) return <TrendingUp className="w-3.5 h-3.5" />;
    if (change < 0) return <TrendingDown className="w-3.5 h-3.5" />;
    return <Minus className="w-3.5 h-3.5" />;
  };

  const getChangeColor = () => {
    if (change > 0) return 'text-green-400';
    if (change < 0) return 'text-red-400';
    return 'text-slate-400';
  };

  if (loading) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 animate-pulse">
        <div className="flex items-start justify-between">
          <div className="w-10 h-10 bg-slate-700 rounded-lg" />
          <div className="w-16 h-5 bg-slate-700 rounded" />
        </div>
        <div className="mt-4 w-20 h-7 bg-slate-700 rounded" />
        <div className="mt-2 w-32 h-4 bg-slate-700 rounded" />
      </div>
    );
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 hover:border-slate-600 transition-colors">
      <div className="flex items-start justify-between">
        <div className={`p-2 rounded-lg ${colorMap[color] || colorMap.blue}`}>
          {Icon && <Icon className="w-5 h-5" />}
        </div>
        {change !== undefined && change !== null && (
          <div className={`flex items-center gap-1 text-xs font-medium ${getChangeColor()}`}>
            {getChangeIcon()}
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold text-white">{value ?? '—'}</p>
        <p className="text-sm text-slate-400 mt-0.5">{title}</p>
        {changeLabel && (
          <p className="text-xs text-slate-500 mt-1">{changeLabel}</p>
        )}
      </div>
    </div>
  );
}

export default SummaryCard;
