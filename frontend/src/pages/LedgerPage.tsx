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

  const formattedMovements: StockMovement[] = ledgerEntries.length > 0
    ? ledgerEntries.map((entry) => {
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
      })
    : mockMovements;

  const filteredMovements = formattedMovements.filter((movement) => {
    const matchesSearch = movement.productName
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesType =
      typeFilter === "All" || movement.type === typeFilter;

    return matchesSearch && matchesType;
  });

  return (
    <div className="p-2 sm:p-6 space-y-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-slate-900">
          Stock Movements
        </h2>
        <p className="mt-1 text-slate-500">
          Track inventory coming in, going out, and internal location transfers.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search product..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:bg-white transition"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(event) => setTypeFilter(event.target.value)}
          className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white transition"
        >
          <option value="All">All Movements</option>
          <option value="Stock In">Stock In</option>
          <option value="Stock Out">Stock Out</option>
        </select>
      </div>

      {/* Movement Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Product
                </th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Type
                </th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Quantity
                </th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Date
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredMovements.map((movement) => (
                <tr key={movement.id} className="hover:bg-slate-50 transition">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-800">
                      {movement.productName}
                    </p>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full ${
                          movement.type === "Stock In"
                            ? "bg-green-50 text-green-600 border border-green-200"
                            : "bg-red-50 text-red-600 border border-red-200"
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
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {movement.type}
                      </span>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`text-sm font-bold ${
                        movement.type === "Stock In"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {movement.type === "Stock In" ? "+" : "-"}
                      {movement.quantity}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-600">
                    {movement.date}
                  </td>
                </tr>
              ))}

              {filteredMovements.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-10 text-center text-sm text-slate-500"
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
