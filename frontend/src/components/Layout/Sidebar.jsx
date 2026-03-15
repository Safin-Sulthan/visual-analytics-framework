import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Database, BarChart2, Lightbulb,
  Activity, TrendingUp, FileText, Settings, Layers,
} from 'lucide-react';

const ICON_MAP = {
  LayoutDashboard, Database, BarChart2, Lightbulb,
  Activity, TrendingUp, FileText, Settings,
};

const NAV_ITEMS = [
  { label: 'Dashboard',   path: '/',            icon: 'LayoutDashboard' },
  { label: 'Datasets',    path: '/datasets',    icon: 'Database' },
  { label: 'Analytics',   path: '/analytics',   icon: 'BarChart2' },
  { label: 'Insights',    path: '/insights',    icon: 'Lightbulb' },
  { label: 'Monitoring',  path: '/monitoring',  icon: 'Activity' },
  { label: 'Predictions', path: '/predictions', icon: 'TrendingUp' },
  { label: 'Reports',     path: '/reports',     icon: 'FileText' },
  { label: 'Settings',    path: '/settings',    icon: 'Settings' },
];

const Sidebar = () => (
  <aside className="w-64 min-h-screen bg-white border-r border-gray-100 flex flex-col">
    {/* Logo */}
    <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-100">
      <Layers size={22} className="text-indigo-600" />
      <span className="text-base font-bold text-gray-900 leading-tight">
        Visual Analytics
      </span>
    </div>

    {/* Navigation */}
    <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
      {NAV_ITEMS.map(({ label, path, icon }) => {
        const Icon = ICON_MAP[icon];
        return (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'}`
            }
          >
            {Icon && <Icon size={18} />}
            {label}
          </NavLink>
        );
      })}
    </nav>

    {/* Footer */}
    <div className="px-6 py-4 border-t border-gray-100">
      <p className="text-xs text-gray-400">v1.0.0 · Visual Analytics Framework</p>
    </div>
  </aside>
);

export default Sidebar;
