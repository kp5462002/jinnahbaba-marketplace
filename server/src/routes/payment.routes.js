import { Router } from 'express';
import express from 'express';
import * as paymentController from '../controllers/payment.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.webhook);
router.post('/checkout/:orderId', authenticate, paymentController.createCheckout);

export default router;
