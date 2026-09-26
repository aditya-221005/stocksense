import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { LogOut, User as UserIcon, Shield } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-slate-900/60 backdrop-blur-md border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-40">
      <div>
        <h2 className="text-sm font-semibold text-slate-300">Welcome back, <span className="text-white">{user?.name || 'User'}</span></h2>
        <p className="text-xs text-slate-500">Live Inventory Management & Tracking</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-xs">
          <Shield className="w-3.5 h-3.5 text-indigo-400" />
          <span className="font-semibold text-slate-300">{user?.role || 'STAFF'}</span>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition border border-slate-800 hover:border-rose-900/50"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </header>
  );
};
