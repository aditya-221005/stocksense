import React, { useEffect, useState } from 'react';
import { InventoryService } from '../services/inventory.service';
import { ProductService } from '../services/product.service';
import { ReorderRule, Product } from '../types';
import { Modal } from '../components/Modal';
import { Bell, Plus, Trash2 } from 'lucide-react';

export const ReorderRulesPage: React.FC = () => {
  const [rules, setRules] = useState<ReorderRule[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [productId, setProductId] = useState('');
  const [minimumStock, setMinimumStock] = useState('');
  const [maximumStock, setMaximumStock] = useState('');
  const [reorderQuantity, setReorderQuantity] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [rData, pData] = await Promise.all([
        InventoryService.getReorderRules(),
        ProductService.getProducts(),
      ]);
      setRules(rData);
      setProducts(pData);
      if (pData.length > 0 && !productId) setProductId(pData[0].id);
    } catch (err) {
      console.error('Failed to load reorder rules:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await InventoryService.createReorderRule({
        productId,
        minimumStock: Number(minimumStock),
        maximumStock: maximumStock ? Number(maximumStock) : undefined,
        reorderQuantity: reorderQuantity ? Number(reorderQuantity) : undefined,
      });
      setIsModalOpen(false);
      setMinimumStock('');
      setMaximumStock('');
      setReorderQuantity('');
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to create reorder rule.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this reorder rule?')) return;
    try {
      await InventoryService.deleteReorderRule(id);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete rule.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Reorder Rules & Alerts</h1>
          <p className="text-xs text-slate-400 mt-1">Set automated minimum and maximum stock thresholds to trigger replenishment alerts.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-lg shadow-indigo-500/20 transition flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Reorder Rule</span>
        </button>
      </div>

      <div className="glass-card rounded-xl border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Loading rules...
          </div>
        ) : rules.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">No reorder rules configured yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Product Name</th>
                  <th className="py-3.5 px-4 font-semibold">SKU</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Min Threshold</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Max Threshold</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Reorder Quantity</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {rules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-medium text-white">{rule.product?.name}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">{rule.product?.sku}</td>
                    <td className="py-3.5 px-4 text-right font-bold text-amber-400">{Number(rule.minimumStock)}</td>
                    <td className="py-3.5 px-4 text-right text-slate-300">{rule.maximumStock !== null ? Number(rule.maximumStock) : '-'}</td>
                    <td className="py-3.5 px-4 text-right font-bold text-indigo-400">{rule.reorderQuantity !== null ? Number(rule.reorderQuantity) : '-'}</td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDelete(rule.id)}
                        className="p-1.5 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Create Reorder Rule */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Reorder Threshold Rule">
        {error && <div className="mb-4 p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs">{error}</div>}
        <form onSubmit={handleCreateRule} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Product *</label>
            <select
              required
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Min Stock *</label>
              <input
                type="number"
                required
                min={0}
                value={minimumStock}
                onChange={(e) => setMinimumStock(e.target.value)}
                placeholder="10"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Max Stock</label>
              <input
                type="number"
                min={0}
                value={maximumStock}
                onChange={(e) => setMaximumStock(e.target.value)}
                placeholder="100"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Reorder Qty</label>
              <input
                type="number"
                min={1}
                value={reorderQuantity}
                onChange={(e) => setReorderQuantity(e.target.value)}
                placeholder="25"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
              />
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
              {submitting ? 'Creating...' : 'Create Rule'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
