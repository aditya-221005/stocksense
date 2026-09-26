import { prisma } from '../config/db.js';
import { Prisma } from '@prisma/client';

export class ProductService {
  static async getAllProducts(params?: { categoryId?: string; search?: string }) {
    const where: any = {};
    if (params?.categoryId) where.categoryId = params.categoryId;
    if (params?.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { sku: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    return await prisma.product.findMany({
      where,
      include: {
        category: true,
        uom: true,
        stockBalances: {
          include: {
            warehouse: true,
            location: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  static async getProductById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        uom: true,
        stockBalances: {
          include: {
            warehouse: true,
            location: true,
          },
        },
        reorderRules: true,
        ledgerEntries: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: { location: true },
        },
      },
    });

    if (!product) throw new Error('Product not found.');
    return product;
  }

  static async createProduct(data: {
    name: string;
    sku: string;
    categoryId?: string;
    uomId: string;
    unitCost: number;
    initialStock?: number;
    defaultWarehouseId?: string;
    defaultLocationId?: string;
  }) {
    const existing = await prisma.product.findUnique({ where: { sku: data.sku } });
    if (existing) throw new Error(`SKU "${data.sku}" is already in use.`);

    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const product = await tx.product.create({
        data: {
          name: data.name,
          sku: data.sku,
          categoryId: data.categoryId || null,
          uomId: data.uomId,
          unitCost: data.unitCost,
          initialStock: data.initialStock || 0,
        },
        include: { category: true, uom: true },
      });

      if (data.initialStock && data.initialStock > 0 && data.defaultLocationId && data.defaultWarehouseId) {
        await tx.stockBalance.create({
          data: {
            productId: product.id,
            warehouseId: data.defaultWarehouseId,
            locationId: data.defaultLocationId,
            onHand: data.initialStock,
          },
        });

        await tx.stockLedger.create({
          data: {
            productId: product.id,
            locationId: data.defaultLocationId,
            type: 'RECEIPT',
            quantity: data.initialStock,
            balanceBefore: 0,
            balanceAfter: data.initialStock,
          },
        });
      }

      return product;
    });
  }

  static async updateProduct(
    id: string,
    data: {
      name?: string;
      categoryId?: string;
      uomId?: string;
      unitCost?: number;
      active?: boolean;
    }
  ) {
    return await prisma.product.update({
      where: { id },
      data,
      include: { category: true, uom: true },
    });
  }

  static async deleteProduct(id: string) {
    return await prisma.product.delete({ where: { id } });
  }

  // Categories
  static async getCategories() {
    return await prisma.productCategory.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: 'asc' },
    });
  }

  static async createCategory(name: string) {
    return await prisma.productCategory.create({ data: { name } });
  }

  // UOMs
  static async getUoms() {
    return await prisma.unitOfMeasure.findMany({ orderBy: { name: 'asc' } });
  }

  static async createUom(name: string, symbol: string) {
    return await prisma.unitOfMeasure.create({ data: { name, symbol } });
  }
}
