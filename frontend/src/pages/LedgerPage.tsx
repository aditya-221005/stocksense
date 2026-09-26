import React, { useEffect, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Search } from "lucide-react";
import { InventoryService } from "../services/inventory.service";
import { StockLedger, StockMovement } from "../types";
import { stockMovements as mockMovements } from "../data/mockData";

export const LedgerPage: React.FC = () => {
  const [ledgerEntries, setLedgerEntries] = useState<StockLedger[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");

  useEffect(() => {
    const fetchLedger = async () => {
      try {
        setLoading(true);
        const data = await InventoryService.getStockLedger();
        setLedgerEntries(data);
      } catch {
        // Fallback to mock data
      } finally {
        setLoading(false);
      }
    };
    fetchLedger();
  }, []);

  const formattedMovements: StockMovement[] = ledgerEntries.map((entry) => {
    const isStockIn = entry.type === "RECEIPT" || entry.type === "TRANSFER_IN";
    return {
      id: entry.id,
      productName: entry.product?.name || "Inventory Product",
      type: isStockIn ? "Stock In" : "Stock Out",
      quantity: Math.abs(entry.quantity),
      date: new Date(entry.createdAt).toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  });

  const filteredMovements = formattedMovements.filter((movement) => {
    const matchesSearch = movement.productName
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesType =
      typeFilter === "All" || movement.type === typeFilter;

    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">
          Stock Movements Audit Trail
        </h2>
        <p className="mt-1 text-sm text-slate-400 font-medium">
          Immutable historical log of receipts, deliveries, transfers, and inventory adjustments.
        </p>
      </div>

      {/* Filters */}
      <div className="glass-card rounded-2xl border border-slate-800/80 bg-slate-900/70 p-4 shadow-xl flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <input
            type="text"
            placeholder="Search by product name..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-900/80 py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all duration-200"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(event) => setTypeFilter(event.target.value)}
          className="rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-indigo-500 transition-all duration-200"
        >
          <option value="All">All Movements</option>
          <option value="Stock In">Stock In</option>
          <option value="Stock Out">Stock Out</option>
        </select>
      </div>

      {/* Movement Table */}
      <div className="glass-card overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/70 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="border-b border-slate-800/80 bg-slate-950/80">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Product
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Quantity
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Timestamp
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/50">
              {filteredMovements.map((movement) => (
                <tr key={movement.id} className="hover:bg-slate-800/40 transition-colors duration-150">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-100">
                      {movement.productName}
                    </p>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-xl border ${
                          movement.type === "Stock In"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                        }`}
                      >
                        {movement.type === "Stock In" ? (
                          <ArrowDownLeft size={16} />
                        ) : (
                          <ArrowUpRight size={16} />
                        )}
                      </div>

                      <span
                        className={`text-sm font-semibold ${
                          movement.type === "Stock In"
                            ? "text-emerald-400"
                            : "text-rose-400"
                        }`}
                      >
                        {movement.type}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`text-sm font-bold ${
                        movement.type === "Stock In"
                          ? "text-emerald-400"
                          : "text-rose-400"
                      }`}
                    >
                      {movement.type === "Stock In" ? "+" : "-"}
                      {movement.quantity}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-xs font-medium text-slate-400">
                    {movement.date}
                  </td>
                </tr>
              ))}

              {filteredMovements.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center text-sm text-slate-500"
                  >
                    {loading ? "Loading stock movements..." : "No movements found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LedgerPage;
