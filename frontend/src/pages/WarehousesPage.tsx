import React, { useEffect, useState } from 'react';
import { WarehouseService } from '../services/warehouse.service';
import { Warehouse, Location } from '../types';
import { Modal } from '../components/Modal';
import { Warehouse as WarehouseIcon, MapPin, Plus, Layers, UserCheck } from 'lucide-react';

export const WarehousesPage: React.FC = () => {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isWhModalOpen, setIsWhModalOpen] = useState(false);
  const [isLocModalOpen, setIsLocModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [whName, setWhName] = useState('');
  const [shortCode, setShortCode] = useState('');
  const [address, setAddress] = useState('');

  const [locName, setLocName] = useState('');
  const [locShortCode, setLocShortCode] = useState('');
  const [targetWhId, setTargetWhId] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await WarehouseService.getWarehouses();
      setWarehouses(data);
      if (data.length > 0 && !targetWhId) setTargetWhId(data[0].id);
    } catch (err: any) {
      setError(err.message || 'Failed to load warehouses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateWarehouse = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await WarehouseService.createWarehouse({ name: whName, shortCode, address });
      setIsWhModalOpen(false);
      setWhName('');
      setShortCode('');
      setAddress('');
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to create warehouse.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await WarehouseService.createLocation({
        name: locName,
        shortCode: locShortCode,
        warehouseId: targetWhId,
      });
      setIsLocModalOpen(false);
      setLocName('');
      setLocShortCode('');
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to create location.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Warehouse & Location Management</h1>
          <p className="text-xs text-slate-400 mt-1">Configure physical facilities, inventory racks, and stock locations.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsLocModalOpen(true)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Location</span>
          </button>
          <button
            onClick={() => setIsWhModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-lg shadow-indigo-500/20 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Warehouse</span>
          </button>
        </div>
      </div>

      {/* Warehouse Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          Loading warehouses...
        </div>
      ) : warehouses.length === 0 ? (
        <div className="glass-card p-12 text-center text-slate-500 text-xs rounded-xl border border-slate-800">
          No warehouses created yet. Click "Add Warehouse" to create one.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {warehouses.map((wh) => (
            <div key={wh.id} className="glass-card rounded-xl p-6 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                      <WarehouseIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base">{wh.name}</h3>
                      <span className="font-mono text-xs font-semibold text-slate-400">{wh.shortCode}</span>
                    </div>
                  </div>
                  {wh.manager && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-[11px] text-slate-300">
                      <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{wh.manager.name}</span>
                    </div>
                  )}
                </div>

                {wh.address && (
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-3">
                    <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
                    <span>{wh.address}</span>
                  </div>
                )}

                <div className="mt-5">
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Sub-Locations ({wh.locations?.length || 0})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {wh.locations && wh.locations.length > 0 ? (
                      wh.locations.map((loc) => (
                        <span
                          key={loc.id}
                          className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300"
                        >
                          {loc.name} ({loc.shortCode})
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500 italic">No sub-locations configured</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-6 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span>Total Locations: {wh.locations?.length || 0}</span>
                <button
                  onClick={() => {
                    setTargetWhId(wh.id);
                    setIsLocModalOpen(true);
                  }}
                  className="text-indigo-400 hover:underline font-semibold"
                >
                  + Add Location
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Add Warehouse */}
      <Modal isOpen={isWhModalOpen} onClose={() => setIsWhModalOpen(false)} title="Create New Warehouse">
        {error && <div className="mb-4 p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs">{error}</div>}
        <form onSubmit={handleCreateWarehouse} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Warehouse Name *</label>
            <input
              type="text"
              required
              value={whName}
              onChange={(e) => setWhName(e.target.value)}
              placeholder="e.g. Central Distribution Hub"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Short Code *</label>
            <input
              type="text"
              required
              value={shortCode}
              onChange={(e) => setShortCode(e.target.value)}
              placeholder="WH-HUB"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono uppercase focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="100 Logistics Way, Industrial Zone"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsWhModalOpen(false)}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold"
            >
              {submitting ? 'Creating...' : 'Create Warehouse'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Add Location */}
      <Modal isOpen={isLocModalOpen} onClose={() => setIsLocModalOpen(false)} title="Create Stock Location">
        {error && <div className="mb-4 p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs">{error}</div>}
        <form onSubmit={handleCreateLocation} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Warehouse *</label>
            <select
              required
              value={targetWhId}
              onChange={(e) => setTargetWhId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
            >
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.shortCode})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Location Name *</label>
            <input
              type="text"
              required
              value={locName}
              onChange={(e) => setLocName(e.target.value)}
              placeholder="e.g. Rack B / Shelf 2"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Short Code *</label>
            <input
              type="text"
              required
              value={locShortCode}
              onChange={(e) => setLocShortCode(e.target.value)}
              placeholder="RACK-B2"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono uppercase focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsLocModalOpen(false)}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold"
            >
              {submitting ? 'Creating...' : 'Create Location'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
