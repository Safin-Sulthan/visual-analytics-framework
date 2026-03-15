import { useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { TrendingUp, Loader2, Settings } from 'lucide-react'

const FORECAST_DATA = Array.from({ length: 24 }, (_, i) => {
  const historical = i < 12
  const base = 100 + i * 4
  return {
    month: `M${i + 1}`,
    actual: historical ? parseFloat((base + (Math.random() - 0.5) * 10).toFixed(1)) : null,
    forecast: !historical ? parseFloat((base + (Math.random() - 0.5) * 8).toFixed(1)) : null,
    lower: !historical ? parseFloat((base * 0.88).toFixed(1)) : null,
    upper: !historical ? parseFloat((base * 1.12).toFixed(1)) : null,
  }
})

const MODELS = ['Linear Regression', 'Random Forest', 'XGBoost', 'LSTM Neural Network', 'ARIMA']

export default function PredictionsPage() {
  const [model, setModel] = useState(MODELS[0])
  const [targetCol, setTargetCol] = useState('revenue')
  const [loading, setLoading] = useState(false)
  const [ran, setRan] = useState(true)

  const runPrediction = () => {
    setLoading(true)
    setRan(false)
    setTimeout(() => { setLoading(false); setRan(true) }, 2000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Predictions</h1>
        <p className="text-sm text-gray-500 mt-1">Machine learning forecasting and predictions</p>
      </div>

      {/* Config panel */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><Settings size={16} />Model Configuration</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Column</label>
            <select
              value={targetCol}
              onChange={(e) => setTargetCol(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {['revenue', 'quantity', 'customer_count', 'avg_order_value'].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {MODELS.map((m) => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Forecast Horizon</label>
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {['3 months', '6 months', '12 months'].map((h) => <option key={h}>{h}</option>)}
            </select>
          </div>
        </div>
        <button
          onClick={runPrediction}
          disabled={loading}
          className="mt-4 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <TrendingUp size={16} />}
          {loading ? 'Running...' : 'Run Prediction'}
        </button>
      </div>

      {ran && (
        <>
          {/* Model metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'R² Score', value: '0.923' },
              { label: 'RMSE', value: '4.21' },
              { label: 'MAE', value: '3.15' },
              { label: 'MAPE', value: '6.8%' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                <p className="text-xs text-gray-500 mb-1">{label}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
              </div>
            ))}
          </div>

          {/* Forecast chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-800 mb-4">Forecast: {targetCol} — {model}</h3>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={FORECAST_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} domain={['auto', 'auto']} />
                <Tooltip />
                <Legend />
                <ReferenceLine x="M12" stroke="#6b7280" strokeDasharray="4 4" label={{ value: 'Forecast start', fontSize: 10, fill: '#6b7280' }} />
                <Line type="monotone" dataKey="actual" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} connectNulls={false} name="Actual" />
                <Line type="monotone" dataKey="forecast" stroke="#f59e0b" strokeWidth={2} strokeDasharray="6 3" dot={{ r: 4 }} connectNulls={false} name="Forecast" />
                <Line type="monotone" dataKey="upper" stroke="#d1fae5" strokeWidth={1} dot={false} name="Upper CI" />
                <Line type="monotone" dataKey="lower" stroke="#fecaca" strokeWidth={1} dot={false} name="Lower CI" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Feature importance */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-800 mb-4">Feature Importance</h3>
            <div className="space-y-3">
              {[
                { feature: 'marketing_spend', importance: 0.34 },
                { feature: 'season_index', importance: 0.28 },
                { feature: 'price_elasticity', importance: 0.18 },
                { feature: 'competitor_price', importance: 0.12 },
                { feature: 'customer_age_avg', importance: 0.08 },
              ].map(({ feature, importance }) => (
                <div key={feature} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-44 truncate">{feature}</span>
                  <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${importance * 100}%` }} />
                  </div>
                  <span className="text-sm font-semibold text-gray-700 w-12 text-right">{(importance * 100).toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
