import { Router } from 'express';
import authRoutes from './auth.routes.js';
import productRoutes from './product.routes.js';
import categoryRoutes from './category.routes.js';
import warehouseRoutes from './warehouse.routes.js';
import locationRoutes from './location.routes.js';
import stockRoutes from './stock.routes.js';
import receiptRoutes from './receipt.routes.js';
import deliveryRoutes from './delivery.routes.js';
import transferRoutes from './transfer.routes.js';
import adjustmentRoutes from './adjustment.routes.js';
import ledgerRoutes from './ledger.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import partnerRoutes from './partner.routes.js';
import reorderRoutes from './reorder.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/warehouses', warehouseRoutes);
router.use('/locations', locationRoutes);
router.use('/stock', stockRoutes);
router.use('/receipts', receiptRoutes);
router.use('/deliveries', deliveryRoutes);
router.use('/transfers', transferRoutes);
router.use('/adjustments', adjustmentRoutes);
router.use('/ledger', ledgerRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/', partnerRoutes); // /api/suppliers & /api/customers
router.use('/reorder-rules', reorderRoutes);

export default router;
