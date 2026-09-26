import { apiFetch } from './api';
import {
  StockBalance,
  StockLedger,
  InventoryDocument,
  DocumentType,
  DocumentStatus,
  Supplier,
  Customer,
  ReorderRule,
} from '../types';

export class InventoryService {
  // Stock Balances
  static async getStockBalances(params?: { warehouseId?: string; locationId?: string; productId?: string }): Promise<StockBalance[]> {
    const query = new URLSearchParams();
    if (params?.warehouseId) query.append('warehouseId', params.warehouseId);
    if (params?.locationId) query.append('locationId', params.locationId);
    if (params?.productId) query.append('productId', params.productId);
    const qStr = query.toString() ? `?${query.toString()}` : '';

    return await apiFetch<StockBalance[]>(`/stock${qStr}`);
  }

  // Stock Ledger History
  static async getStockLedger(params?: { productId?: string; locationId?: string; type?: string }): Promise<StockLedger[]> {
    const query = new URLSearchParams();
    if (params?.productId) query.append('productId', params.productId);
    if (params?.locationId) query.append('locationId', params.locationId);
    if (params?.type) query.append('type', params.type);
    const qStr = query.toString() ? `?${query.toString()}` : '';

    return await apiFetch<StockLedger[]>(`/ledger${qStr}`);
  }

  // Generic Document Fetching
  static async getDocumentById(id: string): Promise<InventoryDocument> {
    return await apiFetch<InventoryDocument>(`/receipts/${id}`); // Or /deliveries, /transfers, /adjustments endpoint
  }

  // Receipts
  static async getReceipts(status?: DocumentStatus): Promise<InventoryDocument[]> {
    const q = status ? `?type=RECEIPT&status=${status}` : '?type=RECEIPT';
    return await apiFetch<InventoryDocument[]>(`/receipts${q}`);
  }

  static async createReceipt(data: {
    warehouseId: string;
    supplierId?: string;
    notes?: string;
    lines: Array<{ productId: string; quantity: number; unitCost?: number; toLocationId: string }>;
  }): Promise<InventoryDocument> {
    return await apiFetch<InventoryDocument>('/receipts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async validateReceipt(id: string): Promise<{ message: string; receipt: InventoryDocument }> {
    return await apiFetch(`/receipts/${id}/validate`, { method: 'POST' });
  }

  // Deliveries
  static async getDeliveries(status?: DocumentStatus): Promise<InventoryDocument[]> {
    const q = status ? `?type=DELIVERY&status=${status}` : '?type=DELIVERY';
    return await apiFetch<InventoryDocument[]>(`/deliveries${q}`);
  }

  static async createDelivery(data: {
    warehouseId: string;
    customerId?: string;
    deliveryAddress?: string;
    notes?: string;
    lines: Array<{ productId: string; quantity: number; fromLocationId: string }>;
  }): Promise<InventoryDocument> {
    return await apiFetch<InventoryDocument>('/deliveries', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async validateDelivery(id: string): Promise<{ message: string; delivery: InventoryDocument }> {
    return await apiFetch(`/deliveries/${id}/validate`, { method: 'POST' });
  }

  // Transfers
  static async getTransfers(status?: DocumentStatus): Promise<InventoryDocument[]> {
    const q = status ? `?type=TRANSFER&status=${status}` : '?type=TRANSFER';
    return await apiFetch<InventoryDocument[]>(`/transfers${q}`);
  }

  static async createTransfer(data: {
    warehouseId: string;
    notes?: string;
    lines: Array<{ productId: string; quantity: number; fromLocationId: string; toLocationId: string }>;
  }): Promise<InventoryDocument> {
    return await apiFetch<InventoryDocument>('/transfers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async validateTransfer(id: string): Promise<{ message: string; transfer: InventoryDocument }> {
    return await apiFetch(`/transfers/${id}/validate`, { method: 'POST' });
  }

  // Adjustments
  static async getAdjustments(status?: DocumentStatus): Promise<InventoryDocument[]> {
    const q = status ? `?type=ADJUSTMENT&status=${status}` : '?type=ADJUSTMENT';
    return await apiFetch<InventoryDocument[]>(`/adjustments${q}`);
  }

  static async createAdjustment(data: {
    warehouseId: string;
    reason?: string;
    notes?: string;
    lines: Array<{ productId: string; toLocationId: string; countedQuantity: number }>;
  }): Promise<InventoryDocument> {
    return await apiFetch<InventoryDocument>('/adjustments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async validateAdjustment(id: string): Promise<{ message: string; adjustment: InventoryDocument }> {
    return await apiFetch(`/adjustments/${id}/validate`, { method: 'POST' });
  }

  // Suppliers & Customers
  static async getSuppliers(): Promise<Supplier[]> {
    return await apiFetch<Supplier[]>('/suppliers');
  }

  static async createSupplier(data: { name: string; email?: string; phone?: string; address?: string }): Promise<Supplier> {
    return await apiFetch<Supplier>('/suppliers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async getCustomers(): Promise<Customer[]> {
    return await apiFetch<Customer[]>('/customers');
  }

  static async createCustomer(data: { name: string; email?: string; phone?: string; address?: string }): Promise<Customer> {
    return await apiFetch<Customer>('/customers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Reorder Rules
  static async getReorderRules(): Promise<ReorderRule[]> {
    return await apiFetch<ReorderRule[]>('/reorder-rules');
  }

  static async createReorderRule(data: {
    productId: string;
    minimumStock: number;
    maximumStock?: number;
    reorderQuantity?: number;
  }): Promise<ReorderRule> {
    return await apiFetch<ReorderRule>('/reorder-rules', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async deleteReorderRule(id: string): Promise<void> {
    await apiFetch(`/reorder-rules/${id}`, { method: 'DELETE' });
  }
}
