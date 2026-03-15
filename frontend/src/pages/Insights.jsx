import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { useAnalytics } from '../hooks/useAnalytics';
import { INSIGHT_CATEGORIES } from '../utils/constants';
import { sortByScore } from '../utils/helpers';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Lightbulb } from 'lucide-react';

const CATEGORY_COLORS = {
  statistical:  'bg-blue-100 text-blue-700',
  trend:        'bg-green-100 text-green-700',
  anomaly:      'bg-red-100 text-red-700',
  correlation:  'bg-purple-100 text-purple-700',
  distribution: 'bg-yellow-100 text-yellow-700',
  business:     'bg-indigo-100 text-indigo-700',
};

const Insights = () => {
  const { currentDataset } = useAppContext();
  const { insights, loading, fetchInsights } = useAnalytics(currentDataset?._id);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (currentDataset?._id) fetchInsights();
  }, [currentDataset?._id]);

  const filtered = filter === 'all'
    ? insights
    : insights.filter((i) => i.category === filter);

  const sorted = sortByScore(filtered);

  if (!currentDataset) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-gray-500 font-medium">No dataset selected.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Insights — {currentDataset.name}</h2>
        <span className="text-sm text-gray-500">{filtered.length} insight{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${filter === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          All
        </button>
        {INSIGHT_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1 rounded-full text-sm font-medium capitalize transition-colors ${filter === cat ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><LoadingSpinner size="xl" /></div>
      ) : sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Lightbulb size={48} className="text-gray-300 mb-3" />
          <p className="text-gray-500">No insights found for this category.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((insight, i) => (
            <div key={insight._id || i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start gap-4">
                <div className="w-7 h-7 rounded-full bg-indigo-50 text-indigo-600 text-sm font-bold flex items-center justify-center flex-shrink-0">
                  {insight.rank ?? i + 1}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${CATEGORY_COLORS[insight.category] || 'bg-gray-100 text-gray-600'}`}>
                      {insight.category}
                    </span>
                    <span className="text-xs text-gray-400">
                      Score: <span className="font-semibold text-gray-700">{(insight.score ?? 0).toFixed(4)}</span>
                    </span>
                  </div>
                  <p className="text-sm text-gray-800">{insight.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Insights;
