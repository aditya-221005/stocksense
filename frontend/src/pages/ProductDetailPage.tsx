import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ProductService } from '../services/product.service';
import { Product } from '../types';
import { Package, ArrowLeft, Warehouse, History, Tag, DollarSign, Layers } from 'lucide-react';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      try {
        const data = await ProductService.getProductById(id);
        setProduct(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load product detail.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-sm">
        {error || 'Product not found.'}
      </div>
    );
  }

  const totalOnHand = product.stockBalances
    ? product.stockBalances.reduce((sum, b) => sum + Number(b.onHand), 0)
    : 0;

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link to="/products" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Products</span>
      </Link>

      {/* Header Info */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Package className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white tracking-tight">{product.name}</h1>
              <span className="px-2.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-xs font-semibold text-slate-300">
                {product.sku}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Category: <span className="text-slate-200">{typeof product.category === 'object' && product.category !== null ? product.category.name : (product.category || 'None')}</span> • Unit of Measure: <span className="text-slate-200">{product.uom?.name} ({product.uom?.symbol})</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6">
          <div>
            <span className="text-xs text-slate-400 block uppercase font-medium">Unit Cost</span>
            <span className="text-xl font-bold text-emerald-400">${Number(product.unitCost).toFixed(2)}</span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block uppercase font-medium">Total On Hand</span>
            <span className="text-xl font-bold text-indigo-400">{totalOnHand} {product.uom?.symbol}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock Balances by Location */}
        <div className="glass-card p-5 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-800">
            <Warehouse className="w-5 h-5 text-indigo-400" />
            <h3 className="font-semibold text-white text-sm">Stock Distribution by Location</h3>
          </div>

          <div className="mt-4 space-y-3">
            {!product.stockBalances || product.stockBalances.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">No stock recorded in any warehouse location.</p>
            ) : (
              product.stockBalances.map((sb) => (
                <div key={sb.id} className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800/80 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-semibold text-white">{sb.warehouse?.name}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">Location: <span className="font-mono text-slate-300">{sb.location?.name}</span></p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-indigo-400">{Number(sb.onHand)} {product.uom?.symbol}</span>
                    <p className="text-[10px] text-slate-500">Reserved: {Number(sb.reserved)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Ledger History */}
        <div className="glass-card p-5 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-800">
            <History className="w-5 h-5 text-indigo-400" />
            <h3 className="font-semibold text-white text-sm">Recent Ledger Audit Trail</h3>
          </div>

          <div className="mt-4 space-y-3">
            {!product.ledgerEntries || product.ledgerEntries.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">No transaction history recorded yet.</p>
            ) : (
              product.ledgerEntries.map((le) => (
                <div key={le.id} className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800/80 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        le.type === 'RECEIPT' ? 'bg-emerald-950 text-emerald-400' :
                        le.type === 'DELIVERY' ? 'bg-amber-950 text-amber-400' :
                        'bg-indigo-950 text-indigo-400'
                      }`}>
                        {le.type}
                      </span>
                      <span className="text-xs text-slate-300 font-mono">{le.location?.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      {new Date(le.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-bold ${Number(le.quantity) > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {Number(le.quantity) > 0 ? `+${le.quantity}` : le.quantity}
                    </span>
                    <p className="text-[10px] text-slate-400">Balance: {Number(le.balanceAfter)}</p>
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
