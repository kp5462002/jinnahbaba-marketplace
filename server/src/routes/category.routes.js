import { Router } from 'express';
import * as categoryController from '../controllers/category.controller.js';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleGuard.js';
import { createCategorySchema, updateCategorySchema } from '../validations/category.validation.js';

const router = Router();

// Public routes
router.get('/', categoryController.list);
router.get('/:id', categoryController.getById);

// Admin only
router.post(
  '/',
  authenticate,
  requireRole('ADMIN'),
  validate(createCategorySchema),
  categoryController.create
);

router.put(
  '/:id',
  authenticate,
  requireRole('ADMIN'),
  validate(updateCategorySchema),
  categoryController.update
);

router.delete(
  '/:id',
  authenticate,
  requireRole('ADMIN'),
  categoryController.remove
);

export default router;
