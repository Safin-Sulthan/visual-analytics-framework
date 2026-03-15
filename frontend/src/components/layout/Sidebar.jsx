import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Database,
  BarChart3,
  Lightbulb,
  Clock,
  TrendingUp,
  AlertTriangle,
  MessageSquare,
  FileText,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/datasets', label: 'Datasets', icon: Database },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/insights', label: 'Insights', icon: Lightbulb },
  { to: '/temporal', label: 'Temporal', icon: Clock },
  { to: '/predictions', label: 'Predictions', icon: TrendingUp },
  { to: '/anomalies', label: 'Anomalies', icon: AlertTriangle },
  { to: '/nlp', label: 'NLP', icon: MessageSquare },
  { to: '/reports', label: 'Reports', icon: FileText },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={`bg-gray-900 text-white flex flex-col transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      } min-h-screen flex-shrink-0`}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        {!collapsed && (
          <span className="text-lg font-bold text-blue-400 truncate">VAF Platform</span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded hover:bg-gray-700 transition-colors ml-auto"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="flex-1 py-4 space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`
            }
          >
            <Icon size={20} className="flex-shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {!collapsed && (
        <div className="p-4 border-t border-gray-700 text-xs text-gray-500">
          Visual Analytics v1.0
        </div>
      )}
    </aside>
  )
}
