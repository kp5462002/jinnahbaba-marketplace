import { Router } from 'express';
import * as rfqController from '../controllers/rfq.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleGuard.js';

const router = Router();

// Public — anyone can browse RFQs
router.get('/', rfqController.list);

// Public — view a single RFQ with its responses
router.get('/:id', rfqController.getById);

// Buyer only — create, update, delete their own RFQs
router.post('/', authenticate, requireRole('BUYER', 'ADMIN'), rfqController.create);
router.put('/:id', authenticate, rfqController.update);
router.delete('/:id', authenticate, rfqController.remove);

// Supplier only — respond to an RFQ
router.post('/:id/respond', authenticate, requireRole('SUPPLIER', 'ADMIN'), rfqController.respond);

export default router;
