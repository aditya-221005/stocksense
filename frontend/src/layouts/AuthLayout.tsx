import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const AuthLayout: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex flex-col items-center justify-center text-slate-400">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background radial highlights */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-cyan-900/10 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-indigo-900/10 rounded-full blur-[140px] pointer-events-none"></div>

      <div className="w-full max-w-md z-10 flex flex-col items-center">
        {/* Minimalist Logo Container with Hover Glow Only */}
        <div className="relative mb-8 group flex flex-col items-center cursor-pointer">
          {/* Hover Glow Aura — Opacity is 0 by default, 100 ONLY on hover */}
          <div className="absolute -inset-3 rounded-3xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-blue-500 opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-300 pointer-events-none"></div>

          {/* Minimal Transparent Logo Card */}
          <div className="relative flex items-center justify-center px-6 py-4 bg-slate-900/90 backdrop-blur-xl border border-slate-800/90 rounded-2xl shadow-xl transition-all duration-300 group-hover:border-cyan-500/60 group-hover:bg-slate-900">
            <img 
              src="/logo-full.png" 
              alt="StockSense Logo" 
              className="h-12 sm:h-14 w-auto object-contain transition-transform duration-300 group-hover:scale-[1.03]" 
            />
          </div>

          <p className="mt-3.5 text-xs font-semibold tracking-wider text-slate-400 uppercase">
            Smart Inventory Platform
          </p>
        </div>

        {/* Auth Form Card */}
        <div className="w-full glass-card rounded-3xl p-6 sm:p-8 border border-slate-800/90 shadow-2xl bg-slate-900/80 backdrop-blur-xl">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
