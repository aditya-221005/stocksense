import React, { useEffect, useState } from 'react';
import { InventoryService } from '../services/inventory.service';
import { WarehouseService } from '../services/warehouse.service';
import { StockBalance, Warehouse } from '../types';
import { Boxes, Filter, Search, Warehouse as WarehouseIcon } from 'lucide-react';

export const StockBalancesPage: React.FC = () => {
  const [balances, setBalances] = useState<StockBalance[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [selectedWh, setSelectedWh] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [bData, wData] = await Promise.all([
        InventoryService.getStockBalances({ warehouseId: selectedWh || undefined }),
        WarehouseService.getWarehouses(),
      ]);
      setBalances(bData);
      setWarehouses(wData);
    } catch (err) {
      console.error('Failed to load stock balances:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedWh]);

  const filteredBalances = balances.filter(
    (b) =>
      b.product?.name.toLowerCase().includes(search.toLowerCase()) ||
      b.product?.sku.toLowerCase().includes(search.toLowerCase()) ||
      b.location?.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Stock Balances</h1>
          <p className="text-xs text-slate-400 mt-1">Real-time breakdown of physical on-hand and reserved inventory.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search product, SKU, or location..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900/80 border border-slate-700/80 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <WarehouseIcon className="w-4 h-4 text-slate-400" />
          <select
            value={selectedWh}
            onChange={(e) => setSelectedWh(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-slate-200 px-3 py-2 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Warehouses</option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Balances Table */}
      <div className="glass-card rounded-xl border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Loading stock balances...
          </div>
        ) : filteredBalances.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">No stock balances found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Product Name</th>
                  <th className="py-3.5 px-4 font-semibold">SKU</th>
                  <th className="py-3.5 px-4 font-semibold">Warehouse</th>
                  <th className="py-3.5 px-4 font-semibold">Location</th>
                  <th className="py-3.5 px-4 font-semibold text-right">On Hand</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Reserved</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Free to Use</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredBalances.map((b) => {
                  const onHand = Number(b.onHand);
                  const reserved = Number(b.reserved);
                  const free = onHand - reserved;

                  return (
                    <tr key={b.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4 font-medium text-white">{b.product?.name}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-400">{b.product?.sku}</td>
                      <td className="py-3.5 px-4 text-slate-300">{b.warehouse?.name}</td>
                      <td className="py-3.5 px-4 font-mono text-indigo-300">{b.location?.name}</td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-100">
                        {onHand} {b.product?.uom?.symbol}
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-400">{reserved}</td>
                      <td className="py-3.5 px-4 text-right font-bold text-emerald-400">{free}</td>
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
