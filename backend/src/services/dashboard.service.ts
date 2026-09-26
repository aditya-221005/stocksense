import { prisma } from '../config/db.js';

export class DashboardService {
  static async getSummary() {
    const totalProducts = await prisma.product.count({ where: { active: true } });
    const totalWarehouses = await prisma.warehouse.count();
    const pendingReceipts = await prisma.inventoryDocument.count({
      where: { type: 'RECEIPT', status: { in: ['DRAFT', 'WAITING', 'READY'] } },
    });
    const pendingDeliveries = await prisma.inventoryDocument.count({
      where: { type: 'DELIVERY', status: { in: ['DRAFT', 'WAITING', 'READY'] } },
    });

    const stockBalances = await prisma.stockBalance.findMany({
      include: {
        product: { select: { unitCost: true, id: true, name: true, sku: true } },
      },
    });

    let totalStockValue = 0;
    let totalItemsOnHand = 0;

    for (const sb of stockBalances) {
      const qty = Number(sb.onHand);
      const cost = Number(sb.product.unitCost);
      totalStockValue += qty * cost;
      totalItemsOnHand += qty;
    }

    const reorderRules = await prisma.reorderRule.findMany({
      where: { isActive: true },
      include: { product: true },
    });

    const lowStockAlerts: Array<{
      productName: string;
      sku: string;
      onHand: number;
      minStock: number;
    }> = [];

    for (const rule of reorderRules) {
      const productBalances = stockBalances.filter((b: any) => b.productId === rule.productId);
      const totalOnHand = productBalances.reduce((sum: number, b: any) => sum + Number(b.onHand), 0);
      const minStock = Number(rule.minimumStock);

      if (totalOnHand < minStock) {
        lowStockAlerts.push({
          productName: rule.product.name,
          sku: rule.product.sku,
          onHand: totalOnHand,
          minStock,
        });
      }
    }

    const recentActivities = await prisma.inventoryDocument.findMany({
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: {
        warehouse: true,
        createdBy: { select: { name: true } },
        lines: { include: { product: true } },
      },
    });

    return {
      kpis: {
        totalProducts,
        totalWarehouses,
        pendingReceipts,
        pendingDeliveries,
        totalStockValue,
        totalItemsOnHand,
        lowStockAlertsCount: lowStockAlerts.length,
      },
      lowStockAlerts,
      recentActivities,
    };
  }
}
