import { Router } from 'express';
import * as orderController from '../controllers/order.controller.js';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleGuard.js';
import { createOrderSchema, updateOrderStatusSchema, orderQuerySchema } from '../validations/order.validation.js';

const router = Router();

router.use(authenticate);

router.get('/', validate(orderQuerySchema), orderController.list);
router.post(
  '/',
  requireRole('BUYER'),
  validate(createOrderSchema),
  orderController.create
);
router.get('/:id', orderController.getById);
router.put(
  '/:id/status',
  requireRole('SUPPLIER', 'ADMIN'),
  validate(updateOrderStatusSchema),
  orderController.updateStatus
);

export default router;
