import { Router } from 'express';
import { ProductController } from '../controllers/product.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);
router.get('/', ProductController.getCategories);
router.post('/', ProductController.createCategory);
router.get('/uom', ProductController.getUoms);
router.post('/uom', ProductController.createUom);

export default router;
