import { Router } from 'express';
import { WarehouseController } from '../controllers/warehouse.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(authenticate);

router.get('/', WarehouseController.getWarehouses);
router.post('/', authorize([UserRole.ADMIN, UserRole.INVENTORY_MANAGER]), WarehouseController.createWarehouse);
router.get('/:id', WarehouseController.getWarehouseById);

export default router;
