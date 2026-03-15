import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { Database, BarChart3, TrendingUp, AlertTriangle, ArrowUpRight, ArrowDownRight } from 'lucide-react'

const lineData = [
  { month: 'Jan', value: 4200, prev: 3800 },
  { month: 'Feb', value: 5800, prev: 4100 },
  { month: 'Mar', value: 5200, prev: 4700 },
  { month: 'Apr', value: 7100, prev: 5000 },
  { month: 'May', value: 6400, prev: 5800 },
  { month: 'Jun', value: 8900, prev: 6200 },
  { month: 'Jul', value: 7600, prev: 7100 },
]

const barData = [
  { category: 'Sales', Q1: 4000, Q2: 3000, Q3: 5000 },
  { category: 'Marketing', Q1: 3000, Q2: 1398, Q3: 2800 },
  { category: 'Support', Q1: 2000, Q2: 9800, Q3: 3200 },
  { category: 'R&D', Q1: 2780, Q2: 3908, Q3: 4100 },
  { category: 'Ops', Q1: 1890, Q2: 4800, Q3: 2300 },
]

const pieData = [
  { name: 'Processed', value: 63, color: '#3b82f6' },
  { name: 'Pending', value: 22, color: '#f59e0b' },
  { name: 'Failed', value: 15, color: '#ef4444' },
]

const stats = [
  { label: 'Total Datasets', value: '24', change: '+3', up: true, icon: Database, color: 'bg-blue-500' },
  { label: 'Analytics Runs', value: '187', change: '+12%', up: true, icon: BarChart3, color: 'bg-purple-500' },
  { label: 'Predictions Made', value: '1,342', change: '+8%', up: true, icon: TrendingUp, color: 'bg-green-500' },
  { label: 'Anomalies Found', value: '17', change: '-4', up: false, icon: AlertTriangle, color: 'bg-orange-500' },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Overview of your analytics platform</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, change, up, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
            <div className={`${color} p-3 rounded-xl`}>
              <Icon size={22} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-500 truncate">{label}</p>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <div className={`flex items-center gap-1 text-xs font-medium ${up ? 'text-green-600' : 'text-red-500'}`}>
                {up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                <span>{change} vs last month</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Data Processing Trend</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} name="Current" />
              <Line type="monotone" dataKey="prev" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} name="Previous" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Job Status</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value">
                {pieData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => `${v}%`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {pieData.map((entry) => (
              <div key={entry.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ background: entry.color }} />
                  <span className="text-gray-600">{entry.name}</span>
                </div>
                <span className="font-semibold text-gray-800">{entry.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-base font-semibold text-gray-800 mb-4">Department Performance by Quarter</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="category" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="Q1" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Q2" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Q3" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent activity */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-base font-semibold text-gray-800 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {[
            { action: 'Dataset uploaded', detail: 'sales_data_q3.csv', time: '2 min ago', type: 'upload' },
            { action: 'Analytics run completed', detail: 'customer_behavior.csv', time: '15 min ago', type: 'analytics' },
            { action: 'Anomaly detected', detail: '3 anomalies in revenue data', time: '1 hr ago', type: 'anomaly' },
            { action: 'Report generated', detail: 'Monthly Summary Report', time: '3 hrs ago', type: 'report' },
          ].map((item, idx) => (
            <div key={idx} className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
              <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${item.type === 'anomaly' ? 'bg-red-500' : item.type === 'upload' ? 'bg-blue-500' : 'bg-green-500'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800">{item.action}</p>
                <p className="text-xs text-gray-500 truncate">{item.detail}</p>
              </div>
              <span className="text-xs text-gray-400 flex-shrink-0">{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
