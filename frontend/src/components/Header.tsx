import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Bell, Search, LogOut } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'A';

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-6 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <div className="relative w-64 sm:w-80 md:w-96">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <input
            type="text"
            placeholder="Search inventory, SKUs, warehouses..."
            className="w-full rounded-xl border border-slate-800/80 bg-slate-900/80 py-2 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-cyan-500/80 focus:bg-slate-900 focus:ring-1 focus:ring-cyan-500/30 transition-all duration-200"
          />
        </div>
      </div>

      <div className="flex items-center gap-5">
        <button className="relative p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-900 transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-slate-950 shadow-sm shadow-rose-500/50" />
        </button>

        <div className="flex items-center gap-3 border-l border-slate-800/80 pl-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-600 via-indigo-600 to-purple-600 font-bold text-white shadow-md shadow-cyan-500/20 ring-2 ring-cyan-500/20">
            {initial}
          </div>

          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-slate-100 leading-none">{user?.name || 'Admin'}</p>
            <p className="text-xs text-slate-400 mt-1">{user?.role || 'Inventory Manager'}</p>
          </div>
        </div>

        {logout && (
          <button
            onClick={logout}
            title="Sign Out"
            className="flex items-center gap-2 rounded-xl border border-slate-800 px-3.5 py-1.5 text-xs font-semibold text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/40 transition-all duration-200"
          >
            <LogOut size={15} />
            <span className="hidden md:inline">Sign Out</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
