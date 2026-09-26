import React from "react";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { stockMovements } from "../data/mockData";
import { StockMovement } from "../types";

interface RecentMovementsProps {
  movements?: StockMovement[];
}

export const RecentMovements: React.FC<RecentMovementsProps> = ({ movements }) => {
  const displayMovements = movements ?? stockMovements;

  return (
    <div className="glass-card rounded-2xl p-6 border border-slate-800/80 bg-slate-900/70">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-100">
            Recent Movements
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Latest inventory receipts and stock transfers
          </p>
        </div>
      </div>

      <div className="space-y-3.5">
        {displayMovements.map((movement) => {
          const isStockIn = movement.type.toLowerCase().includes("in") || movement.type === "RECEIPT";

          return (
            <div
              key={movement.id}
              className="flex items-center justify-between border-b border-slate-800/50 pb-3.5 last:border-0 last:pb-0 hover:bg-slate-800/30 p-2 rounded-xl transition-colors duration-150"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-xl border ${
                    isStockIn
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                  }`}
                >
                  {isStockIn ? (
                    <ArrowDownLeft size={18} />
                  ) : (
                    <ArrowUpRight size={18} />
                  )}
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-200">
                    {movement.productName}
                  </p>
                  <p className="text-xs text-slate-500 font-medium">
                    {movement.date}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p
                  className={`text-sm font-bold ${
                    isStockIn ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {isStockIn ? "+" : "-"}
                  {movement.quantity}
                </p>

                <p className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">
                  {movement.type}
                </p>
              </div>
            </div>
          );
        })}

        {displayMovements.length === 0 && (
          <p className="py-6 text-center text-sm text-slate-500">
            No recent stock movements recorded.
          </p>
        )}
      </div>
    </div>
  );
};

export default RecentMovements;
