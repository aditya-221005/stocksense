import { Router } from 'express';
import { PartnerController } from '../controllers/partner.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/suppliers', PartnerController.getSuppliers);
router.post('/suppliers', PartnerController.createSupplier);
router.get('/customers', PartnerController.getCustomers);
router.post('/customers', PartnerController.createCustomer);

export default router;
