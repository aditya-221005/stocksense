import { Router } from 'express';
import { InventoryController } from '../controllers/inventory.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);
router.get('/', InventoryController.getDocuments);
router.post('/', InventoryController.createReceipt);
router.get('/:id', InventoryController.getDocumentById);
router.post('/:id/validate', InventoryController.validateReceipt);

export default router;
