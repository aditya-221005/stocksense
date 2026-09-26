import { PrismaClient, UserRole, DocumentType, DocumentStatus, LedgerType, AdjustmentReason } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting StockSense database seeding...');

  // 1. Users
  const passwordHash = await bcrypt.hash('admin123', 10);
  const managerPasswordHash = await bcrypt.hash('manager123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@stocksense.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@stocksense.com',
      passwordHash,
      role: UserRole.ADMIN,
      isActive: true,
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: 'manager@stocksense.com' },
    update: {},
    create: {
      name: 'Inventory Manager',
      email: 'manager@stocksense.com',
      passwordHash: managerPasswordHash,
      role: UserRole.INVENTORY_MANAGER,
      isActive: true,
    },
  });

  console.log(`👤 Seeded Users: ${admin.email}, ${manager.email}`);

  // 2. Units of Measure
  const uomPcs = await prisma.unitOfMeasure.upsert({
    where: { symbol: 'pcs' },
    update: {},
    create: { name: 'Pieces', symbol: 'pcs' },
  });

  const uomKg = await prisma.unitOfMeasure.upsert({
    where: { symbol: 'kg' },
    update: {},
    create: { name: 'Kilograms', symbol: 'kg' },
  });

  const uomBox = await prisma.unitOfMeasure.upsert({
    where: { symbol: 'box' },
    update: {},
    create: { name: 'Boxes', symbol: 'box' },
  });

  console.log('📏 Seeded Units of Measure');

  // 3. Product Categories
  const catElectronics = await prisma.productCategory.upsert({
    where: { name: 'Electronics' },
    update: {},
    create: { name: 'Electronics' },
  });

  const catFurniture = await prisma.productCategory.upsert({
    where: { name: 'Furniture' },
    update: {},
    create: { name: 'Furniture' },
  });

  const catRaw = await prisma.productCategory.upsert({
    where: { name: 'Raw Materials' },
    update: {},
    create: { name: 'Raw Materials' },
  });

  console.log('🏷️ Seeded Categories');

  // 4. Warehouses & Locations
  const whMain = await prisma.warehouse.upsert({
    where: { shortCode: 'WH-MAIN' },
    update: {},
    create: {
      name: 'Main Warehouse',
      shortCode: 'WH-MAIN',
      address: '100 Logistics Way, Industrial Zone',
      managerId: manager.id,
    },
  });

  const whSec = await prisma.warehouse.upsert({
    where: { shortCode: 'WH-SEC' },
    update: {},
    create: {
      name: 'Secondary Warehouse',
      shortCode: 'WH-SEC',
      address: '45 Supply Drive, Port Area',
      managerId: admin.id,
    },
  });

  const locMainStock = await prisma.location.upsert({
    where: {
      warehouseId_shortCode: {
        warehouseId: whMain.id,
        shortCode: 'MAIN-STOCK',
      },
    },
    update: {},
    create: {
      name: 'Main Stock Area',
      shortCode: 'MAIN-STOCK',
      warehouseId: whMain.id,
    },
  });

  const locRackA = await prisma.location.upsert({
    where: {
      warehouseId_shortCode: {
        warehouseId: whMain.id,
        shortCode: 'RACK-A',
      },
    },
    update: {},
    create: {
      name: 'Rack A (Electronics)',
      shortCode: 'RACK-A',
      warehouseId: whMain.id,
      parentId: locMainStock.id,
    },
  });

  const locSecStock = await prisma.location.upsert({
    where: {
      warehouseId_shortCode: {
        warehouseId: whSec.id,
        shortCode: 'SEC-STOCK',
      },
    },
    update: {},
    create: {
      name: 'Secondary Stock Area',
      shortCode: 'SEC-STOCK',
      warehouseId: whSec.id,
    },
  });

  console.log('🏢 Seeded Warehouses and Locations');

  // 5. Suppliers & Customers
  const supplier1 = await prisma.supplier.create({
    data: {
      name: 'TechSupply Global',
      email: 'orders@techsupply.com',
      phone: '+1-555-0192',
      address: '88 Tech Boulevard, San Jose, CA',
    },
  });

  const customer1 = await prisma.customer.create({
    data: {
      name: 'Acme Enterprises',
      email: 'purchasing@acme.com',
      phone: '+1-555-0481',
      address: '250 Corporate Parkway, New York, NY',
    },
  });

  console.log('🤝 Seeded Suppliers and Customers');

  // 6. Products
  const p1 = await prisma.product.upsert({
    where: { sku: 'PROD-DESK-01' },
    update: {},
    create: {
      name: 'Ergonomic Standing Desk',
      sku: 'PROD-DESK-01',
      categoryId: catFurniture.id,
      uomId: uomPcs.id,
      unitCost: 299.99,
      active: true,
      initialStock: 25,
    },
  });

  const p2 = await prisma.product.upsert({
    where: { sku: 'PROD-MOUSE-01' },
    update: {},
    create: {
      name: 'Wireless Ergonomic Mouse',
      sku: 'PROD-MOUSE-01',
      categoryId: catElectronics.id,
      uomId: uomPcs.id,
      unitCost: 34.50,
      active: true,
      initialStock: 150,
    },
  });

  const p3 = await prisma.product.upsert({
    where: { sku: 'PROD-KBD-01' },
    update: {},
    create: {
      name: 'Mechanical RGB Keyboard',
      sku: 'PROD-KBD-01',
      categoryId: catElectronics.id,
      uomId: uomPcs.id,
      unitCost: 79.00,
      active: true,
      initialStock: 60,
    },
  });

  console.log('📦 Seeded Products');

  // 7. Initial Stock Balances & Ledger Entries
  const balances = [
    { product: p1, location: locMainStock, warehouse: whMain, qty: 25 },
    { product: p2, location: locRackA, warehouse: whMain, qty: 150 },
    { product: p3, location: locSecStock, warehouse: whSec, qty: 60 },
  ];

  for (const b of balances) {
    await prisma.stockBalance.upsert({
      where: {
        productId_locationId: {
          productId: b.product.id,
          locationId: b.location.id,
        },
      },
      update: { onHand: b.qty },
      create: {
        productId: b.product.id,
        locationId: b.location.id,
        warehouseId: b.warehouse.id,
        onHand: b.qty,
        reserved: 0,
      },
    });

    await prisma.stockLedger.create({
      data: {
        productId: b.product.id,
        locationId: b.location.id,
        type: LedgerType.RECEIPT,
        quantity: b.qty,
        balanceBefore: 0,
        balanceAfter: b.qty,
      },
    });
  }

  // 8. Reorder Rules
  await prisma.reorderRule.create({
    data: {
      productId: p1.id,
      locationId: locMainStock.id,
      minimumStock: 10,
      maximumStock: 50,
      reorderQuantity: 20,
    },
  });

  console.log('📊 Seeded Stock Balances and Reorder Rules');

  // 9. Sample Completed Receipt Document
  const docRef = 'WH/IN/0001';
  const existingDoc = await prisma.inventoryDocument.findUnique({ where: { reference: docRef } });
  if (!existingDoc) {
    await prisma.inventoryDocument.create({
      data: {
        reference: docRef,
        type: DocumentType.RECEIPT,
        status: DocumentStatus.DONE,
        warehouseId: whMain.id,
        createdById: admin.id,
        supplierId: supplier1.id,
        notes: 'Initial inventory load from TechSupply',
        completedAt: new Date(),
        lines: {
          create: [
            {
              productId: p1.id,
              quantity: 25,
              unitCost: 299.99,
              toLocationId: locMainStock.id,
            },
          ],
        },
      },
    });
  }

  console.log('✅ Database seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Database seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
