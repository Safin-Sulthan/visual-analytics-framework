import { useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ReferenceLine, ResponsiveContainer, Brush,
} from 'recharts'
import { Clock, TrendingUp, TrendingDown } from 'lucide-react'

const generateTimeSeries = () => {
  const data = []
  const start = new Date('2024-01-01')
  let value = 100
  for (let i = 0; i < 90; i++) {
    const date = new Date(start)
    date.setDate(start.getDate() + i)
    value += (Math.random() - 0.48) * 8
    data.push({
      date: date.toISOString().split('T')[0],
      value: parseFloat(value.toFixed(2)),
      forecast: parseFloat((value + (Math.random() - 0.5) * 5).toFixed(2)),
    })
  }
  return data
}

const tsData = generateTimeSeries()

const metrics = [
  { label: 'Current Value', value: '127.4', change: '+3.2%', up: true },
  { label: 'Avg (30d)', value: '119.8', change: '+1.1%', up: true },
  { label: 'Volatility', value: '8.4%', change: '-0.5%', up: false },
  { label: 'Trend', value: 'Upward', change: 'Strong', up: true },
]

export default function TemporalPage() {
  const [range, setRange] = useState('90d')

  const rangeData = {
    '30d': tsData.slice(-30),
    '60d': tsData.slice(-60),
    '90d': tsData,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Temporal Monitoring</h1>
        <p className="text-sm text-gray-500 mt-1">Time series analysis and trend monitoring</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map(({ label, value, change, up }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className="text-xl font-bold text-gray-900">{value}</p>
            <div className={`flex items-center gap-1 text-xs font-medium mt-1 ${up ? 'text-green-600' : 'text-red-500'}`}>
              {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {change}
            </div>
          </div>
        ))}
      </div>

      {/* Time series chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <Clock size={18} className="text-blue-600" />
            Time Series — Actual vs Forecast
          </h3>
          <div className="flex gap-2">
            {['30d', '60d', '90d'].map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  range === r ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={rangeData[range]}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} tickCount={8} />
            <YAxis tick={{ fontSize: 12 }} domain={['auto', 'auto']} />
            <Tooltip />
            <Legend />
            <ReferenceLine y={100} stroke="#94a3b8" strokeDasharray="4 4" label={{ value: 'Baseline', fontSize: 11 }} />
            <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={false} name="Actual" />
            <Line type="monotone" dataKey="forecast" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="5 5" dot={false} name="Forecast" />
            <Brush dataKey="date" height={20} stroke="#e5e7eb" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Change points */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-800 mb-4">Detected Change Points</h3>
        <div className="space-y-3">
          {[
            { date: '2024-02-14', type: 'Level Shift', magnitude: '+12.3', desc: 'Significant upward level shift detected after promotional event.' },
            { date: '2024-03-01', type: 'Trend Change', magnitude: '+2.1%/wk', desc: 'Growth rate acceleration — possible new demand driver.' },
            { date: '2024-03-22', type: 'Variance Change', magnitude: '×1.8', desc: 'Increased volatility, possibly linked to supply disruption.' },
          ].map((cp) => (
            <div key={cp.date} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-orange-500 mt-1.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-gray-800">{cp.date}</span>
                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">{cp.type}</span>
                  <span className="text-xs font-mono font-bold text-blue-600">{cp.magnitude}</span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{cp.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
