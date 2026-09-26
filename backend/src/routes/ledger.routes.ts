import { Router } from 'express';
import { InventoryController } from '../controllers/inventory.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);
router.get('/', InventoryController.getStockLedger);

export default router;
