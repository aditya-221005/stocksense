import { Router } from 'express';
import { PartnerController } from '../controllers/partner.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(authenticate);

router.get('/suppliers', PartnerController.getSuppliers);
router.post('/suppliers', authorize([UserRole.ADMIN, UserRole.INVENTORY_MANAGER]), PartnerController.createSupplier);
router.get('/customers', PartnerController.getCustomers);
router.post('/customers', authorize([UserRole.ADMIN, UserRole.INVENTORY_MANAGER]), PartnerController.createCustomer);

export default router;
