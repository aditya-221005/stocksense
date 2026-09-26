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
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-slate-900">
          Low Stock Alerts
        </h3>
        <p className="text-sm text-slate-500">
          Products requiring immediate replenishment
        </p>
      </div>

      <div className="space-y-4">
        {displayItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between border-b border-slate-100 pb-4 last:border-0 last:pb-0"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-50 text-orange-600">
                <AlertTriangle size={18} />
              </div>

              <div>
                <p className="text-sm font-medium text-slate-800">
                  {item.name}
                </p>

                <p className="text-xs text-slate-500">
                  SKU: {item.sku}
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-sm font-semibold text-red-600">
                {item.quantity} left
              </p>

              <p className="text-xs text-slate-400">
                Min: {item.minStock}
              </p>
            </div>
          </div>
        ))}

        {displayItems.length === 0 && (
          <p className="py-4 text-center text-sm text-slate-500">
            All stock levels are currently optimal.
          </p>
        )}
      </div>
    </div>
  );
};

export default LowStock;
