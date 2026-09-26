import React, { useEffect, useState } from 'react';
import { InventoryService } from '../services/inventory.service';
import { StockLedger } from '../types';
import { History, Filter, ArrowDownRight, ArrowUpRight, Repeat, SlidersHorizontal } from 'lucide-react';

export const LedgerPage: React.FC = () => {
  const [ledger, setLedger] = useState<StockLedger[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await InventoryService.getStockLedger({ type: selectedType || undefined });
      setLedger(data);
    } catch (err) {
      console.error('Failed to load stock ledger:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedType]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Stock Movement Ledger</h1>
          <p className="text-xs text-slate-400 mt-1">Immutable audit log of all stock increases, deductions, transfers, and count adjustments.</p>
        </div>
      </div>

      {/* Filter */}
      <div className="glass-card p-4 rounded-xl border border-slate-800 flex items-center gap-3">
        <Filter className="w-4 h-4 text-slate-400" />
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-slate-200 px-3 py-2 focus:outline-none focus:border-indigo-500"
        >
          <option value="">All Movement Types</option>
          <option value="RECEIPT">Receipt (Stock In)</option>
          <option value="DELIVERY">Delivery (Stock Out)</option>
          <option value="TRANSFER_IN">Transfer In</option>
          <option value="TRANSFER_OUT">Transfer Out</option>
          <option value="ADJUSTMENT">Stock Adjustment</option>
        </select>
      </div>

      {/* Ledger Table */}
      <div className="glass-card rounded-xl border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Loading stock ledger...
          </div>
        ) : ledger.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">No stock ledger entries recorded.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Date & Time</th>
                  <th className="py-3.5 px-4 font-semibold">Type</th>
                  <th className="py-3.5 px-4 font-semibold">Product Name</th>
                  <th className="py-3.5 px-4 font-semibold">Location</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Qty Movement</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Balance Before</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Balance After</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {ledger.map((entry) => {
                  const qty = Number(entry.quantity);
                  const isPositive = qty > 0;

                  return (
                    <tr key={entry.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4 font-mono text-slate-400">
                        {new Date(entry.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            entry.type === 'RECEIPT' || entry.type === 'TRANSFER_IN'
                              ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800/50'
                              : entry.type === 'DELIVERY' || entry.type === 'TRANSFER_OUT'
                              ? 'bg-amber-950/80 text-amber-400 border-amber-800/50'
                              : 'bg-indigo-950/80 text-indigo-400 border-indigo-800/50'
                          }`}
                        >
                          {entry.type}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-white">{entry.product?.name}</td>
                      <td className="py-3.5 px-4 font-mono text-indigo-300">
                        {entry.location?.warehouse?.shortCode} / {entry.location?.name}
                      </td>
                      <td className={`py-3.5 px-4 text-right font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isPositive ? `+${qty}` : qty} {entry.product?.uom?.symbol}
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-400">{Number(entry.balanceBefore)}</td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-200">{Number(entry.balanceAfter)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
