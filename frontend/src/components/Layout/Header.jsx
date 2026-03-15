import React from 'react';
import { LogOut, Bell } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getInitials } from '../../utils/helpers';

const Header = ({ pageTitle = 'Dashboard' }) => {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-10">
      <h1 className="text-lg font-semibold text-gray-900">{pageTitle}</h1>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="relative p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* User info */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-semibold">
            {getInitials(user?.name || 'User')}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-900 leading-tight">{user?.name || 'User'}</p>
            <p className="text-xs text-gray-500">{user?.email || ''}</p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
