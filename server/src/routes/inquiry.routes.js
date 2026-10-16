import { Router } from 'express';
import * as inquiryController from '../controllers/inquiry.controller.js';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleGuard.js';
import { createInquirySchema, updateInquiryStatusSchema, inquiryQuerySchema } from '../validations/inquiry.validation.js';

const router = Router();

router.use(authenticate);

router.get('/', validate(inquiryQuerySchema), inquiryController.list);
router.post(
  '/',
  requireRole('BUYER'),
  validate(createInquirySchema),
  inquiryController.create
);
router.get('/:id', inquiryController.getById);
router.put(
  '/:id/status',
  requireRole('SUPPLIER', 'ADMIN'),
  validate(updateInquiryStatusSchema),
  inquiryController.updateStatus
);

export default router;
