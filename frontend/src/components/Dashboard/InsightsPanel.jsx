import React from 'react';
import { Lightbulb, TrendingUp } from 'lucide-react';
import Card from '../common/Card';
import { truncateText } from '../../utils/helpers';

const CATEGORY_COLORS = {
  statistical:  'bg-blue-100 text-blue-700',
  trend:        'bg-green-100 text-green-700',
  anomaly:      'bg-red-100 text-red-700',
  correlation:  'bg-purple-100 text-purple-700',
  distribution: 'bg-yellow-100 text-yellow-700',
  business:     'bg-indigo-100 text-indigo-700',
};

const InsightsPanel = ({ insights = [] }) => (
  <Card
    title="Top Insights"
    subtitle="Highest-scoring insights from your data"
    headerAction={
      <span className="text-xs text-gray-400 font-medium">Top 5</span>
    }
  >
    {!insights.length ? (
      <div className="flex flex-col items-center py-8 text-center">
        <Lightbulb size={32} className="text-gray-300 mb-2" />
        <p className="text-sm text-gray-500">No insights yet. Upload a dataset to begin.</p>
      </div>
    ) : (
      <ol className="space-y-3">
        {insights.slice(0, 5).map((insight, i) => (
          <li key={insight._id || i} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
            <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
              {i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${CATEGORY_COLORS[insight.category] || 'bg-gray-100 text-gray-600'}`}>
                  {insight.category}
                </span>
                <span className="text-xs text-gray-400 flex items-center gap-0.5">
                  <TrendingUp size={10} /> {(insight.score ?? 0).toFixed(3)}
                </span>
              </div>
              <p className="text-sm text-gray-700">{truncateText(insight.text, 120)}</p>
            </div>
          </li>
        ))}
      </ol>
    )}
  </Card>
);

export default InsightsPanel;
