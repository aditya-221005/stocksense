import { prisma } from '../config/db.js';

export class PartnerService {
  // Suppliers
  static async getSuppliers() {
    return await prisma.supplier.findMany({ orderBy: { name: 'asc' } });
  }

  static async createSupplier(data: { name: string; email?: string; phone?: string; address?: string }) {
    return await prisma.supplier.create({ data });
  }

  // Customers
  static async getCustomers() {
    return await prisma.customer.findMany({ orderBy: { name: 'asc' } });
  }

  static async createCustomer(data: { name: string; email?: string; phone?: string; address?: string }) {
    return await prisma.customer.create({ data });
  }
}
