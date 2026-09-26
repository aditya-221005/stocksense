import { Router } from 'express';
import { WarehouseController } from '../controllers/warehouse.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);
router.get('/', WarehouseController.getLocations);
router.post('/', WarehouseController.createLocation);

export default router;
