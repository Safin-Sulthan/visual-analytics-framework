import { useState } from 'react'
import { Lightbulb, TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp, Star } from 'lucide-react'

const INSIGHTS = [
  {
    id: 1, rank: 1, score: 98,
    title: 'Revenue spike in Q3 correlates with marketing campaign',
    description: 'A strong positive correlation (r=0.87) was detected between marketing spend and revenue in Q3. Increasing budget allocation by 20% could yield an estimated 18% revenue uplift.',
    impact: 'high', trend: 'up', category: 'Revenue', tags: ['correlation', 'marketing', 'revenue'],
  },
  {
    id: 2, rank: 2, score: 91,
    title: 'Customer churn risk elevated in segment B',
    description: 'Customers in segment B show a 34% higher churn probability than average. Key predictors: inactivity >30 days, no support interactions, and single product usage.',
    impact: 'high', trend: 'down', category: 'Retention', tags: ['churn', 'segmentation', 'risk'],
  },
  {
    id: 3, rank: 3, score: 84,
    title: 'Inventory turnover rate below industry benchmark',
    description: 'Current turnover rate of 4.2x is 22% below the industry average of 5.4x. Optimizing reorder points for top 15 SKUs could improve cash flow by ~$120,000.',
    impact: 'medium', trend: 'neutral', category: 'Operations', tags: ['inventory', 'efficiency'],
  },
  {
    id: 4, rank: 4, score: 79,
    title: 'Product category C outperforming forecast by 31%',
    description: 'Category C sales exceeded projections by 31% this quarter. Demand forecasting models should be recalibrated to capture this trend.',
    impact: 'medium', trend: 'up', category: 'Sales', tags: ['forecast', 'product'],
  },
  {
    id: 5, rank: 5, score: 72,
    title: 'Support ticket volume increasing on weekends',
    description: 'Weekend support volume has grown 28% over the past 6 weeks, with avg resolution time 2.3x longer due to reduced staffing.',
    impact: 'low', trend: 'down', category: 'Support', tags: ['operations', 'staffing'],
  },
]

const impactColors = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-green-100 text-green-700',
}

function InsightCard({ insight }) {
  const [expanded, setExpanded] = useState(false)
  const TrendIcon = insight.trend === 'up' ? TrendingUp : insight.trend === 'down' ? TrendingDown : Minus
  const trendColor = insight.trend === 'up' ? 'text-green-500' : insight.trend === 'down' ? 'text-red-500' : 'text-gray-400'

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="flex flex-col items-center flex-shrink-0 w-10">
            <span className="text-xs font-bold text-gray-400 uppercase">#{insight.rank}</span>
            <div className="flex items-center gap-0.5 mt-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={10} className={i < Math.ceil(insight.score / 20) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'} />
              ))}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{insight.category}</span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded ${impactColors[insight.impact]}`}>
                {insight.impact.charAt(0).toUpperCase() + insight.impact.slice(1)} Impact
              </span>
              <TrendIcon size={16} className={trendColor} />
            </div>
            <h3 className="font-semibold text-gray-800 text-sm leading-snug">{insight.title}</h3>
            {expanded && (
              <p className="text-sm text-gray-600 mt-2 leading-relaxed">{insight.description}</p>
            )}
            <div className="flex flex-wrap gap-1 mt-2">
              {insight.tags.map((t) => (
                <span key={t} className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">#{t}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-right">
            <span className="text-2xl font-bold text-blue-600">{insight.score}</span>
            <p className="text-xs text-gray-400">score</p>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function InsightsPage() {
  const [filter, setFilter] = useState('all')

  const filtered = filter === 'all' ? INSIGHTS : INSIGHTS.filter((i) => i.impact === filter)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Insights</h1>
          <p className="text-sm text-gray-500 mt-1">Automatically ranked insights from your data</p>
        </div>
        <div className="flex items-center gap-2 bg-blue-50 rounded-xl px-4 py-2">
          <Lightbulb size={18} className="text-blue-600" />
          <span className="text-sm font-semibold text-blue-700">{INSIGHTS.length} insights generated</span>
        </div>
      </div>

      <div className="flex gap-2">
        {['all', 'high', 'medium', 'low'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === f ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.map((insight) => (
          <InsightCard key={insight.id} insight={insight} />
        ))}
      </div>
    </div>
  )
}
