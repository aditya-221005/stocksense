import { Request, Response } from 'express';
import { WarehouseService } from '../services/warehouse.service.js';
import { asyncHandler } from '../utils/async-handler.js';

export class WarehouseController {
  static getWarehouses = asyncHandler(async (_req: Request, res: Response) => {
    const warehouses = await WarehouseService.getAllWarehouses();
    res.json(warehouses);
  });

  static getWarehouseById = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const warehouse = await WarehouseService.getWarehouseById(id);
    res.json(warehouse);
  });

  static createWarehouse = asyncHandler(async (req: Request, res: Response) => {
    const { name, shortCode, address, managerId } = req.body;
    if (!name || !shortCode) {
      return res.status(400).json({ error: 'Name and shortCode are required.' });
    }
    const warehouse = await WarehouseService.createWarehouse({ name, shortCode, address, managerId });
    res.status(201).json(warehouse);
  });

  // Locations
  static getLocations = asyncHandler(async (req: Request, res: Response) => {
    const warehouseId = typeof req.query.warehouseId === 'string' ? req.query.warehouseId : undefined;
    const locations = await WarehouseService.getLocations(warehouseId);
    res.json(locations);
  });

  static createLocation = asyncHandler(async (req: Request, res: Response) => {
    const { name, shortCode, warehouseId, parentId } = req.body;
    if (!name || !shortCode || !warehouseId) {
      return res.status(400).json({ error: 'Name, shortCode, and warehouseId are required.' });
    }
    const location = await WarehouseService.createLocation({ name, shortCode, warehouseId, parentId });
    res.status(201).json(location);
  });
}
