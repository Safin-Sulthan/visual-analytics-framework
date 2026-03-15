import { useState } from 'react'
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { BarChart3, TrendingUp, PieChart } from 'lucide-react'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const areaData = MONTHS.map((m, i) => ({
  month: m,
  sales: Math.floor(4000 + Math.sin(i * 0.5) * 2000 + Math.random() * 1000),
  returns: Math.floor(500 + Math.random() * 500),
}))

const barData = [
  { region: 'North', revenue: 42000, target: 40000 },
  { region: 'South', revenue: 38000, target: 45000 },
  { region: 'East', revenue: 55000, target: 50000 },
  { region: 'West', revenue: 31000, target: 35000 },
  { region: 'Central', revenue: 48000, target: 42000 },
]

const CHART_TYPES = [
  { id: 'area', label: 'Area Chart', icon: TrendingUp },
  { id: 'bar', label: 'Bar Chart', icon: BarChart3 },
  { id: 'line', label: 'Line Chart', icon: PieChart },
]

export default function AnalyticsPage() {
  const [chartType, setChartType] = useState('area')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-500 mt-1">Visual analytics with interactive charts</p>
      </div>

      {/* Chart type selector */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex flex-wrap gap-3 mb-6">
          {CHART_TYPES.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setChartType(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                chartType === id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        <h3 className="font-semibold text-gray-800 mb-4">Sales & Returns — Monthly Trend</h3>
        <ResponsiveContainer width="100%" height={320}>
          {chartType === 'area' ? (
            <AreaChart data={areaData}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorReturns" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="sales" stroke="#3b82f6" fill="url(#colorSales)" strokeWidth={2} />
              <Area type="monotone" dataKey="returns" stroke="#ef4444" fill="url(#colorReturns)" strokeWidth={2} />
            </AreaChart>
          ) : chartType === 'bar' ? (
            <BarChart data={areaData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="sales" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="returns" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : (
            <LineChart data={areaData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="returns" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Regional bar chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-800 mb-4">Revenue vs Target by Region</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={barData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 12 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
            <YAxis type="category" dataKey="region" tick={{ fontSize: 12 }} width={60} />
            <Tooltip formatter={(v) => `$${v.toLocaleString()}`} />
            <Legend />
            <Bar dataKey="revenue" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Revenue" />
            <Bar dataKey="target" fill="#e5e7eb" radius={[0, 4, 4, 0]} name="Target" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* KPI summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: '$214,000', delta: '+12.3%', up: true },
          { label: 'Avg. Order Value', value: '$347', delta: '+5.1%', up: true },
          { label: 'Return Rate', value: '8.2%', delta: '-2.4%', up: false },
          { label: 'Conversion Rate', value: '3.7%', delta: '+0.8%', up: true },
        ].map(({ label, value, delta, up }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className={`text-xs font-medium mt-1 ${up ? 'text-green-600' : 'text-red-500'}`}>{delta} vs last period</p>
          </div>
        ))}
      </div>
    </div>
  )
}
