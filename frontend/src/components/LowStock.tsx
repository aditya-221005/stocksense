import React from "react";
import { AlertTriangle } from "lucide-react";
import { products } from "../data/mockData";

export interface LowStockItem {
  id: string | number;
  name: string;
  sku: string;
  quantity: number;
  minStock: number;
}

interface LowStockProps {
  items?: LowStockItem[];
}

export const LowStock: React.FC<LowStockProps> = ({ items }) => {
  const displayItems = items && items.length > 0
    ? items
    : products
        .filter(
          (product) =>
            product.status === "Low Stock" ||
            product.status === "Out of Stock" ||
            (product.quantity !== undefined && product.minStock !== undefined && product.quantity <= product.minStock)
        )
        .map((p) => ({
          id: p.id,
          name: p.name,
          sku: p.sku,
          quantity: p.quantity ?? 0,
          minStock: p.minStock ?? 5,
        }));

  return (
    <div className="glass-card rounded-2xl p-6 border border-slate-800/80 bg-slate-900/70">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-100">
            Low Stock Alerts
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Products requiring immediate replenishment
          </p>
        </div>
      </div>

      <div className="space-y-3.5">
        {displayItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between border-b border-slate-800/50 pb-3.5 last:border-0 last:pb-0 hover:bg-slate-800/30 p-2 rounded-xl transition-colors duration-150"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
                <AlertTriangle size={18} />
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-200">
                  {item.name}
                </p>

                <p className="text-xs font-mono text-indigo-400">
                  SKU: {item.sku}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                {item.quantity} left
              </span>

              <p className="text-[11px] text-slate-500 mt-1 font-medium">
                Min: {item.minStock}
              </p>
            </div>
          </div>
        ))}

        {displayItems.length === 0 && (
          <p className="py-6 text-center text-sm text-slate-400">
            All stock levels are currently optimal.
          </p>
        )}
      </div>
    </div>
  );
};

export default LowStock;
