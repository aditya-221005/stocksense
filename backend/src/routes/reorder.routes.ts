import { Router } from 'express';
import { InventoryController } from '../controllers/inventory.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(authenticate);

router.get('/', InventoryController.getReorderRules);
router.post('/', authorize([UserRole.ADMIN, UserRole.INVENTORY_MANAGER]), InventoryController.createReorderRule);
router.delete('/:id', authorize([UserRole.ADMIN, UserRole.INVENTORY_MANAGER]), InventoryController.deleteReorderRule);

export default router;
