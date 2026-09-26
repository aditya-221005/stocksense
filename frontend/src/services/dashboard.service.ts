import { apiFetch } from './api';
import { DashboardSummary } from '../types';
import { dashboardStats, products, stockMovements } from '../data/mockData';

export class DashboardService {
  static async getSummary(): Promise<DashboardSummary> {
    try {
      return await apiFetch<DashboardSummary>('/dashboard');
    } catch {
      return {
        kpis: {
          totalProducts: dashboardStats.totalProducts,
          totalWarehouses: 2,
          pendingReceipts: 3,
          pendingDeliveries: 4,
          totalStockValue: dashboardStats.inventoryValue,
          totalItemsOnHand: dashboardStats.totalStock,
          lowStockAlertsCount: dashboardStats.lowStock,
        },
        lowStockAlerts: products
          .filter((p) => p.status === 'Low Stock' || p.status === 'Out of Stock')
          .map((p) => ({
            productName: p.name,
            sku: p.sku,
            onHand: p.quantity ?? 0,
            minStock: p.minStock ?? 10,
          })),
        recentActivities: stockMovements.map((m) => ({
          id: String(m.id),
          reference: `REC-${m.id}`,
          type: m.type === 'Stock In' ? 'RECEIPT' : 'DELIVERY',
          status: 'DONE',
          warehouseId: 'wh-main',
          warehouse: { id: 'wh-main', name: 'Main Warehouse', shortCode: 'WH-MAIN' },
          createdById: 'user-1',
          createdBy: { id: 'user-1', name: 'Admin', email: 'admin@stocksense.com' },
          lines: [
            {
              id: `line-${m.id}`,
              documentId: String(m.id),
              productId: String(m.id),
              product: {
                id: String(m.id),
                name: m.productName,
                sku: `SKU-${m.id}`,
                uomId: 'uom-1',
                uom: { id: 'uom-1', name: 'Units', symbol: 'pcs' },
                unitCost: 100,
                active: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
              quantity: m.quantity,
            },
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })),
      };
    }
  }
}

export default DashboardService;
