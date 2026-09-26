export type UserRole = 'ADMIN' | 'INVENTORY_MANAGER' | 'WAREHOUSE_STAFF';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive?: boolean;
}

export interface UnitOfMeasure {
  id: string;
  name: string;
  symbol: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  _count?: {
    products: number;
  };
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  categoryId?: string | null;
  category?: ProductCategory | null;
  uomId: string;
  uom: UnitOfMeasure;
  unitCost: number;
  active: boolean;
  initialStock?: number;
  stockBalances?: StockBalance[];
  reorderRules?: ReorderRule[];
  ledgerEntries?: StockLedger[];
  createdAt: string;
  updatedAt: string;
}

export interface Warehouse {
  id: string;
  name: string;
  shortCode: string;
  address?: string;
  managerId?: string;
  manager?: {
    id: string;
    name: string;
    email: string;
  };
  locations?: Location[];
  _count?: {
    products: number;
    documents: number;
  };
}

export interface Location {
  id: string;
  name: string;
  shortCode: string;
  warehouseId: string;
  warehouse?: Warehouse;
  parentId?: string | null;
  parent?: Location | null;
  children?: Location[];
}

export interface StockBalance {
  id: string;
  productId: string;
  product: Product;
  warehouseId: string;
  warehouse: Warehouse;
  locationId: string;
  location: Location;
  onHand: number;
  reserved: number;
  updatedAt: string;
}

export type DocumentType = 'RECEIPT' | 'DELIVERY' | 'TRANSFER' | 'ADJUSTMENT';
export type DocumentStatus = 'DRAFT' | 'WAITING' | 'READY' | 'DONE' | 'CANCELED';

export interface InventoryDocumentLine {
  id: string;
  documentId: string;
  productId: string;
  product: Product;
  quantity: number;
  countedQuantity?: number | null;
  unitCost?: number | null;
  fromLocationId?: string | null;
  fromLocation?: Location | null;
  toLocationId?: string | null;
  toLocation?: Location | null;
}

export interface InventoryDocument {
  id: string;
  reference: string;
  type: DocumentType;
  status: DocumentStatus;
  warehouseId: string;
  warehouse: Warehouse;
  scheduledDate?: string;
  createdById: string;
  createdBy: { id: string; name: string; email: string };
  responsibleId?: string | null;
  responsible?: { id: string; name: string; email: string } | null;
  supplierId?: string | null;
  supplier?: Supplier | null;
  customerId?: string | null;
  customer?: Customer | null;
  notes?: string | null;
  lines: InventoryDocumentLine[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string | null;
}

export type LedgerType = 'RECEIPT' | 'DELIVERY' | 'TRANSFER_IN' | 'TRANSFER_OUT' | 'ADJUSTMENT';

export interface StockLedger {
  id: string;
  productId: string;
  product: Product;
  locationId: string;
  location: Location;
  documentId?: string | null;
  document?: InventoryDocument | null;
  type: LedgerType;
  quantity: number;
  balanceBefore: number;
  balanceAfter: number;
  createdAt: string;
}

export interface ReorderRule {
  id: string;
  productId: string;
  product: Product;
  locationId?: string | null;
  minimumStock: number;
  maximumStock?: number | null;
  reorderQuantity?: number | null;
  isActive: boolean;
}

export interface Supplier {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface DashboardSummary {
  kpis: {
    totalProducts: number;
    totalWarehouses: number;
    pendingReceipts: number;
    pendingDeliveries: number;
    totalStockValue: number;
    totalItemsOnHand: number;
    lowStockAlertsCount: number;
  };
  lowStockAlerts: Array<{
    productName: string;
    sku: string;
    onHand: number;
    minStock: number;
  }>;
  recentActivities: InventoryDocument[];
}
