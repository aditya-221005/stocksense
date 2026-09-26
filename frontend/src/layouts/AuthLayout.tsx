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
      {/* Ambient Radial Background Glows */}
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-cyan-600/15 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md z-10 flex flex-col items-center">
        {/* Minimalist Floating Logo Card */}
        <div className="relative mb-8 group flex flex-col items-center">
          {/* Logo Glow Aura */}
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-blue-500 opacity-40 blur-lg group-hover:opacity-75 transition duration-500"></div>

          {/* Floating White Glass Container for Brand Logo */}
          <div className="relative flex items-center justify-center px-6 py-3.5 bg-white/95 backdrop-blur-xl border border-white/40 rounded-2xl shadow-2xl shadow-cyan-500/20 ring-1 ring-white/50 transition-all duration-300 group-hover:scale-[1.02]">
            <img 
              src="/logo-full.png" 
              alt="StockSense Logo" 
              className="h-11 sm:h-12 w-auto object-contain mix-blend-multiply" 
            />
          </div>

          {/* Subtitle Badge */}
          <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-cyan-500/30 text-[11px] font-bold tracking-widest text-cyan-400 uppercase shadow-inner">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping"></span>
            Smart Inventory Platform
          </div>
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
