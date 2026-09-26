import { Request, Response } from 'express';
import { InventoryService } from '../services/inventory.service.js';
import { asyncHandler } from '../utils/async-handler.js';
import { DocumentType, DocumentStatus, LedgerType } from '@prisma/client';

export class InventoryController {
  // Stock Balances
  static getStockBalances = asyncHandler(async (req: Request, res: Response) => {
    const warehouseId = typeof req.query.warehouseId === 'string' ? req.query.warehouseId : undefined;
    const locationId = typeof req.query.locationId === 'string' ? req.query.locationId : undefined;
    const productId = typeof req.query.productId === 'string' ? req.query.productId : undefined;

    const balances = await InventoryService.getStockBalances({
      warehouseId,
      locationId,
      productId,
    });
    res.json(balances);
  });

  // Stock Ledger
  static getStockLedger = asyncHandler(async (req: Request, res: Response) => {
    const productId = typeof req.query.productId === 'string' ? req.query.productId : undefined;
    const locationId = typeof req.query.locationId === 'string' ? req.query.locationId : undefined;
    const type = typeof req.query.type === 'string' ? (req.query.type as LedgerType) : undefined;

    const ledger = await InventoryService.getStockLedger({
      productId,
      locationId,
      type,
    });
    res.json(ledger);
  });

  // Documents General
  static getDocuments = asyncHandler(async (req: Request, res: Response) => {
    const type = typeof req.query.type === 'string' ? (req.query.type as DocumentType) : undefined;
    const status = typeof req.query.status === 'string' ? (req.query.status as DocumentStatus) : undefined;

    const docs = await InventoryService.getDocuments(type, status);
    res.json(docs);
  });

  static getDocumentById = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const doc = await InventoryService.getDocumentById(id);
    res.json(doc);
  });

  // Receipts
  static createReceipt = asyncHandler(async (req: Request, res: Response) => {
    const { warehouseId, supplierId, scheduledDate, notes, lines } = req.body;
    if (!warehouseId || !lines || !Array.isArray(lines) || lines.length === 0) {
      return res.status(400).json({ error: 'Warehouse ID and at least one line item are required.' });
    }
    const createdById = req.user!.id;
    const receipt = await InventoryService.createReceipt({
      warehouseId,
      createdById,
      supplierId,
      scheduledDate,
      notes,
      lines,
    });
    res.status(201).json(receipt);
  });

  static validateReceipt = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const receipt = await InventoryService.validateReceipt(id);
    res.json({ message: 'Receipt validated successfully.', receipt });
  });

  // Deliveries
  static createDelivery = asyncHandler(async (req: Request, res: Response) => {
    const { warehouseId, customerId, deliveryAddress, scheduledDate, notes, lines } = req.body;
    if (!warehouseId || !lines || !Array.isArray(lines) || lines.length === 0) {
      return res.status(400).json({ error: 'Warehouse ID and at least one line item are required.' });
    }
    const createdById = req.user!.id;
    const delivery = await InventoryService.createDelivery({
      warehouseId,
      createdById,
      customerId,
      deliveryAddress,
      scheduledDate,
      notes,
      lines,
    });
    res.status(201).json(delivery);
  });

  static validateDelivery = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const delivery = await InventoryService.validateDelivery(id);
    res.json({ message: 'Delivery validated successfully.', delivery });
  });

  // Transfers
  static createTransfer = asyncHandler(async (req: Request, res: Response) => {
    const { warehouseId, scheduledDate, notes, lines } = req.body;
    if (!warehouseId || !lines || !Array.isArray(lines) || lines.length === 0) {
      return res.status(400).json({ error: 'Warehouse ID and at least one line item are required.' });
    }
    const createdById = req.user!.id;
    const transfer = await InventoryService.createTransfer({
      warehouseId,
      createdById,
      scheduledDate,
      notes,
      lines,
    });
    res.status(201).json(transfer);
  });

  static validateTransfer = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const transfer = await InventoryService.validateTransfer(id);
    res.json({ message: 'Transfer validated successfully.', transfer });
  });

  // Adjustments
  static createAdjustment = asyncHandler(async (req: Request, res: Response) => {
    const { warehouseId, reason, notes, lines } = req.body;
    if (!warehouseId || !lines || !Array.isArray(lines) || lines.length === 0) {
      return res.status(400).json({ error: 'Warehouse ID and at least one line item are required.' });
    }
    const createdById = req.user!.id;
    const adjustment = await InventoryService.createAdjustment({
      warehouseId,
      createdById,
      reason,
      notes,
      lines,
    });
    res.status(201).json(adjustment);
  });

  static validateAdjustment = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const adjustment = await InventoryService.validateAdjustment(id);
    res.json({ message: 'Adjustment validated successfully.', adjustment });
  });

  // Reorder Rules
  static getReorderRules = asyncHandler(async (_req: Request, res: Response) => {
    const rules = await InventoryService.getReorderRules();
    res.json(rules);
  });

  static createReorderRule = asyncHandler(async (req: Request, res: Response) => {
    const { productId, locationId, minimumStock, maximumStock, reorderQuantity } = req.body;
    if (!productId || minimumStock === undefined) {
      return res.status(400).json({ error: 'Product ID and minimum stock are required.' });
    }
    const rule = await InventoryService.createReorderRule({
      productId,
      locationId,
      minimumStock: Number(minimumStock),
      maximumStock: maximumStock !== undefined ? Number(maximumStock) : undefined,
      reorderQuantity: reorderQuantity !== undefined ? Number(reorderQuantity) : undefined,
    });
    res.status(201).json(rule);
  });

  static deleteReorderRule = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    await InventoryService.deleteReorderRule(id);
    res.json({ message: 'Reorder rule deleted successfully.' });
  });
}
