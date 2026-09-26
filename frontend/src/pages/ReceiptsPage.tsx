import React, { useEffect, useState } from 'react';
import { InventoryService } from '../services/inventory.service';
import { ProductService } from '../services/product.service';
import { WarehouseService } from '../services/warehouse.service';
import { InventoryDocument, Product, Warehouse, Location, Supplier } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { ArrowDownRight, Plus, CheckCircle, Clock } from 'lucide-react';

export const ReceiptsPage: React.FC = () => {
  const [receipts, setReceipts] = useState<InventoryDocument[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [warehouseId, setWarehouseId] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState<Array<{ productId: string; quantity: number; unitCost: number; toLocationId: string }>>([]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rData, pData, wData, lData, sData] = await Promise.all([
        InventoryService.getReceipts(),
        ProductService.getProducts(),
        WarehouseService.getWarehouses(),
        WarehouseService.getLocations(),
        InventoryService.getSuppliers(),
      ]);
      setReceipts(rData);
      setProducts(pData);
      setWarehouses(wData);
      setLocations(lData);
      setSuppliers(sData);

      if (wData.length > 0 && !warehouseId) setWarehouseId(wData[0].id);
    } catch (err: any) {
      setError(err.message || 'Failed to load receipts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const addLine = () => {
    const defaultProduct = products[0];
    const defaultLoc = locations.find((l) => l.warehouseId === warehouseId) || locations[0];
    if (!defaultProduct || !defaultLoc) return;

    setLines([
      ...lines,
      {
        productId: defaultProduct.id,
        quantity: 1,
        unitCost: Number(defaultProduct.unitCost) || 0,
        toLocationId: defaultLoc.id,
      },
    ]);
  };

  const handleCreateReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lines.length === 0) {
      setError('Please add at least one line item.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await InventoryService.createReceipt({
        warehouseId,
        supplierId: supplierId || undefined,
        notes,
        lines,
      });
      setIsModalOpen(false);
      setLines([]);
      setNotes('');
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to create receipt.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleValidate = async (id: string) => {
    if (!confirm('Validate and complete this receipt? Stock levels will be increased.')) return;
    try {
      await InventoryService.validateReceipt(id);
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
          <h1 className="text-2xl font-bold text-white tracking-tight">Receipt Operations (Stock IN)</h1>
          <p className="text-xs text-slate-400 mt-1">Record and validate incoming shipments from suppliers to increase stock.</p>
        </div>
        <button
          onClick={() => {
            setIsModalOpen(true);
            if (lines.length === 0) addLine();
          }}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-lg shadow-indigo-500/20 transition flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Receipt</span>
        </button>
      </div>

      <div className="glass-card rounded-xl border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Loading receipts...
          </div>
        ) : receipts.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">No receipt operations recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Reference</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold">Warehouse</th>
                  <th className="py-3.5 px-4 font-semibold">Supplier</th>
                  <th className="py-3.5 px-4 font-semibold">Created By</th>
                  <th className="py-3.5 px-4 font-semibold">Line Items</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {receipts.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-white">{r.reference}</td>
                    <td className="py-3.5 px-4"><StatusBadge status={r.status} /></td>
                    <td className="py-3.5 px-4">{r.warehouse?.name}</td>
                    <td className="py-3.5 px-4">{r.supplier?.name || 'N/A'}</td>
                    <td className="py-3.5 px-4 text-slate-400">{r.createdBy?.name}</td>
                    <td className="py-3.5 px-4 text-slate-300">{r.lines?.length || 0} product(s)</td>
                    <td className="py-3.5 px-4 text-right">
                      {r.status !== 'DONE' && (
                        <button
                          onClick={() => handleValidate(r.id)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-semibold transition inline-flex items-center gap-1"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Validate & Add Stock</span>
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

      {/* Modal: New Receipt */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Stock Receipt (IN)">
        {error && <div className="mb-4 p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs">{error}</div>}
        <form onSubmit={handleCreateReceipt} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Target Warehouse *</label>
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
              <label className="block text-slate-300 font-semibold mb-1">Supplier</label>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
              >
                <option value="">Select Supplier</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-semibold text-indigo-400">Line Items</label>
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
                <div key={idx} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-5">
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
                    <select
                      value={line.toLocationId}
                      onChange={(e) => {
                        const newLines = [...lines];
                        newLines[idx].toLocationId = e.target.value;
                        setLines(newLines);
                      }}
                      className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200"
                    >
                      {filteredLocations.map((l) => (
                        <option key={l.id} value={l.id}>{l.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-3">
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
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Notes</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="PO reference or notes..."
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
            />
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
              {submitting ? 'Creating...' : 'Create Receipt'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
