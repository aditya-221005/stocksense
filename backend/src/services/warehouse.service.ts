import { prisma } from '../config/db.js';
import { Prisma } from '@prisma/client';

export class WarehouseService {
  static async getAllWarehouses() {
    return await prisma.warehouse.findMany({
      include: {
        manager: { select: { id: true, name: true, email: true } },
        locations: true,
        _count: { select: { products: true, documents: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  static async getWarehouseById(id: string) {
    const warehouse = await prisma.warehouse.findUnique({
      where: { id },
      include: {
        manager: { select: { id: true, name: true, email: true } },
        locations: {
          include: {
            parent: true,
            children: true,
            _count: { select: { stockBalances: true } },
          },
        },
      },
    });
    if (!warehouse) throw new Error('Warehouse not found.');
    return warehouse;
  }

  static async createWarehouse(data: { name: string; shortCode: string; address?: string; managerId?: string }) {
    const existing = await prisma.warehouse.findUnique({ where: { shortCode: data.shortCode } });
    if (existing) throw new Error(`Warehouse short code "${data.shortCode}" already exists.`);

    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const warehouse = await tx.warehouse.create({
        data,
      });

      await tx.location.create({
        data: {
          name: `${data.name} Stock`,
          shortCode: 'STOCK',
          warehouseId: warehouse.id,
        },
      });

      return warehouse;
    });
  }

  // Locations
  static async getLocations(warehouseId?: string) {
    const where = warehouseId ? { warehouseId } : {};
    return await prisma.location.findMany({
      where,
      include: {
        warehouse: { select: { id: true, name: true, shortCode: true } },
        parent: true,
        children: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  static async createLocation(data: { name: string; shortCode: string; warehouseId: string; parentId?: string }) {
    return await prisma.location.create({
      data: {
        name: data.name,
        shortCode: data.shortCode,
        warehouseId: data.warehouseId,
        parentId: data.parentId || null,
      },
    });
  }
}
