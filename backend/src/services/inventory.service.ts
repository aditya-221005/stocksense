import { prisma } from '../config/db.js';
import { DocumentType, DocumentStatus, LedgerType, AdjustmentReason, Prisma } from '@prisma/client';

export class InventoryService {
  // ==========================================
  // STOCK BALANCES & LEDGER
  // ==========================================
  static async getStockBalances(params?: { warehouseId?: string; locationId?: string; productId?: string }) {
    const where: any = {};
    if (params?.warehouseId) where.warehouseId = params.warehouseId;
    if (params?.locationId) where.locationId = params.locationId;
    if (params?.productId) where.productId = params.productId;

    return await prisma.stockBalance.findMany({
      where,
      include: {
        product: {
          include: { category: true, uom: true },
        },
        warehouse: true,
        location: true,
      },
      orderBy: { product: { name: 'asc' } },
    });
  }

  static async getStockLedger(params?: { productId?: string; locationId?: string; type?: LedgerType }) {
    const where: any = {};
    if (params?.productId) where.productId = params.productId;
    if (params?.locationId) where.locationId = params.locationId;
    if (params?.type) where.type = params.type;

    return await prisma.stockLedger.findMany({
      where,
      include: {
        product: { include: { uom: true } },
        location: { include: { warehouse: true } },
        document: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  // ==========================================
  // INVENTORY DOCUMENTS (GENERIC CRUD & LIST)
  // ==========================================
  static async getDocuments(type?: DocumentType, status?: DocumentStatus) {
    const where: any = {};
    if (type) where.type = type;
    if (status) where.status = status;

    return await prisma.inventoryDocument.findMany({
      where,
      include: {
        warehouse: true,
        createdBy: { select: { id: true, name: true, email: true } },
        responsible: { select: { id: true, name: true, email: true } },
        supplier: true,
        customer: true,
        lines: {
          include: {
            product: { include: { uom: true } },
            fromLocation: true,
            toLocation: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getDocumentById(id: string) {
    const doc = await prisma.inventoryDocument.findUnique({
      where: { id },
      include: {
        warehouse: true,
        createdBy: { select: { id: true, name: true, email: true } },
        responsible: { select: { id: true, name: true, email: true } },
        supplier: true,
        customer: true,
        receipt: true,
        delivery: true,
        transfer: true,
        adjustment: true,
        lines: {
          include: {
            product: { include: { uom: true } },
            fromLocation: true,
            toLocation: true,
          },
        },
        ledgerEntries: {
          include: {
            product: true,
            location: true,
          },
        },
      },
    });
    if (!doc) throw new Error('Inventory document not found.');
    return doc;
  }

  private static async generateReference(type: DocumentType, warehouseId: string): Promise<string> {
    const wh = await prisma.warehouse.findUnique({ where: { id: warehouseId } });
    const whCode = wh ? wh.shortCode : 'WH';

    let prefix = 'IN';
    if (type === DocumentType.DELIVERY) prefix = 'OUT';
    if (type === DocumentType.TRANSFER) prefix = 'TR';
    if (type === DocumentType.ADJUSTMENT) prefix = 'ADJ';

    const count = await prisma.inventoryDocument.count({ where: { type, warehouseId } });
    const num = (count + 1).toString().padStart(4, '0');

    return `${whCode}/${prefix}/${num}`;
  }

  // ==========================================
  // RECEIPT (STOCK IN)
  // ==========================================
  static async createReceipt(data: {
    warehouseId: string;
    createdById: string;
    supplierId?: string;
    scheduledDate?: Date;
    notes?: string;
    lines: Array<{
      productId: string;
      quantity: number;
      unitCost?: number;
      toLocationId: string;
    }>;
  }) {
    const reference = await this.generateReference(DocumentType.RECEIPT, data.warehouseId);

    return await prisma.inventoryDocument.create({
      data: {
        reference,
        type: DocumentType.RECEIPT,
        status: DocumentStatus.READY,
        warehouseId: data.warehouseId,
        createdById: data.createdById,
        supplierId: data.supplierId || null,
        scheduledDate: data.scheduledDate || new Date(),
        notes: data.notes || null,
        receipt: { create: {} },
        lines: {
          create: data.lines.map((l) => ({
            productId: l.productId,
            quantity: l.quantity,
            unitCost: l.unitCost || null,
            toLocationId: l.toLocationId,
          })),
        },
      },
      include: { lines: true, receipt: true },
    });
  }

  static async validateReceipt(documentId: string) {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const doc = await tx.inventoryDocument.findUnique({
        where: { id: documentId },
        include: { lines: true },
      });

      if (!doc || doc.type !== DocumentType.RECEIPT) {
        throw new Error('Invalid receipt document.');
      }
      if (doc.status === DocumentStatus.DONE) {
        throw new Error('Receipt has already been validated and completed.');
      }

      for (const line of doc.lines) {
        if (!line.toLocationId) {
          throw new Error(`Line with product ID ${line.productId} missing destination location.`);
        }

        const qty = Number(line.quantity);

        const balance = await tx.stockBalance.findUnique({
          where: {
            productId_locationId: {
              productId: line.productId,
              locationId: line.toLocationId,
            },
          },
        });

        const currentOnHand = balance ? Number(balance.onHand) : 0;
        const newOnHand = currentOnHand + qty;

        if (balance) {
          await tx.stockBalance.update({
            where: { id: balance.id },
            data: { onHand: newOnHand },
          });
        } else {
          await tx.stockBalance.create({
            data: {
              productId: line.productId,
              warehouseId: doc.warehouseId,
              locationId: line.toLocationId,
              onHand: newOnHand,
              reserved: 0,
            },
          });
        }

        await tx.stockLedger.create({
          data: {
            productId: line.productId,
            locationId: line.toLocationId,
            documentId: doc.id,
            type: LedgerType.RECEIPT,
            quantity: qty,
            balanceBefore: currentOnHand,
            balanceAfter: newOnHand,
          },
        });
      }

      return await tx.inventoryDocument.update({
        where: { id: documentId },
        data: {
          status: DocumentStatus.DONE,
          completedAt: new Date(),
        },
        include: { lines: true },
      });
    });
  }

  // ==========================================
  // DELIVERY (STOCK OUT)
  // ==========================================
  static async createDelivery(data: {
    warehouseId: string;
    createdById: string;
    customerId?: string;
    deliveryAddress?: string;
    scheduledDate?: Date;
    notes?: string;
    lines: Array<{
      productId: string;
      quantity: number;
      fromLocationId: string;
    }>;
  }) {
    const reference = await this.generateReference(DocumentType.DELIVERY, data.warehouseId);

    return await prisma.inventoryDocument.create({
      data: {
        reference,
        type: DocumentType.DELIVERY,
        status: DocumentStatus.READY,
        warehouseId: data.warehouseId,
        createdById: data.createdById,
        customerId: data.customerId || null,
        scheduledDate: data.scheduledDate || new Date(),
        notes: data.notes || null,
        delivery: {
          create: {
            deliveryAddress: data.deliveryAddress || null,
          },
        },
        lines: {
          create: data.lines.map((l) => ({
            productId: l.productId,
            quantity: l.quantity,
            fromLocationId: l.fromLocationId,
          })),
        },
      },
      include: { lines: true, delivery: true },
    });
  }

  static async validateDelivery(documentId: string) {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const doc = await tx.inventoryDocument.findUnique({
        where: { id: documentId },
        include: { lines: { include: { product: true } } },
      });

      if (!doc || doc.type !== DocumentType.DELIVERY) {
        throw new Error('Invalid delivery document.');
      }
      if (doc.status === DocumentStatus.DONE) {
        throw new Error('Delivery has already been validated and completed.');
      }

      for (const line of doc.lines) {
        if (!line.fromLocationId) {
          throw new Error(`Line for product "${line.product.name}" missing source location.`);
        }

        const qty = Number(line.quantity);

        const balance = await tx.stockBalance.findUnique({
          where: {
            productId_locationId: {
              productId: line.productId,
              locationId: line.fromLocationId,
            },
          },
        });

        const currentOnHand = balance ? Number(balance.onHand) : 0;
        if (currentOnHand < qty) {
          throw new Error(
            `Insufficient stock for "${line.product.name}". Required: ${qty}, On Hand: ${currentOnHand}`
          );
        }

        const newOnHand = currentOnHand - qty;

        await tx.stockBalance.update({
          where: { id: balance!.id },
          data: { onHand: newOnHand },
        });

        await tx.stockLedger.create({
          data: {
            productId: line.productId,
            locationId: line.fromLocationId,
            documentId: doc.id,
            type: LedgerType.DELIVERY,
            quantity: -qty,
            balanceBefore: currentOnHand,
            balanceAfter: newOnHand,
          },
        });
      }

      return await tx.inventoryDocument.update({
        where: { id: documentId },
        data: {
          status: DocumentStatus.DONE,
          completedAt: new Date(),
        },
        include: { lines: true },
      });
    });
  }

  // ==========================================
  // INTERNAL TRANSFER
  // ==========================================
  static async createTransfer(data: {
    warehouseId: string;
    createdById: string;
    scheduledDate?: Date;
    notes?: string;
    lines: Array<{
      productId: string;
      quantity: number;
      fromLocationId: string;
      toLocationId: string;
    }>;
  }) {
    const reference = await this.generateReference(DocumentType.TRANSFER, data.warehouseId);

    return await prisma.inventoryDocument.create({
      data: {
        reference,
        type: DocumentType.TRANSFER,
        status: DocumentStatus.READY,
        warehouseId: data.warehouseId,
        createdById: data.createdById,
        scheduledDate: data.scheduledDate || new Date(),
        notes: data.notes || null,
        transfer: { create: {} },
        lines: {
          create: data.lines.map((l) => ({
            productId: l.productId,
            quantity: l.quantity,
            fromLocationId: l.fromLocationId,
            toLocationId: l.toLocationId,
          })),
        },
      },
      include: { lines: true, transfer: true },
    });
  }

  static async validateTransfer(documentId: string) {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const doc = await tx.inventoryDocument.findUnique({
        where: { id: documentId },
        include: { lines: { include: { product: true } } },
      });

      if (!doc || doc.type !== DocumentType.TRANSFER) {
        throw new Error('Invalid transfer document.');
      }
      if (doc.status === DocumentStatus.DONE) {
        throw new Error('Transfer has already been completed.');
      }

      for (const line of doc.lines) {
        if (!line.fromLocationId || !line.toLocationId) {
          throw new Error(`Line for product "${line.product.name}" requires source and destination locations.`);
        }
        if (line.fromLocationId === line.toLocationId) {
          throw new Error('Source and destination locations cannot be identical.');
        }

        const qty = Number(line.quantity);

        const sourceBal = await tx.stockBalance.findUnique({
          where: {
            productId_locationId: {
              productId: line.productId,
              locationId: line.fromLocationId,
            },
          },
        });

        const srcOnHand = sourceBal ? Number(sourceBal.onHand) : 0;
        if (srcOnHand < qty) {
          throw new Error(
            `Insufficient stock at source location for "${line.product.name}". Required: ${qty}, On Hand: ${srcOnHand}`
          );
        }

        const newSrcOnHand = srcOnHand - qty;
        await tx.stockBalance.update({
          where: { id: sourceBal!.id },
          data: { onHand: newSrcOnHand },
        });

        await tx.stockLedger.create({
          data: {
            productId: line.productId,
            locationId: line.fromLocationId,
            documentId: doc.id,
            type: LedgerType.TRANSFER_OUT,
            quantity: -qty,
            balanceBefore: srcOnHand,
            balanceAfter: newSrcOnHand,
          },
        });

        const destBal = await tx.stockBalance.findUnique({
          where: {
            productId_locationId: {
              productId: line.productId,
              locationId: line.toLocationId,
            },
          },
        });

        const destOnHand = destBal ? Number(destBal.onHand) : 0;
        const newDestOnHand = destOnHand + qty;

        if (destBal) {
          await tx.stockBalance.update({
            where: { id: destBal.id },
            data: { onHand: newDestOnHand },
          });
        } else {
          await tx.stockBalance.create({
            data: {
              productId: line.productId,
              warehouseId: doc.warehouseId,
              locationId: line.toLocationId,
              onHand: newDestOnHand,
              reserved: 0,
            },
          });
        }

        await tx.stockLedger.create({
          data: {
            productId: line.productId,
            locationId: line.toLocationId,
            documentId: doc.id,
            type: LedgerType.TRANSFER_IN,
            quantity: qty,
            balanceBefore: destOnHand,
            balanceAfter: newDestOnHand,
          },
        });
      }

      return await tx.inventoryDocument.update({
        where: { id: documentId },
        data: {
          status: DocumentStatus.DONE,
          completedAt: new Date(),
        },
        include: { lines: true },
      });
    });
  }

  // ==========================================
  // INVENTORY ADJUSTMENT
  // ==========================================
  static async createAdjustment(data: {
    warehouseId: string;
    createdById: string;
    reason?: AdjustmentReason;
    notes?: string;
    lines: Array<{
      productId: string;
      toLocationId: string;
      countedQuantity: number;
    }>;
  }) {
    const reference = await this.generateReference(DocumentType.ADJUSTMENT, data.warehouseId);

    return await prisma.inventoryDocument.create({
      data: {
        reference,
        type: DocumentType.ADJUSTMENT,
        status: DocumentStatus.READY,
        warehouseId: data.warehouseId,
        createdById: data.createdById,
        scheduledDate: new Date(),
        notes: data.notes || null,
        adjustment: {
          create: {
            reason: data.reason || AdjustmentReason.STOCK_COUNT,
          },
        },
        lines: {
          create: data.lines.map((l) => ({
            productId: l.productId,
            quantity: l.countedQuantity,
            countedQuantity: l.countedQuantity,
            toLocationId: l.toLocationId,
          })),
        },
      },
      include: { lines: true, adjustment: true },
    });
  }

  static async validateAdjustment(documentId: string) {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const doc = await tx.inventoryDocument.findUnique({
        where: { id: documentId },
        include: { lines: { include: { product: true } } },
      });

      if (!doc || doc.type !== DocumentType.ADJUSTMENT) {
        throw new Error('Invalid adjustment document.');
      }
      if (doc.status === DocumentStatus.DONE) {
        throw new Error('Adjustment has already been validated and completed.');
      }

      for (const line of doc.lines) {
        if (!line.toLocationId) {
          throw new Error(`Line for product "${line.product.name}" missing target location.`);
        }

        const countedQty = line.countedQuantity !== null ? Number(line.countedQuantity) : Number(line.quantity);

        const balance = await tx.stockBalance.findUnique({
          where: {
            productId_locationId: {
              productId: line.productId,
              locationId: line.toLocationId,
            },
          },
        });

        const currentOnHand = balance ? Number(balance.onHand) : 0;
        const difference = countedQty - currentOnHand;

        if (balance) {
          await tx.stockBalance.update({
            where: { id: balance.id },
            data: { onHand: countedQty },
          });
        } else {
          await tx.stockBalance.create({
            data: {
              productId: line.productId,
              warehouseId: doc.warehouseId,
              locationId: line.toLocationId,
              onHand: countedQty,
              reserved: 0,
            },
          });
        }

        await tx.stockLedger.create({
          data: {
            productId: line.productId,
            locationId: line.toLocationId,
            documentId: doc.id,
            type: LedgerType.ADJUSTMENT,
            quantity: difference,
            balanceBefore: currentOnHand,
            balanceAfter: countedQty,
          },
        });
      }

      return await tx.inventoryDocument.update({
        where: { id: documentId },
        data: {
          status: DocumentStatus.DONE,
          completedAt: new Date(),
        },
        include: { lines: true },
      });
    });
  }

  // ==========================================
  // REORDER RULES
  // ==========================================
  static async getReorderRules() {
    return await prisma.reorderRule.findMany({
      include: {
        product: { include: { uom: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async createReorderRule(data: {
    productId: string;
    locationId?: string;
    minimumStock: number;
    maximumStock?: number;
    reorderQuantity?: number;
  }) {
    return await prisma.reorderRule.create({ data });
  }

  static async deleteReorderRule(id: string) {
    return await prisma.reorderRule.delete({ where: { id } });
  }
}
