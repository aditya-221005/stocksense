import { Router } from 'express';
import { ProductController } from '../controllers/product.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(authenticate);

// Products
router.get('/', ProductController.getProducts);
router.post('/', authorize([UserRole.ADMIN, UserRole.INVENTORY_MANAGER]), ProductController.createProduct);
router.get('/:id', ProductController.getProductById);
router.put('/:id', authorize([UserRole.ADMIN, UserRole.INVENTORY_MANAGER]), ProductController.updateProduct);
router.delete('/:id', authorize([UserRole.ADMIN]), ProductController.deleteProduct);

export default router;
