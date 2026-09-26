import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const AuthLayout: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex flex-col items-center justify-center text-slate-400">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-2xl shadow-cyan-500/10 mb-4 inline-block backdrop-blur-md">
            <img src="/logo-full.png" alt="StockSense Logo" className="h-12 object-contain" />
          </div>
          <p className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
            Smart Inventory Management Platform
          </p>
        </div>

        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800/90 shadow-2xl bg-slate-900/80">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
