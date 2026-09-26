import { Router } from 'express';
import { ProductController } from '../controllers/product.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

// Products
router.get('/', ProductController.getProducts);
router.post('/', ProductController.createProduct);
router.get('/:id', ProductController.getProductById);
router.put('/:id', ProductController.updateProduct);
router.delete('/:id', ProductController.deleteProduct);

export default router;
