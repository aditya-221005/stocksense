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
  History,
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
    <aside className="flex min-h-screen w-64 flex-col bg-slate-950 text-white sticky top-0 h-screen">
      <div className="border-b border-slate-800 px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">StockSense</h1>
        <p className="mt-1 text-sm text-slate-400">Inventory Management</p>
      </div>

      <nav className="flex-1 px-3 py-5 overflow-y-auto space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              <Icon size={19} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-slate-800 px-6 py-4 flex items-center justify-between text-xs text-slate-500">
        <span>StockSense</span>
        <span className="rounded bg-slate-900 px-2 py-0.5 text-slate-400 font-mono text-[10px]">v1.0.0</span>
      </div>
    </aside>
  );
};

export default Sidebar;
