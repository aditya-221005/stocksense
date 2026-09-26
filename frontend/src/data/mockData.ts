import type {
  DashboardStats,
  Product,
  StockMovement,
  Supplier,
} from "../types"

export const dashboardStats: DashboardStats = {
  totalProducts: 248,
  totalStock: 1842,
  lowStock: 12,
  inventoryValue: 240000,
}

export const products: Product[] = [
  {
    id: "1",
    name: "Wireless Mouse",
    sku: "WM-001",
    category: "Accessories",
    supplier: "TechSupply",
    quantity: 50,
    minStock: 10,
    price: 599,
    unitCost: 599,
    status: "In Stock",
  },
  {
    id: "2",
    name: "Mechanical Keyboard",
    sku: "MK-002",
    category: "Accessories",
    supplier: "KeyWorld",
    quantity: 8,
    minStock: 10,
    price: 2499,
    unitCost: 2499,
    status: "Low Stock",
  },
  {
    id: "3",
    name: "USB-C Cable",
    sku: "UC-003",
    category: "Cables",
    supplier: "CableHub",
    quantity: 100,
    minStock: 20,
    price: 399,
    unitCost: 399,
    status: "In Stock",
  },
  {
    id: "4",
    name: "Laptop Stand",
    sku: "LS-004",
    category: "Accessories",
    supplier: "DeskPro",
    quantity: 4,
    minStock: 10,
    price: 1299,
    unitCost: 1299,
    status: "Low Stock",
  },
  {
    id: "5",
    name: "Webcam",
    sku: "WC-005",
    category: "Electronics",
    supplier: "VisionTech",
    quantity: 0,
    minStock: 5,
    price: 1899,
    unitCost: 1899,
    status: "Out of Stock",
  },
]

export const stockMovements: StockMovement[] = [
  {
    id: "1",
    productName: "Wireless Mouse",
    type: "Stock In",
    quantity: 50,
    date: "Today",
  },
  {
    id: "2",
    productName: "Mechanical Keyboard",
    type: "Stock Out",
    quantity: 10,
    date: "Today",
  },
  {
    id: "3",
    productName: "USB-C Cable",
    type: "Stock In",
    quantity: 100,
    date: "Yesterday",
  },
  {
    id: "4",
    productName: "Laptop Stand",
    type: "Stock Out",
    quantity: 6,
    date: "Yesterday",
  },
]

export const suppliers: Supplier[] = [
  {
    id: "1",
    name: "TechSupply",
    email: "contact@techsupply.com",
    phone: "+91 98765 43210",
  },
  {
    id: "2",
    name: "KeyWorld",
    email: "hello@keyworld.com",
    phone: "+91 98765 12345",
  },
  {
    id: "3",
    name: "CableHub",
    email: "support@cablehub.com",
    phone: "+91 91234 56789",
  },
]
