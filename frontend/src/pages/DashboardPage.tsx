import React, { useEffect, useState } from 'react';
import { DashboardService } from '../services/dashboard.service';
import { DashboardSummary } from '../types';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { Link } from 'react-router-dom';
import {
  Package,
  Warehouse,
  ArrowDownRight,
  ArrowUpRight,
  DollarSign,
  AlertTriangle,
  Boxes,
  Clock,
  ChevronRight,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const data = await DashboardService.getSummary();
        setSummary(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard.');
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-sm">
        {error}
      </div>
    );
  }

  const kpis = summary?.kpis;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-indigo-950/40 to-slate-900">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">StockSense Overview</h1>
          <p className="text-xs text-slate-400 mt-1">Real-time inventory metrics, low-stock alerts, and pending stock operations.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/receipts"
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition shadow-md shadow-indigo-500/20 flex items-center gap-2"
          >
            <ArrowDownRight className="w-4 h-4" />
            <span>New Receipt</span>
          </Link>
          <Link
            to="/deliveries"
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition border border-slate-700 flex items-center gap-2"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>New Delivery</span>
          </Link>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Products"
          value={kpis?.totalProducts || 0}
          subtitle="Active SKUs"
          icon={Package}
          color="indigo"
        />
        <StatCard
          title="Stock Valuation"
          value={`$${(kpis?.totalStockValue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtitle={`${kpis?.totalItemsOnHand || 0} units on hand`}
          icon={DollarSign}
          color="emerald"
        />
        <StatCard
          title="Pending Receipts"
          value={kpis?.pendingReceipts || 0}
          subtitle="Incoming shipments"
          icon={ArrowDownRight}
          color="sky"
        />
        <StatCard
          title="Pending Deliveries"
          value={kpis?.pendingDeliveries || 0}
          subtitle="Outgoing orders"
          icon={ArrowUpRight}
          color="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Low Stock Alerts */}
        <div className="glass-card rounded-xl p-5 border border-slate-800 lg:col-span-1">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <h3 className="font-semibold text-white text-sm">Low Stock Alerts</h3>
            </div>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-950 text-amber-400 border border-amber-800">
              {summary?.lowStockAlerts.length || 0}
            </span>
          </div>

          <div className="mt-4 space-y-3 max-h-80 overflow-y-auto pr-1">
            {summary?.lowStockAlerts.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">All products are adequately stocked.</p>
            ) : (
              summary?.lowStockAlerts.map((alert, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80 flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-xs font-semibold text-slate-200">{alert.productName}</h4>
                    <span className="text-[10px] font-mono text-slate-500">{alert.sku}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-amber-400">{alert.onHand} pcs</span>
                    <p className="text-[10px] text-slate-500">Min: {alert.minStock}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="glass-card rounded-xl p-5 border border-slate-800 lg:col-span-2">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-400" />
              <h3 className="font-semibold text-white text-sm">Recent Inventory Operations</h3>
            </div>
            <Link to="/ledger" className="text-xs text-indigo-400 hover:underline flex items-center gap-1">
              <span>View Ledger</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {summary?.recentActivities.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">No recent inventory operations recorded.</p>
            ) : (
              summary?.recentActivities.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800/80 flex items-center justify-between hover:border-slate-700 transition"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                        doc.type === 'RECEIPT'
                          ? 'bg-emerald-950 text-emerald-400'
                          : doc.type === 'DELIVERY'
                          ? 'bg-amber-950 text-amber-400'
                          : doc.type === 'TRANSFER'
                          ? 'bg-indigo-950 text-indigo-400'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {doc.type.substring(0, 3)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-200">{doc.reference}</span>
                        <StatusBadge status={doc.status} />
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {doc.warehouse?.name} • Created by {doc.createdBy?.name}
                      </p>
                    </div>
                  </div>
                  <div className="text-right text-xs text-slate-500">
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
