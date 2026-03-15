import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LineChart, Line, ReferenceLine, Legend,
} from 'recharts'
import { AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react'

const ANOMALIES = [
  { id: 1, date: '2024-03-14 14:32', metric: 'Revenue', value: 48200, expected: 28400, severity: 'critical', desc: 'Revenue spike 70% above expected range' },
  { id: 2, date: '2024-03-12 09:15', metric: 'Quantity', value: 2, expected: 234, severity: 'high', desc: 'Near-zero quantity — possible data entry error' },
  { id: 3, date: '2024-03-10 22:01', metric: 'Response Time', value: 4820, expected: 320, severity: 'high', desc: 'API response time exceeded 15× normal' },
  { id: 4, date: '2024-03-08 16:44', metric: 'Discount Rate', value: 0.82, expected: 0.15, severity: 'medium', desc: 'Unusually high discount rate applied' },
  { id: 5, date: '2024-03-06 11:20', metric: 'Customer Count', value: 1, expected: 87, severity: 'medium', desc: 'Abnormally low customer count period' },
]

const scatterData = Array.from({ length: 120 }, (_, i) => ({
  x: i,
  y: 50 + Math.sin(i * 0.2) * 15 + (Math.random() - 0.5) * 8,
  anomaly: Math.random() < 0.05,
})).map((d) => ({
  ...d,
  y: d.anomaly ? d.y * (Math.random() > 0.5 ? 2.2 : 0.25) : d.y,
}))

const normal = scatterData.filter((d) => !d.anomaly)
const anomalous = scatterData.filter((d) => d.anomaly)

const severityConfig = {
  critical: { color: 'bg-red-100 text-red-700 border-red-200', icon: AlertCircle, dot: 'bg-red-500' },
  high: { color: 'bg-orange-100 text-orange-700 border-orange-200', icon: AlertTriangle, dot: 'bg-orange-500' },
  medium: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: AlertTriangle, dot: 'bg-yellow-500' },
  low: { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: CheckCircle, dot: 'bg-blue-400' },
}

export default function AnomaliesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Anomaly Detection</h1>
          <p className="text-sm text-gray-500 mt-1">Automated detection of outliers and unusual patterns</p>
        </div>
        <div className="flex gap-3">
          {[
            { label: 'Critical', count: 1, color: 'bg-red-100 text-red-700' },
            { label: 'High', count: 2, color: 'bg-orange-100 text-orange-700' },
            { label: 'Medium', count: 2, color: 'bg-yellow-100 text-yellow-700' },
          ].map(({ label, count, color }) => (
            <div key={label} className={`${color} px-3 py-1.5 rounded-lg text-sm font-semibold`}>
              {count} {label}
            </div>
          ))}
        </div>
      </div>

      {/* Scatter plot anomalies */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-800 mb-4">Anomaly Scatter Plot — Normal vs Outliers</h3>
        <ResponsiveContainer width="100%" height={280}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="x" tick={{ fontSize: 11 }} name="Index" />
            <YAxis dataKey="y" tick={{ fontSize: 11 }} domain={[0, 140]} name="Value" />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Legend />
            <ReferenceLine y={80} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'Upper bound', fontSize: 10, fill: '#f59e0b' }} />
            <ReferenceLine y={20} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'Lower bound', fontSize: 10, fill: '#f59e0b' }} />
            <Scatter name="Normal" data={normal} fill="#3b82f6" opacity={0.5} />
            <Scatter name="Anomaly" data={anomalous} fill="#ef4444" opacity={0.9} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Anomaly list */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-800">Detected Anomalies</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {ANOMALIES.map((a) => {
            const { color, icon: Icon, dot } = severityConfig[a.severity]
            return (
              <div key={a.id} className="flex items-start gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${dot}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-500">{a.date}</span>
                    <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{a.metric}</span>
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded border ${color}`}>
                      <Icon size={11} />
                      {a.severity.charAt(0).toUpperCase() + a.severity.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-800 font-medium">{a.desc}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Value: <span className="font-mono font-semibold text-red-600">{a.value.toLocaleString()}</span>
                    &nbsp;· Expected: <span className="font-mono font-semibold text-green-600">{a.expected.toLocaleString()}</span>
                    &nbsp;· Deviation: <span className="font-mono font-semibold">{Math.abs(((a.value - a.expected) / a.expected) * 100).toFixed(1)}%</span>
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
