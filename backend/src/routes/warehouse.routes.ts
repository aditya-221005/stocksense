import { Router } from 'express';
import { WarehouseController } from '../controllers/warehouse.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', WarehouseController.getWarehouses);
router.post('/', WarehouseController.createWarehouse);
router.get('/:id', WarehouseController.getWarehouseById);

export default router;
