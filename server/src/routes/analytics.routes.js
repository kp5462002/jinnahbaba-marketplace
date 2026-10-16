import { Router } from 'express';
import * as analyticsController from '../controllers/analytics.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleGuard.js';

const router = Router();

router.use(authenticate);

// Admin dashboard
router.get('/dashboard', requireRole('ADMIN'), analyticsController.dashboard);

// Role-specific analytics
router.get('/supplier', requireRole('SUPPLIER'), analyticsController.supplierStats);
router.get('/buyer', requireRole('BUYER'), analyticsController.buyerStats);

export default router;
