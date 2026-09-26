import React, { useEffect, useState } from "react";
import {
  Package,
  Boxes,
  AlertTriangle,
  IndianRupee,
} from "lucide-react";
import { DashboardService } from "../services/dashboard.service";
import { DashboardSummary } from "../types";
import StatCard from "../components/StatCard";
import RecentMovements from "../components/RecentMovements";
import LowStock from "../components/LowStock";
import { dashboardStats } from "../data/mockData";

export const DashboardPage: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const data = await DashboardService.getSummary();
        setSummary(data);
      } catch {
        // Fallback to mock data if API unavailable
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  const totalProducts = summary?.kpis.totalProducts ?? dashboardStats.totalProducts;
  const totalStock = summary?.kpis.totalItemsOnHand ?? dashboardStats.totalStock;
  const lowStockCount = summary?.kpis.lowStockAlertsCount ?? dashboardStats.lowStock;
  const totalStockValue = summary?.kpis.totalStockValue ?? dashboardStats.inventoryValue;

  const lowStockItems = summary?.lowStockAlerts.map((item, idx) => ({
    id: idx,
    name: item.productName,
    sku: item.sku,
    quantity: item.onHand,
    minStock: item.minStock,
  }));

  const recentMovements = summary?.recentActivities.map((doc) => {
    const line = doc.lines && doc.lines[0];
    const productName = line?.product?.name || doc.reference || "Stock Operation";
    const qty = line?.quantity || 1;
    const isStockIn = doc.type === "RECEIPT";

    return {
      id: doc.id,
      productName,
      type: isStockIn ? "Stock In" : "Stock Out",
      quantity: qty,
      date: new Date(doc.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
    };
  });

  return (
    <div className="p-2 sm:p-6 space-y-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-slate-900">
          Dashboard
        </h2>
        <p className="mt-1 text-slate-500">
          Here's what's happening with your inventory today.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Products"
          value={totalProducts.toString()}
          icon={<Package size={22} />}
          description="Products in inventory"
        />

        <StatCard
          title="Total Stock"
          value={totalStock.toLocaleString()}
          icon={<Boxes size={22} />}
          description="Units currently available"
        />

        <StatCard
          title="Low Stock"
          value={lowStockCount.toString()}
          icon={<AlertTriangle size={22} />}
          description="Products need attention"
        />

        <StatCard
          title="Inventory Value"
          value={`₹${totalStockValue.toLocaleString("en-IN")}`}
          icon={<IndianRupee size={22} />}
          description="Total inventory value"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <RecentMovements movements={recentMovements} />
        <LowStock items={lowStockItems} />
      </div>
    </div>
  );
};

export default DashboardPage;
