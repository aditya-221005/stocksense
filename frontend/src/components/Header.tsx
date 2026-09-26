import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Bell, Search, LogOut } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'A';

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 sticky top-0 z-40">
      <div className="relative w-72 sm:w-96">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          placeholder="Search inventory..."
          className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:bg-white transition"
        />
      </div>

      <div className="flex items-center gap-5">
        <button className="relative text-slate-600 hover:text-slate-900 transition">
          <Bell size={21} />
          <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-red-500" />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 font-semibold text-white">
            {initial}
          </div>

          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-slate-800">{user?.name || 'Admin'}</p>
            <p className="text-xs text-slate-500">{user?.role || 'Inventory Manager'}</p>
          </div>
        </div>

        {logout && (
          <button
            onClick={logout}
            title="Sign Out"
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition"
          >
            <LogOut size={16} />
            <span className="hidden md:inline">Sign Out</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
