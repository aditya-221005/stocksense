import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Warehouse as WarehouseIcon,
  Layers,
  ArrowDownRight,
  ArrowUpRight,
  Repeat,
  SlidersHorizontal,
  History,
  Users,
  Truck,
  Bell,
  Box,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Products', path: '/products', icon: Package },
    { label: 'Stock Balances', path: '/stock', icon: Box },
    { label: 'Warehouses', path: '/warehouses', icon: WarehouseIcon },
    { label: 'Receipts (In)', path: '/receipts', icon: ArrowDownRight },
    { label: 'Deliveries (Out)', path: '/deliveries', icon: ArrowUpRight },
    { label: 'Transfers', path: '/transfers', icon: Repeat },
    { label: 'Adjustments', path: '/adjustments', icon: SlidersHorizontal },
    { label: 'Stock Ledger', path: '/ledger', icon: History },
    { label: 'Reorder Rules', path: '/reorder-rules', icon: Bell },
    { label: 'Suppliers', path: '/suppliers', icon: Truck },
    { label: 'Customers', path: '/customers', icon: Users },
  ];

  return (
    <aside className="w-64 bg-slate-900/90 border-r border-slate-800 flex flex-col h-screen sticky top-0">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800 gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/30">
          SS
        </div>
        <div>
          <h1 className="font-bold text-lg text-white tracking-tight leading-none">StockSense</h1>
          <span className="text-[10px] uppercase font-semibold text-indigo-400 tracking-wider">Inventory System</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer / Info */}
      <div className="p-4 border-t border-slate-800 text-xs text-slate-500 flex items-center justify-between">
        <span>Odoo Hackathon 2026</span>
        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono text-[10px]">v1.0.0</span>
      </div>
    </aside>
  );
};
