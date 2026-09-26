import React, { useEffect, useState } from 'react';
import { InventoryService } from '../services/inventory.service';
import { ProductService } from '../services/product.service';
import { WarehouseService } from '../services/warehouse.service';
import { InventoryDocument, Product, Warehouse, Location, Customer } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { ArrowUpRight, Plus, CheckCircle } from 'lucide-react';

export const DeliveriesPage: React.FC = () => {
  const [deliveries, setDeliveries] = useState<InventoryDocument[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [warehouseId, setWarehouseId] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState<Array<{ productId: string; quantity: number; fromLocationId: string }>>([]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [dData, pData, wData, lData, cData] = await Promise.all([
        InventoryService.getDeliveries(),
        ProductService.getProducts(),
        WarehouseService.getWarehouses(),
        WarehouseService.getLocations(),
        InventoryService.getCustomers(),
      ]);
      setDeliveries(dData);
      setProducts(pData);
      setWarehouses(wData);
      setLocations(lData);
      setCustomers(cData);

      if (wData.length > 0 && !warehouseId) setWarehouseId(wData[0].id);
    } catch (err: any) {
      setError(err.message || 'Failed to load delivery orders.');
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
        fromLocationId: defaultLoc.id,
      },
    ]);
  };

  const handleCreateDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lines.length === 0) {
      setError('Please add at least one line item.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await InventoryService.createDelivery({
        warehouseId,
        customerId: customerId || undefined,
        deliveryAddress,
        notes,
        lines,
      });
      setIsModalOpen(false);
      setLines([]);
      setNotes('');
      setDeliveryAddress('');
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to create delivery order.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleValidate = async (id: string) => {
    if (!confirm('Validate and complete this delivery? Stock levels will be deducted.')) return;
    try {
      await InventoryService.validateDelivery(id);
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
          <h1 className="text-2xl font-bold text-white tracking-tight">Delivery Operations (Stock OUT)</h1>
          <p className="text-xs text-slate-400 mt-1">Record and validate outgoing shipments to customers to decrease stock.</p>
        </div>
        <button
          onClick={() => {
            setIsModalOpen(true);
            if (lines.length === 0) addLine();
          }}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-lg shadow-indigo-500/20 transition flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Delivery</span>
        </button>
      </div>

      <div className="glass-card rounded-xl border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Loading delivery orders...
          </div>
        ) : deliveries.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">No delivery operations recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Reference</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold">Warehouse</th>
                  <th className="py-3.5 px-4 font-semibold">Customer</th>
                  <th className="py-3.5 px-4 font-semibold">Created By</th>
                  <th className="py-3.5 px-4 font-semibold">Line Items</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {deliveries.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-white">{d.reference}</td>
                    <td className="py-3.5 px-4"><StatusBadge status={d.status} /></td>
                    <td className="py-3.5 px-4">{d.warehouse?.name}</td>
                    <td className="py-3.5 px-4">{d.customer?.name || 'N/A'}</td>
                    <td className="py-3.5 px-4 text-slate-400">{d.createdBy?.name}</td>
                    <td className="py-3.5 px-4 text-slate-300">{d.lines?.length || 0} product(s)</td>
                    <td className="py-3.5 px-4 text-right">
                      {d.status !== 'DONE' && (
                        <button
                          onClick={() => handleValidate(d.id)}
                          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[11px] font-semibold transition inline-flex items-center gap-1"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Validate & Deduct Stock</span>
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

      {/* Modal: New Delivery */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Delivery Order (OUT)">
        {error && <div className="mb-4 p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs">{error}</div>}
        <form onSubmit={handleCreateDelivery} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Source Warehouse *</label>
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
              <label className="block text-slate-300 font-semibold mb-1">Customer</label>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
              >
                <option value="">Select Customer</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
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
                      value={line.fromLocationId}
                      onChange={(e) => {
                        const newLines = [...lines];
                        newLines[idx].fromLocationId = e.target.value;
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
            <label className="block text-slate-300 font-semibold mb-1">Delivery Address</label>
            <input
              type="text"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              placeholder="Shipping destination address..."
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
              {submitting ? 'Creating...' : 'Create Delivery'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
