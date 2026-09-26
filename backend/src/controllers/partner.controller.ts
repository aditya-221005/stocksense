import { Request, Response } from 'express';
import { PartnerService } from '../services/partner.service.js';
import { asyncHandler } from '../utils/async-handler.js';

export class PartnerController {
  // Suppliers
  static getSuppliers = asyncHandler(async (_req: Request, res: Response) => {
    const suppliers = await PartnerService.getSuppliers();
    res.json(suppliers);
  });

  static createSupplier = asyncHandler(async (req: Request, res: Response) => {
    const { name, email, phone, address } = req.body;
    if (!name) return res.status(400).json({ error: 'Supplier name is required.' });
    const supplier = await PartnerService.createSupplier({ name, email, phone, address });
    res.status(201).json(supplier);
  });

  // Customers
  static getCustomers = asyncHandler(async (_req: Request, res: Response) => {
    const customers = await PartnerService.getCustomers();
    res.json(customers);
  });

  static createCustomer = asyncHandler(async (req: Request, res: Response) => {
    const { name, email, phone, address } = req.body;
    if (!name) return res.status(400).json({ error: 'Customer name is required.' });
    const customer = await PartnerService.createCustomer({ name, email, phone, address });
    res.status(201).json(customer);
  });
}
