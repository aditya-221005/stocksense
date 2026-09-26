import React, { useEffect, useState } from 'react';
import { InventoryService } from '../services/inventory.service';
import { ProductService } from '../services/product.service';
import { WarehouseService } from '../services/warehouse.service';
import { InventoryDocument, Product, Warehouse, Location } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { Repeat, Plus, CheckCircle } from 'lucide-react';

export const TransfersPage: React.FC = () => {
  const [transfers, setTransfers] = useState<InventoryDocument[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);

  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [warehouseId, setWarehouseId] = useState('');
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState<Array<{ productId: string; quantity: number; fromLocationId: string; toLocationId: string }>>([]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tData, pData, wData, lData] = await Promise.all([
        InventoryService.getTransfers(),
        ProductService.getProducts(),
        WarehouseService.getWarehouses(),
        WarehouseService.getLocations(),
      ]);
      setTransfers(tData);
      setProducts(pData);
      setWarehouses(wData);
      setLocations(lData);

      if (wData.length > 0 && !warehouseId) setWarehouseId(wData[0].id);
    } catch (err: any) {
      setError(err.message || 'Failed to load internal transfers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const addLine = () => {
    const defaultProduct = products[0];
    const locs = locations.filter((l) => l.warehouseId === warehouseId);
    const fromLoc = locs[0] || locations[0];
    const toLoc = locs[1] || locations[1] || locs[0];
    if (!defaultProduct || !fromLoc || !toLoc) return;

    setLines([
      ...lines,
      {
        productId: defaultProduct.id,
        quantity: 1,
        fromLocationId: fromLoc.id,
        toLocationId: toLoc.id,
      },
    ]);
  };

  const handleCreateTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lines.length === 0) {
      setError('Please add at least one line item.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await InventoryService.createTransfer({
        warehouseId,
        notes,
        lines,
      });
      setIsModalOpen(false);
      setLines([]);
      setNotes('');
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to create transfer operation.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleValidate = async (id: string) => {
    if (!confirm('Validate and execute internal stock transfer?')) return;
    try {
      await InventoryService.validateTransfer(id);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Validation failed.');
    }
  };

  const filteredLocations = locations.filter((l) => !warehouseId || l.warehouseId === warehouseId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Internal Stock Transfers</h1>
          <p className="text-xs text-slate-400 mt-1">Move inventory between locations, racks, or warehouses with complete audit history.</p>
        </div>
        <button
          onClick={() => {
            setIsModalOpen(true);
            if (lines.length === 0) addLine();
          }}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-lg shadow-indigo-500/20 transition flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Transfer</span>
        </button>
      </div>

      <div className="glass-card rounded-xl border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Loading transfers...
          </div>
        ) : transfers.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">No internal transfer operations recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Reference</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold">Warehouse</th>
                  <th className="py-3.5 px-4 font-semibold">Created By</th>
                  <th className="py-3.5 px-4 font-semibold">Items</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {transfers.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-white">{t.reference}</td>
                    <td className="py-3.5 px-4"><StatusBadge status={t.status} /></td>
                    <td className="py-3.5 px-4">{t.warehouse?.name}</td>
                    <td className="py-3.5 px-4 text-slate-400">{t.createdBy?.name}</td>
                    <td className="py-3.5 px-4 text-slate-300">{t.lines?.length || 0} product(s)</td>
                    <td className="py-3.5 px-4 text-right">
                      {t.status !== 'DONE' && (
                        <button
                          onClick={() => handleValidate(t.id)}
                          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[11px] font-semibold transition inline-flex items-center gap-1"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Validate Transfer</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: New Transfer */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Internal Transfer">
        {error && <div className="mb-4 p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs">{error}</div>}
        <form onSubmit={handleCreateTransfer} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Warehouse *</label>
            <select
              required
              value={warehouseId}
              onChange={(e) => setWarehouseId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
            >
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-semibold text-indigo-400">Transfer Items</label>
              <button
                type="button"
                onClick={addLine}
                className="text-xs text-indigo-400 hover:underline font-semibold"
              >
                + Add Item
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {lines.map((line, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
                  <div className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-8">
                      <select
                        value={line.productId}
                        onChange={(e) => {
                          const newLines = [...lines];
                          newLines[idx].productId = e.target.value;
                          setLines(newLines);
                        }}
                        className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200"
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-4">
                      <input
                        type="number"
                        min={1}
                        value={line.quantity}
                        onChange={(e) => {
                          const newLines = [...lines];
                          newLines[idx].quantity = Number(e.target.value);
                          setLines(newLines);
                        }}
                        className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded text-white text-center font-bold"
                        placeholder="Qty"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-500 block mb-0.5">From Location</span>
                      <select
                        value={line.fromLocationId}
                        onChange={(e) => {
                          const newLines = [...lines];
                          newLines[idx].fromLocationId = e.target.value;
                          setLines(newLines);
                        }}
                        className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-300"
                      >
                        {filteredLocations.map((l) => (
                          <option key={l.id} value={l.id}>{l.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block mb-0.5">To Location</span>
                      <select
                        value={line.toLocationId}
                        onChange={(e) => {
                          const newLines = [...lines];
                          newLines[idx].toLocationId = e.target.value;
                          setLines(newLines);
                        }}
                        className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-300"
                      >
                        {filteredLocations.map((l) => (
                          <option key={l.id} value={l.id}>{l.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold"
            >
              {submitting ? 'Creating...' : 'Create Transfer'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
