import { Router } from 'express';
import * as messageController from '../controllers/message.controller.js';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import { createMessageSchema, messageQuerySchema } from '../validations/message.validation.js';

const router = Router();

router.use(authenticate);

router.get(
  '/order/:orderId',
  validate(messageQuerySchema),
  messageController.listByOrder
);
router.post(
  '/',
  validate(createMessageSchema),
  messageController.create
);
router.post(
  '/order/:orderId/read',
  messageController.markAsRead
);

export default router;
