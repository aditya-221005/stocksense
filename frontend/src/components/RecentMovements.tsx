import React from "react";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { stockMovements } from "../data/mockData";
import { StockMovement } from "../types";

interface RecentMovementsProps {
  movements?: StockMovement[];
}

export const RecentMovements: React.FC<RecentMovementsProps> = ({ movements }) => {
  const displayMovements = movements && movements.length > 0 ? movements : stockMovements;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            Recent Movements
          </h3>
          <p className="text-sm text-slate-500">
            Latest inventory receipts and stock transfers
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {displayMovements.map((movement) => {
          const isStockIn = movement.type.toLowerCase().includes("in") || movement.type === "RECEIPT";

          return (
            <div
              key={movement.id}
              className="flex items-center justify-between border-b border-slate-100 pb-4 last:border-0 last:pb-0"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full ${
                    isStockIn
                      ? "bg-green-50 text-green-600"
                      : "bg-red-50 text-red-600"
                  }`}
                >
                  {isStockIn ? (
                    <ArrowDownLeft size={18} />
                  ) : (
                    <ArrowUpRight size={18} />
                  )}
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-800">
                    {movement.productName}
                  </p>
                  <p className="text-xs text-slate-500">
                    {movement.date}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p
                  className={`text-sm font-semibold ${
                    isStockIn
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {isStockIn ? "+" : "-"}
                  {movement.quantity}
                </p>

                <p className="text-xs text-slate-400">
                  {movement.type}
                </p>
              </div>
            </div>
          );
        })}

        {displayMovements.length === 0 && (
          <p className="py-4 text-center text-sm text-slate-500">
            No recent stock movements recorded.
          </p>
        )}
      </div>
    </div>
  );
};

export default RecentMovements;
