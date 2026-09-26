import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ArrowLeftRight,
  Truck,
  Bell,
  Box,
  Warehouse as WarehouseIcon,
  ArrowDownRight,
  ArrowUpRight,
  Repeat,
  SlidersHorizontal,
  Users,
} from "lucide-react";

export const Sidebar: React.FC = () => {
  const menuItems = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Products", path: "/products", icon: Package },
    { name: "Stock Balances", path: "/stock", icon: Box },
    { name: "Stock Movements", path: "/movements", icon: ArrowLeftRight },
    { name: "Receipts (In)", path: "/receipts", icon: ArrowDownRight },
    { name: "Deliveries (Out)", path: "/deliveries", icon: ArrowUpRight },
    { name: "Transfers", path: "/transfers", icon: Repeat },
    { name: "Adjustments", path: "/adjustments", icon: SlidersHorizontal },
    { name: "Warehouses", path: "/warehouses", icon: WarehouseIcon },
    { name: "Suppliers", path: "/suppliers", icon: Truck },
    { name: "Customers", path: "/customers", icon: Users },
    { name: "Reorder Rules", path: "/reorder-rules", icon: Bell },
  ];

  return (
    <aside className="flex min-h-screen w-64 flex-col bg-slate-950 border-r border-slate-800/80 text-slate-100 sticky top-0 h-screen z-50">
      <div className="border-b border-slate-800/80 px-5 py-4 flex items-center gap-3 bg-slate-950/90">
        <div className="p-1.5 rounded-xl bg-slate-900 border border-slate-800/90 shadow-md shadow-cyan-500/10 shrink-0">
          <img src="/logo-icon.png" alt="StockSense Icon" className="h-9 w-9 object-contain rounded-lg" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-300 bg-clip-text text-transparent truncate">
            StockSense
          </h1>
          <p className="text-[10px] font-semibold text-cyan-400 tracking-wider uppercase">
            Smart Inventory
          </p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-indigo-600/90 to-cyan-600/90 text-white shadow-md shadow-cyan-500/20 font-semibold"
                    : "text-slate-400 hover:bg-slate-900/80 hover:text-slate-100"
                }`
              }
            >
              <Icon size={18} className="shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-slate-800/80 px-5 py-3.5 flex items-center justify-between text-xs text-slate-500 bg-slate-950/90">
        <span className="font-medium text-slate-400">StockSense Suite</span>
        <span className="rounded-full bg-cyan-950/80 border border-cyan-800/50 px-2 py-0.5 text-cyan-300 font-mono text-[10px]">
          v1.0.0
        </span>
      </div>
    </aside>
  );
};

export default Sidebar;
